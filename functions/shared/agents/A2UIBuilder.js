import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    vertexai: true,
    project: process.env.GCP_PROJECT_ID,
    location: process.env.GCP_REGION || 'us-central1',
});

export const runA2UIBuilder = async (courseContent) => {
    console.log(`[A2UI Builder Agent] Translating content to A2UI payload...`);

    const prompt = `You are an expert Frontend AI generating A2UI JSON components.
Your goal is to take raw course content and map it into a beautiful, interactive learning interface using our A2UI component system.

AVAILABLE COMPONENTS:
- Card, CardHeader, CardTitle, CardContent: For grouping information.
- Accordion, AccordionItem, AccordionTrigger, AccordionContent: For collapsible steps.
- Tabs, TabsList, TabsTrigger, TabsContent: For categorized content.
- Markdown: For displaying rich text (content must be a string).
- Checkbox, RadioGroup, Textarea: For user challenges.

RULES:
1. The root element MUST be a single 'Card' or 'div' containing the entire lesson.
2. Use 'Accordion' or 'Tabs' to organize the "lessons" from the content so the user isn't overwhelmed.
3. Inside each lesson, include the "content", the "realWorldExample", and use interactive form elements for the "challengeQuestion".
4. The output MUST be a perfectly valid JSON object representing the A2UI tree.

COURSE CONTENT TO TRANSFORM:
${JSON.stringify(courseContent, null, 2)}

Output raw JSON only. Do not wrap in backticks or markdown blocks.`;

    const interaction = await ai.interactions.create({
        model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
        input: prompt,
        response_format: {
            type: 'text',
            mime_type: 'application/json',
        },
        generation_config: {
            temperature: 0.4,
            max_output_tokens: 8192,
        }
    });

    let responseText = interaction.output_text;
    
    // Clean up if the model includes markdown backticks by accident
    if (responseText.startsWith('\`\`\`')) {
        const firstNewline = responseText.indexOf('\n');
        const lastBacktick = responseText.lastIndexOf('\`\`\`');
        if (firstNewline !== -1 && lastBacktick !== -1) {
            responseText = responseText.substring(firstNewline + 1, lastBacktick).trim();
        }
    }
    
    return JSON.parse(responseText);
};
