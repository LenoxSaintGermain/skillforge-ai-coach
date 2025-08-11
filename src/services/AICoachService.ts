import { User } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';

// Defines the structured response from the AI Coach service.
// This allows for a variety of actions to be sent to the UI,
// such as displaying speech, creating canvas objects, or showing code.
export type CanvasObject = 'rect' | 'circle' | 'text';

export interface SpeechAction {
  type: 'speech';
  content: string;
}

export interface CanvasObjectAction {
  type: 'canvas_object';
  object: CanvasObject;
  label?: string;
  params?: any;
}

export type Action = SpeechAction | CanvasObjectAction;

export interface AIResponse {
  actions: Action[];
}

export interface ConversationItem {
  role: 'user' | 'system' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UserContext {
  currentScenario?: any;
  currentScreen?: string;
  userActivity?: any;
  lastInteractions?: string[];
  learningPreferences?: string[];
  challengeAreas?: string[];
  strengths?: string[];
}

export interface LearningJourney {
  completedScenarios: string[];
  currentSkillFocus: string[];
  progressMetrics: Record<string, number>;
  recentActivities: {
    date: Date;
    activity: string;
    outcome: string;
  }[];
  recommendedNext: string[];
}

export interface CoachSuggestion {
  text: string;
  type: 'hint' | 'resource' | 'question' | 'challenge';
  relevanceScore?: number;
  followUp?: string;
}

export class AICoachService {
  private conversationHistory: ConversationItem[];
  private userContext: UserContext;
  private learningJourney: LearningJourney;
  
  constructor() {
    this.conversationHistory = [];
    this.userContext = {
      lastInteractions: [],
      learningPreferences: ['Interactive exercises', 'Real-world examples', 'Visual learning'],
      challengeAreas: [],
      strengths: []
    };
    // Initialize with empty data - will be populated with real data
    this.learningJourney = {
      completedScenarios: [],
      currentSkillFocus: [],
      progressMetrics: {},
      recentActivities: [],
      recommendedNext: []
    };
  }
  
  /**
   * Gets a response from the AI Coach based on a prompt
   */
  public async getResponse(prompt: string): Promise<string> {
    console.log('AI Coach received prompt:', prompt);
    
    // Add the prompt to conversation history
    this.addToConversationHistory('user', prompt);
    
    try {
      // For industry name suggestions, use a specific system prompt
      if (prompt.includes('List 5 specific industry names')) {
        const query = prompt.match(/related to "([^"]+)"/)?.[1] || '';
        const systemPrompt = "You are an industry expert. Provide exactly 5 specific industry names separated by commas, without any additional explanation or formatting.";
        const response = await this.callGeminiAPI(`List 5 specific industry names related to "${query}"`, systemPrompt);
        this.addToConversationHistory('assistant', response);
        return response;
      }

      // Use appropriate AI model based on context
      const systemPrompt = `You are Jarvis, an AI learning coach. You help users develop AI skills through personalized guidance, practical exercises, and expert knowledge. Be supportive, knowledgeable, and encouraging. Provide actionable advice and specific next steps.`;
      
      const response = await this.callGeminiAPI(prompt, systemPrompt);
      this.addToConversationHistory('assistant', response);
      return response;

    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback to mock response if API fails
      const fallbackResponse = this.getFallbackResponse(prompt);
      this.addToConversationHistory('assistant', fallbackResponse);
      return fallbackResponse;
    }
  }

