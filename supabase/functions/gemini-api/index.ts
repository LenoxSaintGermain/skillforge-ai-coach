import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: corsHeaders }
      );
    }

    console.log('Authenticated request from user:', user.id);
    const { prompt, temperature = 0.7, maxTokens = 8192, systemPrompt, responseSchema } = await req.json();
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Prepare the request body for Gemini 3 Flash API with enhanced capabilities
    // Gemini 3 Flash: Pro-level intelligence at Flash speed with native UI generation
    const requestBody: any = {
      contents: [
        {
          parts: [
            {
              text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
            }
          ]
        }
      ],
      generationConfig: {
        // Gemini 3 recommends temperature 1.0 for optimal reasoning
        temperature: temperature === 0.7 ? 1.0 : temperature,
        maxOutputTokens: maxTokens,
        topP: 0.95,
        topK: 64,
        responseMimeType: responseSchema ? "application/json" : undefined,
        responseSchema: responseSchema || undefined,
        // Gemini 3 thinking level: controls reasoning depth
        // 'high' for complex UI generation, 'medium' for balanced, 'low' for simple tasks
        thinkingConfig: {
          thinkingLevel: maxTokens > 4000 ? "high" : "medium"
        }
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_ONLY_HIGH"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_ONLY_HIGH"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_ONLY_HIGH"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_ONLY_HIGH"
        }
      ]
    };

    console.log('Calling Gemini API with prompt:', prompt.substring(0, 100) + '...');

    // Use Gemini 3 Flash for enhanced UI generation and reasoning capabilities
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Log full response for debugging
    console.log('Gemini API response structure:', JSON.stringify(data, null, 2));
    
    // Validate response structure
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates in response:', data);
      throw new Error('Gemini API returned no response candidates. This may be due to content being blocked by safety filters.');
    }

    const candidate = data.candidates[0];
    
    // Check for safety filter blocks
    if (candidate.finishReason === 'SAFETY') {
      console.error('Content blocked by safety filters:', candidate.safetyRatings);
      throw new Error('Content was blocked by Gemini safety filters. Please try rephrasing your request.');
    }
    
    // Check for other finish reasons
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      console.error('Unexpected finish reason:', candidate.finishReason);
      
      // For MAX_TOKENS, return partial content with error flag
      if (candidate.finishReason === 'MAX_TOKENS') {
        const partialText = candidate.content?.parts?.[0]?.text || '';
        console.warn('Response truncated due to MAX_TOKENS. Partial length:', partialText.length);
        throw new Error(`MAX_TOKENS: Response was truncated. Please increase maxTokens parameter.`);
      }
      
      throw new Error(`Generation stopped unexpectedly: ${candidate.finishReason}`);
    }
    
    // Validate content structure
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      console.error('Invalid content structure:', candidate);
      throw new Error('Gemini API response missing content parts');
    }

    const generatedText = candidate.content.parts[0].text;
    
    if (!generatedText) {
      console.error('Empty text in response:', candidate);
      throw new Error('Gemini API returned empty response text');
    }
    
    console.log('Gemini API response received successfully');

    return new Response(
      JSON.stringify({ 
        generatedText,
        usage: data.usageMetadata || {},
        model: 'gemini-3-flash-preview'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    // Log full error server-side for debugging
    console.error('Error in gemini-api function:', error);
    
    // Return safe error message without exposing internals
    const safeMessage = getSafeErrorMessage(error);
    
    return new Response(
      JSON.stringify({ error: safeMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Maps internal error messages to safe client-facing messages
 */
function getSafeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  
  if (message.includes('authentication') || message.includes('unauthorized')) {
    return 'Authentication failed. Please sign in and try again.';
  }
  
  if (message.includes('rate limit') || message.includes('429')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  if (message.includes('api key') || message.includes('not configured')) {
    return 'Service temporarily unavailable. Please try again later.';
  }
  
  if (message.includes('safety') || message.includes('blocked')) {
    return 'Content was blocked by safety filters. Please rephrase your request.';
  }
  
  if (message.includes('max_tokens') || message.includes('truncated')) {
    return 'Response was too long. Please try a more specific request.';
  }
  
  return 'An error occurred processing your request. Please try again.';
}