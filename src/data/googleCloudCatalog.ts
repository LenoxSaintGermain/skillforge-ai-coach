export interface CatalogItem {
  id: string;
  title: string;
  type: string;
  level: string;
  duration_minutes: number;
  products: string[];
}

export const catalog: CatalogItem[] = [
  {
    "id": "lab-build-a-chat-application-using-the-gemini-api-on-cloud-run",
    "title": "Build a Chat Application using the Gemini API on Cloud Run",
    "type": "lab",
    "level": "intermediate",
    "duration_minutes": 90,
    "products": ["AppSheet", "Cloud Run", "Vertex AI"]
  },
  {
    "id": "course-analyze-and-reason-on-multimodal-data-with-gemini",
    "title": "Analyze and Reason on Multimodal Data with Gemini",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 95,
    "products": ["BigQuery ML", "Vertex AI"]
  },
  {
    "id": "course-introduction-to-ai-and-machine-learning-on-google-cloud",
    "title": "Introduction to AI and Machine Learning on Google Cloud",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 1440,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-using-the-google-cloud-speech-api",
    "title": "Using the Google Cloud Speech API",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 40,
    "products": []
  },
  {
    "id": "course-perform-predictive-data-analysis-in-bigquery",
    "title": "Perform Predictive Data Analysis in BigQuery",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 55,
    "products": ["BigQuery", "BigQuery ML", "Cloud Data Fusion", "Cloud Dataflow", "Dataprep"]
  },
  {
    "id": "course-implement-multimodal-vector-search-with-bigquery",
    "title": "Implement Multimodal Vector Search with BigQuery",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 50,
    "products": ["BigQuery", "BigQuery ML", "Vertex AI"]
  },
  {
    "id": "course-monitoring-in-google-cloud",
    "title": "Monitoring in Google Cloud",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 55,
    "products": ["Cloud Logging", "Cloud Monitoring", "Cloud Run functions", "Observability"]
  },
  {
    "id": "course-manage-kubernetes-in-google-cloud",
    "title": "Manage Kubernetes in Google Cloud",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 115,
    "products": ["Google Kubernetes Engine"]
  },
  {
    "id": "course-create-a-secure-data-lake-on-cloud-storage",
    "title": "Create a Secure Data Lake on Cloud Storage",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 45,
    "products": ["Cloud Identity and Access Management", "Dataplex"]
  },
  {
    "id": "course-implement-ci-cd-pipelines-on-google-cloud",
    "title": "Implement CI/CD Pipelines on Google Cloud",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 110,
    "products": ["Artifact Registry", "Cloud Build", "Cloud Deploy", "Google Kubernetes Engine"]
  },
  {
    "id": "course-kickstarting-application-development-with-gemini-code-assist",
    "title": "Kickstarting Application Development with Gemini Code Assist",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 195,
    "products": ["BigQuery ML", "Cloud Run functions", "Cloud Shell"]
  },
  {
    "id": "course-inspect-rich-documents-with-gemini-multimodality-and-multimodal-rag",
    "title": "Inspect Rich Documents with Gemini Multimodality and Multimodal RAG",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 55,
    "products": ["BigQuery ML", "Vertex AI"]
  },
  {
    "id": "course-google-deepmind-train-a-small-language-model",
    "title": "Google DeepMind: Train A Small Language Model",
    "type": "course",
    "level": "advanced",
    "duration_minutes": 120,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-create-conversational-agents-with-stateful-flows",
    "title": "Create Conversational Agents with Stateful Flows",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 120,
    "products": ["BigQuery ML"]
  },
  {
    "id": "course-introduction-to-gemini-enterprise",
    "title": "Introduction to Gemini Enterprise",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 180,
    "products": ["Gemini Enterprise"]
  },
  {
    "id": "course-the-basics-of-google-cloud-compute",
    "title": "The Basics of Google Cloud Compute",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 70,
    "products": ["Compute Engine", "Persistent Disk"]
  },
  {
    "id": "course-streaming-analytics-into-bigquery",
    "title": "Streaming Analytics into BigQuery",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 40,
    "products": ["BigQuery", "BigQuery ML", "Cloud Bigtable", "Cloud Dataproc", "Cloud SQL"]
  },
  {
    "id": "course-build-google-cloud-infrastructure-for-aws-professionals",
    "title": "Build Google Cloud Infrastructure for AWS Professionals",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 70,
    "products": ["AppSheet", "Compute Engine", "Google Kubernetes Engine"]
  },
  {
    "id": "course-build-a-data-warehouse-with-bigquery",
    "title": "Build a Data Warehouse with BigQuery",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 80,
    "products": ["BigQuery", "BigQuery ML", "Cloud Bigtable", "Cloud Dataproc", "Cloud SQL"]
  },
  {
    "id": "course-build-a-website-on-google-cloud",
    "title": "Build a Website on Google Cloud",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 904,
    "products": ["Cloud Build", "Cloud Run", "Google Kubernetes Engine"]
  },
  {
    "id": "course-deploy-multi-agent-architectures",
    "title": "Deploy Multi-Agent Architectures",
    "type": "course",
    "level": "advanced",
    "duration_minutes": 180,
    "products": ["Vertex AI"]
  },
  {
    "id": "lab-build-a-smart-cloud-application-with-vibe-coding-challenge-lab",
    "title": "Build a Smart Cloud Application with Vibe Coding: Challenge Lab",
    "type": "lab",
    "level": "introductory",
    "duration_minutes": 90,
    "products": ["AppSheet", "Cloud Run"]
  },
  {
    "id": "course-develop-serverless-apps-with-firebase",
    "title": "Develop Serverless Apps with Firebase",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 70,
    "products": ["Cloud Build", "Firebase", "Firestore"]
  },
  {
    "id": "course-develop-serverless-applications-on-cloud-run",
    "title": "Develop Serverless Applications on Cloud Run",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 95,
    "products": ["Cloud Run", "Firebase", "Firestore"]
  },
  {
    "id": "course-get-started-with-pub-sub",
    "title": "Get Started with Pub/Sub",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 20,
    "products": ["Pub/Sub"]
  },
  {
    "id": "course-get-started-with-cloud-storage",
    "title": "Get Started with Cloud Storage",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 35,
    "products": ["Cloud Storage"]
  },
  {
    "id": "course-get-started-with-api-gateway",
    "title": "Get Started with API Gateway",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 60,
    "products": ["Cloud API Gateway", "Cloud Run", "Cloud Run functions"]
  },
  {
    "id": "course-implement-cloud-security-fundamentals-on-google-cloud",
    "title": "Implement Cloud Security Fundamentals on Google Cloud",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 210,
    "products": ["BigQuery", "Cloud Identity and Access Management", "Cloud SDK", "Google Kubernetes Engine"]
  },
  {
    "id": "course-engineer-data-for-predictive-modeling-with-bigquery-ml",
    "title": "Engineer Data for Predictive Modeling with BigQuery ML",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 90,
    "products": ["BigQuery", "BigQuery ML", "Cloud Data Fusion", "Cloud Dataflow", "Dataprep"]
  },
  {
    "id": "course-develop-with-apps-script-and-appsheet",
    "title": "Develop with Apps Script and AppSheet",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 55,
    "products": ["AppSheet", "Gmail", "Google Chat", "Sheets"]
  },
  {
    "id": "course-cloud-run-functions-3-ways",
    "title": "Cloud Run Functions: 3 Ways",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 65,
    "products": ["Cloud Run", "Cloud Run functions"]
  },
  {
    "id": "course-develop-your-google-cloud-network",
    "title": "Develop Your Google Cloud Network",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 160,
    "products": ["Cloud Identity and Access Management", "Cloud Monitoring", "Google Kubernetes Engine", "Virtual Private Cloud (VPC)"]
  },
  {
    "id": "course-set-up-a-google-cloud-network",
    "title": "Set Up a Google Cloud Network",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 40,
    "products": ["Virtual Private Cloud (VPC)"]
  },
  {
    "id": "course-prompt-design-in-vertex-ai",
    "title": "Prompt Design in Vertex AI",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 45,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-generative-ai-fundamentals",
    "title": "Generative AI Fundamentals",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 60,
    "products": ["Vertex AI"]
  },
  {
    "id": "lab-intro-to-ml-image-processing",
    "title": "Intro to ML: Image Processing",
    "type": "lab",
    "level": "introductory",
    "duration_minutes": 60,
    "products": ["Vertex AI", "Cloud Vision API"]
  },
  {
    "id": "course-machine-learning-operations-mlops-fundamentals",
    "title": "Machine Learning Operations (MLOps) Fundamentals",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 240,
    "products": ["Vertex AI", "Cloud Build", "Cloud Run"]
  },
  {
    "id": "lab-build-and-deploy-ml-solutions-with-vertex-ai",
    "title": "Build and Deploy ML Solutions with Vertex AI",
    "type": "lab",
    "level": "intermediate",
    "duration_minutes": 120,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-responsible-ai-applying-ai-principles-with-google-cloud",
    "title": "Responsible AI: Applying AI Principles with Google Cloud",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 90,
    "products": ["Vertex AI"]
  },
  {
    "id": "lab-vertex-ai-custom-model-training-and-serving",
    "title": "Vertex AI: Custom Model Training and Serving",
    "type": "lab",
    "level": "advanced",
    "duration_minutes": 90,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-introduction-to-large-language-models",
    "title": "Introduction to Large Language Models",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 30,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-introduction-to-responsible-ai",
    "title": "Introduction to Responsible AI",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 25,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-introduction-to-image-generation",
    "title": "Introduction to Image Generation",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 30,
    "products": ["Vertex AI", "Imagen"]
  },
  {
    "id": "lab-get-started-with-vertex-ai-studio",
    "title": "Get Started with Vertex AI Studio",
    "type": "lab",
    "level": "introductory",
    "duration_minutes": 45,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-encoder-decoder-architecture",
    "title": "Encoder-Decoder Architecture",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 45,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-attention-mechanism",
    "title": "Attention Mechanism",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 45,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-transformer-models-and-bert-model",
    "title": "Transformer Models and BERT Model",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 45,
    "products": ["Vertex AI"]
  },
  {
    "id": "lab-generative-ai-with-vertex-ai-prompt-design",
    "title": "Generative AI with Vertex AI: Prompt Design",
    "type": "lab",
    "level": "introductory",
    "duration_minutes": 60,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-create-image-captioning-models",
    "title": "Create Image Captioning Models",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 45,
    "products": ["Vertex AI"]
  },
  {
    "id": "lab-intro-to-generative-ai-studio",
    "title": "Intro to Generative AI Studio",
    "type": "lab",
    "level": "introductory",
    "duration_minutes": 30,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-introduction-to-vertex-ai-gemini-api",
    "title": "Introduction to Vertex AI Gemini API",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 60,
    "products": ["Vertex AI"]
  },
  {
    "id": "lab-getting-started-with-the-gemini-api-in-vertex-ai",
    "title": "Getting Started with the Gemini API in Vertex AI",
    "type": "lab",
    "level": "introductory",
    "duration_minutes": 45,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-vector-search-and-embeddings",
    "title": "Vector Search and Embeddings",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 60,
    "products": ["Vertex AI"]
  },
  {
    "id": "lab-build-a-rag-application-using-vertex-ai",
    "title": "Build a RAG Application using Vertex AI",
    "type": "lab",
    "level": "intermediate",
    "duration_minutes": 90,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-grounding-large-language-models",
    "title": "Grounding Large Language Models",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 45,
    "products": ["Vertex AI"]
  },
  {
    "id": "lab-function-calling-with-gemini",
    "title": "Function Calling with Gemini",
    "type": "lab",
    "level": "intermediate",
    "duration_minutes": 60,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-fine-tuning-llms",
    "title": "Fine-Tuning LLMs",
    "type": "course",
    "level": "advanced",
    "duration_minutes": 90,
    "products": ["Vertex AI"]
  },
  {
    "id": "lab-fine-tune-a-generative-ai-model",
    "title": "Fine-Tune a Generative AI Model",
    "type": "lab",
    "level": "advanced",
    "duration_minutes": 120,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-ai-agents-in-vertex-ai",
    "title": "AI Agents in Vertex AI",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 120,
    "products": ["Vertex AI"]
  },
  {
    "id": "lab-build-ai-agents-with-vertex-ai",
    "title": "Build AI Agents with Vertex AI",
    "type": "lab",
    "level": "intermediate",
    "duration_minutes": 90,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-langchain-on-vertex-ai",
    "title": "LangChain on Vertex AI",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 75,
    "products": ["Vertex AI"]
  },
  {
    "id": "lab-build-langchain-applications-on-vertex-ai",
    "title": "Build LangChain Applications on Vertex AI",
    "type": "lab",
    "level": "intermediate",
    "duration_minutes": 60,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-gemini-for-google-workspace",
    "title": "Gemini for Google Workspace",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 60,
    "products": ["Gemini", "Google Workspace"]
  },
  {
    "id": "course-gemini-for-developers",
    "title": "Gemini for Developers",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 90,
    "products": ["Vertex AI", "Gemini"]
  },
  {
    "id": "lab-deploy-a-gemini-powered-application",
    "title": "Deploy a Gemini-Powered Application",
    "type": "lab",
    "level": "intermediate",
    "duration_minutes": 75,
    "products": ["Cloud Run", "Vertex AI"]
  },
  {
    "id": "course-duet-ai-for-developers",
    "title": "Gemini Code Assist for Developers",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 120,
    "products": ["Cloud Code", "Gemini"]
  },
  {
    "id": "lab-use-gemini-code-assist-to-build-applications",
    "title": "Use Gemini Code Assist to Build Applications",
    "type": "lab",
    "level": "intermediate",
    "duration_minutes": 60,
    "products": ["Cloud Shell", "Gemini"]
  },
  {
    "id": "course-document-ai-fundamentals",
    "title": "Document AI Fundamentals",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 180,
    "products": ["Document AI"]
  },
  {
    "id": "lab-extract-summarize-translate-text-from-images-with-cloud-ai",
    "title": "Extract, Summarize & Translate Text from Images with Cloud AI",
    "type": "lab",
    "level": "intermediate",
    "duration_minutes": 60,
    "products": ["Cloud Vision API", "Cloud Natural Language API", "Cloud Translation API"]
  },
  {
    "id": "course-cloud-natural-language-api",
    "title": "Cloud Natural Language API",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 45,
    "products": ["Cloud Natural Language API"]
  },
  {
    "id": "lab-entity-and-sentiment-analysis-with-cloud-natural-language-api",
    "title": "Entity and Sentiment Analysis with Cloud Natural Language API",
    "type": "lab",
    "level": "introductory",
    "duration_minutes": 45,
    "products": ["Cloud Natural Language API"]
  },
  {
    "id": "course-google-cloud-speech-to-text-api",
    "title": "Google Cloud Speech-to-Text API",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 45,
    "products": ["Speech-to-Text API"]
  },
  {
    "id": "lab-transcribe-speech-to-text-using-cloud-speech-api",
    "title": "Transcribe Speech to Text using Cloud Speech API",
    "type": "lab",
    "level": "introductory",
    "duration_minutes": 30,
    "products": ["Speech-to-Text API"]
  },
  {
    "id": "course-text-to-speech-api-fundamentals",
    "title": "Text-to-Speech API Fundamentals",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 30,
    "products": ["Text-to-Speech API"]
  },
  {
    "id": "lab-create-audio-with-text-to-speech-api",
    "title": "Create Audio with Text-to-Speech API",
    "type": "lab",
    "level": "introductory",
    "duration_minutes": 30,
    "products": ["Text-to-Speech API"]
  },
  {
    "id": "course-translation-api-fundamentals",
    "title": "Translation API Fundamentals",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 45,
    "products": ["Cloud Translation API"]
  },
  {
    "id": "lab-translate-text-with-cloud-translation-api",
    "title": "Translate Text with Cloud Translation API",
    "type": "lab",
    "level": "introductory",
    "duration_minutes": 30,
    "products": ["Cloud Translation API"]
  },
  {
    "id": "course-video-intelligence-api",
    "title": "Video Intelligence API",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 60,
    "products": ["Video Intelligence API"]
  },
  {
    "id": "lab-detect-labels-faces-and-landmarks-in-images-with-cloud-vision-api",
    "title": "Detect Labels, Faces, and Landmarks in Images with Cloud Vision API",
    "type": "lab",
    "level": "introductory",
    "duration_minutes": 45,
    "products": ["Cloud Vision API"]
  },
  {
    "id": "course-automl-on-vertex-ai",
    "title": "AutoML on Vertex AI",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 120,
    "products": ["Vertex AI"]
  },
  {
    "id": "lab-train-an-automl-model-with-vertex-ai",
    "title": "Train an AutoML Model with Vertex AI",
    "type": "lab",
    "level": "intermediate",
    "duration_minutes": 90,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-tensorflow-on-google-cloud",
    "title": "TensorFlow on Google Cloud",
    "type": "course",
    "level": "advanced",
    "duration_minutes": 300,
    "products": ["Vertex AI", "TensorFlow"]
  },
  {
    "id": "lab-predict-housing-prices-with-tensorflow-on-vertex-ai",
    "title": "Predict Housing Prices with TensorFlow on Vertex AI",
    "type": "lab",
    "level": "advanced",
    "duration_minutes": 90,
    "products": ["Vertex AI", "TensorFlow"]
  },
  {
    "id": "course-bigquery-ml-getting-started",
    "title": "BigQuery ML: Getting Started",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 90,
    "products": ["BigQuery", "BigQuery ML"]
  },
  {
    "id": "lab-predict-visitor-purchases-with-bigquery-ml",
    "title": "Predict Visitor Purchases with BigQuery ML",
    "type": "lab",
    "level": "intermediate",
    "duration_minutes": 60,
    "products": ["BigQuery", "BigQuery ML"]
  },
  {
    "id": "course-recommendations-ai-fundamentals",
    "title": "Recommendations AI Fundamentals",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 90,
    "products": ["Recommendations AI"]
  },
  {
    "id": "course-contact-center-ai-fundamentals",
    "title": "Contact Center AI Fundamentals",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 120,
    "products": ["Contact Center AI", "Dialogflow"]
  },
  {
    "id": "lab-build-a-virtual-agent-with-dialogflow-cx",
    "title": "Build a Virtual Agent with Dialogflow CX",
    "type": "lab",
    "level": "intermediate",
    "duration_minutes": 90,
    "products": ["Dialogflow CX"]
  },
  {
    "id": "course-dialogflow-essentials",
    "title": "Dialogflow Essentials",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 180,
    "products": ["Dialogflow"]
  },
  {
    "id": "lab-define-intents-and-entities-for-your-dialogflow-agent",
    "title": "Define Intents and Entities for Your Dialogflow Agent",
    "type": "lab",
    "level": "introductory",
    "duration_minutes": 45,
    "products": ["Dialogflow"]
  },
  {
    "id": "course-conversational-ai-on-vertex-ai",
    "title": "Conversational AI on Vertex AI",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 150,
    "products": ["Vertex AI", "Dialogflow CX"]
  },
  {
    "id": "course-anti-money-laundering-ai",
    "title": "Anti Money Laundering AI",
    "type": "course",
    "level": "advanced",
    "duration_minutes": 120,
    "products": ["Anti Money Laundering AI"]
  },
  {
    "id": "course-healthcare-data-engine",
    "title": "Healthcare Data Engine",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 90,
    "products": ["Cloud Healthcare API"]
  },
  {
    "id": "course-build-with-ai-solutions",
    "title": "Build with AI Solutions",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 180,
    "products": ["Vertex AI", "Cloud Run", "BigQuery"]
  },
  {
    "id": "lab-deploy-an-ai-solution-to-production",
    "title": "Deploy an AI Solution to Production",
    "type": "lab",
    "level": "advanced",
    "duration_minutes": 120,
    "products": ["Vertex AI", "Cloud Run"]
  },
  {
    "id": "course-ai-platform-notebooks-fundamentals",
    "title": "Vertex AI Workbench Fundamentals",
    "type": "course",
    "level": "introductory",
    "duration_minutes": 60,
    "products": ["Vertex AI Workbench"]
  },
  {
    "id": "lab-run-jupyter-notebooks-on-vertex-ai-workbench",
    "title": "Run Jupyter Notebooks on Vertex AI Workbench",
    "type": "lab",
    "level": "introductory",
    "duration_minutes": 45,
    "products": ["Vertex AI Workbench"]
  },
  {
    "id": "course-data-science-on-google-cloud",
    "title": "Data Science on Google Cloud",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 240,
    "products": ["BigQuery", "Vertex AI", "Dataflow"]
  },
  {
    "id": "course-feature-engineering",
    "title": "Feature Engineering",
    "type": "course",
    "level": "advanced",
    "duration_minutes": 180,
    "products": ["BigQuery", "Vertex AI"]
  },
  {
    "id": "lab-create-and-manage-features-with-vertex-ai-feature-store",
    "title": "Create and Manage Features with Vertex AI Feature Store",
    "type": "lab",
    "level": "intermediate",
    "duration_minutes": 60,
    "products": ["Vertex AI Feature Store"]
  },
  {
    "id": "course-ml-pipelines-on-google-cloud",
    "title": "ML Pipelines on Google Cloud",
    "type": "course",
    "level": "advanced",
    "duration_minutes": 240,
    "products": ["Vertex AI Pipelines", "Kubeflow"]
  },
  {
    "id": "lab-build-and-run-ml-pipelines-with-vertex-ai",
    "title": "Build and Run ML Pipelines with Vertex AI",
    "type": "lab",
    "level": "advanced",
    "duration_minutes": 90,
    "products": ["Vertex AI Pipelines"]
  },
  {
    "id": "course-model-evaluation-on-vertex-ai",
    "title": "Model Evaluation on Vertex AI",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 60,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-explainable-ai-on-vertex-ai",
    "title": "Explainable AI on Vertex AI",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 75,
    "products": ["Vertex AI"]
  },
  {
    "id": "lab-use-vertex-ai-explainability-to-understand-model-predictions",
    "title": "Use Vertex AI Explainability to Understand Model Predictions",
    "type": "lab",
    "level": "intermediate",
    "duration_minutes": 60,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-image-classification-with-vertex-ai",
    "title": "Image Classification with Vertex AI",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 120,
    "products": ["Vertex AI", "AutoML"]
  },
  {
    "id": "lab-train-an-image-classification-model-with-vertex-ai",
    "title": "Train an Image Classification Model with Vertex AI",
    "type": "lab",
    "level": "intermediate",
    "duration_minutes": 90,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-object-detection-with-vertex-ai",
    "title": "Object Detection with Vertex AI",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 120,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-text-classification-with-vertex-ai",
    "title": "Text Classification with Vertex AI",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 90,
    "products": ["Vertex AI", "AutoML"]
  },
  {
    "id": "course-tabular-data-ml-with-vertex-ai",
    "title": "Tabular Data ML with Vertex AI",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 150,
    "products": ["Vertex AI", "AutoML", "BigQuery"]
  },
  {
    "id": "lab-build-a-tabular-regression-model-with-vertex-ai",
    "title": "Build a Tabular Regression Model with Vertex AI",
    "type": "lab",
    "level": "intermediate",
    "duration_minutes": 75,
    "products": ["Vertex AI"]
  },
  {
    "id": "course-time-series-forecasting-with-vertex-ai",
    "title": "Time Series Forecasting with Vertex AI",
    "type": "course",
    "level": "advanced",
    "duration_minutes": 120,
    "products": ["Vertex AI", "BigQuery"]
  },
  {
    "id": "course-vertex-ai-search-fundamentals",
    "title": "Vertex AI Search Fundamentals",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 90,
    "products": ["Vertex AI Search"]
  },
  {
    "id": "lab-create-a-search-app-with-vertex-ai-search",
    "title": "Create a Search App with Vertex AI Search",
    "type": "lab",
    "level": "intermediate",
    "duration_minutes": 60,
    "products": ["Vertex AI Search"]
  },
  {
    "id": "course-vertex-ai-conversation-fundamentals",
    "title": "Vertex AI Conversation Fundamentals",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 90,
    "products": ["Vertex AI Conversation"]
  },
  {
    "id": "course-looker-and-generative-ai",
    "title": "Looker and Generative AI",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 60,
    "products": ["Looker", "Vertex AI"]
  },
  {
    "id": "course-gemini-for-data-scientists-and-analysts",
    "title": "Gemini for Data Scientists and Analysts",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 90,
    "products": ["BigQuery", "Vertex AI", "Gemini"]
  },
  {
    "id": "lab-use-gemini-to-analyze-data-in-bigquery",
    "title": "Use Gemini to Analyze Data in BigQuery",
    "type": "lab",
    "level": "intermediate",
    "duration_minutes": 60,
    "products": ["BigQuery", "Gemini"]
  },
  {
    "id": "course-gemini-for-cloud-architects",
    "title": "Gemini for Cloud Architects",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 90,
    "products": ["Google Cloud", "Gemini"]
  },
  {
    "id": "course-gemini-for-security-engineers",
    "title": "Gemini for Security Engineers",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 90,
    "products": ["Security Command Center", "Gemini"]
  },
  {
    "id": "course-gemini-for-devops-engineers",
    "title": "Gemini for DevOps Engineers",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 90,
    "products": ["Cloud Build", "Cloud Deploy", "Gemini"]
  },
  {
    "id": "course-gemini-for-network-engineers",
    "title": "Gemini for Network Engineers",
    "type": "course",
    "level": "intermediate",
    "duration_minutes": 90,
    "products": ["Virtual Private Cloud (VPC)", "Gemini"]
  }
];

// Helper to format duration
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Helper to get catalog URL
export const getCatalogUrl = (title: string): string => {
  return `https://www.cloudskillsboost.google/catalog?keywords=${encodeURIComponent(title)}`;
};
