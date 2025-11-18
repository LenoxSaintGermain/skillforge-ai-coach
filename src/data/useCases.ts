export interface UseCase {
  id: string;
  title: string;
  description: string;
  category: 'customer' | 'employee' | 'creative' | 'data' | 'code';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetAudience: string[];
  industry: string[];
  valueProposition: string;
  impact: string;
  technicalBlueprintUrl?: string;
  relatedCases: string[];
}

export const useCases: UseCase[] = [
  {
    id: 'customer-support-automation',
    title: 'AI-Powered Customer Support',
    description: 'Automatically resolve common customer inquiries 24/7 with intelligent chatbots that understand context and provide personalized responses.',
    category: 'customer',
    difficulty: 'beginner',
    targetAudience: ['Customer Service Managers', 'Support Teams', 'Small Business Owners'],
    industry: ['Retail', 'SaaS', 'E-commerce', 'Healthcare'],
    valueProposition: 'Reduce support costs by 60% while improving response time to under 30 seconds',
    impact: '60% cost reduction, 24/7 availability, <30s response time',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['voice-assistant', 'personalized-recommendations']
  },
  {
    id: 'meeting-summarization',
    title: 'Automated Meeting Summaries',
    description: 'Generate comprehensive meeting notes, action items, and key decisions automatically from recorded conversations.',
    category: 'employee',
    difficulty: 'beginner',
    targetAudience: ['Project Managers', 'Team Leads', 'Executives'],
    industry: ['Technology', 'Consulting', 'Finance', 'Healthcare'],
    valueProposition: 'Save 2+ hours per week per employee on meeting documentation',
    impact: '2+ hours saved weekly per employee',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['document-analysis', 'email-drafting']
  },
  {
    id: 'content-generation',
    title: 'Marketing Content Creation',
    description: 'Generate high-quality blog posts, social media content, and ad copy tailored to your brand voice and audience.',
    category: 'creative',
    difficulty: 'beginner',
    targetAudience: ['Marketing Managers', 'Content Creators', 'Social Media Managers'],
    industry: ['Marketing', 'E-commerce', 'Media', 'Technology'],
    valueProposition: 'Produce 10x more content while maintaining quality and consistency',
    impact: '10x content production increase',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['image-generation', 'video-editing']
  },
  {
    id: 'code-review-assistant',
    title: 'Intelligent Code Reviews',
    description: 'Automatically identify bugs, security vulnerabilities, and code quality issues before they reach production.',
    category: 'code',
    difficulty: 'intermediate',
    targetAudience: ['Software Engineers', 'Tech Leads', 'DevOps Teams'],
    industry: ['Technology', 'Finance', 'Healthcare'],
    valueProposition: 'Catch 85% of bugs before production and reduce review time by 50%',
    impact: '85% bug detection, 50% faster reviews',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['documentation-generation', 'debugging-assistant']
  },
  {
    id: 'predictive-analytics',
    title: 'Predictive Business Analytics',
    description: 'Forecast sales, identify trends, and make data-driven decisions with AI-powered analytics that understand your business context.',
    category: 'data',
    difficulty: 'advanced',
    targetAudience: ['Data Analysts', 'Business Intelligence Teams', 'CFOs'],
    industry: ['Retail', 'Finance', 'Manufacturing', 'SaaS'],
    valueProposition: 'Improve forecast accuracy by 40% and reduce planning time by 70%',
    impact: '40% better forecasts, 70% faster planning',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['report-generation', 'data-visualization']
  },
  {
    id: 'personalized-recommendations',
    title: 'Hyper-Personalized Product Recommendations',
    description: 'Deliver individualized product suggestions based on behavior, preferences, and real-time context to increase conversion rates.',
    category: 'customer',
    difficulty: 'intermediate',
    targetAudience: ['E-commerce Managers', 'Product Managers', 'Marketing Teams'],
    industry: ['E-commerce', 'Retail', 'Media', 'Entertainment'],
    valueProposition: 'Increase conversion rates by 35% with personalized experiences',
    impact: '35% conversion increase',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['customer-support-automation', 'dynamic-pricing']
  },
  {
    id: 'document-analysis',
    title: 'Intelligent Document Processing',
    description: 'Extract insights, summarize key points, and answer questions from contracts, reports, and research papers automatically.',
    category: 'employee',
    difficulty: 'intermediate',
    targetAudience: ['Legal Teams', 'Researchers', 'Compliance Officers'],
    industry: ['Legal', 'Finance', 'Healthcare', 'Government'],
    valueProposition: 'Process documents 100x faster with 99% accuracy',
    impact: '100x processing speed, 99% accuracy',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['meeting-summarization', 'contract-analysis']
  },
  {
    id: 'image-generation',
    title: 'AI-Generated Visual Content',
    description: 'Create unique images, graphics, and design assets on-demand for marketing campaigns, products, and social media.',
    category: 'creative',
    difficulty: 'beginner',
    targetAudience: ['Designers', 'Marketing Teams', 'Content Creators'],
    industry: ['Marketing', 'E-commerce', 'Media', 'Fashion'],
    valueProposition: 'Reduce design costs by 80% and produce assets in minutes, not days',
    impact: '80% cost reduction, minutes vs. days',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['content-generation', 'video-editing']
  },
  {
    id: 'debugging-assistant',
    title: 'AI Debugging Companion',
    description: 'Get instant help diagnosing errors, understanding stack traces, and finding solutions to common coding problems.',
    category: 'code',
    difficulty: 'beginner',
    targetAudience: ['Developers', 'Junior Engineers', 'Students'],
    industry: ['Technology', 'Education', 'Startups'],
    valueProposition: 'Reduce debugging time by 60% and accelerate learning',
    impact: '60% faster debugging',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['code-review-assistant', 'documentation-generation']
  },
  {
    id: 'report-generation',
    title: 'Automated Report Creation',
    description: 'Transform raw data into polished reports with charts, insights, and executive summaries in seconds.',
    category: 'data',
    difficulty: 'intermediate',
    targetAudience: ['Business Analysts', 'Finance Teams', 'Operations Managers'],
    industry: ['Finance', 'Consulting', 'Healthcare', 'Retail'],
    valueProposition: 'Create comprehensive reports in 5 minutes instead of 5 hours',
    impact: '95% time savings on reporting',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['predictive-analytics', 'data-visualization']
  },
  {
    id: 'voice-assistant',
    title: 'Conversational Voice AI',
    description: 'Enable customers to interact with your business through natural voice conversations for bookings, orders, and support.',
    category: 'customer',
    difficulty: 'advanced',
    targetAudience: ['Contact Center Managers', 'Customer Experience Teams'],
    industry: ['Healthcare', 'Hospitality', 'Retail', 'Financial Services'],
    valueProposition: 'Handle 10,000+ concurrent voice interactions with human-like quality',
    impact: '10,000+ concurrent calls handled',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['customer-support-automation', 'sentiment-analysis']
  },
  {
    id: 'email-drafting',
    title: 'Intelligent Email Assistant',
    description: 'Compose professional emails, responses, and follow-ups that match your tone and intent in seconds.',
    category: 'employee',
    difficulty: 'beginner',
    targetAudience: ['Sales Teams', 'Customer Success', 'Professionals'],
    industry: ['All Industries'],
    valueProposition: 'Save 1+ hour daily on email composition and responses',
    impact: '1+ hour saved daily per person',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['meeting-summarization', 'sentiment-analysis']
  },
  {
    id: 'video-editing',
    title: 'AI-Powered Video Production',
    description: 'Automatically edit videos, add captions, create highlights, and optimize content for different platforms.',
    category: 'creative',
    difficulty: 'intermediate',
    targetAudience: ['Content Creators', 'Marketing Teams', 'Social Media Managers'],
    industry: ['Media', 'Marketing', 'Entertainment', 'Education'],
    valueProposition: 'Reduce video editing time by 75% with automated workflows',
    impact: '75% faster video production',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['image-generation', 'content-generation']
  },
  {
    id: 'documentation-generation',
    title: 'Auto-Generated Code Documentation',
    description: 'Create comprehensive API documentation, code comments, and technical guides automatically from your codebase.',
    category: 'code',
    difficulty: 'intermediate',
    targetAudience: ['Engineering Teams', 'Tech Writers', 'Open Source Maintainers'],
    industry: ['Technology', 'Software Development'],
    valueProposition: 'Keep documentation always up-to-date with zero manual effort',
    impact: 'Zero-effort documentation maintenance',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['code-review-assistant', 'debugging-assistant']
  },
  {
    id: 'data-visualization',
    title: 'Natural Language Data Viz',
    description: 'Create charts, graphs, and dashboards by simply describing what you want to see in plain English.',
    category: 'data',
    difficulty: 'beginner',
    targetAudience: ['Analysts', 'Managers', 'Decision Makers'],
    industry: ['All Industries'],
    valueProposition: 'Create executive dashboards in minutes without coding',
    impact: 'Minutes to create dashboards',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['report-generation', 'predictive-analytics']
  },
  {
    id: 'sentiment-analysis',
    title: 'Real-Time Sentiment Monitoring',
    description: 'Analyze customer feedback, social media, and support tickets to understand sentiment trends and respond proactively.',
    category: 'customer',
    difficulty: 'intermediate',
    targetAudience: ['Customer Experience Teams', 'Brand Managers', 'Product Teams'],
    industry: ['All Industries'],
    valueProposition: 'Detect negative sentiment 3x faster and prevent churn',
    impact: '3x faster issue detection',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['customer-support-automation', 'voice-assistant']
  },
  {
    id: 'hr-chatbot',
    title: 'AI HR Assistant',
    description: 'Answer employee questions about policies, benefits, and procedures instantly while handling onboarding workflows.',
    category: 'employee',
    difficulty: 'intermediate',
    targetAudience: ['HR Teams', 'People Operations', 'Managers'],
    industry: ['All Industries'],
    valueProposition: 'Reduce HR inquiry volume by 70% and improve employee satisfaction',
    impact: '70% reduction in HR tickets',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['document-analysis', 'meeting-summarization']
  },
  {
    id: 'translation-service',
    title: 'Contextual Translation Engine',
    description: 'Translate content while preserving tone, context, and cultural nuances for global audiences.',
    category: 'creative',
    difficulty: 'intermediate',
    targetAudience: ['Global Teams', 'Marketing', 'Content Creators'],
    industry: ['All Industries'],
    valueProposition: 'Expand to global markets 10x faster with accurate translations',
    impact: '10x faster global expansion',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['content-generation', 'localization']
  },
  {
    id: 'test-automation',
    title: 'AI Test Case Generation',
    description: 'Automatically generate comprehensive test cases and scenarios based on your code and requirements.',
    category: 'code',
    difficulty: 'advanced',
    targetAudience: ['QA Engineers', 'Dev Teams', 'Tech Leads'],
    industry: ['Technology', 'Software Development'],
    valueProposition: 'Increase test coverage by 90% with automated test creation',
    impact: '90% increase in test coverage',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['code-review-assistant', 'debugging-assistant']
  },
  {
    id: 'fraud-detection',
    title: 'Intelligent Fraud Prevention',
    description: 'Detect suspicious patterns and prevent fraudulent transactions in real-time with AI-powered analysis.',
    category: 'data',
    difficulty: 'advanced',
    targetAudience: ['Security Teams', 'Finance Teams', 'Risk Managers'],
    industry: ['Finance', 'E-commerce', 'Banking', 'Insurance'],
    valueProposition: 'Reduce fraud losses by 95% while minimizing false positives',
    impact: '95% fraud reduction',
    technicalBlueprintUrl: 'https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints',
    relatedCases: ['predictive-analytics', 'anomaly-detection']
  }
];

export const categories = [
  { id: 'customer', label: 'Customer Agents', color: 'from-blue-500 to-cyan-500' },
  { id: 'employee', label: 'Employee Agents', color: 'from-purple-500 to-pink-500' },
  { id: 'creative', label: 'Creative Agents', color: 'from-orange-500 to-red-500' },
  { id: 'data', label: 'Data Agents', color: 'from-green-500 to-emerald-500' },
  { id: 'code', label: 'Code Agents', color: 'from-indigo-500 to-blue-500' }
] as const;

export const difficulties = [
  { id: 'beginner', label: 'Beginner', description: 'Easy to implement, minimal setup' },
  { id: 'intermediate', label: 'Intermediate', description: 'Moderate complexity, some integration needed' },
  { id: 'advanced', label: 'Advanced', description: 'Complex implementation, significant customization' }
] as const;
