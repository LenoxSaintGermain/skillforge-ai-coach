import { supabase } from '@/integrations/supabase/client';

export interface SyllabusProgressUpdate {
  syllabus_name: string;
  current_module?: string;
  progress_percentage: number;
  completed_modules?: string[];
  last_accessed: Date;
}

export interface SyllabusProgressData {
  id: string;
  user_id: string;
  syllabus_name: string;
  current_module: string | null;
  progress_percentage: number;
  completed_modules: string[] | null;
  last_accessed: string;
  created_at: string;
  updated_at: string;
}

class SyllabusProgressService {
  /**
   * Save or update syllabus progress in the database
   */
  async saveProgress(userId: string, progressData: SyllabusProgressUpdate): Promise<SyllabusProgressData | null> {
    try {
      const { data, error } = await supabase
        .from('syllabus_progress')
        .upsert({
          user_id: userId,
          syllabus_name: progressData.syllabus_name,
          current_module: progressData.current_module,
          progress_percentage: progressData.progress_percentage,
          completed_modules: progressData.completed_modules || [],
          last_accessed: progressData.last_accessed.toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving syllabus progress:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error saving progress:', error);
      return null;
    }
  }

  /**
   * Get syllabus progress for a user
   */
  async getProgress(userId: string, syllabusName: string): Promise<SyllabusProgressData | null> {
    try {
      const { data, error } = await supabase
        .from('syllabus_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('syllabus_name', syllabusName)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching syllabus progress:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error fetching progress:', error);
      return null;
    }
  }

  /**
   * Get all syllabus progress for a user
   */
  async getAllProgress(userId: string): Promise<SyllabusProgressData[]> {
    try {
      const { data, error } = await supabase
        .from('syllabus_progress')
        .select('*')
        .eq('user_id', userId)
        .order('last_accessed', { ascending: false });

      if (error) {
        console.error('Error fetching all syllabus progress:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching all progress:', error);
      return [];
    }
  }

  /**
   * Calculate overall progress based on explored concepts and completed phases
   */
  calculateProgress(exploredConcepts: Set<string>, completedPhases: Set<number>, totalPhases: number): number {
    const conceptWeight = 0.7; // 70% weight for exploring concepts
    const phaseWeight = 0.3;   // 30% weight for completing phases
    
    // Estimate progress based on explored concepts (assuming 20 concepts per phase)
    const conceptProgress = Math.min((exploredConcepts.size / (totalPhases * 5)) * 100, 100);
    
    // Calculate phase completion progress
    const phaseProgress = (completedPhases.size / totalPhases) * 100;
    
    return Math.round((conceptProgress * conceptWeight) + (phaseProgress * phaseWeight));
  }

  /**
   * Save progress to both localStorage and database for offline capability
   */
  async saveProgressDual(userId: string, progressData: SyllabusProgressUpdate): Promise<void> {
    // Save to localStorage for immediate access
    const localKey = `syllabus_progress_${userId}_${progressData.syllabus_name}`;
    localStorage.setItem(localKey, JSON.stringify(progressData));

    // Save to database
    await this.saveProgress(userId, progressData);
  }

  /**
   * Load progress from localStorage if database is unavailable
   */
  loadLocalProgress(userId: string, syllabusName: string): SyllabusProgressUpdate | null {
    try {
      const localKey = `syllabus_progress_${userId}_${syllabusName}`;
      const stored = localStorage.getItem(localKey);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          last_accessed: new Date(parsed.last_accessed)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error loading local progress:', error);
      return null;
    }
  }
}

export const syllabusProgressService = new SyllabusProgressService();
export default syllabusProgressService;