  /**
   * Calls the Gemini API via edge function
   */
  private async callGeminiAPI(prompt: string, systemPrompt?: string): Promise<string> {
    const { supabase } = await import('@/integrations/supabase/client');

    const { data, error } = await supabase.functions.invoke('gemini-api', {
      body: {
        prompt,
        systemPrompt,
        temperature: 0.7,
        maxTokens: 1000
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
   * Fallback response when API fails
   */
  private getFallbackResponse(prompt: string): string {
    if (prompt.includes('List 5 specific industry names')) {
      const query = prompt.match(/related to "([^"]+)"/)?.[1] || '';
      return this.generateIndustrySuggestions(query);
    }
    
    return "I'm currently experiencing some connectivity issues. Let me provide you with some general guidance based on your query. For more detailed assistance, please try again in a moment or let me know how I can help with your AI learning journey.";
  }
  
  /**
   * Generates industry name suggestions based on a query
   */
  private generateIndustrySuggestions(query: string): string {
    const industries = {
      'food': 'Food Manufacturing, Food Distribution, Food Service, Food Retail, Food Technology',
      'tech': 'Software Development, Cloud Computing, Cybersecurity, Data Analytics, Artificial Intelligence',
      'health': 'Healthcare Services, Pharmaceutical, Medical Devices, Telemedicine, Health Insurance',
      'finance': 'Commercial Banking, Investment Management, Insurance, Financial Technology, Wealth Management',
      'education': 'Higher Education, K-12 Education, Educational Technology, Corporate Training, Special Education',
      'retail': 'E-commerce, Brick-and-mortar Retail, Omnichannel Retail, Luxury Retail, Discount Retail',
      'manufacturing': 'Automotive Manufacturing, Electronics Manufacturing, Chemical Manufacturing, Textile Manufacturing, Industrial Equipment',
      'hospitality': 'Hotels and Lodging, Food and Beverage Service, Event Management, Tourism, Cruise Industry',
      'marketing': 'Digital Marketing, Content Marketing, Market Research, Advertising, Public Relations',
      'sales': 'B2B Sales, Direct Sales, Account Management, Sales Operations, Channel Sales'
    };
    
    const lowerQuery = query.toLowerCase();
    
    // Find matching industry category
    for (const [key, value] of Object.entries(industries)) {
      if (lowerQuery.includes(key)) {
        return value;
      }
    }
    
    // Default suggestions if no match found
    return 'Specialized Consulting, Professional Services, Custom Solutions, Strategic Advisory, Business Intelligence';
  }
  
  /**
   * Fetches real user progress from database
   */
  private async fetchUserProgress(userId: string): Promise<{
    hasActivity: boolean;
    progressData: any;
  }> {
    try {
      // Check for scenario progress
      const { data: scenarioProgress } = await supabase
        .from('user_scenario_progress')
        .select('*')
        .eq('user_id', userId);

      // Check for skill assessments
      const { data: skillAssessments } = await supabase
        .from('skill_assessments')
        .select('*')
        .eq('user_id', userId);

      // Check for syllabus progress
      const { data: syllabusProgress } = await supabase
        .from('syllabus_progress')
        .select('*')
        .eq('user_id', userId);

      const hasActivity = (scenarioProgress && scenarioProgress.length > 0) ||
                         (skillAssessments && skillAssessments.length > 0) ||
                         (syllabusProgress && syllabusProgress.length > 0);

      return {
        hasActivity,
        progressData: {
          scenarios: scenarioProgress || [],
          assessments: skillAssessments || [],
          syllabus: syllabusProgress || []
        }
      };
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return { hasActivity: false, progressData: null };
    }
  }

  /**
   * Initializes coach with welcome message based on real user activity
   */
  public async initializeCoach(user: User, context?: string): Promise<AIResponse> {
    // Check for actual user activity in the database
    const { hasActivity, progressData } = await this.fetchUserProgress(user.user_id);
    
    let welcomeMessage;
    const contextMessage = context ? ` I'm here to help you with ${context}.` : '';
    
    if (hasActivity && progressData) {
      // User has real activity - show personalized progress
      const completedScenarios = progressData.scenarios.filter((s: any) => s.status === 'completed').length;
      const skillAreas = progressData.assessments.map((a: any) => a.skill_area);
      const uniqueSkills = [...new Set(skillAreas)];
      
      let progressText = '';
      if (completedScenarios > 0) {
        progressText += `You've completed ${completedScenarios} scenario${completedScenarios > 1 ? 's' : ''}. `;
      }
      if (uniqueSkills.length > 0) {
        progressText += `You've been working on ${uniqueSkills.join(', ')}. `;
      }
      
      welcomeMessage = `Welcome back, ${user.name}! ${progressText}${contextMessage} You're currently at ${user.ai_knowledge_level} level. How can I help you continue your AI learning journey today?`;
    } else {
      // New user with no activity
      welcomeMessage = `Welcome to AI SkillForge, ${user.name}! I'm your AI coach to help you master AI skills relevant to your ${user.role || 'current'} role.${contextMessage} \n\nAs you're just getting started, I'd recommend beginning with a skill assessment or exploring our learning scenarios. How would you like to begin your AI learning journey?`;
    }
    
    this.addToConversationHistory('assistant', welcomeMessage);

    return {
      actions: [
        { type: 'speech', content: welcomeMessage },
        { type: 'canvas_object', object: 'rect', label: 'Web Server', params: { left: 100, top: 150, fill: '#6366f1', width: 150, height: 100 } },
        { type: 'canvas_object', object: 'circle', label: 'User', params: { left: 400, top: 150, fill: '#10b981', radius: 50 } },
      ]
    };
  }
  
  /**
   * Processes user message and maintains continuous context
   */
  public async processUserMessage(message: string): Promise<AIResponse> {
    this.addToConversationHistory('user', message);
    
    // Track user interactions for context
    if (this.userContext.lastInteractions) {
      this.userContext.lastInteractions.push(message);
      if (this.userContext.lastInteractions.length > 5) {
        this.userContext.lastInteractions.shift();
      }
    }

    try {
      // This part would normally call the Gemini API and get a structured response.
      // For now, we are mocking the response.
      const responseText = "Great question! Let's add a database to our architecture.";
      this.addToConversationHistory('assistant', responseText);
      return {
        actions: [
          { type: 'speech', content: responseText },
          { type: 'canvas_object', object: 'rect', label: 'Database', params: { left: 100, top: 300, fill: '#f59e0b', width: 150, height: 75 } },
        ]
      };

    } catch (error) {
      console.error('Error processing user message:', error);
      
      const fallbackText = "I'm having trouble connecting right now, but let's try something. How about we add a text box to describe the issue?";
      this.addToConversationHistory('assistant', fallbackText);
      return {
        actions: [
          { type: 'speech', content: fallbackText },
          { type: 'canvas_object', object: 'text', label: 'Issue Description', params: { left: 400, top: 300, fill: '#ef4444', text: 'Connectivity Issue' } },
        ]
      };
    }
  }

  /**
   * Builds a contextual prompt including conversation history
   */
  private buildContextualPrompt(currentMessage: string, recentHistory: ConversationItem[]): string {
    let contextPrompt = '';
    
    if (recentHistory.length > 0) {
      contextPrompt += "Previous conversation context:\n";
      recentHistory.forEach((item, index) => {
        if (index < recentHistory.length - 1) { // Don't include the current message
          contextPrompt += `${item.role}: ${item.content}\n`;
        }
      });
      contextPrompt += "\n";
    }
    
    contextPrompt += `Current user message: ${currentMessage}`;
    
    return contextPrompt;
  }
  
  /**
   * Analyzes user message to determine intent
   */
  private analyzeMessageIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi ') || lowerMessage.includes('hey')) {
      return 'greeting';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('confused') || lowerMessage.includes('don\'t understand')) {
      return 'help_request';
    } else if (lowerMessage.includes('scenario') || lowerMessage.includes('exercise') || lowerMessage.includes('challenge')) {
      return 'scenario_inquiry';
    } else if (lowerMessage.includes('skill') || lowerMessage.includes('learn') || lowerMessage.includes('improve')) {
      return 'skill_inquiry';
    } else if (lowerMessage.includes('progress') || lowerMessage.includes('how am i doing') || lowerMessage.includes('status')) {
      return 'progress_inquiry';
    } else if (lowerMessage.includes('harder') || lowerMessage.includes('challenge me') || lowerMessage.includes('advanced')) {
      return 'challenge_request';
    } else if (lowerMessage.includes('what is') || lowerMessage.includes('explain') || lowerMessage.includes('how does')) {
      return 'specific_concept';
    }
    
    return 'general_conversation';
  }
  
  /**
   * Generates a greeting response
   */
  private generateGreetingResponse(): string {
    const greetings = [
      "Hello! It's good to see you. How can I assist with your AI learning today?",
      "Hi there! Ready to continue building your AI skills? What would you like to focus on?",
      "Welcome back to your learning session! Would you like to pick up where you left off or explore something new?"
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  /**
   * Generates a help response
   */
  private generateHelpResponse(): string {
    return "I can help you with various AI topics and learning approaches. Here are some ways I can assist:\n\n1. **Explore learning scenarios** - I can guide you through practical scenarios tailored to your role and interests\n2. **Practice specific skills** - We can focus on developing skills like prompt engineering, model selection, or implementation strategies\n3. **Explain AI concepts** - I can break down complex AI topics into understandable explanations\n4. **Provide resources** - I can recommend articles, videos, or exercises for deeper learning\n5. **Track your progress** - I can help you monitor your skill development over time\n\nWhat specific area would you like assistance with right now?";
  }
  
  /**
   * Generates a response about scenarios
   */
  private generateScenarioResponse(): string {
    return "I can help you with several AI learning scenarios based on your profile and learning goals. Here are some options:\n\n1. **Optimizing Customer Support with AI** - You've already started this scenario and completed 45% of the tasks. It focuses on designing AI solutions for customer support efficiency.\n\n2. **AI-Powered Content Creation Strategy** - This scenario (60% complete) helps you develop comprehensive AI content strategies for marketing teams.\n\n3. **Enhancing Product Discovery with Generative AI** - You haven't started this advanced scenario yet, which focuses on creating natural language product discovery experiences.\n\n4. **Building a Generative AI Assistant with Gemini** - You've completed this scenario, which covered creating a specialized healthcare AI assistant.\n\nWould you like to continue with one of these scenarios or generate a new one customized to your current interests?";
  }
  
  /**
   * Generates a response about skills based on the message
   */
  private generateSkillResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    let skill = "AI skills";
    
    if (lowerMessage.includes("prompt") || lowerMessage.includes("engineering")) {
      skill = "prompt engineering";
      return `Prompt engineering is a crucial skill you've been developing, currently at ${this.learningJourney.progressMetrics['Prompt Engineering']}% mastery. Based on your learning history, here are some ways to improve further:\n\n1. **Practice structured prompting** - Try creating prompts with clear sections for context, instruction, and output format\n\n2. **Experiment with chain-of-thought** - Guide AI through step-by-step reasoning processes\n\n3. **Test parameter variations** - Observe how different temperature settings affect creativity vs. consistency\n\n4. **Try the CRISPE framework** - Capacity, Role, Insight, Specific, Process, Example\n\nWould you like a practical exercise to develop these skills further?`;
    } else if (lowerMessage.includes("design") || lowerMessage.includes("solution")) {
      skill = "AI solution design";
      return `For AI solution design (currently at ${this.learningJourney.progressMetrics['AI Solution Design']}% mastery), consider these development approaches:\n\n1. **Problem-first thinking** - Define the problem clearly before considering AI solutions\n\n2. **Capability mapping** - Match specific AI capabilities to business requirements\n\n3. **Integration planning** - Consider how AI components will work with existing systems\n\n4. **Ethical review** - Evaluate potential biases and fairness issues early\n\nThe "Optimizing Customer Support with AI" scenario you're currently working on is excellent practice for these skills. Would you like to continue with that scenario or try a different design challenge?`;
    } else if (lowerMessage.includes("implement") || lowerMessage.includes("technical")) {
      skill = "implementation planning";
      return `Implementation planning (currently at ${this.learningJourney.progressMetrics['Implementation Planning']}% mastery) is one of your focus areas. To improve:\n\n1. **Architecture design** - Practice creating system diagrams showing AI component integration\n\n2. **API utilization** - Learn best practices for Gemini API integration\n\n3. **Performance optimization** - Consider response time, cost, and scaling factors\n\n4. **Testing strategies** - Develop approaches for evaluating AI system performance\n\nThe scenario "Building a Generative AI Assistant with Gemini" that you completed provided good experience in this area. Would you like to review what you learned there or tackle a new implementation challenge?`;
    }
    
    return `Based on your profile, here are the key AI skills you're developing:\n\n1. **Prompt Engineering** (${this.learningJourney.progressMetrics['Prompt Engineering']}% mastery) - Creating effective prompts for AI systems\n\n2. **AI Solution Design** (${this.learningJourney.progressMetrics['AI Solution Design']}% mastery) - Architecting AI-powered applications\n\n3. **Implementation Planning** (${this.learningJourney.progressMetrics['Implementation Planning']}% mastery) - Technical execution of AI solutions\n\n4. **Business Process Optimization** (${this.learningJourney.progressMetrics['Business Process Optimization']}% mastery) - Integrating AI into workflows\n\nWhich of these areas would you like to focus on improving next?`;
  }
  
  /**
   * Generates a response about user progress
   */
  private generateProgressResponse(): string {
    // Calculate overall progress
    const allMetrics = Object.values(this.learningJourney.progressMetrics);
    const averageProgress = allMetrics.reduce((sum, val) => sum + val, 0) / allMetrics.length;
    
    return `**Your AI Learning Progress**\n\nOverall progress: ${Math.round(averageProgress)}% across all skill areas\n\n**Skills breakdown:**\n${Object.entries(this.learningJourney.progressMetrics).map(([skill, progress]) => `- ${skill}: ${progress}%`).join('\n')}\n\n**Recent achievements:**\n- ${this.learningJourney.recentActivities[0].activity}\n- Started working on "Optimizing Customer Support with AI"\n\n**Recommended next steps:**\n1. Complete your current scenario on AI for customer support\n2. Focus on improving your implementation planning skills\n3. Practice advanced prompt engineering techniques\n\nIs there a specific area where you'd like more detailed progress information?`;
  }
  
  /**
   * Generates a challenging task response
   */
  private generateChallengeResponse(): string {
    return "Looking for a challenge? Here's an advanced exercise to test your skills:\n\n**Multi-stage AI Solution Design Challenge**\n\nScenario: A multinational retail company wants to use AI to personalize the shopping experience while optimizing inventory management.\n\nYour tasks:\n\n1. Design a system architecture that integrates multiple AI models for both customer-facing and operational functions\n\n2. Create detailed prompt templates for each component, including fallback mechanisms\n\n3. Develop an evaluation framework that measures both business metrics and AI performance\n\n4. Identify potential ethical concerns and mitigation strategies\n\nThis exercise will test your abilities across solution design, prompt engineering, implementation planning, and business process optimization. Would you like to start with a specific part of this challenge?";
  }
  
  /**
   * Generates an explanation of a specific concept
   */
  private generateConceptExplanation(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('prompt engineering')) {
      return "**Prompt Engineering** is the process of designing and optimizing inputs to AI models to generate desired outputs. It's like learning to communicate effectively with AI systems.\n\nKey aspects include:\n\n1. **Structure** - How you format your prompts (instructions, context, examples)\n2. **Specificity** - The level of detail you provide\n3. **Role assignment** - Giving the AI a specific persona or role\n4. **Chain-of-thought** - Guiding the AI through reasoning steps\n5. **Output formatting** - Specifying how you want results presented\n\nEffective prompt engineering is both an art and a science, requiring experimentation and an understanding of how AI models process information. Would you like to see some examples of well-engineered prompts?";
    } else if (lowerMessage.includes('model selection') || lowerMessage.includes('ai model')) {
      return "**AI Model Selection** involves choosing the right AI model for a specific task based on various factors:\n\n1. **Capability requirements** - What the model needs to do (text generation, classification, multimodal processing)\n2. **Performance needs** - Accuracy, speed, and resource efficiency\n3. **Deployment constraints** - Where and how the model will run\n4. **Cost considerations** - Training, inference, and maintenance costs\n5. **Ethical implications** - Bias, fairness, and transparency\n\nFor example, when working with Gemini models:\n- Gemini Pro balances performance and efficiency for general tasks\n- Gemini Ultra offers highest quality for complex reasoning\n- Gemini Flash provides faster responses for simpler needs\n\nWould you like guidance on selecting a model for a particular use case?";
    } else if (lowerMessage.includes('fine-tuning')) {
      return "**Fine-tuning** is the process of further training a pre-trained AI model on a specific dataset to adapt it for a particular task or domain.\n\n**Key benefits**:\n1. **Improved performance** on domain-specific tasks\n2. **Consistency** in following specific formats or styles\n3. **Efficiency** through shorter prompts (model learns your preferences)\n4. **Cost reduction** in production environments\n\n**The process typically involves**:\n1. Preparing a high-quality dataset of examples\n2. Selecting appropriate hyperparameters\n3. Training the model on your dataset\n4. Evaluating performance against your objectives\n5. Iterative refinement\n\nWhile large models like Gemini can perform well with prompt engineering alone, fine-tuning can provide additional benefits for specialized applications. Would you like to know more about when to choose fine-tuning vs. prompt engineering?";
    }
    
    return "I'm not sure about the specific concept you're asking about, but I'm happy to explain any AI-related topic. Could you provide more details about what you'd like to learn?";
  }
  
  /**
   * Generates a default response for general conversation
   */
  private generateDefaultResponse(): string {
    const defaultResponses = [
      "That's an interesting perspective. Based on your learning goals, I'd suggest connecting this to practical applications in your current scenarios. What specific aspect would you like to explore further?",
      
      "Thank you for sharing that. To make this relevant to your AI learning journey, let's consider how this relates to your current focus areas. Would you like to see some examples or practical exercises?",
      
      "I appreciate your input. To help you progress in your learning, we could explore how this connects to specific AI capabilities or implementation strategies. What would be most valuable for you right now?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }
  
  /**
   * Provides proactive guidance based on user activity
   */
  public async provideProactiveGuidance(currentScreen: string, userActivity: any): Promise<string | null> {
    this.userContext.currentScreen = currentScreen;
    this.userContext.userActivity = userActivity;
    
    // Example implementation of proactive guidance based on screen and activity
    if (currentScreen === 'scenario_detail' && userActivity?.timeSpent > 300 && userActivity?.completedTasks < 2) {
      return "I notice you've been exploring this scenario for a while. Would you like some help breaking down the first task into smaller steps?";
    } else if (currentScreen === 'scenario_task' && userActivity?.attemptCount > 3) {
      return "It seems like you might be encountering some challenges with this task. Would you like me to provide some hints or alternative approaches?";
    } else if (currentScreen === 'dashboard' && this.learningJourney.completedScenarios.length > 0) {
      return "Based on your completed scenarios, you might enjoy exploring the 'Enhancing Product Discovery with Generative AI' scenario. It builds on skills you've already demonstrated.";
    }
    
    // No proactive guidance needed
    return null;
  }
  
  /**
   * Updates AI coach with canvas interaction details
   */
  public async processCanvasInteraction(interaction: any): Promise<void> {
    console.log('Canvas interaction processed:', interaction);
  }
  
  /**
   * Gets AI suggestions for canvas state
   */
  public async getCanvasSuggestions(canvasState: any): Promise<CoachSuggestion[]> {
    // Enhanced suggestions with more context and follow-up prompts
    return [
      {
        text: "I notice you're creating an AI workflow for data processing. Consider adding a validation step between the input and processing components to handle edge cases.",
        type: "hint",
        relevanceScore: 0.85,
        followUp: "Would you like me to suggest specific validation methods for this data type?"
      },
      {
        text: "For this type of AI solution, Harvard Business Review published a relevant case study on implementation challenges. Would you like me to summarize the key findings?",
        type: "resource",
        relevanceScore: 0.72
      },
      {
        text: "How will your solution handle scenarios where the input data is incomplete or ambiguous?",
        type: "question",
        relevanceScore: 0.91,
        followUp: "This is important because AI models often need strategies for uncertainty management."
      },
      {
        text: "Try enhancing your current architecture by adding a feedback loop that allows the model to learn from user corrections over time.",
        type: "challenge",
        relevanceScore: 0.78,
        followUp: "This would transform your static solution into an adaptive learning system."
      }
    ];
  }
  
  /**
   * Adds a message to conversation history
   */
  private addToConversationHistory(role: 'user' | 'system' | 'assistant', content: string): void {
    this.conversationHistory.push({
      role,
      content,
      timestamp: new Date()
    });
    
    // Limit history size to prevent excessive memory usage
    if (this.conversationHistory.length > 100) {
      this.conversationHistory.shift();
    }
  }
  
  /**
   * Gets recent conversation history
   */
  public getConversationHistory(): ConversationItem[] {
    return [...this.conversationHistory];
  }
  
  /**
   * Checks if there has been a recent coach interaction
   */
  public hasRecentCoachInteraction(timeWindowMs: number = 60000): boolean {
    const now = new Date();
    const recentAssistantMessage = this.conversationHistory
      .filter(item => item.role === 'assistant')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
      
    if (!recentAssistantMessage) return false;
    
    return (now.getTime() - recentAssistantMessage.timestamp.getTime()) < timeWindowMs;
  }
}
