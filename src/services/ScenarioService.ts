
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
          'AI customer support case studies'
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
          'Generative AI capabilities documentation'
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
        'Ethical AI guidelines'
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
}
