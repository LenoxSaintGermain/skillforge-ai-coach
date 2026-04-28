import { VertexAI } from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
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

    const model = vertexAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-3.1-flash',
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
            responseSchema: contentSchema,
        },
        tools: [
            { googleSearchRetrieval: {} } // Use Google Search grounding to pull latest info
        ]
    });

    const prompt = `You are an expert Content Writer and Subject Matter Expert.
Given the following syllabus outline, write the full, comprehensive training material for each section.
Use your web search tool to ensure your real-world examples and facts are up-to-date and accurate.

SYLLABUS:
${JSON.stringify(syllabus, null, 2)}

Return the output in the strictly requested JSON structure.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.candidates[0].content.parts[0].text;
    
    return JSON.parse(responseText);
};
