
import { ConversationItem, UserContext } from './AICoachService';

export interface JarvisContext {
  currentPhaseId: number;
  userProgress: UserSyllabusProgress;
}

export interface UserSyllabusProgress {
  currentPhase: number;
  completedTasks: number[];
  lastInteraction: Date;
}

export class JarvisCoachService {
  private conversationHistory: ConversationItem[];
  private userContext: UserContext;
  private jarvisContext: JarvisContext;
  private systemPrompt: string;
  
  constructor() {
    this.conversationHistory = [];
    this.userContext = {};
    this.jarvisContext = {
      currentPhaseId: 1,
      userProgress: {
        currentPhase: 1,
        completedTasks: [],
        lastInteraction: new Date()
      }
    };
    
    // Initialize the Jarvis system prompt
    this.systemPrompt = `You are 'Jarvis', a highly intelligent, personalized AI training assistant specifically designed to guide a user through the provided syllabus titled "Building with Gemini: From Idea to Prototype". Your primary function is to act as the user's personal tutor and motivator, helping them understand and complete the exercises and training outlined in each phase of the syllabus. Your tone is supportive, knowledgeable, encouraging, and slightly formal, befitting a sophisticated AI assistant.`;
  }
  
  /**
   * Initializes Jarvis with welcome message 
   */
  public async initializeJarvis(userName: string): Promise<string> {
    const welcomeMessage = `Greetings, ${userName}. I am Jarvis, your personalized AI training assistant for the syllabus 'Building with Gemini: From Idea to Prototype'. This program is designed to guide you from a GenAI novice to proficiency by building a practical project using the Google Gemini ecosystem. I am here to help you understand the concepts, complete the exercises, and navigate through each phase of the syllabus.\n\nAre you ready to begin, or would you like to start with a specific phase? I recommend beginning with Phase 1: Getting Started - Understanding GenAI and Gemini Fundamentals.`;
    
    this.addToConversationHistory('assistant', welcomeMessage);
    return welcomeMessage;
  }
  
  /**
   * Processes user message within Jarvis context
   */
  public async processUserMessage(message: string): Promise<string> {
    this.addToConversationHistory('user', message);
    
    // Mock AI response - in a real implementation, this would call a Gemini API
    let response = '';
    
    if (message.toLowerCase().includes('phase 1') || message.toLowerCase().includes('start')) {
      response = "Excellent choice! Let's begin with Phase 1: Understanding GenAI and Gemini Fundamentals.\n\nThe objective of this phase is to introduce you to the core concepts of Generative AI and Large Language Models (LLMs), understand what Gemini is, its basic capabilities, and how to interact with it.\n\nYour core practical task will be to explore the Gemini interface and perform basic text-based tasks to get comfortable with AI interaction. Specifically, you'll access the Gemini interface, use it to generate creative text, summarize a document, or brainstorm simple ideas for a potential project.\n\nWould you like me to guide you through this task step by step?";
      this.jarvisContext.currentPhaseId = 1;
    } else if (message.toLowerCase().includes('phase 2')) {
      response = "Great! Let's move to Phase 2: Project Ideation and Design with AI Assistance.\n\nThe objective of this phase is to select a project idea for a GenAI-powered solution and leverage Gemini's capabilities for research, brainstorming, and outlining the project plan.\n\nYour core practical task will be to define a specific GenAI solution idea you want to explore building, and then use Gemini to refine the idea, gather information, and outline the steps required.\n\nAre you ready to start brainstorming your project idea?";
      this.jarvisContext.currentPhaseId = 2;
    } else if (message.toLowerCase().includes('yes') || message.toLowerCase().includes('ready')) {
      if (this.jarvisContext.currentPhaseId === 1) {
        response = "Perfect! Let's begin by accessing the Gemini interface. You can use either the Gemini app on your mobile device or visit gemini.google.com.\n\nOnce you've accessed the interface, try these simple tasks:\n\n1. Ask Gemini to generate a short creative story about AI learning\n2. Provide a paragraph of text and ask it to summarize it\n3. Ask it to brainstorm 3-5 potential GenAI project ideas related to your interests\n\nThis will help you get a feel for how Gemini responds to different types of prompts. Let me know when you've completed these tasks, and we can discuss what you observed about Gemini's responses.";
      } else {
        response = "I'm here to help you with your current phase. Could you please let me know which specific aspect of the current task you'd like guidance on?";
      }
    } else if (message.toLowerCase().includes('help') || message.toLowerCase().includes('confused')) {
      response = "I understand that learning about AI can be complex. Let me help clarify. The syllabus we're following has 5 phases:\n\n1. Understanding GenAI and Gemini Fundamentals\n2. Project Ideation and Design with AI\n3. Building the Prototype\n4. Enhancing and Evaluating the Prototype\n5. Deployment and Responsible AI\n\nWe're currently focusing on Phase " + this.jarvisContext.currentPhaseId + ". What specific concept or task would you like me to explain in more detail?";
    } else {
      response = "That's an interesting point. As your AI training assistant, I'm focused on helping you progress through the Gemini syllabus. Based on our current focus on Phase " + this.jarvisContext.currentPhaseId + ", I'd recommend connecting your question to the practical tasks at hand. Would you like me to explain a specific concept from this phase in more detail or guide you through the next steps of the practical task?";
    }
    
    this.addToConversationHistory('assistant', response);
    this.jarvisContext.userProgress.lastInteraction = new Date();
    return response;
  }
  
  /**
   * Updates user progress in the syllabus
   */
  public updateProgress(phaseId: number, completedTaskId?: number): void {
    this.jarvisContext.currentPhaseId = phaseId;
    this.jarvisContext.userProgress.currentPhase = phaseId;
    
    if (completedTaskId && !this.jarvisContext.userProgress.completedTasks.includes(completedTaskId)) {
      this.jarvisContext.userProgress.completedTasks.push(completedTaskId);
    }
  }
  
  /**
   * Gets syllabus progress for the user
   */
  public getProgress(): UserSyllabusProgress {
    return this.jarvisContext.userProgress;
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
}
