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
    const { query, userId } = await req.json();
    
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

    // Call Gemini API with Google Search grounding
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Find the 8 best learning resources about: "${query}"

For each resource provide:
- title: Clear, descriptive title
- description: 2-3 sentence summary of what the resource covers
- url: Full URL to the resource
- type: One of: documentation, video, tutorial, article, template
- tags: 3-5 relevant keywords (lowercase, hyphenated)
- quality_score: Rate 1-10 based on authority, recency, clarity, and relevance

Prioritize:
- Official documentation and authoritative sources
- Recent content (2023-2025)
- Clear, beginner-friendly tutorials
- High-quality video tutorials from reputable channels
- Practical, hands-on resources

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
            maxOutputTokens: 4000
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    const { data: savedResources, error: dbError } = await supabase
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
    console.error('Error in discover-resources:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});