
import { ConversationItem, UserContext } from './AICoachService';

export interface JarvisContext {
  currentPhaseId: number;
  userProgress: UserSyllabusProgress;
  lastUserQuery?: string;
  previousResponses: string[];
}

export interface UserSyllabusProgress {
  currentPhase: number;
  completedTasks: number[];
  lastInteraction: Date;
  phaseProgress: {
    [phaseId: number]: {
      percentComplete: number;
      conceptsUnderstanding: number;
      practicalExercisesCompleted: number;
    }
  };
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
        lastInteraction: new Date(),
        phaseProgress: {
          1: { percentComplete: 15, conceptsUnderstanding: 20, practicalExercisesCompleted: 1 },
          2: { percentComplete: 0, conceptsUnderstanding: 0, practicalExercisesCompleted: 0 },
          3: { percentComplete: 0, conceptsUnderstanding: 0, practicalExercisesCompleted: 0 },
          4: { percentComplete: 0, conceptsUnderstanding: 0, practicalExercisesCompleted: 0 },
          5: { percentComplete: 0, conceptsUnderstanding: 0, practicalExercisesCompleted: 0 }
        }
      },
      previousResponses: []
    };
    
    // Initialize the Jarvis system prompt
    this.systemPrompt = `You are 'Jarvis', a highly intelligent, personalized AI training assistant specifically designed to guide a user through the provided syllabus titled "Building with Gemini: From Idea to Prototype". Your primary function is to act as the user's personal tutor and motivator, helping them understand and complete the exercises and training outlined in each phase of the syllabus. Your tone is supportive, knowledgeable, encouraging, and slightly formal, befitting a sophisticated AI assistant.`;
  }
  
  /**
   * Initializes Jarvis with welcome message 
   */
  public async initializeJarvis(userName: string): Promise<string> {
    const welcomeMessage = `Greetings, ${userName}. I am Jarvis, your personalized AI training assistant for the syllabus 'Building with Gemini: From Idea to Prototype'. This program is designed to guide you from a GenAI novice to proficiency by building a practical project using the Google Gemini ecosystem. I am here to help you understand the concepts, complete the exercises, and navigate through each phase of the syllabus.\n\nI notice you've already begun Phase 1: Getting Started - Understanding GenAI and Gemini Fundamentals. Would you like to continue where you left off, or shall we review what you've learned so far?`;
    
    this.addToConversationHistory('assistant', welcomeMessage);
    return welcomeMessage;
  }
  
  /**
   * Processes user message within Jarvis context
   */
  public async processUserMessage(message: string): Promise<string> {
    this.addToConversationHistory('user', message);
    this.jarvisContext.lastUserQuery = message;
    
    try {
      // Build context for Jarvis
      const recentHistory = this.conversationHistory.slice(-8);
      const contextPrompt = this.buildJarvisContextualPrompt(message, recentHistory);
      
      const systemPrompt = `${this.systemPrompt}

You are guiding a user through the "Building with Gemini: From Idea to Prototype" syllabus.

Current user progress:
- Current Phase: ${this.jarvisContext.currentPhaseId}
- Progress in current phase: ${this.jarvisContext.userProgress.phaseProgress[this.jarvisContext.currentPhaseId].percentComplete}%
- Concepts understanding: ${this.jarvisContext.userProgress.phaseProgress[this.jarvisContext.currentPhaseId].conceptsUnderstanding}%
- Practical exercises completed: ${this.jarvisContext.userProgress.phaseProgress[this.jarvisContext.currentPhaseId].practicalExercisesCompleted}

Phase overview:
${this.getPhaseOverview(this.jarvisContext.currentPhaseId)}

Always maintain your sophisticated, supportive coaching style while providing specific, actionable guidance based on the user's current phase and progress.`;

      const response = await this.callGeminiAPI(contextPrompt, systemPrompt);
      
      // Update progress based on response context
      this.updateProgressFromResponse(message, response);
      
      this.jarvisContext.previousResponses.push(response);
      this.addToConversationHistory('assistant', response);
      this.jarvisContext.userProgress.lastInteraction = new Date();
      return response;

    } catch (error) {
      console.error('Error in Jarvis processUserMessage:', error);
      
      // Fallback to intent-based responses
      let response = '';
      
      // Determine appropriate response based on message content and context
      if (message.toLowerCase().includes('continue') || message.toLowerCase().includes('where i left off')) {
        response = this.getContinueResponse();
      } else if (message.toLowerCase().includes('review') || message.toLowerCase().includes('what i learned')) {
        response = this.getReviewResponse();
      } else if (message.toLowerCase().includes('phase 1') || (message.toLowerCase().includes('phase') && message.toLowerCase().includes('1'))) {
        response = this.getPhaseInformation(1);
        this.jarvisContext.currentPhaseId = 1;
      } else if (message.toLowerCase().includes('phase 2') || (message.toLowerCase().includes('phase') && message.toLowerCase().includes('2'))) {
        response = this.getPhaseInformation(2);
        this.jarvisContext.currentPhaseId = 2;
      } else if (message.toLowerCase().includes('phase 3') || (message.toLowerCase().includes('phase') && message.toLowerCase().includes('3'))) {
        response = this.getPhaseInformation(3);
        this.jarvisContext.currentPhaseId = 3;
      } else if (message.toLowerCase().includes('phase 4') || (message.toLowerCase().includes('phase') && message.toLowerCase().includes('4'))) {
        response = this.getPhaseInformation(4);
        this.jarvisContext.currentPhaseId = 4;
      } else if (message.toLowerCase().includes('phase 5') || (message.toLowerCase().includes('phase') && message.toLowerCase().includes('5'))) {
        response = this.getPhaseInformation(5);
        this.jarvisContext.currentPhaseId = 5;
      } else if (message.toLowerCase().includes('yes') || message.toLowerCase().includes('ready') || message.toLowerCase().includes('let\'s start')) {
        response = this.getTaskInstructions();
      } else if (message.toLowerCase().includes('gemini') && message.toLowerCase().includes('api')) {
        response = this.getGeminiAPIInfo();
      } else if (message.toLowerCase().includes('progress')) {
        response = this.getProgressUpdate();
      } else if (message.toLowerCase().includes('help') || message.toLowerCase().includes('confused')) {
        response = this.getHelpResponse();
      } else if (message.toLowerCase().includes('complete') || message.toLowerCase().includes('finished') || message.toLowerCase().includes('done')) {
        response = this.handleTaskCompletion();
      } else {
        response = this.getDefaultResponse();
      }
      
      // Add response to history
      this.jarvisContext.previousResponses.push(response);
      this.addToConversationHistory('assistant', response);
      this.jarvisContext.userProgress.lastInteraction = new Date();
      return response;
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
        temperature: 0.8,
        maxTokens: 1500
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
   * Builds a contextual prompt for Jarvis including conversation history
   */
  private buildJarvisContextualPrompt(currentMessage: string, recentHistory: ConversationItem[]): string {
    let contextPrompt = '';
    
    if (recentHistory.length > 0) {
      contextPrompt += "Recent conversation:\n";
      recentHistory.forEach((item, index) => {
        if (index < recentHistory.length - 1) {
          contextPrompt += `${item.role}: ${item.content}\n`;
        }
      });
      contextPrompt += "\n";
    }
    
    contextPrompt += `User's current message: ${currentMessage}`;
    
    return contextPrompt;
  }

  /**
   * Updates user progress based on interaction patterns
   */
  private updateProgressFromResponse(userMessage: string, response: string): void {
    const phaseId = this.jarvisContext.currentPhaseId;
    const currentProgress = this.jarvisContext.userProgress.phaseProgress[phaseId];
    
    // Simple progress update logic based on interaction
    if (userMessage.toLowerCase().includes('complete') || userMessage.toLowerCase().includes('finished')) {
      currentProgress.percentComplete = Math.min(100, currentProgress.percentComplete + 15);
      currentProgress.practicalExercisesCompleted += 1;
    } else if (userMessage.length > 100) { // Detailed interaction
      currentProgress.percentComplete = Math.min(100, currentProgress.percentComplete + 5);
      currentProgress.conceptsUnderstanding = Math.min(100, currentProgress.conceptsUnderstanding + 3);
    }
  }

  /**
   * Gets phase overview for context
   */
  private getPhaseOverview(phaseId: number): string {
    const phases = {
      1: "Understanding GenAI and Gemini Fundamentals - Introduction to AI concepts and basic Gemini usage",
      2: "Project Ideation and Design with AI Assistance - Using Gemini for research and project planning", 
      3: "Building the Prototype - Implementing a GenAI solution with Gemini API",
      4: "Enhancing and Evaluating the Prototype - Improving and testing the solution",
      5: "Deployment and Responsible AI - Preparing for production and implementing best practices"
    };
    
    return phases[phaseId] || "Unknown phase";
  }
  
  /**
   * Generate response for continuing the current phase
   */
  private getContinueResponse(): string {
    const phaseId = this.jarvisContext.currentPhaseId;
    const progress = this.jarvisContext.userProgress.phaseProgress[phaseId];
    
    if (progress.percentComplete < 30) {
      return `Excellent! Let's continue with Phase ${phaseId}. You're currently at ${progress.percentComplete}% completion of this phase.\n\nYour next task is to explore the Gemini interface more deeply. Specifically, I'd like you to experiment with different prompt formats to see how they affect Gemini's responses. Try asking the same question in different ways, such as:\n\n1. Direct question: "What is prompt engineering?"\n2. Role-based: "You are an expert in AI. Explain prompt engineering to a beginner."\n3. Format-specific: "Create a bullet-point list explaining prompt engineering."\n\nAfter trying these, let me know what differences you observe in Gemini's responses. This will help you understand how prompt structure affects AI output - a key concept in effective AI interaction.`;
    } else if (progress.percentComplete < 70) {
      return `Great! You're making good progress in Phase ${phaseId} with ${progress.percentComplete}% completion. Let's build on what you've learned.\n\nNow, I'd like you to practice more advanced prompting techniques by creating a "chain of thought" prompt. This technique guides the AI through a step-by-step reasoning process.\n\nFor example, try asking Gemini to solve a problem using this format: "I need to select the right AI model for my customer service chatbot. Think through this step by step: First, consider my requirements (24/7 availability, handling basic product questions, escalating complex issues). Second, analyze what capabilities are needed. Third, recommend a suitable AI approach."\n\nAfter getting Gemini's response, try modifying your prompt to see how the changes affect the output. Let me know what you discover!`;
    } else {
      return `Excellent! You're nearly complete with Phase ${phaseId} at ${progress.percentComplete}% completion. Let's work on finalizing your understanding.\n\nFor your final exercise in this phase, I'd like you to create a comparison between different AI interaction approaches. Use Gemini to help you compare:\n\n1. Simple prompts vs. detailed prompts\n2. Single queries vs. conversation-based interaction\n3. Technical language vs. natural language\n\nCreate a small table or list showing the strengths and weaknesses of each approach. This exercise will consolidate your knowledge about effective AI interaction before we move to Phase ${phaseId + 1}.\n\nWhen you're ready to submit your comparison or if you have questions, let me know!`;
    }
  }
  
  /**
   * Generate response for reviewing current progress
   */
  private getReviewResponse(): string {
    const phaseId = this.jarvisContext.currentPhaseId;
    const progress = this.jarvisContext.userProgress.phaseProgress[phaseId];
    
    return `Let's review what you've learned so far in Phase ${phaseId}:\n\n- You've achieved ${progress.percentComplete}% completion of this phase\n- You've completed ${progress.practicalExercisesCompleted} practical exercises\n- Your conceptual understanding is rated at ${progress.conceptsUnderstanding}/100\n\nKey concepts you've explored:\n1. Basic understanding of Large Language Models (LLMs) and how they process information\n2. Introduction to Gemini's capabilities and interface\n3. Fundamentals of prompt creation and interaction with AI\n\nAreas to focus on next:\n- More structured prompt creation techniques\n- Understanding context and how it affects AI responses\n- Practical applications of Gemini for specific use cases\n\nWould you like to continue with these focus areas, or would you prefer to revisit any specific concept?`;
  }
  
  /**
   * Provide information about a specific phase
   */
  private getPhaseInformation(phaseId: number): string {
    const phases = {
      1: {
        title: "Getting Started - Understanding GenAI and Gemini Fundamentals",
        description: "This phase introduces the core concepts of Generative AI and Large Language Models (LLMs), explains what Gemini is, its basic capabilities, and how to interact with it.",
        keyObjectives: [
          "Understand what Generative AI is and how it works",
          "Learn about Google's Gemini models and their capabilities",
          "Explore the Gemini interface and perform basic tasks",
          "Master fundamental prompt engineering techniques"
        ],
        practicalTask: "Explore the Gemini interface and perform basic text-based tasks to get comfortable with AI interaction."
      },
      2: {
        title: "Project Ideation and Design with AI Assistance",
        description: "In this phase, you'll select a project idea for a GenAI-powered solution and leverage Gemini's capabilities for research, brainstorming, and outlining the project plan.",
        keyObjectives: [
          "Identify potential application areas for Gemini",
          "Use Gemini for project research and ideation",
          "Create a detailed project outline with Gemini's help",
          "Apply prompt engineering for specific research goals"
        ],
        practicalTask: "Define a specific GenAI solution idea you want to explore building, and then use Gemini to refine the idea, gather information, and outline the steps required."
      },
      3: {
        title: "Building the Prototype",
        description: "This phase focuses on implementing your GenAI solution concept using the Gemini API and creating a functional prototype.",
        keyObjectives: [
          "Set up your development environment for Gemini API",
          "Implement basic API calls and response handling",
          "Design effective prompts for your specific use case",
          "Create a minimal working prototype of your solution"
        ],
        practicalTask: "Implement a basic working prototype of your selected GenAI solution using the Gemini API."
      },
      4: {
        title: "Enhancing and Evaluating the Prototype",
        description: "In this phase, you'll improve your prototype, add more sophisticated features, and implement evaluation metrics to test its performance.",
        keyObjectives: [
          "Implement advanced features using Gemini capabilities",
          "Enhance user experience and interface design",
          "Develop evaluation methods for your solution",
          "Iterate based on feedback and testing results"
        ],
        practicalTask: "Enhance your prototype with more sophisticated features and implement methods to evaluate its performance."
      },
      5: {
        title: "Deployment and Responsible AI",
        description: "This final phase covers preparing your solution for deployment, implementing best practices for responsible AI use, and planning for ongoing improvements.",
        keyObjectives: [
          "Understand deployment options for Gemini-powered applications",
          "Implement responsible AI practices in your solution",
          "Create a plan for monitoring and improving your application",
          "Prepare documentation and presentation of your project"
        ],
        practicalTask: "Prepare your solution for deployment, implement responsible AI safeguards, and create a presentation showcasing your project."
      }
    };
    
    const phase = phases[phaseId];
    const progress = this.jarvisContext.userProgress.phaseProgress[phaseId];
    
    return `**Phase ${phaseId}: ${phase.title}**\n\nDescription: ${phase.description}\n\nKey Objectives:\n${phase.keyObjectives.map((objective, index) => `${index + 1}. ${objective}`).join('\n')}\n\nCore Practical Task: ${phase.practicalTask}\n\nYour Current Progress: ${progress.percentComplete}% complete\n\nWould you like to begin working on this phase or learn more details about any specific objective?`;
  }
  
  /**
   * Provide detailed task instructions
   */
  private getTaskInstructions(): string {
    const phaseId = this.jarvisContext.currentPhaseId;
    const taskInstructions = {
      1: `Let's start with your first practical task for Phase 1. This will help you get familiar with the Gemini interface.\n\nTask: Basic Gemini Exploration\n\nStep 1: Access Gemini through either gemini.google.com/app/ or the mobile app.\n\nStep 2: Complete these specific exercises:\n- Ask Gemini to generate a short creative story about AI learning from humans\n- Provide this paragraph to Gemini and ask it to summarize it in 3 bullet points: "Generative AI is a type of artificial intelligence technology that can create various types of content, including text, imagery, audio, and synthetic data. Unlike traditional AI systems that are designed for specific tasks like classification or prediction, generative AI can create new content that didn't exist before, based on its training data and the prompts it receives."\n- Ask Gemini to brainstorm 3-5 potential project ideas related to your field of interest\n\nStep 3: For each exercise, pay attention to:\n- How quickly Gemini responds\n- How accurate and relevant the responses are\n- How the format of your prompt affects the output\n\nLet me know when you've completed these steps, and we can discuss what you observed about Gemini's capabilities and responses.`,
      
      2: `For this Phase 2 task, you'll start developing your project idea.\n\nTask: Project Ideation\n\nStep 1: Brainstorm 2-3 potential problem areas in your field that could benefit from a GenAI solution.\n\nStep 2: For each problem area, use Gemini to help you explore:\n- Who would be the primary users of your solution?\n- What specific pain points would it address?\n- What existing solutions are available, and how could GenAI improve on them?\n- What specific capabilities of Gemini would be most relevant?\n\nStep 3: Based on Gemini's responses, select one project idea to focus on.\n\nStep 4: Work with Gemini to create an initial project outline that includes:\n- Project name and tagline\n- Problem statement\n- Proposed solution overview\n- Key features (3-5 items)\n- Main user benefits\n- Technical approach at a high level\n\nWhen you've created this outline, share it with me, and we can discuss how to refine it further.`,
      
      3: `Now that you have your project idea, let's start building a prototype.\n\nTask: Basic Gemini API Integration\n\nStep 1: Set up your development environment:\n- Create a new project folder\n- Register for Gemini API access through Google AI Studio (if you haven't already)\n- Generate an API key for your project\n\nStep 2: Create a basic application structure:\n- Set up a simple front-end interface (can be a web page, notebook, or command-line interface)\n- Implement the basic code to make API calls to Gemini\n- Create a simple input method for user prompts\n\nStep 3: Implement your first functional feature:\n- Choose one core feature from your project outline\n- Design the prompt template for this feature\n- Implement the API call and response handling\n- Test with various inputs\n\nStep 4: Document your implementation:\n- Note any challenges you encountered\n- Document the prompt design decisions\n- Identify areas for improvement\n\nLet me know when you've completed these steps or if you need help with any specific part of the implementation.`,
      
      4: `In this phase, we'll enhance your prototype and evaluate its performance.\n\nTask: Prototype Enhancement and Evaluation\n\nStep 1: Implement at least two enhancement areas:\n- Improve prompt engineering for better response quality\n- Add error handling and edge case management\n- Implement a better user interface/experience\n- Add context management for more coherent interactions\n\nStep 2: Develop evaluation criteria:\n- Define 3-5 specific metrics relevant to your solution (e.g., response accuracy, helpfulness, task completion rate)\n- Create a simple evaluation framework (can be a spreadsheet or document)\n- Design 5-10 test cases representing typical user interactions\n\nStep 3: Conduct evaluation:\n- Run through your test cases\n- Record results based on your metrics\n- Identify patterns in strengths and weaknesses\n\nStep 4: Plan iterations:\n- Based on evaluation results, determine priority improvements\n- Document specific changes needed for each area\n\nShare your evaluation results and iteration plan when complete. We can then discuss which improvements might have the most impact.`,
      
      5: `For the final phase, let's prepare your solution for deployment and ensure responsible AI practices.\n\nTask: Deployment Preparation and Responsible AI Implementation\n\nStep 1: Deployment preparation:\n- Optimize your code for performance and reliability\n- Document installation and usage instructions\n- Create any necessary configuration files\n- Consider scaling requirements if applicable\n\nStep 2: Implement responsible AI safeguards:\n- Add appropriate disclaimers about AI-generated content\n- Implement content filtering for inappropriate outputs\n- Add user feedback mechanisms\n- Create a plan for monitoring and addressing potential biases\n\nStep 3: Create documentation:\n- Technical documentation for future developers\n- User guide explaining features and limitations\n- Responsible use guidelines\n\nStep 4: Prepare a project presentation:\n- Create a 5-minute demonstration of your solution\n- Prepare slides covering problem, solution, technical approach, and results\n- Include lessons learned and future enhancement ideas\n\nWhen you've completed this task, you'll have a deployment-ready solution and a compelling presentation of your work!`
    };
    
    return taskInstructions[phaseId] || `I don't have specific task instructions for Phase ${phaseId} yet. Let's discuss what you'd like to focus on in this phase, and I can help create a custom task for you.`;
  }
  
  /**
   * Provide information about the Gemini API
   */
  private getGeminiAPIInfo(): string {
    return `The Gemini API allows developers to integrate Google's Gemini models into their applications. Here's a basic overview:\n\n**Getting Started with Gemini API**\n\n1. **Access**: You can access the Gemini API through Google AI Studio or Google Cloud Vertex AI.\n\n2. **Key Models**:\n   - Gemini 1.0 Pro: Balanced model for most text and image tasks\n   - Gemini 1.0 Ultra: Most powerful model for complex tasks\n   - Gemini 1.0 Flash: Fast, cost-effective model for simpler tasks\n\n3. **Basic Implementation**:\n\`\`\`python\nfrom google.generativeai import GenerativeModel\n\n# Configure your API key\nimport google.generativeai as genai\ngenai.configure(api_key="YOUR_API_KEY")\n\n# Create the model\nmodel = GenerativeModel('gemini-pro')\n\n# Generate content\nresponse = model.generate_content("Write a short poem about AI")\nprint(response.text)\n\`\`\`\n\n4. **Key Features**:\n   - Text generation\n   - Image understanding\n   - Multimodal capabilities\n   - Function calling\n   - Chat functionality\n\n5. **Pricing**: Varies based on model and usage, with both free tiers and paid options available.\n\nWould you like more specific information about implementing a particular feature with the Gemini API?`;
  }
  
  /**
   * Generate progress update for the user
   */
  private getProgressUpdate(): string {
    const totalPhases = 5;
    const userProgress = this.jarvisContext.userProgress;
    const currentPhase = userProgress.currentPhase;
    const currentPhaseProgress = userProgress.phaseProgress[currentPhase].percentComplete;
    
    // Calculate overall progress
    const completedPhases = Object.entries(userProgress.phaseProgress)
      .filter(([_, data]) => data.percentComplete === 100)
      .map(([phaseId, _]) => parseInt(phaseId));
    
    const partialPhases = Object.entries(userProgress.phaseProgress)
      .filter(([_, data]) => data.percentComplete > 0 && data.percentComplete < 100)
      .map(([phaseId, data]) => ({ phaseId: parseInt(phaseId), progress: data.percentComplete }));
    
    const totalProgress = (completedPhases.length * 100 + partialPhases.reduce((acc, phase) => acc + phase.progress, 0)) / totalPhases;
    
    return `**Your Learning Progress**\n\nOverall Syllabus Completion: ${Math.round(totalProgress)}%\n\nPhase-by-Phase Breakdown:\n${Object.entries(userProgress.phaseProgress).map(([phaseId, data]) => {
      return `- Phase ${phaseId}: ${data.percentComplete}% complete${data.percentComplete === 100 ? ' ✅' : ''}`;
    }).join('\n')}\n\nCurrent Focus: Phase ${currentPhase} (${currentPhaseProgress}% complete)\n\nNext Milestones:\n${
      currentPhaseProgress < 100 
      ? `- Complete remaining tasks in Phase ${currentPhase}`
      : `- Begin Phase ${Math.min(currentPhase + 1, 5)}`
    }\n\nWould you like to continue working on your current phase or learn more about an upcoming phase?`;
  }
  
  /**
   * Provide help response
   */
  private getHelpResponse(): string {
    return `I understand that learning about AI can be complex. Let me help clarify. The syllabus we're following has 5 phases:\n\n1. Understanding GenAI and Gemini Fundamentals\n2. Project Ideation and Design with AI Assistance\n3. Building the Prototype\n4. Enhancing and Evaluating the Prototype\n5. Deployment and Responsible AI\n\nWe're currently focusing on Phase ${this.jarvisContext.currentPhaseId}.\n\nHere are some ways I can assist you:\n\n- Explain specific concepts in more detail\n- Provide step-by-step guidance for practical exercises\n- Offer examples and demonstrations\n- Break down complex topics into simpler parts\n- Suggest resources for additional learning\n\nWhat specific aspect are you finding challenging, or what would you like me to explain in more detail?`;
  }
  
  /**
   * Handle task completion
   */
  private handleTaskCompletion(): string {
    const phaseId = this.jarvisContext.currentPhaseId;
    const progress = this.jarvisContext.userProgress.phaseProgress[phaseId];
    
    // Simulate task completion by increasing progress
    const newPercentComplete = Math.min(100, progress.percentComplete + 25);
    const newConceptsUnderstanding = Math.min(100, progress.conceptsUnderstanding + 15);
    const newPracticalExercises = progress.practicalExercisesCompleted + 1;
    
    this.jarvisContext.userProgress.phaseProgress[phaseId] = {
      percentComplete: newPercentComplete,
      conceptsUnderstanding: newConceptsUnderstanding,
      practicalExercisesCompleted: newPracticalExercises
    };
    
    // If phase is complete, update the current phase if not already on a later phase
    if (newPercentComplete >= 100 && phaseId >= this.jarvisContext.userProgress.currentPhase) {
      this.jarvisContext.userProgress.currentPhase = Math.min(5, phaseId + 1);
    }
    
    const completionMessages = [
      `Excellent work! You've successfully completed this task in Phase ${phaseId}. Your progress in this phase is now at ${newPercentComplete}%.\n\nI've noticed significant improvement in your understanding of the core concepts. Would you like to continue with the next task in this phase${newPercentComplete < 100 ? '' : ' or move on to Phase ' + Math.min(5, phaseId + 1)}?`,
      
      `Well done! Task completed successfully. Your phase progress is now at ${newPercentComplete}%.\n\nYou've demonstrated a good grasp of the practical application of these concepts. The next steps will build on what you've just learned. Ready to continue?`,
      
      `Great job completing this task! Your progress in Phase ${phaseId} is now ${newPercentComplete}%.\n\nI'm particularly impressed with how you applied the concepts we've covered. This will serve as a solid foundation for the more advanced topics${newPercentComplete < 100 ? ' later in this phase' : ' in the next phase'}. Would you like to proceed with the next activity?`
    ];
    
    return completionMessages[Math.floor(Math.random() * completionMessages.length)];
  }
  
  /**
   * Generate default response when no specific pattern is matched
   */
  private getDefaultResponse(): string {
    const defaultResponses = [
      `That's an interesting point. As your Gemini training assistant, I'm focused on helping you progress through the "Building with Gemini" syllabus. Based on our current focus on Phase ${this.jarvisContext.currentPhaseId}, I'd recommend connecting your question to the practical tasks at hand. Would you like me to explain a specific concept from this phase in more detail or guide you through the next steps?`,
      
      `Thank you for sharing that. To make the most of our training session, let's relate this to your current progress in Phase ${this.jarvisContext.currentPhaseId}. What specific aspect of Gemini or GenAI would you like to explore in relation to your learning goals?`,
      
      `I appreciate your input. To keep us on track with your Gemini training, let's focus on how this relates to your current phase. Would you like to see some practical examples of applying the concepts from Phase ${this.jarvisContext.currentPhaseId}, or would you prefer to move on to the next learning activity?`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }
  
  /**
   * Updates user progress in the syllabus
   */
  public updateProgress(phaseId: number, completedTaskId?: number): void {
    this.jarvisContext.currentPhaseId = phaseId;
    this.jarvisContext.userProgress.currentPhase = phaseId;
    
    if (completedTaskId && !this.jarvisContext.userProgress.completedTasks.includes(completedTaskId)) {
      this.jarvisContext.userProgress.completedTasks.push(completedTaskId);
      
      // Update phase progress
      const phaseProgress = this.jarvisContext.userProgress.phaseProgress[phaseId];
      if (phaseProgress) {
        this.jarvisContext.userProgress.phaseProgress[phaseId] = {
          ...phaseProgress,
          percentComplete: Math.min(100, phaseProgress.percentComplete + 10),
          conceptsUnderstanding: Math.min(100, phaseProgress.conceptsUnderstanding + 5),
          practicalExercisesCompleted: phaseProgress.practicalExercisesCompleted + 1
        };
      }
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
