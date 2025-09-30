import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  topic_area: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Discovering resources for query:', query);

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Call Gemini with Google Search grounding
    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Find the 8 best learning resources about: "${query}"
              
For each resource provide:
- Title (clear and descriptive)
- Description (2-3 sentences explaining what the resource covers)
- URL (direct link to the resource)
- Type (one of: documentation, video, tutorial, article, template)
- Tags (3-5 relevant keywords as array)
- Quality score (1-10 based on authority, recency, clarity, and relevance)

Prioritize:
- Official documentation and authoritative sources
- Recent content (2023-2025)
- Clear, well-structured tutorials
- Reputable creators/organizations
- Practical, actionable content

Return ONLY a valid JSON array with no additional text or markdown. Each object should have: title, description, url, type, tags, quality_score.

Example format:
[
  {
    "title": "Official Guide to X",
    "description": "Comprehensive official documentation covering core concepts and best practices for X technology.",
    "url": "https://example.com/docs",
    "type": "documentation",
    "tags": ["official", "beginner-friendly", "comprehensive"],
    "quality_score": 9
  }
]`
            }]
          }],
          tools: [{
            googleSearchRetrieval: {
              dynamicRetrievalConfig: {
                mode: "MODE_DYNAMIC",
                dynamicThreshold: 0.7
              }
            }
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8000,
          }
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini response received');

    // Extract the text content
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      throw new Error('No content generated from Gemini');
    }

    // Parse the JSON response
    let resources: DiscoveredResource[];
    try {
      // Clean the response (remove markdown code blocks if present)
      const cleanedText = generatedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      resources = JSON.parse(cleanedText);
      
      if (!Array.isArray(resources)) {
        throw new Error('Response is not an array');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', generatedText);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate and save resources to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const validatedResources = resources.map(resource => ({
      title: resource.title || 'Untitled Resource',
      description: resource.description || 'No description available',
      url: resource.url || '',
      type: resource.type || 'article',
      tags: Array.isArray(resource.tags) ? resource.tags : [],
      quality_score: Math.min(Math.max(resource.quality_score || 5, 1), 10),
      topic_area: query,
      source: 'ai-curated' as const,
      added_by_user_id: userId || null,
      votes: 0,
      is_verified: false,
    }));

    // Insert resources into database
    const { data: savedResources, error: dbError } = await supabase
      .from('learning_resources')
      .insert(validatedResources)
      .select();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to save resources: ${dbError.message}`);
    }

    console.log(`Successfully saved ${savedResources?.length || 0} resources`);

    return new Response(
      JSON.stringify({
        success: true,
        resources: savedResources,
        count: savedResources?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in discover-resources function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});