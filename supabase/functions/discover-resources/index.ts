import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiscoveredResource {
  title: string;
  description: string;
  url: string;
  type: 'documentation' | 'video' | 'tutorial' | 'template' | 'article';
  tags: string[];
  quality_score: number;
}

serve(async (req) => {
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

    // Initialize Supabase client for auth validation
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

    const { query } = await req.json();
    // Use authenticated user ID instead of client-provided userId
    const userId = user.id;
    
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Discovering resources for query: "${query}"`);

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Use Gemini 3 Flash for enhanced resource discovery and curation
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert learning resource curator. Based on your knowledge, recommend the 8 best learning resources about: "${query}"

For each resource, provide:
- title: Clear, descriptive title
- description: 2-3 sentence summary of what the resource covers
- url: Full URL to the resource (use well-known, authoritative sources)
- type: One of: documentation, video, tutorial, article, template
- tags: 3-5 relevant keywords (lowercase, hyphenated)
- quality_score: Rate 1-10 based on authority, clarity, and educational value

Prioritize well-known sources:
- Official documentation (e.g., docs.python.org, developer.mozilla.org, reactjs.org)
- Reputable educational platforms (e.g., YouTube channels like freeCodeCamp, Fireship, Traversy Media)
- Major tech company tutorials (e.g., Google Codelabs, AWS Tutorials, Microsoft Learn)
- Well-established learning sites (e.g., MDN, W3Schools, Real Python)
- Popular GitHub repositories and templates

Return ONLY a valid JSON array with this exact structure:
[
  {
    "title": "string",
    "description": "string", 
    "url": "string",
    "type": "documentation|video|tutorial|article|template",
    "tags": ["tag1", "tag2", "tag3"],
    "quality_score": 8
  }
]

Do not include any markdown formatting, code blocks, or explanatory text - only the JSON array.`
            }]
          }],
          generationConfig: {
            // Gemini 3 recommends temperature 1.0, use lower for structured output
            temperature: 0.7,
            maxOutputTokens: 4000,
            topP: 0.95,
            topK: 64,
            responseMimeType: "application/json",
            // Use low thinking for faster resource discovery
            thinkingConfig: {
              thinkingLevel: "low"
            }
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini response received');

    // Extract and parse the content
    const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      throw new Error('No content in Gemini response');
    }

    // Clean and parse JSON
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/```\n?/g, '');
    }

    let resources: DiscoveredResource[];
    try {
      resources = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', cleanedContent);
      throw new Error('Invalid JSON response from AI');
    }

    if (!Array.isArray(resources) || resources.length === 0) {
      throw new Error('No resources found in AI response');
    }

    console.log(`Discovered ${resources.length} resources`);

    // Use service role key for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Save resources to database
    const resourcesToInsert = resources.map(resource => ({
      title: resource.title,
      description: resource.description,
      url: resource.url,
      type: resource.type,
      tags: resource.tags || [],
      source: 'ai-curated',
      quality_score: resource.quality_score,
      votes: 0,
      topic_area: query,
      added_by_user_id: userId || null,
      is_verified: false
    }));

    const { data: savedResources, error: dbError } = await supabaseAdmin
      .from('learning_resources')
      .insert(resourcesToInsert)
      .select();

    if (dbError) {
      console.error('Database error:', dbError);
      // Return resources even if DB save fails
      return new Response(
        JSON.stringify({ 
          resources,
          saved: false,
          error: 'Resources found but not saved to database' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Saved ${savedResources?.length || 0} resources to database`);

    return new Response(
      JSON.stringify({ 
        resources: savedResources,
        saved: true,
        count: savedResources?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Log full error server-side for debugging
    console.error('Error in discover-resources:', error);
    
    // Return safe error message - NEVER expose stack traces
    const safeMessage = getSafeErrorMessage(error);
    
    return new Response(
      JSON.stringify({ error: safeMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
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
  
  if (message.includes('api key') || message.includes('not configured')) {
    return 'Service temporarily unavailable. Please try again later.';
  }
  
  if (message.includes('invalid json')) {
    return 'Failed to process resources. Please try a different search.';
  }
  
  return 'An error occurred discovering resources. Please try again.';
}