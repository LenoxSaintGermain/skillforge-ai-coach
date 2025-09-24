import { supabase } from "@/integrations/supabase/client";
import { contentCacheService } from "./ContentCacheService";
import { phaseContextService } from "./PhaseContextService";

interface GenerationRequest {
  userId: string;
  phaseId: string;
  interactionType: 'introduction' | 'generate_full_content';
  userInput?: string;
  context: {
    phase: string;
    objective: string;
    keyConcepts: { title: string; description: string }[];
  };
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
      console.log('DEBUG: OptimizedGeminiService.generateContent called with:', {
        userId: request.userId,
        phaseId: request.phaseId,
        interactionType: request.interactionType,
        contextKeyConcepts: request.context.keyConcepts?.length
      });

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
        console.log('DEBUG: Using cached content for', request.interactionType, 'length:', cachedContent.length);
        return {
          content: cachedContent,
          fromCache: true
        };
      }

      console.log('DEBUG: No cached content found, generating new content...');
      // Generate new content with optimized request
      let newContent = await this.generateOptimizedContent(request);
      
      // Validate content appropriateness for the phase
      if (!this.isContentPhaseAppropriate(request, newContent)) {
        console.log('DEBUG: Content not appropriate for phase, using fallback');
        await contentCacheService.logInteraction(userContext, {
          userInput: request.userInput,
          generated: false,
          reason: 'invalid_content_rejected',
          timestamp: new Date().toISOString()
        });
        return {
          content: this.getFallbackContent(request),
          fromCache: false
        };
      }

      console.log('DEBUG: Content validated, caching and returning. Content length:', newContent?.length);
      
      // Cache the valid result
      await contentCacheService.cacheContent(
        userContext,
        newContent,
        { userInput: request.userInput, context: request.context, cacheVersion: '2025-09-23_phasefix_1' }
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
    const phaseId = parseInt(request.phaseId);
    
    console.log('DEBUG: generateOptimizedContent - phaseId:', phaseId);

    const optimizedPrompt = phaseContextService.buildComprehensivePrompt(
      phaseId,
      request.context.objective,
      request.context.keyConcepts
    );

    console.log('DEBUG: Generated prompt length:', optimizedPrompt?.length, 'Preview:', optimizedPrompt?.substring(0, 200));

    // Call edge function with a larger token limit for comprehensive content
    console.log('DEBUG: Calling supabase.functions.invoke with gemini-api...');
    const { data, error } = await Promise.race([
      supabase.functions.invoke('gemini-api', {
        body: {
          prompt: optimizedPrompt,
          type: 'curriculum_generation',
          maxTokens: 4000, // Increased for blog-style content
          temperature: 0.75,
        }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 45000) // Increased timeout
      )
    ]) as { data: any; error: any };

    console.log('DEBUG: Supabase function response:', { 
      hasData: !!data, 
      hasError: !!error, 
      dataKeys: data ? Object.keys(data) : null,
      errorMessage: error?.message 
    });

    if (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }

    const rawContent = data.generatedText || data.text || data.content || '';
    console.log('DEBUG: Raw content from API:', { 
      length: rawContent?.length, 
      preview: rawContent?.substring(0, 100) 
    });
    
    const formattedContent = this.formatResponse(rawContent);
    console.log('DEBUG: Formatted content:', { 
      length: formattedContent?.length, 
      preview: formattedContent?.substring(0, 100) 
    });

    return formattedContent;
  }

  private formatResponse(content: string): string {
    // Ensure proper HTML structure and class usage
    if (!content.includes('llm-container')) {
      content = `<div class="llm-container">${content}</div>`;
    }
    // No longer adding default interaction IDs, as content should be self-contained
    return content;
  }
  
  private isContentPhaseAppropriate(request: GenerationRequest, content: string): boolean {
    const phase = parseInt(request.phaseId, 10);
    const lower = (content || '').toLowerCase();
    if (isNaN(phase)) return true;
    if (phase <= 1) {
      const codeIndicators = [
        '```', '<code', '</code>', '<pre', '</pre>',
        'def ', 'class ', 'import ', 'console.log', 'function ', '=>',
        'python', 'javascript', 'typescript', 'java', 'c++'
      ];
      return !codeIndicators.some(ind => lower.includes(ind));
    }
    return true;
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