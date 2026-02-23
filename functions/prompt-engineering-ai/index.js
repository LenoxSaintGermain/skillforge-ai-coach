import express from 'express';
import cors from 'cors';
import { VertexAI } from '@google-cloud/vertexai';
import { verifyAuth, getSafeErrorMessage } from '../shared/auth.js';
import { query } from '../shared/database.js';

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

const vertexAI = new VertexAI({
    project: process.env.GCP_PROJECT_ID,
    location: process.env.GCP_REGION || 'us-central1',
});

app.post('/', async (req, res) => {
    try {
        const user = await verifyAuth(req);
        const { action, prompt, userLevel, context, experimentId } = req.body;

        switch (action) {
            case 'analyze_prompt': {
                const analysis = await analyzePrompt(prompt, userLevel);
                return res.json({ analysis });
            }

            case 'generate_exercise': {
                const exercise = await generatePersonalizedExercise(userLevel, context);
                return res.json({ exercise });
            }

            case 'evaluate_response': {
                const evaluation = await evaluatePromptResponse(prompt, context.response, userLevel);

                // Save experiment to Cloud SQL (replaces Supabase client)
                if (experimentId) {
                    await query(
                        `UPDATE prompt_experiments 
             SET response_data = $1, performance_metrics = $2, updated_at = NOW() 
             WHERE id = $3 AND user_id = $4`,
                        [
                            JSON.stringify({ response: context.response }),
                            JSON.stringify(evaluation.metrics),
                            experimentId,
                            user.uid,
                        ]
                    );
                }

                return res.json({ evaluation });
            }

            case 'get_feedback': {
                const feedback = await generateDetailedFeedback(prompt, context, userLevel);
                return res.json({ feedback });
            }

            default:
                return res.status(400).json({ error: 'Invalid request. Please try again.' });
        }
    } catch (error) {
        console.error('Error in prompt-engineering-ai function:', error);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: getSafeErrorMessage(error) });
    }
});

async function callGeminiAPI(prompt) {
    const model = vertexAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        generationConfig: {
            temperature: 1.0,
            topK: 64,
            topP: 0.95,
            maxOutputTokens: 2048,
        },
    });

    const result = await model.generateContent(prompt);
    return result.response.candidates[0].content.parts[0].text;
}

async function analyzePrompt(prompt, userLevel) {
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

async function generatePersonalizedExercise(userLevel, context) {
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

async function evaluatePromptResponse(prompt, response, userLevel) {
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
    const responseEval = await callGeminiAPI(evaluationPrompt);
    return JSON.parse(responseEval);
}

async function generateDetailedFeedback(prompt, context, userLevel) {
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

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
    console.log(`prompt-engineering-ai function listening on port ${PORT}`);
});

export default app;
