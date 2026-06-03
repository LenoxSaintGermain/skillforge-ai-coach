import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    vertexai: true,
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

    const prompt = `You are an expert Curriculum Architect. 
Design a structured syllabus for the subject: "${subject}".
The target audience is at the "${level}" level, and they work in the role of "${role}".
Ensure the curriculum is practical, progressive, and highly relevant.
Return the output in the requested JSON structure.`;

    const interaction = await ai.interactions.create({
        model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
        input: prompt,
        response_format: {
            type: 'text',
            mime_type: 'application/json',
            schema: syllabusSchema,
        },
        generation_config: {
            temperature: 0.5,
        }
    });

    return JSON.parse(interaction.output_text);
};
