import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simplified catalog for token efficiency - just enough for AI to match
const catalogContext = [
  { id: "lab-build-a-chat-application-using-the-gemini-api-on-cloud-run", title: "Build a Chat Application using the Gemini API on Cloud Run", type: "lab", level: "intermediate", products: ["Cloud Run", "Vertex AI"] },
  { id: "course-analyze-and-reason-on-multimodal-data-with-gemini", title: "Analyze and Reason on Multimodal Data with Gemini", type: "course", level: "intermediate", products: ["Vertex AI"] },
  { id: "course-introduction-to-ai-and-machine-learning-on-google-cloud", title: "Introduction to AI and Machine Learning on Google Cloud", type: "course", level: "introductory", products: ["Vertex AI"] },
  { id: "course-perform-predictive-data-analysis-in-bigquery", title: "Perform Predictive Data Analysis in BigQuery", type: "course", level: "intermediate", products: ["BigQuery", "BigQuery ML"] },
  { id: "course-implement-multimodal-vector-search-with-bigquery", title: "Implement Multimodal Vector Search with BigQuery", type: "course", level: "intermediate", products: ["BigQuery", "Vertex AI"] },
  { id: "course-monitoring-in-google-cloud", title: "Monitoring in Google Cloud", type: "course", level: "introductory", products: ["Cloud Monitoring"] },
  { id: "course-manage-kubernetes-in-google-cloud", title: "Manage Kubernetes in Google Cloud", type: "course", level: "intermediate", products: ["Google Kubernetes Engine"] },
  { id: "course-implement-ci-cd-pipelines-on-google-cloud", title: "Implement CI/CD Pipelines on Google Cloud", type: "course", level: "intermediate", products: ["Cloud Build", "Cloud Deploy"] },
  { id: "course-kickstarting-application-development-with-gemini-code-assist", title: "Kickstarting Application Development with Gemini Code Assist", type: "course", level: "intermediate", products: ["Gemini"] },
  { id: "course-inspect-rich-documents-with-gemini-multimodality-and-multimodal-rag", title: "Inspect Rich Documents with Gemini Multimodality and Multimodal RAG", type: "course", level: "intermediate", products: ["Vertex AI"] },
  { id: "course-google-deepmind-train-a-small-language-model", title: "Google DeepMind: Train A Small Language Model", type: "course", level: "advanced", products: ["Vertex AI"] },
  { id: "course-create-conversational-agents-with-stateful-flows", title: "Create Conversational Agents with Stateful Flows", type: "course", level: "intermediate", products: ["Dialogflow"] },
  { id: "course-introduction-to-gemini-enterprise", title: "Introduction to Gemini Enterprise", type: "course", level: "introductory", products: ["Gemini"] },
  { id: "course-the-basics-of-google-cloud-compute", title: "The Basics of Google Cloud Compute", type: "course", level: "introductory", products: ["Compute Engine"] },
  { id: "course-build-a-data-warehouse-with-bigquery", title: "Build a Data Warehouse with BigQuery", type: "course", level: "intermediate", products: ["BigQuery"] },
  { id: "course-build-a-website-on-google-cloud", title: "Build a Website on Google Cloud", type: "course", level: "introductory", products: ["Cloud Run", "Google Kubernetes Engine"] },
  { id: "course-deploy-multi-agent-architectures", title: "Deploy Multi-Agent Architectures", type: "course", level: "advanced", products: ["Vertex AI"] },
  { id: "course-develop-serverless-apps-with-firebase", title: "Develop Serverless Apps with Firebase", type: "course", level: "intermediate", products: ["Firebase"] },
  { id: "course-develop-serverless-applications-on-cloud-run", title: "Develop Serverless Applications on Cloud Run", type: "course", level: "intermediate", products: ["Cloud Run"] },
  { id: "course-get-started-with-pub-sub", title: "Get Started with Pub/Sub", type: "course", level: "introductory", products: ["Pub/Sub"] },
  { id: "course-get-started-with-cloud-storage", title: "Get Started with Cloud Storage", type: "course", level: "introductory", products: ["Cloud Storage"] },
  { id: "course-get-started-with-api-gateway", title: "Get Started with API Gateway", type: "course", level: "introductory", products: ["Cloud API Gateway"] },
  { id: "course-implement-cloud-security-fundamentals-on-google-cloud", title: "Implement Cloud Security Fundamentals on Google Cloud", type: "course", level: "intermediate", products: ["Cloud IAM", "Security Command Center"] },
  { id: "course-engineer-data-for-predictive-modeling-with-bigquery-ml", title: "Engineer Data for Predictive Modeling with BigQuery ML", type: "course", level: "intermediate", products: ["BigQuery ML"] },
  { id: "course-cloud-run-functions-3-ways", title: "Cloud Run Functions: 3 Ways", type: "course", level: "introductory", products: ["Cloud Run"] },
  { id: "course-prompt-design-in-vertex-ai", title: "Prompt Design in Vertex AI", type: "course", level: "introductory", products: ["Vertex AI"] },
  { id: "course-generative-ai-fundamentals", title: "Generative AI Fundamentals", type: "course", level: "introductory", products: ["Vertex AI"] },
  { id: "lab-intro-to-ml-image-processing", title: "Intro to ML: Image Processing", type: "lab", level: "introductory", products: ["Cloud Vision API"] },
  { id: "course-machine-learning-operations-mlops-fundamentals", title: "Machine Learning Operations (MLOps) Fundamentals", type: "course", level: "intermediate", products: ["Vertex AI"] },
  { id: "lab-build-and-deploy-ml-solutions-with-vertex-ai", title: "Build and Deploy ML Solutions with Vertex AI", type: "lab", level: "intermediate", products: ["Vertex AI"] },
  { id: "course-responsible-ai-applying-ai-principles-with-google-cloud", title: "Responsible AI: Applying AI Principles with Google Cloud", type: "course", level: "introductory", products: ["Vertex AI"] },
  { id: "lab-vertex-ai-custom-model-training-and-serving", title: "Vertex AI: Custom Model Training and Serving", type: "lab", level: "advanced", products: ["Vertex AI"] },
  { id: "course-introduction-to-large-language-models", title: "Introduction to Large Language Models", type: "course", level: "introductory", products: ["Vertex AI"] },
  { id: "course-introduction-to-image-generation", title: "Introduction to Image Generation", type: "course", level: "introductory", products: ["Imagen"] },
  { id: "lab-get-started-with-vertex-ai-studio", title: "Get Started with Vertex AI Studio", type: "lab", level: "introductory", products: ["Vertex AI"] },
  { id: "course-encoder-decoder-architecture", title: "Encoder-Decoder Architecture", type: "course", level: "intermediate", products: ["Vertex AI"] },
  { id: "course-attention-mechanism", title: "Attention Mechanism", type: "course", level: "intermediate", products: ["Vertex AI"] },
  { id: "course-transformer-models-and-bert-model", title: "Transformer Models and BERT Model", type: "course", level: "intermediate", products: ["Vertex AI"] },
  { id: "lab-generative-ai-with-vertex-ai-prompt-design", title: "Generative AI with Vertex AI: Prompt Design", type: "lab", level: "introductory", products: ["Vertex AI"] },
  { id: "course-introduction-to-vertex-ai-gemini-api", title: "Introduction to Vertex AI Gemini API", type: "course", level: "introductory", products: ["Vertex AI"] },
  { id: "lab-getting-started-with-the-gemini-api-in-vertex-ai", title: "Getting Started with the Gemini API in Vertex AI", type: "lab", level: "introductory", products: ["Vertex AI"] },
  { id: "course-vector-search-and-embeddings", title: "Vector Search and Embeddings", type: "course", level: "intermediate", products: ["Vertex AI"] },
  { id: "lab-build-a-rag-application-using-vertex-ai", title: "Build a RAG Application using Vertex AI", type: "lab", level: "intermediate", products: ["Vertex AI"] },
  { id: "course-grounding-large-language-models", title: "Grounding Large Language Models", type: "course", level: "intermediate", products: ["Vertex AI"] },
  { id: "lab-function-calling-with-gemini", title: "Function Calling with Gemini", type: "lab", level: "intermediate", products: ["Vertex AI"] },
  { id: "course-fine-tuning-llms", title: "Fine-Tuning LLMs", type: "course", level: "advanced", products: ["Vertex AI"] },
  { id: "lab-fine-tune-a-generative-ai-model", title: "Fine-Tune a Generative AI Model", type: "lab", level: "advanced", products: ["Vertex AI"] },
  { id: "course-ai-agents-in-vertex-ai", title: "AI Agents in Vertex AI", type: "course", level: "intermediate", products: ["Vertex AI"] },
  { id: "lab-build-ai-agents-with-vertex-ai", title: "Build AI Agents with Vertex AI", type: "lab", level: "intermediate", products: ["Vertex AI"] },
  { id: "course-langchain-on-vertex-ai", title: "LangChain on Vertex AI", type: "course", level: "intermediate", products: ["Vertex AI"] },
  { id: "lab-build-langchain-applications-on-vertex-ai", title: "Build LangChain Applications on Vertex AI", type: "lab", level: "intermediate", products: ["Vertex AI"] },
  { id: "course-gemini-for-google-workspace", title: "Gemini for Google Workspace", type: "course", level: "introductory", products: ["Gemini", "Google Workspace"] },
  { id: "course-gemini-for-developers", title: "Gemini for Developers", type: "course", level: "intermediate", products: ["Gemini"] },
  { id: "lab-deploy-a-gemini-powered-application", title: "Deploy a Gemini-Powered Application", type: "lab", level: "intermediate", products: ["Cloud Run", "Vertex AI"] },
  { id: "course-duet-ai-for-developers", title: "Gemini Code Assist for Developers", type: "course", level: "intermediate", products: ["Gemini"] },
  { id: "lab-use-gemini-code-assist-to-build-applications", title: "Use Gemini Code Assist to Build Applications", type: "lab", level: "intermediate", products: ["Gemini"] },
  { id: "course-document-ai-fundamentals", title: "Document AI Fundamentals", type: "course", level: "intermediate", products: ["Document AI"] },
  { id: "course-cloud-natural-language-api", title: "Cloud Natural Language API", type: "course", level: "introductory", products: ["Cloud Natural Language API"] },
  { id: "lab-entity-and-sentiment-analysis-with-cloud-natural-language-api", title: "Entity and Sentiment Analysis with Cloud Natural Language API", type: "lab", level: "introductory", products: ["Cloud Natural Language API"] },
  { id: "course-google-cloud-speech-to-text-api", title: "Google Cloud Speech-to-Text API", type: "course", level: "introductory", products: ["Speech-to-Text API"] },
  { id: "lab-transcribe-speech-to-text-using-cloud-speech-api", title: "Transcribe Speech to Text using Cloud Speech API", type: "lab", level: "introductory", products: ["Speech-to-Text API"] },
  { id: "course-text-to-speech-api-fundamentals", title: "Text-to-Speech API Fundamentals", type: "course", level: "introductory", products: ["Text-to-Speech API"] },
  { id: "course-translation-api-fundamentals", title: "Translation API Fundamentals", type: "course", level: "introductory", products: ["Cloud Translation API"] },
  { id: "course-video-intelligence-api", title: "Video Intelligence API", type: "course", level: "intermediate", products: ["Video Intelligence API"] },
  { id: "lab-detect-labels-faces-and-landmarks-in-images-with-cloud-vision-api", title: "Detect Labels, Faces, and Landmarks in Images with Cloud Vision API", type: "lab", level: "introductory", products: ["Cloud Vision API"] },
  { id: "course-automl-on-vertex-ai", title: "AutoML on Vertex AI", type: "course", level: "intermediate", products: ["Vertex AI"] },
  { id: "lab-train-an-automl-model-with-vertex-ai", title: "Train an AutoML Model with Vertex AI", type: "lab", level: "intermediate", products: ["Vertex AI"] },
  { id: "course-tensorflow-on-google-cloud", title: "TensorFlow on Google Cloud", type: "course", level: "advanced", products: ["TensorFlow"] },
  { id: "course-bigquery-ml-getting-started", title: "BigQuery ML: Getting Started", type: "course", level: "introductory", products: ["BigQuery ML"] },
  { id: "lab-predict-visitor-purchases-with-bigquery-ml", title: "Predict Visitor Purchases with BigQuery ML", type: "lab", level: "intermediate", products: ["BigQuery ML"] },
  { id: "course-recommendations-ai-fundamentals", title: "Recommendations AI Fundamentals", type: "course", level: "intermediate", products: ["Recommendations AI"] },
  { id: "course-contact-center-ai-fundamentals", title: "Contact Center AI Fundamentals", type: "course", level: "intermediate", products: ["Contact Center AI", "Dialogflow"] },
  { id: "lab-build-a-virtual-agent-with-dialogflow-cx", title: "Build a Virtual Agent with Dialogflow CX", type: "lab", level: "intermediate", products: ["Dialogflow CX"] },
  { id: "course-dialogflow-essentials", title: "Dialogflow Essentials", type: "course", level: "introductory", products: ["Dialogflow"] },
  { id: "course-conversational-ai-on-vertex-ai", title: "Conversational AI on Vertex AI", type: "course", level: "intermediate", products: ["Dialogflow CX"] },
  { id: "course-build-with-ai-solutions", title: "Build with AI Solutions", type: "course", level: "intermediate", products: ["Vertex AI", "Cloud Run"] },
  { id: "course-ai-platform-notebooks-fundamentals", title: "Vertex AI Workbench Fundamentals", type: "course", level: "introductory", products: ["Vertex AI Workbench"] },
  { id: "course-data-science-on-google-cloud", title: "Data Science on Google Cloud", type: "course", level: "intermediate", products: ["BigQuery", "Vertex AI"] },
  { id: "course-feature-engineering", title: "Feature Engineering", type: "course", level: "advanced", products: ["BigQuery", "Vertex AI"] },
  { id: "course-ml-pipelines-on-google-cloud", title: "ML Pipelines on Google Cloud", type: "course", level: "advanced", products: ["Vertex AI Pipelines"] },
  { id: "lab-build-and-run-ml-pipelines-with-vertex-ai", title: "Build and Run ML Pipelines with Vertex AI", type: "lab", level: "advanced", products: ["Vertex AI Pipelines"] },
  { id: "course-model-evaluation-on-vertex-ai", title: "Model Evaluation on Vertex AI", type: "course", level: "intermediate", products: ["Vertex AI"] },
  { id: "course-explainable-ai-on-vertex-ai", title: "Explainable AI on Vertex AI", type: "course", level: "intermediate", products: ["Vertex AI"] },
  { id: "course-image-classification-with-vertex-ai", title: "Image Classification with Vertex AI", type: "course", level: "intermediate", products: ["Vertex AI", "AutoML"] },
  { id: "course-text-classification-with-vertex-ai", title: "Text Classification with Vertex AI", type: "course", level: "intermediate", products: ["Vertex AI", "AutoML"] },
  { id: "course-tabular-data-ml-with-vertex-ai", title: "Tabular Data ML with Vertex AI", type: "course", level: "intermediate", products: ["Vertex AI", "AutoML"] },
  { id: "course-time-series-forecasting-with-vertex-ai", title: "Time Series Forecasting with Vertex AI", type: "course", level: "advanced", products: ["Vertex AI"] },
  { id: "course-vertex-ai-search-fundamentals", title: "Vertex AI Search Fundamentals", type: "course", level: "intermediate", products: ["Vertex AI Search"] },
  { id: "lab-create-a-search-app-with-vertex-ai-search", title: "Create a Search App with Vertex AI Search", type: "lab", level: "intermediate", products: ["Vertex AI Search"] },
  { id: "course-looker-and-generative-ai", title: "Looker and Generative AI", type: "course", level: "intermediate", products: ["Looker", "Vertex AI"] },
  { id: "course-gemini-for-data-scientists-and-analysts", title: "Gemini for Data Scientists and Analysts", type: "course", level: "intermediate", products: ["BigQuery", "Gemini"] },
  { id: "lab-use-gemini-to-analyze-data-in-bigquery", title: "Use Gemini to Analyze Data in BigQuery", type: "lab", level: "intermediate", products: ["BigQuery", "Gemini"] },
  { id: "course-gemini-for-cloud-architects", title: "Gemini for Cloud Architects", type: "course", level: "intermediate", products: ["Google Cloud", "Gemini"] },
  { id: "course-gemini-for-security-engineers", title: "Gemini for Security Engineers", type: "course", level: "intermediate", products: ["Security Command Center", "Gemini"] },
  { id: "course-gemini-for-devops-engineers", title: "Gemini for DevOps Engineers", type: "course", level: "intermediate", products: ["Cloud Build", "Gemini"] },
  { id: "course-gemini-for-network-engineers", title: "Gemini for Network Engineers", type: "course", level: "intermediate", products: ["VPC", "Gemini"] },
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { persona, goal } = await req.json();
    
    if (!persona || !goal) {
      return new Response(
        JSON.stringify({ error: 'Missing persona or goal' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

    console.log('Calling Gemini API for learning path generation...');
    console.log('Persona:', persona);
    console.log('Goal:', goal);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: systemPrompt + '\n\n' + userPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Gemini response received');

    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      console.error('No text content in response:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: 'Invalid AI response format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response
    let pathway;
    try {
      pathway = JSON.parse(textContent);
    } catch (parseError) {
      console.error('Failed to parse JSON:', textContent);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the response structure
    if (!pathway.rationale || !pathway.pathway || !Array.isArray(pathway.pathway)) {
      console.error('Invalid pathway structure:', pathway);
      return new Response(
        JSON.stringify({ error: 'Invalid pathway structure from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully generated learning path');

    return new Response(
      JSON.stringify(pathway),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Learning path generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
