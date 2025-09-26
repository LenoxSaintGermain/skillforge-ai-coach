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
  aiActions?: string[];
  evaluationTips?: string;
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
        context: 'As a Customer Support Manager, you\'re tasked with implementing AI solutions to improve response times and customer satisfaction.',
        challenge: 'Use Google\'s Gemini AI to analyze customer queries, draft responses, and create FAQ documentation.',
        tasks: [
          {
            id: '1',
            description: 'Analyze customer inquiry patterns using Gemini',
            aiActions: [
              'Go to gemini.google.com and sign in',
              'Try this prompt: "Analyze these customer support tickets for common patterns: [paste 5-10 real or sample tickets]. Identify the top 3 most common issues and suggest response strategies"',
              'Expected response: Analysis of patterns with actionable insights',
              'Ask follow-up questions to refine the analysis'
            ],
            evaluationTips: 'Look for specific, actionable patterns that can improve your support process',
            isCompleted: false
          },
          {
            id: '2',
            description: 'Generate response templates using AI Studio',
            aiActions: [
              'Open aistudio.google.com for advanced prompting',
              'Try this prompt: "Create 3 professional email templates for the most common support issues identified. Each template should be empathetic, solution-focused, and under 150 words"',
              'Expected response: Professional, customizable templates',
              'Test different tones and styles with follow-up prompts'
            ],
            evaluationTips: 'Templates should feel personal and address specific customer pain points',
            isCompleted: false
          }
        ],
        resources: [
          'https://gemini.google.com/app/ - Google Gemini AI assistant',
          'https://aistudio.google.com/prompts/new_chat - Google AI Studio for advanced prompting',
          'Customer Support Best Practices Guide',
          'AI-Powered Support Tools Overview'
        ],
        evaluationCriteria: [
          'Effective identification of customer pain points',
          'Quality and professionalism of AI-generated responses',
          'Proper use of AI prompting techniques',
          'Understanding of when to use different AI tools'
        ],
        skillsAddressed: ['Customer Service', 'AI-Assisted Communication', 'Data Analysis'],
        difficultyLevel: 'Intermediate',
        estimatedTime: '90 minutes',
        completionStats: {
          percentComplete: 0,
          timeSpent: '0 minutes',
          skillProgress: [
            { skillName: 'Customer Service', progress: 0 },
            { skillName: 'AI-Assisted Communication', progress: 0 },
            { skillName: 'Data Analysis', progress: 0 }
          ],
          coachInteractions: 0
        }
      },
      {
        id: '2',
        title: 'Content Creation with AI Assistance',
        context: 'As a Marketing Professional, you need to create engaging content across multiple platforms using AI tools.',
        challenge: 'Leverage Gemini and AI Studio to research, write, and optimize content for different audiences and platforms.',
        tasks: [
          {
            id: '1',
            description: 'Research target audience with AI assistance',
            aiActions: [
              'Go to gemini.google.com',
              'Try this prompt: "Help me research the target audience for [your product/service]. Provide demographics, pain points, preferred communication styles, and content consumption habits"',
              'Expected response: Comprehensive audience analysis',
              'Ask follow-up questions about specific demographics or behaviors'
            ],
            evaluationTips: 'Look for specific, actionable insights about your audience that inform content strategy',
            isCompleted: false
          },
          {
            id: '2',
            description: 'Generate multi-platform content using AI Studio',
            aiActions: [
              'Open aistudio.google.com for more sophisticated prompting',
              'Try this prompt: "Create content variations for [topic] targeting [audience] across LinkedIn, Twitter, and email newsletter. LinkedIn: professional tone, 200 words. Twitter: casual, engaging, 280 chars. Email: informative, 300 words"',
              'Expected response: Platform-optimized content variations',
              'Iterate with different angles and CTAs'
            ],
            evaluationTips: 'Content should be tailored to each platform while maintaining consistent messaging',
            isCompleted: false
          }
        ],
        resources: [
          'https://gemini.google.com/app/ - Google Gemini AI assistant',
          'https://aistudio.google.com/prompts/new_chat - Google AI Studio for advanced prompting',
          'Content Marketing Strategy Guide',
          'Platform-Specific Content Guidelines'
        ],
        evaluationCriteria: [
          'Depth of audience research and insights',
          'Quality and platform-appropriateness of content',
          'Effective use of AI for ideation and refinement',
          'Understanding of different platform requirements'
        ],
        skillsAddressed: ['Content Marketing', 'Audience Research', 'Multi-Platform Strategy'],
        difficultyLevel: 'Intermediate',
        estimatedTime: '120 minutes',
        completionStats: {
          percentComplete: 0,
          timeSpent: '0 minutes',
          skillProgress: [
            { skillName: 'Content Marketing', progress: 0 },
            { skillName: 'Audience Research', progress: 0 },
            { skillName: 'Multi-Platform Strategy', progress: 0 }
          ],
          coachInteractions: 0
        }
      }
    ];
  }

  /**
   * Gets all available scenarios from database first, fallback to hardcoded
   */
  public async getScenarios(): Promise<Scenario[]> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: dbScenarios, error } = await supabase
        .from('scenarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching scenarios from database:', error);
        return this.scenarios;
      }

      if (dbScenarios && dbScenarios.length > 0) {
        const formattedScenarios = dbScenarios.map(scenario => ({
          id: scenario.id,
          title: scenario.title,
          context: scenario.description,
          challenge: scenario.description,
          tasks: JSON.parse(scenario.scenario_data as string).tasks || [],
          resources: JSON.parse(scenario.scenario_data as string).resources || [],
          evaluationCriteria: JSON.parse(scenario.scenario_data as string).evaluationCriteria || [],
          skillsAddressed: scenario.learning_objectives || [],
          difficultyLevel: scenario.difficulty_level,
          estimatedTime: `${scenario.estimated_duration} minutes`,
          completionStats: {
            percentComplete: 0,
            timeSpent: '0 minutes',
            skillProgress: scenario.learning_objectives.map((skill: string) => ({
              skillName: skill,
              progress: 0
            })),
            coachInteractions: 0
          }
        }));
        
        return [...formattedScenarios, ...this.scenarios];
      }

      return this.scenarios;
    } catch (error) {
      console.error('Error in getScenarios:', error);
      return this.scenarios;
    }
  }

  /**
   * Gets a specific scenario by ID
   */
  public async getScenarioById(id: string): Promise<Scenario | undefined> {
    const scenarios = await this.getScenarios();
    return scenarios.find(scenario => scenario.id === id);
  }

  /**
   * Updates the completion status of a task in a scenario
   */
  public async updateTaskCompletion(scenarioId: string, taskId: string, isCompleted: boolean): Promise<void> {
    const scenarios = await this.getScenarios();
    const scenario = scenarios.find(s => s.id === scenarioId);
    
    if (scenario) {
      const task = scenario.tasks.find(t => t.id === taskId);
      if (task) {
        task.isCompleted = isCompleted;
        
        // Update completion stats
        const completedTasks = scenario.tasks.filter(t => t.isCompleted).length;
        const totalTasks = scenario.tasks.length;
        scenario.completionStats = {
          ...scenario.completionStats!,
          percentComplete: Math.round((completedTasks / totalTasks) * 100)
        };
      }
    }
  }

  /**
   * Gets user scenario progress
   */
  public async getUserScenarioProgress(scenarioId: string): Promise<ScenarioCompletionStats | null> {
    const scenario = await this.getScenarioById(scenarioId);
    return scenario?.completionStats || null;
  }

  /**
   * Updates scenario progress
   */
  public async updateScenarioProgress(scenarioId: string, progress: Partial<ScenarioCompletionStats>): Promise<void> {
    const scenarios = await this.getScenarios();
    const scenario = scenarios.find(s => s.id === scenarioId);
    
    if (scenario && scenario.completionStats) {
      scenario.completionStats = {
        ...scenario.completionStats,
        ...progress
      };
    }
  }

  /**
   * Completes a scenario
   */
  public async completeScenario(scenarioId: string): Promise<void> {
    await this.updateScenarioProgress(scenarioId, {
      percentComplete: 100,
      completedDate: new Date()
    });
  }

  /**
   * Saves user feedback for a scenario
   */
  public async saveFeedback(scenarioId: string, feedback: string): Promise<void> {
    await this.updateScenarioProgress(scenarioId, {
      userFeedback: feedback
    });
  }

  /**
   * Generates a new scenario using AI based on user profile and learning goals
   */
  public async generateScenario(
    userProfile: User, 
    learningGoals: LearningGoal[], 
    description?: string
  ): Promise<Scenario> {
    try {
      const prompt = this.buildScenarioPrompt(userProfile, learningGoals, description);
      
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('gemini-api', {
        body: { 
          prompt,
          systemPrompt: 'You are an AI training specialist. Generate realistic, actionable learning scenarios focused on practical AI tool usage. Always respond with valid JSON that matches the required schema.'
        }
      });

      if (error) {
        console.error('Error calling Gemini API:', error);
        throw new Error('Failed to generate scenario with AI');
      }

      return this.parseScenarioResponse(data.response, userProfile, learningGoals);
      
    } catch (error) {
      console.error('Error generating scenario:', error);
      return this.generateFallbackScenario(userProfile, learningGoals, description);
    }
  }

  /**
   * Builds the prompt for AI scenario generation
   */
  private buildScenarioPrompt(
    userProfile: User, 
    learningGoals: LearningGoal[], 
    description?: string
  ): string {
    const goalsText = learningGoals.map(goal => goal.skill_area).join(', ');
    const focusArea = description ? `with specific focus on: ${description}` : '';
    
    return `
Create a practical AI learning scenario for a ${userProfile.role} in ${userProfile.industry} industry.
AI Knowledge Level: ${userProfile.ai_knowledge_level}
Learning Goals: ${goalsText}
${focusArea}

CRITICAL: This scenario should guide users to use gemini.google.com and aistudio.google.com for hands-on practice.

The scenario should include specific tasks that require users to:
1. Use Gemini AI for basic queries and analysis
2. Use AI Studio for more advanced prompting and experimentation
3. Apply AI tools to real work challenges

Each task must include:
- Clear description of what to do
- Specific AI prompts to try
- Expected types of responses from the AI
- Tips for evaluating AI output quality
- Direct links to the appropriate AI tools

Return a JSON object with this exact structure:
{
  "title": "Scenario title that clearly indicates AI tool usage",
  "context": "Professional context explaining why this matters for their role",
  "challenge": "Clear challenge statement that requires using Google's AI tools",
  "tasks": [
    {
      "id": "task-1",
      "description": "Clear task description",
      "aiActions": [
        "Step 1: Go to gemini.google.com or aistudio.google.com",
        "Step 2: Try this specific prompt: '[exact prompt text]'",
        "Step 3: Expected response type and what to look for",
        "Step 4: Follow-up questions or iterations to try"
      ],
      "evaluationTips": "How to evaluate if the AI output is useful and high-quality"
    }
  ],
  "resources": [
    "https://gemini.google.com/app/ - Google Gemini AI assistant",
    "https://aistudio.google.com/prompts/new_chat - Google AI Studio for advanced AI experimentation"
  ],
  "evaluationCriteria": ["Criteria focused on effective AI tool usage"],
  "skillsAddressed": ["AI Tool Usage", "Prompt Engineering", "relevant professional skills"],
  "difficultyLevel": "${userProfile.ai_knowledge_level}",
  "estimatedTime": "Realistic time estimate including AI interaction time"
}`;
  }

  /**
   * Parses the AI response and converts it to a Scenario object
   */
  private parseScenarioResponse(
    response: string, 
    userProfile: User, 
    learningGoals: LearningGoal[]
  ): Scenario {
    try {
      const parsedData = JSON.parse(response);
      
      const scenario: Scenario = {
        id: `ai-generated-${Date.now()}`,
        title: parsedData.title,
        context: parsedData.context,
        challenge: parsedData.challenge,
        tasks: parsedData.tasks.map((task: any, index: number) => ({
          id: task.id || `task-${index + 1}`,
          description: task.description,
          aiActions: task.aiActions || [],
          evaluationTips: task.evaluationTips || '',
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
  private generateFallbackScenario(userProfile: User, learningGoals: LearningGoal[], description?: string): Scenario {
    const scenarioFocus = description 
      ? `focusing on: ${description}` 
      : `based on role: ${userProfile.role} in ${userProfile.industry}`;

    return {
      id: `fallback-${Date.now()}`,
      title: `AI Learning Scenario - ${userProfile.role}`,
      context: `As a ${userProfile.role} in ${userProfile.industry}, you need hands-on experience with AI tools.`,
      challenge: `Complete real-world tasks using Google's Gemini and AI Studio tools ${scenarioFocus}`,
      tasks: [
        {
          id: 'fallback-task-1',
          description: 'Use AI to analyze a work challenge',
          aiActions: [
            'Go to gemini.google.com',
            'Try this prompt: "Help me analyze [describe a current work challenge]. Provide 3 different approaches to solving this problem"',
            'Expected response: Multiple solution approaches with pros/cons',
            'Ask follow-up questions to dive deeper into each approach'
          ],
          evaluationTips: 'Look for practical, actionable solutions that you can implement in your work',
          isCompleted: false
        },
        {
          id: 'fallback-task-2', 
          description: 'Create professional content using AI',
          aiActions: [
            'Open aistudio.google.com for more advanced prompting',
            'Try this prompt: "Create [type of content needed for your role] that addresses [specific challenge]. Make it professional and tailored to [your industry]"',
            'Expected response: Professional, industry-specific content',
            'Iterate to refine tone, length, or focus as needed'
          ],
          evaluationTips: 'Content should be professional, relevant to your industry, and ready to use or easily adaptable',
          isCompleted: false
        }
      ],
      resources: [
        'https://gemini.google.com - Google Gemini AI assistant',
        'https://aistudio.google.com - Google AI Studio for advanced prompting'
      ],
      evaluationCriteria: [
        'Effective use of AI prompting techniques',
        'Quality of AI-generated outputs',
        'Application of AI insights to real work challenges'
      ],
      skillsAddressed: ['AI Tool Usage', 'Prompt Engineering'],
      difficultyLevel: userProfile.ai_knowledge_level || 'Intermediate',
      estimatedTime: '60 minutes',
      completionStats: {
        percentComplete: 0,
        timeSpent: '0 minutes',
        skillProgress: [
          { skillName: 'AI Tool Usage', progress: 0 }
        ],
        coachInteractions: 0
      }
    };
  }

  /**
   * Saves a scenario to the database
   */
  public async saveScenario(scenario: Scenario): Promise<boolean> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase
        .from('scenarios')
        .insert({
          title: scenario.title,
          description: scenario.context,
          difficulty_level: scenario.difficultyLevel,
          estimated_duration: parseInt(scenario.estimatedTime.split(' ')[0]) || 90,
          learning_objectives: scenario.skillsAddressed,
          scenario_data: JSON.stringify({
            tasks: scenario.tasks,
            resources: scenario.resources,
            evaluationCriteria: scenario.evaluationCriteria,
            challenge: scenario.challenge
          }) as any,
          role: 'General',
          industry: 'General'
        });

      if (error) {
        console.error('Error saving scenario:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveScenario:', error);
      return false;
    }
  }
}