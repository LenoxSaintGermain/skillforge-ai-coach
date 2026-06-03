import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    vertexai: true,
    project: process.env.GCP_PROJECT_ID,
    location: process.env.GCP_REGION || 'us-central1',
});

const contentSchema = {
    type: "object",
    properties: {
        title: { type: "string" },
        introduction: { type: "string" },
        lessons: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    content: { type: "string", description: "Detailed educational text, using markdown formatting." },
                    realWorldExample: { type: "string" },
                    challengeQuestion: { type: "string" }
                },
                required: ["title", "content", "realWorldExample", "challengeQuestion"]
            }
        }
    },
    required: ["title", "introduction", "lessons"]
};

export const runContentWriter = async (syllabus) => {
    console.log(`[Content Writer Agent] Drafting detailed content for: ${syllabus.title}...`);

    const prompt = `You are an expert Content Writer and Subject Matter Expert.
Given the following syllabus outline, write the full, comprehensive training material for each section.
Use your web search tool to ensure your real-world examples and facts are up-to-date and accurate.

SYLLABUS:
${JSON.stringify(syllabus, null, 2)}

Return the output in the strictly requested JSON structure.`;

    const interaction = await ai.interactions.create({
        model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
        input: prompt,
        response_format: {
            type: 'text',
            mime_type: 'application/json',
            schema: contentSchema,
        },
        tools: [
            { type: 'google_search' } // Use Google Search grounding to pull latest info
        ],
        generation_config: {
            temperature: 0.7,
            max_output_tokens: 8192,
        }
    });

    return JSON.parse(interaction.output_text);
};
