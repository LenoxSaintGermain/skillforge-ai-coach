
import { User, LearningGoal } from '@/contexts/UserContext';

export interface Scenario {
  id: string;
  title: string;
  context: string;
  challenge: string;
  tasks: string[];
  resources: string[];
  evaluationCriteria: string[];
  skillsAddressed: string[];
  difficultyLevel: string;
  estimatedTime: string;
  loading?: boolean;
}

interface UserProfile {
  role: string;
  industry: string;
  aiKnowledgeLevel: string;
}

export class ScenarioService {
  private scenarios: Scenario[];
  
  constructor() {
    // Pre-populated scenarios for demonstration
    this.scenarios = [
      {
        id: '1',
        title: 'Optimizing Customer Support with AI',
        context: 'Your company is experiencing increasing customer support inquiries, and the response time has been growing. The leadership team wants to explore AI solutions to improve efficiency while maintaining quality.',
        challenge: 'Design an AI-powered customer support solution that will reduce response time by 50% while maintaining or improving customer satisfaction ratings.',
        tasks: [
          'Analyze current support workflows and identify bottlenecks',
          'Research available AI technologies for customer support',
          'Design a solution architecture integrating AI with existing systems',
          'Create implementation timeline and resource requirements',
          'Develop metrics for measuring success'
        ],
        resources: [
          'Customer support process documentation',
          'Historical support ticket data',
          'AI customer support case studies',
          'Gemini API documentation for chatbot capabilities',
          'Best practices for AI implementation in customer service'
        ],
        evaluationCriteria: [
          'Solution feasibility',
          'Integration with existing systems',
          'Expected impact on response times',
          'Cost-benefit analysis',
          'Consideration of potential challenges'
        ],
        skillsAddressed: ['AI Solution Design', 'Implementation Planning', 'Business Process Optimization'],
        difficultyLevel: 'Intermediate',
        estimatedTime: '60 minutes'
      },
      {
        id: '2',
        title: 'Enhancing Product Discovery with Generative AI',
        context: 'Your e-commerce platform has a vast catalog but users often struggle to find products that match their specific needs. The product team wants to implement a more intuitive discovery experience.',
        challenge: 'Create a generative AI-powered product discovery feature that helps users find exactly what they need through natural language interactions.',
        tasks: [
          'Define the user interaction model for natural language product search',
          'Design the prompt engineering approach for accurate product matching',
          'Architect the integration between the AI model and product catalog',
          'Create a prototype of the user interface',
          'Develop an evaluation framework for measuring search accuracy'
        ],
        resources: [
          'Product catalog data structure',
          'User search behavior analytics',
          'Generative AI capabilities documentation',
          'Prompt engineering best practices guide',
          'User interface guidelines for AI-powered search experiences',
          'Sample conversations for natural language product queries'
        ],
        evaluationCriteria: [
          'Accuracy of product recommendations',
          'Natural language understanding capabilities',
          'User experience design',
          'Technical feasibility',
          'Scalability of the solution'
        ],
        skillsAddressed: ['Prompt Engineering', 'AI UX Design', 'Natural Language Processing'],
        difficultyLevel: 'Advanced',
        estimatedTime: '90 minutes'
      },
      {
        id: '3',
        title: 'AI-Powered Content Creation Strategy',
        context: 'Your marketing team needs to create more engaging content across multiple channels but is constrained by limited resources. They want to explore how AI can amplify their content creation capabilities.',
        challenge: 'Develop a comprehensive AI content strategy that helps the marketing team create more personalized, engaging content at scale while maintaining brand voice and quality.',
        tasks: [
          'Audit existing content creation workflows and identify opportunities for AI assistance',
          'Research AI content generation tools suitable for different content types',
          'Create guidelines for human-AI collaboration in content creation',
          'Develop a quality control framework for AI-generated content',
          'Design a pilot implementation plan for one content channel'
        ],
        resources: [
          'Marketing content strategy documentation',
          'Brand voice guidelines',
          'AI content generation tool comparison',
          'Case studies on successful AI content implementation',
          'Content performance metrics from previous campaigns'
        ],
        evaluationCriteria: [
          'Potential for increased content production',
          'Maintenance of brand voice and quality',
          'Practical implementation approach',
          'Return on investment calculation',
          'Risk mitigation strategies'
        ],
        skillsAddressed: ['AI Content Strategy', 'Marketing Automation', 'Brand Management'],
        difficultyLevel: 'Intermediate',
        estimatedTime: '75 minutes'
      }
    ];
  }
  
  /**
   * Generates a new scenario based on user profile and learning goals
   */
  public async generateScenario(userProfile: UserProfile, learningGoals: LearningGoal[]): Promise<Scenario> {
    // In a real implementation, this would call an AI API to generate a scenario
    // For now, we'll return a mock scenario based on the user's role and industry
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newScenario: Scenario = {
      id: `${Date.now()}`,
      title: `AI Strategy Development for ${userProfile.industry}`,
      context: `As a ${userProfile.role} in the ${userProfile.industry} industry, you've been tasked with developing an AI strategy for your organization. The leadership team is interested in understanding how AI can create competitive advantages and improve operational efficiency.`,
      challenge: `Create a comprehensive AI strategy document that identifies opportunities, prioritizes initiatives, addresses ethical considerations, and includes an implementation roadmap.`,
      tasks: [
        'Conduct an AI readiness assessment for your organization',
        'Identify 3-5 high-impact AI use cases specific to your industry',
        'Develop evaluation criteria for AI vendors and solutions',
        'Create an ethical framework for AI implementation',
        'Design an implementation roadmap with clear milestones'
      ],
      resources: [
        'AI maturity model framework',
        'Industry-specific AI case studies',
        'Ethical AI guidelines',
        'Vendor evaluation templates',
        'Implementation planning resources',
        'ROI calculation tools for AI initiatives'
      ],
      evaluationCriteria: [
        'Strategic alignment with business goals',
        'Technical feasibility assessment',
        'ROI potential and measurement approach',
        'Risk management considerations',
        'Change management strategy'
      ],
      skillsAddressed: ['Strategic Planning', 'AI Opportunity Identification', 'Implementation Planning'],
      difficultyLevel: 'Intermediate',
      estimatedTime: '120 minutes'
    };
    
    return newScenario;
  }
  
  /**
   * Gets all available scenarios
   */
  public getScenarios(): Scenario[] {
    return [...this.scenarios];
  }
  
  /**
   * Gets a scenario by ID
   */
  public getScenarioById(id: string): Scenario | undefined {
    return this.scenarios.find(s => s.id === id);
  }
  
  /**
   * Adds a new scenario to the collection
   */
  public addScenario(scenario: Scenario): void {
    this.scenarios.push({
      ...scenario,
      id: scenario.id || `${Date.now()}`
    });
  }
  
  /**
   * Updates a user's progress in a scenario
   */
  public updateScenarioProgress(scenarioId: string, userId: string, completedTasks: number[]): void {
    // In a real implementation, this would update a database
    console.log(`Updating progress for scenario ${scenarioId}, user ${userId}: completed tasks ${completedTasks.join(', ')}`);
  }
}
