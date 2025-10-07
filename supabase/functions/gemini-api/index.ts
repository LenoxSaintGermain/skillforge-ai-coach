import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { prompt, temperature = 0.7, maxTokens = 8192, systemPrompt, responseSchema } = await req.json();
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Prepare the request body for Gemini API with safety settings
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
        temperature: temperature,
        maxOutputTokens: maxTokens,
        topP: 0.8,
        topK: 40,
        responseMimeType: responseSchema ? "application/json" : undefined,
        responseSchema: responseSchema || undefined
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

    // Disable extended thinking mode to save tokens
    if (!responseSchema) {
      requestBody.thoughtConfig = {
        mode: "DISABLED"
      };
    }

    console.log('Calling Gemini API with prompt:', prompt.substring(0, 100) + '...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
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
        model: 'gemini-2.5-flash'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in gemini-api function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Check function logs for more information'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});