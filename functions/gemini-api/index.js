import express from 'express';
import cors from 'cors';
import { VertexAI } from '@google-cloud/vertexai';
import { verifyAuth, getSafeErrorMessage, corsHeaders } from '../shared/auth.js';

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

// Initialize Vertex AI (uses Application Default Credentials — no API key needed in GCP)
const vertexAI = new VertexAI({
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

        // Use Vertex AI SDK instead of direct API key calls
        const model = vertexAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
            generationConfig: {
                temperature: temperature === 0.7 ? 1.0 : temperature,
                maxOutputTokens: maxTokens,
                topP: 0.95,
                topK: 64,
                responseMimeType: responseSchema ? 'application/json' : undefined,
                responseSchema: responseSchema || undefined,
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
            ],
        });

        console.log('Calling Gemini via Vertex AI with prompt:', prompt.substring(0, 100) + '...');

        const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
        const result = await model.generateContent(fullPrompt);
        const response = result.response;

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error('Gemini API returned no response candidates.');
        }

        const candidate = response.candidates[0];

        if (candidate.finishReason === 'SAFETY') {
            throw new Error('Content was blocked by Gemini safety filters.');
        }

        if (candidate.finishReason === 'MAX_TOKENS') {
            throw new Error('MAX_TOKENS: Response was truncated.');
        }

        const generatedText = candidate.content?.parts?.[0]?.text;
        if (!generatedText) {
            throw new Error('Gemini API returned empty response text');
        }

        console.log('Gemini response received successfully');

        return res.json({
            generatedText,
            usage: response.usageMetadata || {},
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
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
