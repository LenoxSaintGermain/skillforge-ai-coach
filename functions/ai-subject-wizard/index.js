import express from 'express';
import cors from 'cors';
import { VertexAI } from '@google-cloud/vertexai';
import { verifyAuth, getSafeErrorMessage } from '../shared/auth.js';

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
        console.log(`[AI Wizard] Authenticated user: ${user.uid}`);

        const { action, topic, description, audience, goals, syllabus } = req.body;
        console.log(`[AI Wizard] Action: ${action}, Topic: ${topic}`);

        let prompt = '';
        let responseSchema = null;

        switch (action) {
            case 'analyze':
                prompt = `Analyze this learning topic and determine if it's suitable for creating a comprehensive learning subject.

Topic: ${topic}
Description: ${description || 'Not provided'}
Target Audience: ${audience || 'General learners'}

Return your analysis with recommendations for scope and structure.`;

                responseSchema = {
                    type: 'object',
                    properties: {
                        is_suitable: { type: 'boolean' },
                        reasoning: { type: 'string' },
                        suggested_scope: { type: 'string' },
                        estimated_phases: { type: 'number' },
                        recommended_duration: { type: 'string' },
                    },
                    required: ['is_suitable', 'reasoning', 'suggested_scope', 'estimated_phases'],
                };
                break;

            case 'generate_syllabus':
                prompt = `Create a comprehensive learning syllabus for teaching: "${topic}"

Description: ${description || 'Not provided'}
Target Audience: ${audience || 'General learners'}
Learning Goals: ${goals?.join(', ') || 'Not specified'}

Create a structured learning path with 4-6 phases. Each phase should:
1. Build progressively on previous knowledge
2. Have clear, actionable learning objectives
3. Include specific expected outputs/deliverables
4. Be practical and hands-on focused

Return a complete syllabus structure.`;

                responseSchema = {
                    type: 'object',
                    properties: {
                        phases: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    title: { type: 'string' },
                                    description: { type: 'string' },
                                    expectedOutputs: { type: 'array', items: { type: 'string' } },
                                },
                                required: ['id', 'title', 'description', 'expectedOutputs'],
                            },
                        },
                    },
                    required: ['phases'],
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
6. Suggested primary and secondary brand colors (as hex codes)

Make it professional, engaging, and learner-focused.`;

                responseSchema = {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        tagline: { type: 'string' },
                        overall_goal: { type: 'string' },
                        hero_description: { type: 'string' },
                        tags: { type: 'array', items: { type: 'string' } },
                        primary_color: { type: 'string' },
                        secondary_color: { type: 'string' },
                        subject_key: { type: 'string' },
                    },
                    required: ['title', 'tagline', 'overall_goal', 'hero_description', 'tags', 'primary_color', 'secondary_color', 'subject_key'],
                };
                break;

            case 'generate_prompt': {
                const syllabusText = syllabus?.phases
                    ?.map((p, i) => `Phase ${i + 1}: ${p.title}\n${p.description}`)
                    .join('\n\n') || 'Syllabus not provided';

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

Make it comprehensive (300-500 words) but clear and actionable.`;

                responseSchema = {
                    type: 'object',
                    properties: {
                        system_prompt: { type: 'string' },
                    },
                    required: ['system_prompt'],
                };
                break;
            }

            default:
                return res.status(400).json({ success: false, error: 'Invalid action' });
        }

        // Use Vertex AI SDK with grounding (Google Search)
        const model = vertexAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8000,
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            },
            tools: [{ googleSearch: {} }],
        });

        const result = await model.generateContent(prompt);
        const generatedText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new Error('Invalid response from Gemini API');
        }

        const data = JSON.parse(generatedText);
        console.log(`[AI Wizard] Successfully generated ${action}`);

        return res.json({ success: true, data });
    } catch (error) {
        console.error('[AI Wizard] Error:', error);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            error: getSafeErrorMessage(error),
        });
    }
});

const PORT = process.env.PORT || 8084;
app.listen(PORT, () => {
    console.log(`ai-subject-wizard function listening on port ${PORT}`);
});

export default app;
