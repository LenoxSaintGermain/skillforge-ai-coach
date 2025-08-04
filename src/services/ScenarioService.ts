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
      },
      {
        id: '5',
        title: 'AI-Powered Resume Screening for Gordon Food Service HR',
        context: 'As part of Gordon Food Service\'s HR team, you face the challenge of efficiently screening hundreds of resumes received for various positions across the organization. The current manual process is time-consuming and may lead to inconsistencies in candidate evaluation.',
        challenge: 'Design and implement an AI-powered resume screening system that can efficiently process resumes, identify qualified candidates based on job requirements, and reduce time-to-hire while ensuring fair evaluation practices.',
        tasks: [
          {
            id: 't5-1',
            description: 'Analyze current resume screening processes and identify key pain points',
            isCompleted: false
          },
          {
            id: 't5-2',
            description: 'Define objective criteria for candidate evaluation across different food service positions',
            isCompleted: false
          },
          {
            id: 't5-3',
            description: 'Design an AI solution that extracts relevant information from resumes and matches against job requirements',
            isCompleted: false
          },
          {
            id: 't5-4',
            description: 'Create a bias mitigation strategy to ensure fair candidate evaluation',
            isCompleted: false
          },
          {
            id: 't5-5',
            description: 'Develop an implementation plan including integration with existing HR systems',
            isCompleted: false
          }
        ],
        resources: [
          'Gordon Food Service HR process documentation',
          'Current job requirement templates',
          'Best practices for AI in recruitment',
          'Ethical guidelines for AI in hiring',
          'Case studies of AI resume screening implementations',
          'Gemini API documentation for document processing capabilities'
        ],
        evaluationCriteria: [
          'Effectiveness in identifying qualified candidates',
          'Time savings compared to manual process',
          'Bias reduction measures',
          'Integration feasibility with existing systems',
          'Privacy and compliance considerations'
        ],
        skillsAddressed: ['HR AI Implementation', 'Document Processing', 'Ethical AI Design', 'Recruitment Automation'],
        difficultyLevel: 'Intermediate',
        estimatedTime: '90 minutes',
        completionStats: {
          percentComplete: 0,
          timeSpent: '0 minutes',
          skillProgress: [
            { skillName: 'HR AI Implementation', progress: 0 },
            { skillName: 'Document Processing', progress: 0 },
            { skillName: 'Ethical AI Design', progress: 0 },
            { skillName: 'Recruitment Automation', progress: 0 }
          ],
          coachInteractions: 0
        }
      },
      {
        id: '6',
        title: 'AI Sales Assistant for Gordon Food Service Account Managers',
        context: 'Gordon Food Service account managers handle multiple restaurant and institutional accounts, needing to stay updated on product availability, pricing, customer preferences, and market trends. They struggle to provide timely, personalized service to all clients while managing their busy schedules.',
        challenge: 'Create an AI sales assistant that integrates with Gordon Food Service\'s workflow to help account managers provide better service, increase order values, and strengthen customer relationships through intelligent recommendations and automated processes.',
        tasks: [
          {
            id: 't6-1',
            description: 'Map the current sales workflow and customer interaction points for Gordon Food Service account managers',
            isCompleted: false
          },
          {
            id: 't6-2',
            description: 'Identify key data sources needed for intelligent product recommendations (inventory, purchase history, seasonal trends)',
            isCompleted: false
          },
          {
            id: 't6-3',
            description: 'Design conversational AI capabilities to assist with customer inquiries and order taking',
            isCompleted: false
          },
          {
            id: 't6-4',
            description: 'Create a system for proactive outreach based on predictive analysis of customer needs',
            isCompleted: false
          },
          {
            id: 't6-5',
            description: 'Develop metrics to measure the effectiveness of the AI assistant on sales performance',
            isCompleted: false
          }
        ],
        resources: [
          'Gordon Food Service product catalog',
          'Sample customer order histories',
          'Sales workflow documentation',
          'Market trend reports for food service industry',
          'Gemini API documentation for conversational AI',
          'Best practices for AI in B2B sales'
        ],
        evaluationCriteria: [
          'Projected increase in account manager efficiency',
          'Quality of product recommendations',
          'Effectiveness of conversational capabilities',
          'Integration with existing sales tools',
          'Customer experience impact'
        ],
        skillsAddressed: ['Sales AI Implementation', 'Predictive Analytics', 'Conversational AI Design', 'B2B Solution Architecture'],
        difficultyLevel: 'Advanced',
        estimatedTime: '100 minutes',
        completionStats: {
          percentComplete: 0,
          timeSpent: '0 minutes',
          skillProgress: [
            { skillName: 'Sales AI Implementation', progress: 0 },
            { skillName: 'Predictive Analytics', progress: 0 },
            { skillName: 'Conversational AI Design', progress: 0 },
            { skillName: 'B2B Solution Architecture', progress: 0 }
          ],
          coachInteractions: 0
        }
      }
    ];
  }
  
  /**
   * Generates a new scenario based on user profile, learning goals, and optional description
   */
  public async generateScenario(
    userProfile: UserProfile, 
    learningGoals: LearningGoal[],
    description?: string
  ): Promise<Scenario> {
    try {
      console.log('Generating scenario with AI for:', userProfile);
      
      // Build the prompt for scenario generation
      const prompt = this.buildScenarioPrompt(userProfile, learningGoals, description);
      
      // Call AI to generate the scenario
      const generatedScenario = await this.callGeminiForScenario(prompt);
      
      // Parse and structure the response
      const scenario = this.parseGeneratedScenario(generatedScenario);
      
      return scenario;
      
    } catch (error) {
      console.error('Error generating scenario with AI:', error);
      
      // Fallback to basic scenario generation
      return this.generateFallbackScenario(userProfile, learningGoals, description);
    }
  }

  /**
   * Builds the prompt for AI scenario generation
   */
  private buildScenarioPrompt(userProfile: UserProfile, learningGoals: LearningGoal[], description?: string): string {
    const learningGoalsText = learningGoals.map(goal => goal.description).join(', ');
    
    return `Generate a comprehensive AI learning scenario for the following profile:

Role: ${userProfile.role}
Industry: ${userProfile.industry}
AI Knowledge Level: ${userProfile.aiKnowledgeLevel}
Learning Goals: ${learningGoalsText}
${description ? `Additional Context: ${description}` : ''}

Create a detailed scenario that includes:
1. An engaging title that reflects the role and industry
2. A realistic context that puts the learner in a professional situation
3. A specific challenge that requires AI knowledge and skills
4. 5 progressive tasks that guide learning (each with a clear description)
5. 6-8 relevant resources to support learning
6. 5 evaluation criteria for success
7. 3-4 skills that will be developed
8. Appropriate difficulty level (Beginner/Intermediate/Advanced)
9. Estimated completion time (30-120 minutes)

The scenario should be practical, engaging, and directly applicable to their work environment.

Please format the response as a structured JSON object with the following structure:
{
  "title": "Scenario title",
  "context": "Detailed background context",
  "challenge": "Specific challenge to solve", 
  "tasks": [
    {"description": "Task 1 description"},
    {"description": "Task 2 description"},
    {"description": "Task 3 description"},
    {"description": "Task 4 description"},
    {"description": "Task 5 description"}
  ],
  "resources": ["Resource 1", "Resource 2", ...],
  "evaluationCriteria": ["Criteria 1", "Criteria 2", ...],
  "skillsAddressed": ["Skill 1", "Skill 2", ...],
  "difficultyLevel": "Intermediate",
  "estimatedTime": "90 minutes"
}`;
  }

  /**
   * Calls Gemini API to generate scenario
   */
  private async callGeminiForScenario(prompt: string): Promise<string> {
    const { supabase } = await import('@/integrations/supabase/client');

    const { data, error } = await supabase.functions.invoke('gemini-api', {
      body: {
        prompt,
        systemPrompt: 'You are an expert AI education consultant who creates highly engaging, practical learning scenarios. Always return valid JSON format as requested.',
        temperature: 0.8,
        maxTokens: 2000
      }
    });

    if (error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }

    if (!data?.generatedText) {
      throw new Error('No response from Gemini API');
    }

    return data.generatedText;
  }

  /**
   * Parses the AI-generated scenario response
   */
  private parseGeneratedScenario(generatedText: string): Scenario {
    try {
      // Try to extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsedData = JSON.parse(jsonMatch[0]);
      
      // Create scenario with parsed data
      const scenario: Scenario = {
        id: `ai-generated-${Date.now()}`,
        title: parsedData.title || 'AI-Generated Scenario',
        context: parsedData.context || '',
        challenge: parsedData.challenge || '',
        tasks: (parsedData.tasks || []).map((task: any, index: number) => ({
          id: `t-ai-${Date.now()}-${index}`,
          description: task.description || task,
          isCompleted: false
        })),
        resources: parsedData.resources || [],
        evaluationCriteria: parsedData.evaluationCriteria || [],
        skillsAddressed: parsedData.skillsAddressed || [],
        difficultyLevel: parsedData.difficultyLevel || 'Intermediate',
        estimatedTime: parsedData.estimatedTime || '90 minutes',
        completionStats: {
          percentComplete: 0,
          timeSpent: '0 minutes',
          skillProgress: (parsedData.skillsAddressed || []).map((skill: string) => ({
            skillName: skill,
            progress: 0
          })),
          coachInteractions: 0
        }
      };
      
      return scenario;
      
    } catch (parseError) {
      console.error('Error parsing generated scenario:', parseError);
      throw new Error('Failed to parse AI-generated scenario');
    }
  }

  /**
   * Fallback scenario generation when AI fails
   */
  private generateFallbackScenario(userProfile: UserProfile, learningGoals: LearningGoal[], description?: string): Scenario {
    const scenarioFocus = description 
      ? `with focus on: ${description}`
      : 'focusing on general AI adoption';
    
    return {
      id: `fallback-${Date.now()}`,
      title: `AI Strategy Development for ${userProfile.industry} ${description ? '- Customized' : ''}`,
      context: `As a ${userProfile.role} in the ${userProfile.industry} industry, you've been tasked with developing an AI strategy ${scenarioFocus}. The leadership team is interested in understanding how AI can create competitive advantages and improve operational efficiency.`,
      challenge: `Create a comprehensive AI strategy document that identifies opportunities, prioritizes initiatives, addresses ethical considerations, and includes an implementation roadmap.`,
      tasks: [
        {
          id: `t-fallback-1`,
          description: 'Conduct an AI readiness assessment for your organization',
          isCompleted: false
        },
        {
          id: `t-fallback-2`,
          description: 'Identify 3-5 high-impact AI use cases specific to your industry',
          isCompleted: false
        },
        {
          id: `t-fallback-3`,
          description: 'Develop evaluation criteria for AI vendors and solutions',
          isCompleted: false
        },
        {
          id: `t-fallback-4`,
          description: 'Create an ethical framework for AI implementation',
          isCompleted: false
        },
        {
          id: `t-fallback-5`,
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
  }
  
  /**
   * Convert database scenario format to our Scenario interface
   */
  private convertDbScenarioToScenario(dbScenario: any): Scenario {
    const scenarioData = dbScenario.scenario_data || {};
    
    return {
      id: dbScenario.id,
      title: dbScenario.title,
      context: scenarioData.introduction || dbScenario.description,
      challenge: dbScenario.description,
      tasks: scenarioData.tasks || [
        {
          id: 'task-1',
          description: 'Complete the scenario objectives',
          isCompleted: false
        }
      ],
      resources: scenarioData.resources || ['Scenario resources will be provided'],
      evaluationCriteria: scenarioData.expectedOutcomes || ['Successful completion of objectives'],
      skillsAddressed: dbScenario.learning_objectives || ['AI Skills'],
      difficultyLevel: dbScenario.difficulty_level || 'Beginner',
      estimatedTime: `${dbScenario.estimated_duration || 30} minutes`,
      completionStats: {
        percentComplete: 0,
        timeSpent: '0 minutes',
        skillProgress: (dbScenario.learning_objectives || ['AI Skills']).map((skill: string) => ({
          skillName: skill,
          progress: 0
        })),
        coachInteractions: 0
      }
    };
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
  public async getScenarioById(id: string): Promise<Scenario | undefined> {
    // Try to fetch from database first
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: dbScenario, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && dbScenario) {
        return this.convertDbScenarioToScenario(dbScenario);
      }
    } catch (error) {
      console.warn('Database not available for scenario fetch:', error);
    }

    // Fallback to hardcoded scenarios
    return this.scenarios.find(s => s.id === id);
  }
  
  /**
   * Updates a scenario by ID with new data
   */
  public updateScenarioById(id: string, updatedScenario: Scenario): void {
    const index = this.scenarios.findIndex(s => s.id === id);
    if (index !== -1) {
      this.scenarios[index] = updatedScenario;
      console.log(`Scenario ${id} updated successfully`);
    }
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
  public async updateScenarioProgress(scenarioId: string, userId: string, completedTasks: string[]): Promise<void> {
    // Update in database if available
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Get user's current progress or create new record
      const { data: existingProgress } = await supabase
        .from('user_scenario_progress')
        .select('*')
        .eq('scenario_id', scenarioId)
        .eq('user_id', userId)
        .single();

      const progressData = {
        completed_tasks: completedTasks,
        current_step: completedTasks.length,
        total_steps: 4 // Default workflow steps
      };

      const totalTasks = 4; // Default number of tasks
      const percentComplete = Math.round((completedTasks.length / totalTasks) * 100);

      if (existingProgress) {
        // Update existing progress
        await supabase
          .from('user_scenario_progress')
          .update({
            progress_data: progressData,
            status: percentComplete === 100 ? 'completed' : 'in_progress',
            ...(percentComplete === 100 && { completed_at: new Date().toISOString() })
          })
          .eq('id', existingProgress.id);
      } else {
        // Create new progress record
        await supabase
          .from('user_scenario_progress')
          .insert({
            user_id: userId,
            scenario_id: scenarioId,
            progress_data: progressData,
            status: 'in_progress',
            started_at: new Date().toISOString()
          });
      }
      
      console.log(`Updated progress for scenario ${scenarioId}, user ${userId}: completed tasks ${completedTasks.join(', ')}`);
    } catch (error) {
      console.warn('Failed to update scenario progress in database:', error);
    }

    // Also update local scenarios for immediate UI feedback
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
      
      // Update skill progress
      scenario.completionStats.skillProgress = scenario.completionStats.skillProgress.map(skill => ({
        ...skill,
        progress: Math.min(100, skill.progress + Math.floor(Math.random() * 15))
      }));
    }
  }

  /**
   * Gets user progress for a specific scenario
   */
  public async getUserScenarioProgress(scenarioId: string, userId: string): Promise<any> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('user_scenario_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('scenario_id', scenarioId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting scenario progress:', error);
      return null;
    }
  }

  /**
   * Marks a scenario as completed
   */
  public async completeScenario(scenarioId: string, userId: string, solution?: string): Promise<void> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('user_scenario_progress')
        .upsert({
          user_id: userId,
          scenario_id: scenarioId,
          status: 'completed',
          completed_at: new Date().toISOString(),
          feedback: solution,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,scenario_id'
        });

      if (error) throw error;
      
      console.log('Scenario completed successfully:', data);
    } catch (error) {
      console.error('Error completing scenario:', error);
      throw error;
    }
  }

  /**
   * Saves user feedback for a scenario
   */
  public async saveFeedback(scenarioId: string, userId: string, feedbackText: string, rating: number): Promise<void> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('user_scenario_progress')
        .update({
          feedback: feedbackText,
          score: rating,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('scenario_id', scenarioId);

      if (error) throw error;
      
      console.log('Feedback saved successfully:', data);
    } catch (error) {
      console.error('Error saving feedback:', error);
      throw error;
    }
  }
}
