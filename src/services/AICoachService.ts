
import { User } from '@/contexts/UserContext';

export interface ConversationItem {
  role: 'user' | 'system' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UserContext {
  currentScenario?: any;
  currentScreen?: string;
  userActivity?: any;
}

export interface LearningJourney {
  completedScenarios: string[];
  currentSkillFocus: string[];
  progressMetrics: Record<string, number>;
}

export interface CoachSuggestion {
  text: string;
  type: 'hint' | 'resource' | 'question' | 'challenge';
}

export class AICoachService {
  private conversationHistory: ConversationItem[];
  private userContext: UserContext;
  private learningJourney: LearningJourney;
  
  constructor() {
    this.conversationHistory = [];
    this.userContext = {};
    this.learningJourney = {
      completedScenarios: [],
      currentSkillFocus: [],
      progressMetrics: {},
    };
  }
  
  /**
   * Initializes coach with welcome message based on user status
   */
  public async initializeCoach(user: User): Promise<string> {
    const isReturningUser = user.lastLoginDate !== null;
    
    let welcomeMessage = isReturningUser
      ? `Welcome back, ${user.name}! Ready to continue your AI learning journey?`
      : `Welcome to AI SkillForge, ${user.name}! I'll be your AI coach to help you master AI skills relevant to your ${user.role} role.`;
    
    this.addToConversationHistory('assistant', welcomeMessage);
    return welcomeMessage;
  }
  
  /**
   * Processes user message and maintains continuous context
   */
  public async processUserMessage(message: string): Promise<string> {
    this.addToConversationHistory('user', message);
    
    // Mock AI response - in a real implementation, this would call an AI API
    let response = '';
    
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      response = "Hello! How can I assist with your AI learning today?";
    } else if (message.toLowerCase().includes('help')) {
      response = "I can help you with various AI topics. Would you like to explore a learning scenario, practice a skill, or learn about a specific AI concept?";
    } else if (message.toLowerCase().includes('scenario')) {
      response = "I can generate personalized learning scenarios based on your role and interests. Would you like to try one focused on prompt engineering, model selection, or implementation strategies?";
    } else if (message.toLowerCase().includes('skill')) {
      response = "Based on your profile, I'd recommend focusing on prompt engineering skills. Would you like to start with a basic exercise?";
    } else {
      response = "That's an interesting question. Let me help you explore that topic further. What specific aspect would you like to focus on?";
    }
    
    this.addToConversationHistory('assistant', response);
    return response;
  }
  
  /**
   * Provides proactive guidance based on user activity
   */
  public async provideProactiveGuidance(currentScreen: string, userActivity: any): Promise<string | null> {
    // In a real implementation, we would analyze user activity and provide contextual guidance
    // For now, we'll return null to indicate no guidance is needed
    return null;
  }
  
  /**
   * Updates AI coach with canvas interaction details
   */
  public async processCanvasInteraction(interaction: any): Promise<void> {
    // In a real implementation, we would update the AI's understanding of user's canvas interactions
    console.log('Canvas interaction processed:', interaction);
  }
  
  /**
   * Gets AI suggestions for canvas state
   */
  public async getCanvasSuggestions(canvasState: any): Promise<CoachSuggestion[]> {
    // Mock suggestions - in a real implementation, this would be AI-generated
    return [
      {
        text: "Try connecting the AI service to your data source to see how it processes the information.",
        type: "hint"
      },
      {
        text: "Have you considered how this solution scales with larger datasets?",
        type: "question"
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
