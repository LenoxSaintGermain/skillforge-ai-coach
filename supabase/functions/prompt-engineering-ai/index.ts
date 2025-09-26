import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, prompt, userLevel, context, experimentId } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    switch (action) {
      case 'analyze_prompt': {
        const analysis = await analyzePrompt(prompt, userLevel);
        return new Response(JSON.stringify({ analysis }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'generate_exercise': {
        const exercise = await generatePersonalizedExercise(userLevel, context);
        return new Response(JSON.stringify({ exercise }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'evaluate_response': {
        const evaluation = await evaluatePromptResponse(prompt, context.response, userLevel);
        
        // Save experiment to database
        if (experimentId) {
          await supabase
            .from('prompt_experiments')
            .update({
              response_data: { response: context.response },
              performance_metrics: evaluation.metrics,
              updated_at: new Date().toISOString()
            })
            .eq('id', experimentId)
            .eq('user_id', user.id);
        }

        return new Response(JSON.stringify({ evaluation }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_feedback': {
        const feedback = await generateDetailedFeedback(prompt, context, userLevel);
        return new Response(JSON.stringify({ feedback }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in prompt-engineering-ai function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzePrompt(prompt: string, userLevel: string) {
  const analysisPrompt = `
    As an expert prompt engineering teacher, analyze this prompt and provide structured feedback:
    
    Prompt to analyze: "${prompt}"
    User skill level: ${userLevel}
    
    Provide analysis in this JSON format:
    {
      "clarity_score": 0-10,
      "specificity_score": 0-10,
      "structure_score": 0-10,
      "context_score": 0-10,
      "overall_score": 0-10,
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"],
      "suggestions": ["suggestion1", "suggestion2"],
      "improved_version": "improved prompt here",
      "skill_level_appropriate": true/false,
      "estimated_effectiveness": "high/medium/low"
    }
    
    Be specific and actionable in your feedback.
  `;

  const response = await callGeminiAPI(analysisPrompt);
  return JSON.parse(response);
}

async function generatePersonalizedExercise(userLevel: string, context: any) {
  const exercisePrompt = `
    Generate a personalized prompt engineering exercise for a ${userLevel} level user.
    Context: ${JSON.stringify(context)}
    
    Return in this JSON format:
    {
      "title": "Exercise title",
      "description": "What the user needs to do",
      "scenario": "The specific scenario/context",
      "starting_prompt": "A basic prompt to improve",
      "success_criteria": ["criteria1", "criteria2"],
      "hints": ["hint1", "hint2"],
      "difficulty_level": "beginner/intermediate/advanced",
      "estimated_time": "X minutes",
      "learning_objectives": ["objective1", "objective2"]
    }
  `;

  const response = await callGeminiAPI(exercisePrompt);
  return JSON.parse(response);
}

async function evaluatePromptResponse(prompt: string, response: string, userLevel: string) {
  const evaluationPrompt = `
    Evaluate this prompt and its AI response:
    
    Prompt: "${prompt}"
    Response: "${response}"
    User level: ${userLevel}
    
    Return evaluation in this JSON format:
    {
      "metrics": {
        "relevance": 0-10,
        "completeness": 0-10,
        "clarity": 0-10,
        "usefulness": 0-10,
        "overall": 0-10
      },
      "response_quality": "excellent/good/fair/poor",
      "prompt_effectiveness": "high/medium/low",
      "areas_for_improvement": ["area1", "area2"],
      "what_worked_well": ["aspect1", "aspect2"],
      "next_steps": ["step1", "step2"]
    }
  `;

  const response_eval = await callGeminiAPI(evaluationPrompt);
  return JSON.parse(response_eval);
}

async function generateDetailedFeedback(prompt: string, context: any, userLevel: string) {
  const feedbackPrompt = `
    Provide detailed, actionable feedback on this prompt engineering attempt:
    
    Prompt: "${prompt}"
    Context: ${JSON.stringify(context)}
    User level: ${userLevel}
    
    Return feedback in this JSON format:
    {
      "overall_assessment": "General assessment text",
      "specific_feedback": {
        "structure": "Feedback on prompt structure",
        "clarity": "Feedback on clarity",
        "specificity": "Feedback on specificity",
        "context": "Feedback on context provision"
      },
      "actionable_improvements": [
        {
          "category": "structure/clarity/specificity/context",
          "current": "What they did",
          "improved": "How to improve it",
          "why": "Why this improvement helps"
        }
      ],
      "examples": {
        "better_version": "Improved version of their prompt",
        "explanation": "Why the improved version is better"
      },
      "practice_suggestions": ["suggestion1", "suggestion2"],
      "resources": ["resource1", "resource2"]
    }
  `;

  const response = await callGeminiAPI(feedbackPrompt);
  return JSON.parse(response);
}

async function callGeminiAPI(prompt: string): Promise<string> {
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}