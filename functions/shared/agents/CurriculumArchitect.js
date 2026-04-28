import { VertexAI } from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
    project: process.env.GCP_PROJECT_ID,
    location: process.env.GCP_REGION || 'us-central1',
});

const syllabusSchema = {
    type: "object",
    properties: {
        title: { type: "string" },
        sections: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    keyTopics: { type: "array", items: { type: "string" } }
                },
                required: ["title", "description", "keyTopics"]
            }
        }
    },
    required: ["title", "sections"]
};

export const runCurriculumArchitect = async (subject, level, role) => {
    console.log(`[Architect Agent] Designing syllabus for ${subject} (${level} level) for a ${role}...`);

    const model = vertexAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-3.1-flash',
        generationConfig: {
            temperature: 0.5,
            responseMimeType: 'application/json',
            responseSchema: syllabusSchema,
        }
    });

    const prompt = `You are an expert Curriculum Architect. 
Design a structured syllabus for the subject: "${subject}".
The target audience is at the "${level}" level, and they work in the role of "${role}".
Ensure the curriculum is practical, progressive, and highly relevant.
Return the output in the requested JSON structure.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.candidates[0].content.parts[0].text;
    
    return JSON.parse(responseText);
};
