import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import { verifyAuth, getSafeErrorMessage } from '../shared/auth.js';

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

// Initialize GoogleGenAI client (uses Application Default Credentials — no API key needed in GCP)
const ai = new GoogleGenAI({
    vertexai: true,
    project: process.env.GCP_PROJECT_ID,
    location: process.env.GCP_REGION || 'us-central1',
});

app.post('/', async (req, res) => {
    try {
        // Verify Firebase auth token
        const user = await verifyAuth(req);
        console.log('Authenticated request from user:', user.uid);

        const { prompt, temperature = 0.7, maxTokens = 8192, systemPrompt, responseSchema } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const requestedModel = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

        console.log('Calling Gemini via Interactions API with prompt:', prompt.substring(0, 100) + '...');

        const interaction = await ai.interactions.create({
            model: requestedModel,
            input: prompt,
            system_instruction: systemPrompt || undefined,
            response_format: responseSchema ? {
                type: 'text',
                mime_type: 'application/json',
                schema: responseSchema,
            } : undefined,
            generation_config: {
                temperature: temperature === 0.7 ? 1.0 : temperature,
                max_output_tokens: maxTokens,
                top_p: 0.95,
                top_k: 64,
            }
        });

        if (interaction.status === 'failed') {
            throw new Error('Interaction failed to generate content');
        }

        const generatedText = interaction.output_text;
        if (!generatedText) {
            throw new Error('Gemini API returned empty response text');
        }

        console.log('Gemini response received successfully');

        return res.json({
            generatedText,
            usage: interaction.usage || {},
            model: requestedModel,
        });
    } catch (error) {
        console.error('Error in gemini-api function:', error);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: getSafeErrorMessage(error) });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`gemini-api function listening on port ${PORT}`);
});

export default app;
