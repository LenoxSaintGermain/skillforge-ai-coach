import { supabase } from "@/integrations/supabase/client";

interface CachedContent {
  id: string;
  content: string;
  success_score: number;
  usage_count: number;
  expires_at: string;
}

interface UserContext {
  userId: string;
  phaseId: string;
  interactionType: string;
  userLevel?: string;
  recentInteractions?: string[];
}

interface ContentTemplate {
  template_key: string;
  template_content: string;
  variables: any; // JSON field from Supabase
}

export class ContentCacheService {
  private static instance: ContentCacheService;

  static getInstance(): ContentCacheService {
    if (!ContentCacheService.instance) {
      ContentCacheService.instance = new ContentCacheService();
    }
    return ContentCacheService.instance;
  }

  // Generate a hash for user context to use as cache key
  private generateContextHash(context: UserContext, additionalData?: any): string {
    const contextString = JSON.stringify({
      phaseId: context.phaseId,
      interactionType: context.interactionType,
      userLevel: context.userLevel,
      recentInteractions: context.recentInteractions?.slice(-3), // Only last 3 interactions
      additional: additionalData
    });
    
    // Simple hash function for browser compatibility
    let hash = 0;
    for (let i = 0; i < contextString.length; i++) {
      const char = contextString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Check cache for existing content
  async getCachedContent(context: UserContext, additionalData?: any): Promise<string | null> {
    try {
      const contextHash = this.generateContextHash(context, additionalData);
      
      const { data, error } = await supabase
        .from('content_cache')
        .select('content, id')
        .eq('user_id', context.userId)
        .eq('context_hash', contextHash)
        .eq('phase_id', context.phaseId)
        .eq('interaction_type', context.interactionType)
        .gt('expires_at', new Date().toISOString())
        .order('usage_count', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching cached content:', error);
        return null;
      }

      if (data) {
        // Update usage count
        await this.incrementUsageCount(data.id);
        return data.content;
      }

      return null;
    } catch (error) {
      console.error('Error in getCachedContent:', error);
      return null;
    }
  }

  // Cache new content
  async cacheContent(context: UserContext, content: string, additionalData?: any): Promise<void> {
    try {
      const contextHash = this.generateContextHash(context, additionalData);
      
      // First try to insert new content
      const { error: insertError } = await supabase
        .from('content_cache')
        .insert({
          user_id: context.userId,
          context_hash: contextHash,
          phase_id: context.phaseId,
          interaction_type: context.interactionType,
          content,
          generation_metadata: { additionalData, generatedAt: new Date().toISOString() },
          usage_count: 1
        });

      // If insert fails due to duplicate, try update instead
      if (insertError && insertError.code === '23505') {
        const { error: updateError } = await supabase
          .from('content_cache')
          .update({
            content,
            generation_metadata: { additionalData, generatedAt: new Date().toISOString() },
            usage_count: 1
          })
          .eq('user_id', context.userId)
          .eq('context_hash', contextHash)
          .eq('phase_id', context.phaseId)
          .eq('interaction_type', context.interactionType);

        if (updateError) {
          console.error('Error updating cached content:', updateError);
        }
      } else if (insertError) {
        console.error('Error inserting cached content:', insertError);
      }
    } catch (error) {
      console.error('Error in cacheContent:', error);
    }
  }

  // Log user interaction for analytics
  async logInteraction(context: UserContext, interactionData: any, timeSpent?: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_interactions')
        .insert({
          user_id: context.userId,
          phase_id: context.phaseId,
          interaction_type: context.interactionType,
          interaction_data: interactionData,
          time_spent: timeSpent
        });

      if (error) {
        console.error('Error logging interaction:', error);
      }
    } catch (error) {
      console.error('Error in logInteraction:', error);
    }
  }

  // Get content template
  async getContentTemplate(templateKey: string): Promise<ContentTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('content_templates')
        .select('template_key, template_content, variables')
        .eq('template_key', templateKey)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching content template:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getContentTemplate:', error);
      return null;
    }
  }

  // Build minimal context for API calls
  async buildMinimalContext(context: UserContext): Promise<any> {
    try {
      // Get user's current progress
      const { data: progressData } = await supabase
        .from('syllabus_progress')
        .select('current_module, completed_modules, progress_percentage')
        .eq('user_id', context.userId)
        .eq('syllabus_name', 'gemini-training')
        .maybeSingle();

      // Get recent successful interactions (last 3)
      const { data: recentInteractions } = await supabase
        .from('user_interactions')
        .select('interaction_type, interaction_data, created_at')
        .eq('user_id', context.userId)
        .eq('phase_id', context.phaseId)
        .gte('success_rating', 3)
        .order('created_at', { ascending: false })
        .limit(3);

      return {
        currentProgress: progressData?.progress_percentage || 0,
        currentModule: progressData?.current_module,
        completedModules: progressData?.completed_modules || [],
        recentSuccesses: recentInteractions?.map(i => ({
          type: i.interaction_type,
          data: i.interaction_data
        })) || []
      };
    } catch (error) {
      console.error('Error building minimal context:', error);
      return {
        currentProgress: 0,
        recentSuccesses: []
      };
    }
  }

  // Clean expired cache entries
  async cleanExpiredCache(): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_cache')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        console.error('Error cleaning expired cache:', error);
      }
    } catch (error) {
      console.error('Error in cleanExpiredCache:', error);
    }
  }

  // Rate content for future optimization
  async rateContent(cacheId: string, rating: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_cache')
        .update({ success_score: rating })
        .eq('id', cacheId);

      if (error) {
        console.error('Error rating content:', error);
      }
    } catch (error) {
      console.error('Error in rateContent:', error);
    }
  }

  private async incrementUsageCount(cacheId: string): Promise<void> {
    try {
      // Get current count and increment
      const { data: currentData, error: fetchError } = await supabase
        .from('content_cache')
        .select('usage_count')
        .eq('id', cacheId)
        .single();

      if (fetchError || !currentData) {
        console.error('Error fetching current usage count:', fetchError);
        return;
      }

      const { error } = await supabase
        .from('content_cache')
        .update({ usage_count: (currentData.usage_count || 0) + 1 })
        .eq('id', cacheId);

      if (error) {
        console.error('Error incrementing usage count:', error);
      }
    } catch (error) {
      console.error('Error in incrementUsageCount:', error);
    }
  }
}

export const contentCacheService = ContentCacheService.getInstance();