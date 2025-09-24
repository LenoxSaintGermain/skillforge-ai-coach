import { supabase } from "@/integrations/supabase/client";
import { contentCacheService } from "./ContentCacheService";
import { phaseContextService } from "./PhaseContextService";
import { videoService } from "./VideoService";

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
      
      // Cache the valid result (mark as completed for extended caching)
      await contentCacheService.cacheContent(
        userContext,
        newContent,
        { userInput: request.userInput, context: request.context, cacheVersion: '2025-09-23_phasefix_1' },
        true // Mark as completed for 30-day caching
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
    
    // Format the response and add video recommendations
    let formattedContent = this.formatResponse(rawContent);
    formattedContent = await this.addVideoRecommendations(request, formattedContent);
    console.log('DEBUG: Final content with videos:', { 
      length: formattedContent?.length, 
      preview: formattedContent?.substring(0, 100) 
    });

    return formattedContent;
  }

  private formatResponse(content: string): string {
    if (!content) return '<div class="llm-container"><p class="llm-text">No content available.</p></div>';
    
    // Handle full HTML documents - extract body content
    if (content.includes('<!DOCTYPE') || content.includes('<html>')) {
      const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        content = bodyMatch[1].trim();
      }
    }
    
    // Remove any remaining html, head tags
    content = content.replace(/<\/?html[^>]*>/gi, '')
                    .replace(/<\/?head[^>]*>/gi, '')
                    .replace(/<\/?body[^>]*>/gi, '')
                    .replace(/<!DOCTYPE[^>]*>/gi, '')
                    .trim();
    
    // Ensure proper container structure
    if (!content.includes('llm-container')) {
      content = `<div class="llm-container">${content}</div>`;
    }
    
    return content;
  }
  
  private isContentPhaseAppropriate(request: GenerationRequest, content: string): boolean {
    const phase = parseInt(request.phaseId, 10);
    if (isNaN(phase) || !content) return false;
    
    // Basic content validation - check if content has meaningful structure
    const hasContent = content.length > 50;
    const hasLLMClasses = content.includes('llm-') || content.includes('class=');
    const isNotEmpty = content.trim() !== '' && !content.includes('No content available');
    
    console.log('DEBUG: Content validation:', {
      hasContent,
      hasLLMClasses, 
      isNotEmpty,
      contentLength: content.length,
      contentPreview: content.substring(0, 100)
    });
    
    return hasContent && isNotEmpty;
  }

  private async addVideoRecommendations(request: GenerationRequest, content: string): Promise<string> {
    try {
      const phaseId = parseInt(request.phaseId, 10);
      const profile = phaseContextService.getPhaseProfile(phaseId);
      
      if (!profile) return content;
      
      // Get relevant videos based on phase and key terms
      const videos = await videoService.getVideosForPhaseWithKeywords(phaseId, profile.keyTerms);
      
      if (videos.length === 0) return content;
      
      // Generate video HTML section
      const videoSection = `
        <div class="llm-container mt-8">
          <h2 class="llm-subtitle">📹 Further Exploration</h2>
          <p class="llm-text">Deepen your understanding with these curated video resources:</p>
          <div class="grid gap-4 mt-4">
            ${videos.map(video => `
              <div class="llm-video-card border rounded-lg p-4">
                <div class="relative group cursor-pointer" onclick="window.open('${video.url}', '_blank')">
                  <img 
                    src="https://img.youtube.com/vi/${video.id}/maxresdefault.jpg" 
                    alt="${video.title}"
                    class="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg group-hover:bg-opacity-30 transition-all">
                    <div class="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                      <div class="w-0 h-0 border-l-[8px] border-l-black border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>
                <h3 class="llm-text font-semibold text-sm mb-2">${video.title}</h3>
                <p class="llm-text text-xs opacity-75 mb-2">${video.bestFor}</p>
                ${video.duration ? `<p class="llm-text text-xs opacity-60">Duration: ${video.duration}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
      
      // Replace placeholder or append to end
      if (content.includes('[VIDEO_RECOMMENDATIONS_PLACEHOLDER]')) {
        return content.replace('[VIDEO_RECOMMENDATIONS_PLACEHOLDER]', videoSection);
      } else {
        // Append before closing container div
        return content.replace(/<\/div>\s*$/, videoSection + '</div>');
      }
      
    } catch (error) {
      console.error('Error adding video recommendations:', error);
      return content; // Return original content if video addition fails
    }
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