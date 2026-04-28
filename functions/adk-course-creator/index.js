import express from 'express';
import cors from 'cors';
import { verifyAuth, getSafeErrorMessage, corsHeaders } from '../shared/auth.js';
import { runCurriculumArchitect } from '../shared/agents/CurriculumArchitect.js';
import { runContentWriter } from '../shared/agents/ContentWriter.js';
import { runA2UIBuilder } from '../shared/agents/A2UIBuilder.js';

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

app.post('/', async (req, res) => {
    try {
        // Verify Firebase auth token
        const user = await verifyAuth(req);
        console.log('Authenticated request from user:', user.uid);

        const { subject, level = 'beginner', role = 'developer' } = req.body;

        if (!subject) {
            return res.status(400).json({ error: 'Subject is required to generate a course.' });
        }

        console.log(`Starting ADK 2.0 Multi-Agent Workflow for subject: ${subject}`);

        // --- STAGE 1: CurriculumArchitect ---
        // Generates the syllabus structure
        const syllabus = await runCurriculumArchitect(subject, level, role);
        console.log('Syllabus generation complete:', syllabus.title);

        // --- STAGE 2: ContentWriter ---
        // Writes the full content, examples, and challenges based on the syllabus
        const courseContent = await runContentWriter(syllabus);
        console.log('Content writing complete. Lessons drafted:', courseContent.lessons?.length);

        // --- STAGE 3: A2UIBuilder ---
        // Converts the raw content into an interactive A2UI payload
        const a2uiPayload = await runA2UIBuilder(courseContent);
        console.log('A2UI generation complete.');

        return res.json({
            title: syllabus.title,
            description: courseContent.introduction,
            a2uiPayload: a2uiPayload,
            rawContent: courseContent // Include raw content in case it's needed for other processing
        });

    } catch (error) {
        console.error('Error in adk-course-creator workflow:', error);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: getSafeErrorMessage(error) });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`adk-course-creator function listening on port ${PORT}`);
});

export default app;
