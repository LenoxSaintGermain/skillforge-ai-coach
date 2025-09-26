import { User, LearningGoal } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';

export interface ScenarioTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  template_content: string;
  variables: Array<{
    name: string;
    type: 'text' | 'select' | 'number';
    description: string;
    options?: string[];
    required: boolean;
  }>;
  difficulty_level: string;
  estimated_duration: number;
}

export interface GenerationProgress {
  stage: 'analyzing' | 'generating' | 'validating' | 'saving' | 'complete';
  message: string;
  progress: number;
}

export interface EnhancedScenario {
  id: string;
  title: string;
  description: string;
  context: string;
  challenge: string;
  tasks: Array<{
    id: string;
    description: string;
    ai_actions?: string[];
    evaluation_tips?: string;
    estimated_time?: number;
    difficulty?: string;
  }>;
  resources: string[];
  evaluation_criteria: string[];
  skills_addressed: string[];
  difficulty_level: string;
  estimated_duration: number;
  role: string;
  industry: string;
  learning_objectives: string[];
  tags: string[];
  quality_score?: number;
  user_id?: string;
  created_at?: string;
  scenario_data?: any;
}

export class EnhancedScenarioService {
  
  /**
   * Generate an enhanced scenario with real-time progress updates
   */
  public async generateEnhancedScenario(
    userProfile: User,
    learningGoals: LearningGoal[],
    description?: string,
    templateId?: string,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<EnhancedScenario> {
    try {
      // Stage 1: Analyzing user context
      onProgress?.({
        stage: 'analyzing',
        message: 'Analyzing your profile and learning goals...',
        progress: 20
      });

      const analysisPrompt = this.buildAnalysisPrompt(userProfile, learningGoals, description);
      const analysisResult = await this.callGeminiAPI(analysisPrompt, 'analysis');

      // Stage 2: Generating scenario
      onProgress?.({
        stage: 'generating',
        message: 'Generating personalized scenario with latest AI models...',
        progress: 50
      });

      const template = templateId ? await this.getTemplate(templateId) : null;
      const scenarioPrompt = this.buildEnhancedScenarioPrompt(
        userProfile,
        learningGoals,
        description,
        analysisResult,
        template
      );
      
      const scenarioData = await this.callGeminiAPI(scenarioPrompt, 'generation');

      // Stage 3: Validating quality
      onProgress?.({
        stage: 'validating',
        message: 'Validating scenario quality and relevance...',
        progress: 75
      });

      const qualityScore = await this.validateScenarioQuality(scenarioData, userProfile);

      // Stage 4: Saving to database
      onProgress?.({
        stage: 'saving',
        message: 'Saving your personalized scenario...',
        progress: 90
      });

      const enhancedScenario = this.parseEnhancedScenario(scenarioData, userProfile, qualityScore);
      const savedScenario = await this.saveScenarioToDatabase(enhancedScenario);

      onProgress?.({
        stage: 'complete',
        message: 'Scenario generated successfully!',
        progress: 100
      });

      return savedScenario;

    } catch (error) {
      console.error('Error generating enhanced scenario:', error);
      throw new Error('Failed to generate enhanced scenario');
    }
  }

  /**
   * Build analysis prompt to understand user context
   */
  private buildAnalysisPrompt(
    userProfile: User,
    learningGoals: LearningGoal[],
    description?: string
  ): string {
    const goalsText = learningGoals.map(goal => `${goal.skill_area}: ${goal.description}`).join('\n');
    
    return `
Analyze this user profile for AI learning scenario generation:

Role: ${userProfile.role}
Industry: ${userProfile.industry}
AI Knowledge Level: ${userProfile.ai_knowledge_level}
Learning Goals:
${goalsText}
${description ? `Specific Request: ${description}` : ''}

Provide a JSON analysis with:
{
  "user_complexity_level": "beginner|intermediate|advanced",
  "primary_learning_focus": "specific area of focus",
  "industry_specific_challenges": ["challenge1", "challenge2"],
  "recommended_ai_tools": ["tool1", "tool2"],
  "skill_gaps": ["gap1", "gap2"],
  "learning_preferences": "hands-on|theoretical|mixed"
}`;
  }

  /**
   * Build enhanced scenario generation prompt
   */
  private buildEnhancedScenarioPrompt(
    userProfile: User,
    learningGoals: LearningGoal[],
    description?: string,
    analysis?: string,
    template?: ScenarioTemplate | null
  ): string {
    const basePrompt = template?.template_content || this.getDefaultTemplate();
    const analysisData = analysis ? JSON.parse(analysis) : null;

    return `
Create a cutting-edge AI learning scenario using the latest Gemini capabilities:

USER PROFILE:
Role: ${userProfile.role}
Industry: ${userProfile.industry} 
AI Knowledge: ${userProfile.ai_knowledge_level}
Learning Goals: ${learningGoals.map(g => g.skill_area).join(', ')}
${description ? `Specific Focus: ${description}` : ''}

${analysisData ? `
USER ANALYSIS:
Complexity Level: ${analysisData.user_complexity_level}
Primary Focus: ${analysisData.primary_learning_focus}
Industry Challenges: ${analysisData.industry_specific_challenges?.join(', ')}
Skill Gaps: ${analysisData.skill_gaps?.join(', ')}
` : ''}

REQUIREMENTS:
1. Use Gemini 2.0 Flash capabilities for advanced scenario generation
2. Include real-world industry-specific challenges
3. Provide hands-on tasks using gemini.google.com and aistudio.google.com
4. Include multi-turn AI interactions and prompt refinement
5. Add interactive elements and validation checkpoints

${basePrompt}

Generate a comprehensive scenario JSON with enhanced structure:
{
  "title": "Compelling, specific title that showcases AI capabilities",
  "description": "Brief description highlighting the value proposition",
  "context": "Rich, industry-specific context that feels realistic",
  "challenge": "Clear, compelling challenge requiring AI tool mastery", 
  "tasks": [
    {
      "id": "task-1",
      "description": "Detailed task description with clear outcomes",
      "ai_actions": [
        "Specific step-by-step instructions including exact URLs",
        "Exact prompt text to use: '[PROMPT TEXT]'",
        "Expected AI response characteristics",
        "Follow-up prompts for iteration and refinement"
      ],
      "evaluation_tips": "Detailed criteria for evaluating AI output quality",
      "estimated_time": 25,
      "difficulty": "appropriate level"
    }
  ],
  "resources": [
    "https://gemini.google.com/app/ - Gemini AI Assistant",
    "https://aistudio.google.com/prompts/new_chat - Advanced AI experimentation"
  ],
  "evaluation_criteria": ["Professional, measurable criteria"],
  "skills_addressed": ["AI Tool Mastery", "Prompt Engineering", "Industry-specific skills"],
  "difficulty_level": "${analysisData?.user_complexity_level || userProfile.ai_knowledge_level}",
  "estimated_duration": 90,
  "learning_objectives": ["Specific, measurable learning outcomes"],
  "tags": ["relevant", "searchable", "tags"]
}`;
  }

  /**
   * Call Gemini API with enhanced prompts
   */
  private async callGeminiAPI(prompt: string, type: 'analysis' | 'generation'): Promise<string> {
    const { data, error } = await supabase.functions.invoke('gemini-api', {
      body: { 
        prompt,
        temperature: type === 'generation' ? 0.8 : 0.3,
        maxTokens: type === 'generation' ? 2000 : 800,
        systemPrompt: type === 'analysis' 
          ? 'You are an expert learning analyst. Analyze user profiles and provide structured insights for personalized AI training scenarios.'
          : 'You are an expert AI training specialist using Gemini 2.0 Flash capabilities. Create engaging, realistic scenarios that showcase modern AI tool usage. Always respond with valid JSON.'
      }
    });

    if (error) {
      console.error(`Error calling Gemini API for ${type}:`, error);
      throw new Error(`Failed to call Gemini API for ${type}`);
    }

    return data.generatedText;
  }

  /**
   * Validate scenario quality using AI
   */
  private async validateScenarioQuality(scenarioData: string, userProfile: User): Promise<number> {
    try {
      const validationPrompt = `
Rate the quality of this AI learning scenario on a scale of 1-100:

Scenario: ${scenarioData}

User Profile: Role: ${userProfile.role}, Industry: ${userProfile.industry}, Level: ${userProfile.ai_knowledge_level}

Evaluate based on:
1. Relevance to user's role and industry (30%)
2. Practical applicability of AI tools (25%)
3. Clear, actionable instructions (20%)
4. Appropriate difficulty level (15%)
5. Engagement and realism (10%)

Return only a number between 1-100.`;

      const scoreResult = await this.callGeminiAPI(validationPrompt, 'analysis');
      const score = parseInt(scoreResult.replace(/\D/g, ''));
      return Math.min(Math.max(score, 1), 100);
    } catch (error) {
      console.error('Error validating scenario quality:', error);
      return 75; // Default score
    }
  }

  /**
   * Parse enhanced scenario from AI response
   */
  private parseEnhancedScenario(
    response: string,
    userProfile: User,
    qualityScore: number
  ): EnhancedScenario {
    try {
      const parsedData = JSON.parse(response);
      
      return {
        id: `enhanced-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: parsedData.title,
        description: parsedData.description || parsedData.context?.substring(0, 200) + '...',
        context: parsedData.context,
        challenge: parsedData.challenge,
        tasks: parsedData.tasks || [],
        resources: parsedData.resources || [
          'https://gemini.google.com/app/ - Gemini AI Assistant',
          'https://aistudio.google.com/prompts/new_chat - Advanced AI Studio'
        ],
        evaluation_criteria: parsedData.evaluation_criteria || parsedData.evaluationCriteria || [],
        skills_addressed: parsedData.skills_addressed || parsedData.skillsAddressed || [],
        difficulty_level: parsedData.difficulty_level || parsedData.difficultyLevel || 'Intermediate',
        estimated_duration: parsedData.estimated_duration || 90,
        role: userProfile.role || 'Professional',
        industry: userProfile.industry || 'General',
        learning_objectives: parsedData.learning_objectives || parsedData.skills_addressed || [],
        tags: parsedData.tags || [userProfile.role, userProfile.industry, 'AI Training'].filter(Boolean),
        quality_score: qualityScore,
        user_id: userProfile.user_id,
        scenario_data: {
          ...parsedData,
          generation_metadata: {
            generated_at: new Date().toISOString(),
            user_profile: {
              role: userProfile.role,
              industry: userProfile.industry,
              ai_knowledge_level: userProfile.ai_knowledge_level
            },
            quality_score: qualityScore
          }
        }
      };
    } catch (error) {
      console.error('Error parsing enhanced scenario:', error);
      throw new Error('Failed to parse AI-generated scenario');
    }
  }

  /**
   * Save scenario to database with enhanced metadata
   */
  private async saveScenarioToDatabase(scenario: EnhancedScenario): Promise<EnhancedScenario> {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .insert({
          title: scenario.title,
          description: scenario.description,
          difficulty_level: scenario.difficulty_level,
          estimated_duration: scenario.estimated_duration,
          role: scenario.role,
          industry: scenario.industry,
          learning_objectives: scenario.learning_objectives,
          tags: scenario.tags,
          scenario_data: scenario.scenario_data
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving scenario to database:', error);
        throw error;
      }

      return {
        ...scenario,
        id: data.id,
        created_at: data.created_at
      };
    } catch (error) {
      console.error('Error saving enhanced scenario:', error);
      // Return the scenario anyway, it will work without DB persistence
      return scenario;
    }
  }

  /**
   * Get scenario templates from database
   */
  public async getScenarioTemplates(category?: string): Promise<ScenarioTemplate[]> {
    try {
      let query = supabase
        .from('content_templates')
        .select('*')
        .eq('is_active', true);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching templates:', error);
        return [];
      }

      return data?.map(template => ({
        id: template.id,
        category: template.category,
        title: template.template_key,
        description: template.template_content.substring(0, 200) + '...',
        template_content: template.template_content,
        variables: Array.isArray(template.variables) ? template.variables as Array<{
          name: string;
          type: 'text' | 'select' | 'number';
          description: string;
          options?: string[];
          required: boolean;
        }> : [],
        difficulty_level: 'Intermediate',
        estimated_duration: 90
      })) || [];
    } catch (error) {
      console.error('Error getting scenario templates:', error);
      return [];
    }
  }

  /**
   * Get a specific template
   */
  private async getTemplate(templateId: string): Promise<ScenarioTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('content_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) return null;

      return {
        id: data.id,
        category: data.category,
        title: data.template_key,
        description: data.template_content.substring(0, 200) + '...',
        template_content: data.template_content,
        variables: Array.isArray(data.variables) ? data.variables as Array<{
          name: string;
          type: 'text' | 'select' | 'number';
          description: string;
          options?: string[];
          required: boolean;
        }> : [],
        difficulty_level: 'Intermediate',
        estimated_duration: 90
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get user's scenario history
   */
  public async getUserScenarioHistory(userId: string): Promise<EnhancedScenario[]> {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .or(`scenario_data->generation_metadata->user_profile->>role.eq."${userId}",tags.cs.{${userId}}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching user scenario history:', error);
        return [];
      }

      return data?.map(scenario => ({
        id: scenario.id,
        title: scenario.title,
        description: scenario.description,
        context: scenario.description,
        challenge: scenario.description,
        tasks: JSON.parse(typeof scenario.scenario_data === 'string' ? scenario.scenario_data : '{}').tasks || [],
        resources: JSON.parse(typeof scenario.scenario_data === 'string' ? scenario.scenario_data : '{}').resources || [],
        evaluation_criteria: JSON.parse(typeof scenario.scenario_data === 'string' ? scenario.scenario_data : '{}').evaluation_criteria || [],
        skills_addressed: Array.isArray(scenario.learning_objectives) ? scenario.learning_objectives : [],
        difficulty_level: scenario.difficulty_level,
        estimated_duration: scenario.estimated_duration,
        role: scenario.role || '',
        industry: scenario.industry || '',
        learning_objectives: Array.isArray(scenario.learning_objectives) ? scenario.learning_objectives : [],
        tags: Array.isArray(scenario.tags) ? scenario.tags : [],
        quality_score: JSON.parse(typeof scenario.scenario_data === 'string' ? scenario.scenario_data : '{}').generation_metadata?.quality_score,
        created_at: scenario.created_at,
        scenario_data: JSON.parse(typeof scenario.scenario_data === 'string' ? scenario.scenario_data : '{}')
      })) || [];
    } catch (error) {
      console.error('Error getting user scenario history:', error);
      return [];
    }
  }

  /**
   * Default template for scenario generation
   */
  private getDefaultTemplate(): string {
    return `
Create a modern, engaging AI learning scenario that uses cutting-edge Gemini capabilities.

The scenario should:
- Feel like a real-world professional challenge
- Showcase advanced AI features and techniques
- Include multi-step problem solving with AI
- Provide clear value to the user's career/role
- Use the latest Gemini 2.0 Flash features effectively
- Include hands-on practice with both Gemini and AI Studio

Focus on practical skills that users can immediately apply in their work.
`;
  }
}