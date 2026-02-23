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
        console.log('Authenticated request from user:', user.uid);

        const { query: searchQuery } = req.body;
        const userId = user.uid;

        if (!searchQuery || typeof searchQuery !== 'string') {
            return res.status(400).json({ error: 'Query is required' });
        }

        console.log(`Discovering resources for query: "${searchQuery}"`);

        const model = vertexAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4000,
                topP: 0.95,
                topK: 64,
                responseMimeType: 'application/json',
            },
        });

        const prompt = `You are an expert learning resource curator. Based on your knowledge, recommend the 8 best learning resources about: "${searchQuery}"

For each resource, provide:
- title: Clear, descriptive title
- description: 2-3 sentence summary of what the resource covers
- url: Full URL to the resource (use well-known, authoritative sources)
- type: One of: documentation, video, tutorial, article, template
- tags: 3-5 relevant keywords (lowercase, hyphenated)
- quality_score: Rate 1-10 based on authority, clarity, and educational value

Return ONLY a valid JSON array.`;

        const result = await model.generateContent(prompt);
        const content = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
            throw new Error('No content in Gemini response');
        }

        let resources;
        try {
            let cleaned = content.trim();
            if (cleaned.startsWith('```json')) {
                cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }
            resources = JSON.parse(cleaned);
        } catch {
            throw new Error('Invalid JSON response from AI');
        }

        if (!Array.isArray(resources) || resources.length === 0) {
            throw new Error('No resources found in AI response');
        }

        console.log(`Discovered ${resources.length} resources`);

        // Save to Cloud SQL (replaces Supabase client insert)
        const insertPromises = resources.map((resource) =>
            query(
                `INSERT INTO learning_resources 
         (title, description, url, type, tags, source, quality_score, votes, topic_area, added_by_user_id, is_verified) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
                [
                    resource.title,
                    resource.description,
                    resource.url,
                    resource.type,
                    resource.tags || [],
                    'ai-curated',
                    resource.quality_score,
                    0,
                    searchQuery,
                    userId,
                    false,
                ]
            )
        );

        try {
            const results = await Promise.all(insertPromises);
            const savedResources = results.map((r) => r.rows[0]);
            console.log(`Saved ${savedResources.length} resources to database`);

            return res.json({
                resources: savedResources,
                saved: true,
                count: savedResources.length,
            });
        } catch (dbError) {
            console.error('Database error:', dbError);
            return res.json({
                resources,
                saved: false,
                error: 'Resources found but not saved to database',
            });
        }
    } catch (error) {
        console.error('Error in discover-resources:', error);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: getSafeErrorMessage(error) });
    }
});

const PORT = process.env.PORT || 8083;
app.listen(PORT, () => {
    console.log(`discover-resources function listening on port ${PORT}`);
});

export default app;
