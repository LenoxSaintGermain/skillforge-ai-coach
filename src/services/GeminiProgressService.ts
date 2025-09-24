import { supabase } from "@/integrations/supabase/client";
import { contentCacheService } from "./ContentCacheService";

export class GeminiProgressService {
  private static instance: GeminiProgressService;

  static getInstance(): GeminiProgressService {
    if (!GeminiProgressService.instance) {
      GeminiProgressService.instance = new GeminiProgressService();
    }
    return GeminiProgressService.instance;
  }

  // Calculate progress based on explored phases
  async calculateProgress(userId: string): Promise<number> {
    try {
      if (!userId) return 0;
      
      const exploredPhases = await contentCacheService.getExploredPhases(userId);
      const totalPhases = 5; // Gemini syllabus has 5 phases
      return Math.round((exploredPhases.length / totalPhases) * 100);
    } catch (error) {
      console.error('Error calculating Gemini progress:', error);
      return 0;
    }
  }

  // Get or create Gemini Training learning goal
  async getOrCreateGeminiGoal(userId: string): Promise<any> {
    try {
      if (!userId) {
        console.warn('No user ID provided for Gemini goal creation');
        return null;
      }

      // Verify user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        console.warn('User not authenticated or user ID mismatch');
        return null;
      }

      // Check if Gemini Training goal exists
      const { data: existingGoal, error: fetchError } = await supabase
        .from('learning_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_area', 'Gemini Training')
        .maybeSingle();

      if (existingGoal && !fetchError) {
        return existingGoal;
      }

      // Create new Gemini Training goal
      const { data: newGoal, error: createError } = await supabase
        .from('learning_goals')
        .insert({
          user_id: userId,
          skill_area: 'Gemini Training',
          description: 'Complete the structured Gemini AI training program',
          progress: 0,
          target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
        })
        .select()
        .single();

      if (createError) {
        if (createError.code === '42501') {
          console.warn('RLS policy violation - user not properly authenticated');
        } else {
          console.error('Error creating Gemini goal:', createError);
        }
        return null;
      }

      return newGoal;
    } catch (error) {
      console.error('Error in getOrCreateGeminiGoal:', error);
      return null;
    }
  }

  // Sync progress with learning goals (only when user is authenticated)
  async syncProgress(userId: string): Promise<void> {
    try {
      if (!userId) {
        console.warn('No user ID provided for progress sync');
        return;
      }

      // Verify user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        console.warn('User not authenticated, skipping progress sync');
        return;
      }

      const progress = await this.calculateProgress(userId);
      const goal = await this.getOrCreateGeminiGoal(userId);

      if (goal) {
        const { error } = await supabase
          .from('learning_goals')
          .update({ 
            progress,
            updated_at: new Date().toISOString()
          })
          .eq('id', goal.id);

        if (error) {
          console.error('Error updating Gemini progress:', error);
        }
      }
    } catch (error) {
      console.error('Error syncing Gemini progress:', error);
    }
  }

  // Get detailed progress info
  async getProgressInfo(userId: string): Promise<{
    progress: number;
    exploredPhases: number[];
    totalPhases: number;
    completedPhases: number;
  }> {
    try {
      const exploredPhases = await contentCacheService.getExploredPhases(userId);
      const totalPhases = 5;
      const progress = Math.round((exploredPhases.length / totalPhases) * 100);

      return {
        progress,
        exploredPhases,
        totalPhases,
        completedPhases: exploredPhases.length
      };
    } catch (error) {
      console.error('Error getting progress info:', error);
      return {
        progress: 0,
        exploredPhases: [],
        totalPhases: 5,
        completedPhases: 0
      };
    }
  }
}

export const geminiProgressService = GeminiProgressService.getInstance();