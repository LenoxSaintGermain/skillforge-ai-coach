import { supabase } from "@/integrations/supabase/client";
import { contentCacheService } from "./ContentCacheService";

interface GenerationRequest {
  userId: string;
  phaseId: string;
  interactionType: string;
  userInput?: string;
  context?: any;
}

interface GenerationResponse {
  content: string;
  fromCache: boolean;
  cacheId?: string;
}

export class OptimizedGeminiService {
  private static instance: OptimizedGeminiService;

  static getInstance(): OptimizedGeminiService {
    if (!OptimizedGeminiService.instance) {
      OptimizedGeminiService.instance = new OptimizedGeminiService();
    }
    return OptimizedGeminiService.instance;
  }

  async generateContent(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const userContext = {
        userId: request.userId,
        phaseId: request.phaseId,
        interactionType: request.interactionType
      };

      // Check cache first
      const cachedContent = await contentCacheService.getCachedContent(
        userContext, 
        { userInput: request.userInput, context: request.context }
      );

      if (cachedContent) {
        console.log('Using cached content for', request.interactionType);
        return {
          content: cachedContent,
          fromCache: true
        };
      }

      // Generate new content with optimized request
      const newContent = await this.generateOptimizedContent(request);
      
      // Cache the result
      await contentCacheService.cacheContent(
        userContext,
        newContent,
        { userInput: request.userInput, context: request.context }
      );

      // Log the interaction
      await contentCacheService.logInteraction(userContext, {
        userInput: request.userInput,
        generated: true,
        timestamp: new Date().toISOString()
      });

      return {
        content: newContent,
        fromCache: false
      };

    } catch (error) {
      console.error('Error in generateContent:', error);
      
      // Return fallback content based on interaction type
      return {
        content: this.getFallbackContent(request),
        fromCache: false
      };
    }
  }

  private async generateOptimizedContent(request: GenerationRequest): Promise<string> {
    // Build minimal context instead of huge system prompt
    const minimalContext = await contentCacheService.buildMinimalContext({
      userId: request.userId,
      phaseId: request.phaseId,
      interactionType: request.interactionType
    });

    // Get appropriate template
    let templateKey = 'concept_explanation';
    switch (request.interactionType) {
      case 'submit':
        templateKey = 'submission_response';
        break;
      case 'quiz':
        templateKey = 'quiz_feedback';
        break;
      case 'introduction':
        templateKey = 'phase_introduction';
        break;
    }

    const template = await contentCacheService.getContentTemplate(templateKey);
    
    // Build optimized prompt - much smaller than before
    const optimizedPrompt = this.buildOptimizedPrompt({
      template: template?.template_content || "Generate helpful content for {{interaction_type}}",
      userInput: request.userInput || '',
      phaseId: request.phaseId,
      interactionType: request.interactionType,
      minimalContext
    });

    // Call edge function with smaller payload and timeout
    const { data, error } = await Promise.race([
      supabase.functions.invoke('gemini-api', {
        body: {
          prompt: optimizedPrompt,
          type: 'curriculum_generation',
          maxTokens: 800,
          temperature: 0.7
        }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      )
    ]) as { data: any; error: any };

    if (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }

    return this.formatResponse(data.generatedText || data.text || data.content || '');
  }

  private buildOptimizedPrompt(params: {
    template: string;
    userInput: string;
    phaseId: string;
    interactionType: string;
    minimalContext: any;
  }): string {
    // Replace template variables
    let prompt = params.template
      .replace('{{user_input}}', params.userInput)
      .replace('{{user_answer}}', params.userInput)
      .replace('{{interaction_type}}', params.interactionType)
      .replace('{{phase_title}}', `Phase ${params.phaseId}`)
      .replace('{{topic}}', `Phase ${params.phaseId} concepts`)
      .replace('{{concept}}', `Phase ${params.phaseId} key concepts`)
      .replace('{{key_concepts}}', 'hands-on AI development');

    // Add minimal context - much smaller than before
    prompt += `\n\nContext: User progress ${params.minimalContext.currentProgress}%. `;
    
    if (params.minimalContext.recentSuccesses?.length > 0) {
      prompt += `Recent successful interactions: ${params.minimalContext.recentSuccesses.length}. `;
    }

    prompt += `\n\nGenerate interactive HTML using only these classes: llm-container, llm-title, llm-text, llm-button, llm-code, llm-highlight, llm-task, llm-subtitle. Include data-interaction-id attributes on clickable elements.`;

    return prompt;
  }

  private formatResponse(content: string): string {
    // Ensure proper HTML structure and class usage
    if (!content.includes('llm-container')) {
      content = `<div class="llm-container">${content}</div>`;
    }

    // Add interactive elements if missing
    if (!content.includes('data-interaction-id') && content.includes('button')) {
      content = content.replace(
        /<button([^>]*)>/g, 
        '<button$1 data-interaction-id="continue-learning">'
      );
    }

    return content;
  }

  private getFallbackContent(request: GenerationRequest): string {
    const fallbacks = {
      submit: `
        <div class="llm-container">
          <div class="llm-highlight">
            <p class="llm-text"><strong>Thank you for your submission!</strong></p>
            <p class="llm-text">Your input has been noted. Let's continue exploring this topic.</p>
          </div>
          <div class="llm-task">
            <h3 class="llm-subtitle">Next Steps</h3>
            <button class="llm-button" data-interaction-id="phase-${request.phaseId}-continue">
              Continue Learning
            </button>
          </div>
        </div>
      `,
      introduction: `
        <div class="llm-container">
          <h2 class="llm-title">Welcome to Phase ${request.phaseId}</h2>
          <p class="llm-text">Let's explore the key concepts in this phase through hands-on practice.</p>
          <div class="llm-task">
            <button class="llm-button" data-interaction-id="phase-${request.phaseId}-start">
              Begin Exploration
            </button>
          </div>
        </div>
      `
    };

    return fallbacks[request.interactionType as keyof typeof fallbacks] || fallbacks.introduction;
  }
}

export const optimizedGeminiService = OptimizedGeminiService.getInstance();