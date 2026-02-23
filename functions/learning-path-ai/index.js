import express from 'express';
import cors from 'cors';
import { VertexAI } from '@google-cloud/vertexai';
import { getSafeErrorMessage } from '../shared/auth.js';

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

const vertexAI = new VertexAI({
    project: process.env.GCP_PROJECT_ID,
    location: process.env.GCP_REGION || 'us-central1',
});

// Simplified catalog for token efficiency
const catalogContext = [
    { id: "lab-build-a-chat-application-using-the-gemini-api-on-cloud-run", title: "Build a Chat Application using the Gemini API on Cloud Run", type: "lab", level: "intermediate", products: ["Cloud Run", "Vertex AI"] },
    { id: "course-analyze-and-reason-on-multimodal-data-with-gemini", title: "Analyze and Reason on Multimodal Data with Gemini", type: "course", level: "intermediate", products: ["Vertex AI"] },
    { id: "course-introduction-to-ai-and-machine-learning-on-google-cloud", title: "Introduction to AI and Machine Learning on Google Cloud", type: "course", level: "introductory", products: ["Vertex AI"] },
    { id: "course-prompt-design-in-vertex-ai", title: "Prompt Design in Vertex AI", type: "course", level: "introductory", products: ["Vertex AI"] },
    { id: "course-generative-ai-fundamentals", title: "Generative AI Fundamentals", type: "course", level: "introductory", products: ["Vertex AI"] },
    { id: "course-introduction-to-large-language-models", title: "Introduction to Large Language Models", type: "course", level: "introductory", products: ["Vertex AI"] },
    { id: "course-introduction-to-vertex-ai-gemini-api", title: "Introduction to Vertex AI Gemini API", type: "course", level: "introductory", products: ["Vertex AI"] },
    { id: "lab-getting-started-with-the-gemini-api-in-vertex-ai", title: "Getting Started with the Gemini API in Vertex AI", type: "lab", level: "introductory", products: ["Vertex AI"] },
    { id: "course-vector-search-and-embeddings", title: "Vector Search and Embeddings", type: "course", level: "intermediate", products: ["Vertex AI"] },
    { id: "lab-build-a-rag-application-using-vertex-ai", title: "Build a RAG Application using Vertex AI", type: "lab", level: "intermediate", products: ["Vertex AI"] },
    { id: "course-fine-tuning-llms", title: "Fine-Tuning LLMs", type: "course", level: "advanced", products: ["Vertex AI"] },
    { id: "course-ai-agents-in-vertex-ai", title: "AI Agents in Vertex AI", type: "course", level: "intermediate", products: ["Vertex AI"] },
    { id: "lab-build-ai-agents-with-vertex-ai", title: "Build AI Agents with Vertex AI", type: "lab", level: "intermediate", products: ["Vertex AI"] },
    { id: "course-deploy-multi-agent-architectures", title: "Deploy Multi-Agent Architectures", type: "course", level: "advanced", products: ["Vertex AI"] },
    { id: "course-implement-cloud-security-fundamentals-on-google-cloud", title: "Implement Cloud Security Fundamentals on Google Cloud", type: "course", level: "intermediate", products: ["Cloud IAM", "Security Command Center"] },
    { id: "course-develop-serverless-applications-on-cloud-run", title: "Develop Serverless Applications on Cloud Run", type: "course", level: "intermediate", products: ["Cloud Run"] },
    { id: "course-implement-ci-cd-pipelines-on-google-cloud", title: "Implement CI/CD Pipelines on Google Cloud", type: "course", level: "intermediate", products: ["Cloud Build", "Cloud Deploy"] },
    { id: "course-monitoring-in-google-cloud", title: "Monitoring in Google Cloud", type: "course", level: "introductory", products: ["Cloud Monitoring"] },
    { id: "course-build-a-data-warehouse-with-bigquery", title: "Build a Data Warehouse with BigQuery", type: "course", level: "intermediate", products: ["BigQuery"] },
    { id: "course-gemini-for-developers", title: "Gemini for Developers", type: "course", level: "intermediate", products: ["Gemini"] },
];

// NOTE: This function does NOT require authentication (matches original Supabase config: verify_jwt = false)
app.post('/', async (req, res) => {
    try {
        const { persona, goal } = req.body;

        if (!persona || !goal) {
            return res.status(400).json({ error: 'Missing persona or goal' });
        }

        const systemPrompt = `You are the SkillForge Curator. Your goal is to build a personalized 3-step learning path from Google Cloud's catalog.

IMPORTANT: You must ONLY return course/lab IDs that exist in the provided catalog. Do not make up IDs.

Your Task:
1. Analyze the user's goal to identify key Google Cloud products and action keywords.
2. Search the Catalog for assets that match these products and keywords.
3. Select exactly 3 assets forming a logical sequence:
   - Step 1 (The Hook): An introductory course to set the foundation.
   - Step 2 (The Action): A hands-on lab to apply the skill.
   - Step 3 (The Deep Dive): An intermediate/advanced asset to go deeper.
4. Provide a rationale for the overall path (2-3 sentences) and a specific reason for each choice (1 sentence each).

Respond ONLY with valid JSON matching this schema:
{
  "rationale": "string explaining why this path fits the user",
  "pathway": [
    { "id": "exact-id-from-catalog", "reason": "why this course/lab", "step_name": "The Hook" },
    { "id": "exact-id-from-catalog", "reason": "why this course/lab", "step_name": "The Action" },
    { "id": "exact-id-from-catalog", "reason": "why this course/lab", "step_name": "The Deep Dive" }
  ]
}`;

        const userPrompt = `User Persona: ${persona}
User Goal: ${goal}

Available Catalog:
${JSON.stringify(catalogContext, null, 2)}

Generate a personalized 3-step learning path for this user. Remember: only use IDs that exist in the catalog above.`;

        console.log('Generating learning path for persona:', persona);

        const model = vertexAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
            generationConfig: {
                temperature: 1.0,
                topP: 0.95,
                topK: 64,
                maxOutputTokens: 4096,
                responseMimeType: 'application/json',
            },
        });

        const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
        const textContent = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textContent) {
            throw new Error('Invalid AI response format');
        }

        const pathway = JSON.parse(textContent);

        if (!pathway.rationale || !pathway.pathway || !Array.isArray(pathway.pathway)) {
            throw new Error('Invalid pathway structure from AI');
        }

        console.log('Successfully generated learning path');
        return res.json(pathway);
    } catch (error) {
        console.error('Learning path generation error:', error);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: getSafeErrorMessage(error) });
    }
});

const PORT = process.env.PORT || 8085;
app.listen(PORT, () => {
    console.log(`learning-path-ai function listening on port ${PORT}`);
});

export default app;
