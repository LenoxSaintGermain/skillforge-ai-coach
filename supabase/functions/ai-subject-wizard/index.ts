import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WizardRequest {
  action: 'analyze' | 'generate_syllabus' | 'generate_metadata' | 'generate_prompt';
  topic: string;
  description?: string;
  audience?: string;
  goals?: string[];
  syllabus?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication validation
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('[AI Wizard] Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[AI Wizard] Authenticated user: ${user.id}`);

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const { action, topic, description, audience, goals, syllabus }: WizardRequest = await req.json();

    console.log(`[AI Wizard] Action: ${action}, Topic: ${topic}`);

    let prompt = '';
    let responseSchema: any = null;

    switch (action) {
      case 'analyze':
        prompt = `Analyze this learning topic and determine if it's suitable for creating a comprehensive learning subject.

Topic: ${topic}
Description: ${description || 'Not provided'}
Target Audience: ${audience || 'General learners'}

Return your analysis with recommendations for scope and structure.`;

        responseSchema = {
          type: "object",
          properties: {
            is_suitable: { type: "boolean" },
            reasoning: { type: "string" },
            suggested_scope: { type: "string" },
            estimated_phases: { type: "number" },
            recommended_duration: { type: "string" }
          },
          required: ["is_suitable", "reasoning", "suggested_scope", "estimated_phases"]
        };
        break;

      case 'generate_syllabus':
        prompt = `Create a comprehensive learning syllabus for teaching: "${topic}"

Description: ${description || 'Not provided'}
Target Audience: ${audience || 'General learners'}
Learning Goals: ${goals?.join(', ') || 'Not specified'}

IMPORTANT: Use Google Search to find the LATEST and most UP-TO-DATE information about "${topic}". Include:
- Current best practices and methodologies
- Recent updates, versions, or changes
- Modern tools and technologies
- Industry-standard approaches

Create a structured learning path with 4-6 phases. Each phase should:
1. Build progressively on previous knowledge
2. Have clear, actionable learning objectives
3. Include specific expected outputs/deliverables
4. Be practical and hands-on focused

Return a complete syllabus structure.`;

        responseSchema = {
          type: "object",
          properties: {
            phases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  expectedOutputs: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["id", "title", "description", "expectedOutputs"]
              }
            }
          },
          required: ["phases"]
        };
        break;

      case 'generate_metadata':
        prompt = `Generate metadata for a learning subject about: "${topic}"

Create:
1. A clear, engaging title (max 50 chars)
2. A compelling tagline (max 60 chars)
3. An overall learning goal (1-2 sentences)
4. A hero description for the landing page (2-3 sentences, max 200 chars)
5. Relevant tags/keywords (5-8 tags)
6. Suggested primary and secondary brand colors (as hex codes that complement each other)

Make it professional, engaging, and learner-focused.`;

        responseSchema = {
          type: "object",
          properties: {
            title: { type: "string" },
            tagline: { type: "string" },
            overall_goal: { type: "string" },
            hero_description: { type: "string" },
            tags: {
              type: "array",
              items: { type: "string" }
            },
            primary_color: { type: "string" },
            secondary_color: { type: "string" },
            subject_key: { type: "string" }
          },
          required: ["title", "tagline", "overall_goal", "hero_description", "tags", "primary_color", "secondary_color", "subject_key"]
        };
        break;

      case 'generate_prompt':
        const syllabusText = syllabus?.phases?.map((p: any, i: number) =>
          `Phase ${i + 1}: ${p.title}\n${p.description}`
        ).join('\n\n') || 'Syllabus not provided';

        prompt = `Create a comprehensive system prompt for an AI learning coach teaching: "${topic}"

The syllabus structure:
${syllabusText}

The system prompt should:
1. Define the AI coach's personality (encouraging, knowledgeable, patient)
2. Explain the teaching methodology (interactive, scenario-based, hands-on)
3. Include placeholders for dynamic content: {user_name}, {user_role}, {subject_title}, {phase_title}, {phase_description}
4. Set expectations for interaction style
5. Emphasize practical application and real-world scenarios
6. Guide the AI to adapt difficulty based on user responses
7. Encourage questions and exploration

Make it comprehensive (300-500 words) but clear and actionable. Write in second person addressing the AI coach.`;

        responseSchema = {
          type: "object",
          properties: {
            system_prompt: { type: "string" }
          },
          required: ["system_prompt"]
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Call Gemini API with grounding
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8000,
            responseMimeType: "application/json",
            responseSchema: responseSchema
          },
          tools: [{
            googleSearch: {}
          }]
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('[AI Wizard] Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();

    if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('[AI Wizard] Invalid Gemini response:', JSON.stringify(geminiData));
      throw new Error('Invalid response from Gemini API');
    }

    const generatedText = geminiData.candidates[0].content.parts[0].text;
    const result = JSON.parse(generatedText);

    console.log(`[AI Wizard] Successfully generated ${action}`);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[AI Wizard] Error:', error);

    // Return safe error message — never expose internals
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    let safeMessage = 'An error occurred processing your request. Please try again.';

    if (message.includes('authentication') || message.includes('invalid')) {
      safeMessage = 'Authentication failed. Please sign in and try again.';
    } else if (message.includes('api key') || message.includes('not configured')) {
      safeMessage = 'Service temporarily unavailable. Please try again later.';
    } else if (message.includes('unknown action')) {
      safeMessage = 'Invalid request. Please try again.';
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: safeMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
