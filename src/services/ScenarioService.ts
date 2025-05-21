
import { User, LearningGoal } from '@/contexts/UserContext';

export interface Scenario {
  id: string;
  title: string;
  context: string;
  challenge: string;
  tasks: ScenarioTask[];
  resources: string[];
  evaluationCriteria: string[];
  skillsAddressed: string[];
  difficultyLevel: string;
  estimatedTime: string;
  loading?: boolean;
  completionStats?: ScenarioCompletionStats;
}

export interface ScenarioTask {
  id: string;
  description: string;
  isCompleted?: boolean;
}

export interface ScenarioCompletionStats {
  percentComplete: number;
  timeSpent: string;
  skillProgress: {
    skillName: string;
    progress: number;
  }[];
  completedDate?: Date;
  userFeedback?: string;
  coachInteractions: number;
}

interface UserProfile {
  role: string;
  industry: string;
  aiKnowledgeLevel: string;
}

export class ScenarioService {
  private scenarios: Scenario[];
  
  constructor() {
    // Pre-populated scenarios for demonstration with enhanced data
    this.scenarios = [
      {
        id: '1',
        title: 'Optimizing Customer Support with AI',
        context: 'Your company is experiencing increasing customer support inquiries, and the response time has been growing. The leadership team wants to explore AI solutions to improve efficiency while maintaining quality.',
        challenge: 'Design an AI-powered customer support solution that will reduce response time by 50% while maintaining or improving customer satisfaction ratings.',
        tasks: [
          {
            id: 't1-1',
            description: 'Analyze current support workflows and identify bottlenecks',
            isCompleted: true
          },
          {
            id: 't1-2',
            description: 'Research available AI technologies for customer support',
            isCompleted: true
          },
          {
            id: 't1-3',
            description: 'Design a solution architecture integrating AI with existing systems',
            isCompleted: false
          },
          {
            id: 't1-4',
            description: 'Create implementation timeline and resource requirements',
            isCompleted: false
          },
          {
            id: 't1-5',
            description: 'Develop metrics for measuring success',
            isCompleted: false
          }
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
        estimatedTime: '60 minutes',
        completionStats: {
          percentComplete: 45,
          timeSpent: '27 minutes',
          skillProgress: [
            { skillName: 'AI Solution Design', progress: 62 },
            { skillName: 'Implementation Planning', progress: 38 },
            { skillName: 'Business Process Optimization', progress: 53 }
          ],
          coachInteractions: 7
        }
      },
      {
        id: '2',
        title: 'Enhancing Product Discovery with Generative AI',
        context: 'Your e-commerce platform has a vast catalog but users often struggle to find products that match their specific needs. The product team wants to implement a more intuitive discovery experience.',
        challenge: 'Create a generative AI-powered product discovery feature that helps users find exactly what they need through natural language interactions.',
        tasks: [
          {
            id: 't2-1',
            description: 'Define the user interaction model for natural language product search',
            isCompleted: false
          },
          {
            id: 't2-2',
            description: 'Design the prompt engineering approach for accurate product matching',
            isCompleted: false
          },
          {
            id: 't2-3',
            description: 'Architect the integration between the AI model and product catalog',
            isCompleted: false
          },
          {
            id: 't2-4',
            description: 'Create a prototype of the user interface',
            isCompleted: false
          },
          {
            id: 't2-5',
            description: 'Develop an evaluation framework for measuring search accuracy',
            isCompleted: false
          }
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
        estimatedTime: '90 minutes',
        completionStats: {
          percentComplete: 0,
          timeSpent: '0 minutes',
          skillProgress: [
            { skillName: 'Prompt Engineering', progress: 0 },
            { skillName: 'AI UX Design', progress: 0 },
            { skillName: 'Natural Language Processing', progress: 0 }
          ],
          coachInteractions: 0
        }
      },
      {
        id: '3',
        title: 'AI-Powered Content Creation Strategy',
        context: 'Your marketing team needs to create more engaging content across multiple channels but is constrained by limited resources. They want to explore how AI can amplify their content creation capabilities.',
        challenge: 'Develop a comprehensive AI content strategy that helps the marketing team create more personalized, engaging content at scale while maintaining brand voice and quality.',
        tasks: [
          {
            id: 't3-1',
            description: 'Audit existing content creation workflows and identify opportunities for AI assistance',
            isCompleted: true
          },
          {
            id: 't3-2',
            description: 'Research AI content generation tools suitable for different content types',
            isCompleted: true
          },
          {
            id: 't3-3',
            description: 'Create guidelines for human-AI collaboration in content creation',
            isCompleted: true
          },
          {
            id: 't3-4',
            description: 'Develop a quality control framework for AI-generated content',
            isCompleted: false
          },
          {
            id: 't3-5',
            description: 'Design a pilot implementation plan for one content channel',
            isCompleted: false
          }
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
        estimatedTime: '75 minutes',
        completionStats: {
          percentComplete: 60,
          timeSpent: '45 minutes',
          skillProgress: [
            { skillName: 'AI Content Strategy', progress: 78 },
            { skillName: 'Marketing Automation', progress: 45 },
            { skillName: 'Brand Management', progress: 62 }
          ],
          coachInteractions: 12
        }
      },
      {
        id: '4',
        title: 'Building a Generative AI Assistant with Gemini',
        context: "As organizations increasingly adopt AI assistants, there's a need to create specialized assistants that have deep knowledge of specific domains. In this scenario, you'll build an AI assistant using Google's Gemini model that is specialized for a particular industry.",
        challenge: 'Design and build a proof-of-concept Gemini-powered AI assistant for a healthcare provider that can answer patient questions, schedule appointments, and provide basic medical information.',
        tasks: [
          {
            id: 't4-1',
            description: 'Define the scope and capabilities of your healthcare AI assistant',
            isCompleted: true
          },
          {
            id: 't4-2',
            description: 'Create a prompt engineering strategy for accurate healthcare information',
            isCompleted: true
          },
          {
            id: 't4-3',
            description: 'Design the conversation flow and user interaction model',
            isCompleted: true
          },
          {
            id: 't4-4',
            description: 'Implement safety measures and ethical guidelines for medical information',
            isCompleted: true
          },
          {
            id: 't4-5',
            description: 'Develop a testing framework to evaluate assistant performance',
            isCompleted: true
          }
        ],
        resources: [
          'Gemini API documentation',
          'Healthcare conversation datasets',
          'Medical terminology glossary',
          'Best practices for healthcare AI ethics',
          'Prompt engineering guide for specialized domains',
          'User testing protocols for AI assistants'
        ],
        evaluationCriteria: [
          'Accuracy of healthcare information provided',
          'Conversation naturalness and flow',
          'Handling of sensitive medical topics',
          'Appropriate limitations and disclaimers',
          'Integration capabilities with scheduling systems'
        ],
        skillsAddressed: ['Prompt Engineering', 'Gemini API Integration', 'Healthcare AI Ethics', 'Conversation Design'],
        difficultyLevel: 'Advanced',
        estimatedTime: '120 minutes',
        completionStats: {
          percentComplete: 100,
          timeSpent: '115 minutes',
          skillProgress: [
            { skillName: 'Prompt Engineering', progress: 95 },
            { skillName: 'Gemini API Integration', progress: 90 },
            { skillName: 'Healthcare AI Ethics', progress: 85 },
            { skillName: 'Conversation Design', progress: 92 }
          ],
          completedDate: new Date(2023, 5, 12),
          userFeedback: "This scenario helped me understand how to effectively adapt Gemini for specialized domains. The ethical considerations section was particularly valuable.",
          coachInteractions: 23
        }
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
        {
          id: `t-new-1`,
          description: 'Conduct an AI readiness assessment for your organization',
          isCompleted: false
        },
        {
          id: `t-new-2`,
          description: 'Identify 3-5 high-impact AI use cases specific to your industry',
          isCompleted: false
        },
        {
          id: `t-new-3`,
          description: 'Develop evaluation criteria for AI vendors and solutions',
          isCompleted: false
        },
        {
          id: `t-new-4`,
          description: 'Create an ethical framework for AI implementation',
          isCompleted: false
        },
        {
          id: `t-new-5`,
          description: 'Design an implementation roadmap with clear milestones',
          isCompleted: false
        }
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
      estimatedTime: '120 minutes',
      completionStats: {
        percentComplete: 0,
        timeSpent: '0 minutes',
        skillProgress: [
          { skillName: 'Strategic Planning', progress: 0 },
          { skillName: 'AI Opportunity Identification', progress: 0 },
          { skillName: 'Implementation Planning', progress: 0 }
        ],
        coachInteractions: 0
      }
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
  public updateScenarioProgress(scenarioId: string, userId: string, completedTasks: string[]): void {
    const scenario = this.scenarios.find(s => s.id === scenarioId);
    
    if (scenario && scenario.completionStats) {
      // Update completion percentage
      const totalTasks = scenario.tasks.length;
      const completedTasksCount = completedTasks.length;
      scenario.completionStats.percentComplete = Math.round((completedTasksCount / totalTasks) * 100);
      
      // Update task completion status
      scenario.tasks.forEach(task => {
        task.isCompleted = completedTasks.includes(task.id);
      });
      
      // Simulate updating skill progress
      scenario.completionStats.skillProgress = scenario.completionStats.skillProgress.map(skill => ({
        ...skill,
        progress: Math.min(100, skill.progress + Math.floor(Math.random() * 15))
      }));
      
      console.log(`Updated progress for scenario ${scenarioId}, user ${userId}: completed tasks ${completedTasks.join(', ')}`);
    }
  }
}
