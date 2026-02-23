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
        console.log('Authenticated request from user:', user.uid);

        const { prompt, model: requestedModel = 'gemini-2.5-flash', temperature = 0.7, maxTokens = 1000, systemPrompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        let generatedText = '';

        if (requestedModel.includes('claude')) {
            // Claude via Vertex AI Model Garden
            // Uses the Anthropic publisher endpoint on Vertex AI
            const endpoint = `https://us-east5-aiplatform.googleapis.com/v1/projects/${process.env.GCP_PROJECT_ID}/locations/us-east5/publishers/anthropic/models/${requestedModel}:rawPredict`;

            // Use Application Default Credentials for auth
            const { GoogleAuth } = await import('google-auth-library');
            const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
            const client = await auth.getClient();
            const accessToken = await client.getAccessToken();

            const anthropicResponse = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    anthropic_version: 'vertex-2023-10-16',
                    max_tokens: maxTokens,
                    temperature: temperature,
                    messages: [
                        ...(systemPrompt ? [{ role: 'user', content: `[System Instructions]\n${systemPrompt}` }] : []),
                        { role: 'user', content: prompt },
                    ],
                }),
            });

            if (!anthropicResponse.ok) {
                const errorText = await anthropicResponse.text();
                console.error('Claude/Vertex AI error:', errorText);
                throw new Error(`Vertex AI error: ${anthropicResponse.status}`);
            }

            const claudeData = await anthropicResponse.json();
            generatedText = claudeData.content?.[0]?.text || '';
        } else {
            // Gemini via Vertex AI SDK (no API key needed — uses ADC)
            const model = vertexAI.getGenerativeModel({
                model: requestedModel,
                generationConfig: {
                    temperature: 1.0,
                    maxOutputTokens: maxTokens,
                    topP: 0.95,
                    topK: 64,
                },
            });

            const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
            const result = await model.generateContent(fullPrompt);
            const response = result.response;

            if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
                generatedText = response.candidates[0].content.parts[0].text;
            }
        }

        if (!generatedText) {
            throw new Error('Unable to extract generated text from response');
        }

        console.log('Vertex AI response received successfully');

        return res.json({
            generatedText,
            model: requestedModel,
            usage: {},
        });
    } catch (error) {
        console.error('Error in vertex-ai function:', error);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: getSafeErrorMessage(error) });
    }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`vertex-ai function listening on port ${PORT}`);
});

export default app;
