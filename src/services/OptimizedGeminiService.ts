import { supabase } from "@/integrations/supabase/client";
import { contentCacheService } from "./ContentCacheService";
import { phaseContextService } from "./PhaseContextService";

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
    // Use smart context instead of generic templates
    const phaseId = parseInt(request.phaseId);
    const optimizedPrompt = phaseContextService.buildSmartPrompt(
      phaseId, 
      request.interactionType, 
      request.userInput
    );

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
    const phaseId = parseInt(request.phaseId);
    const profile = phaseContextService.getPhaseProfile(phaseId);
    const phaseTitle = profile?.titleShort || `Phase ${request.phaseId}`;

    // Phase-appropriate fallbacks
    const fallbacks = {
      submit: `
        <div class="llm-container">
          <div class="llm-highlight">
            <p class="llm-text"><strong>Great work on ${phaseTitle}!</strong></p>
            <p class="llm-text">Let's continue building your understanding step by step.</p>
          </div>
          <div class="llm-task">
            <h3 class="llm-subtitle">Next Steps</h3>
            <button class="llm-button" data-interaction-id="phase-${request.phaseId}-continue">
              Continue Learning
            </button>
          </div>
        </div>
      `,
      introduction: profile?.difficulty === 'beginner' ? `
        <div class="llm-container">
          <h2 class="llm-title">Welcome to ${phaseTitle}</h2>
          <p class="llm-text">Let's start with the fundamentals and build your understanding step by step.</p>
          <div class="llm-highlight">
            <p class="llm-text">In this phase, you'll learn about: ${profile.keyTerms.join(', ')}</p>
          </div>
          <div class="llm-task">
            <button class="llm-button" data-interaction-id="phase-${request.phaseId}-start">
              Begin Learning
            </button>
          </div>
        </div>
      ` : `
        <div class="llm-container">
          <h2 class="llm-title">Welcome to ${phaseTitle}</h2>
          <p class="llm-text">Ready to dive deeper? Let's explore advanced concepts and practical applications.</p>
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