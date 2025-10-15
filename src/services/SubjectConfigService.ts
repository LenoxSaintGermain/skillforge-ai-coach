import { supabase } from "@/integrations/supabase/client";
import { Syllabus, SyllabusPhase } from "@/models/Syllabus";

export interface SubjectConfig {
  id: string;
  subject_key: string;
  title: string;
  overall_goal: string;
  tagline: string | null;
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  hero_description: string | null;
  syllabus_data: any;
  system_prompt_template: string;
  skill_areas: any;
  phase_context_profiles: any;
  status: string;
  is_default: boolean;
}

export interface UserSubjectEnrollment {
  id: string;
  user_id: string;
  subject_id: string;
  is_primary: boolean;
  enrolled_at: string;
  last_accessed: string | null;
}

export class SubjectConfigService {
  private static instance: SubjectConfigService;
  private subjectCache: Map<string, SubjectConfig> = new Map();
  private enrollmentCache: Map<string, SubjectConfig | null> = new Map();

  static getInstance(): SubjectConfigService {
    if (!SubjectConfigService.instance) {
      SubjectConfigService.instance = new SubjectConfigService();
    }
    return SubjectConfigService.instance;
  }

  /**
   * Get active subject for a user (their primary enrollment)
   */
  async getActiveSubject(userId: string): Promise<SubjectConfig | null> {
    // Check cache
    if (this.enrollmentCache.has(userId)) {
      return this.enrollmentCache.get(userId) || null;
    }

    try {
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('user_subject_enrollments')
        .select('subject_id')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .maybeSingle();

      if (enrollmentError) throw enrollmentError;
      if (!enrollment) {
        this.enrollmentCache.set(userId, null);
        return null;
      }

      const subject = await this.getSubjectById(enrollment.subject_id);
      this.enrollmentCache.set(userId, subject);
      return subject;
    } catch (error) {
      console.error('Error loading active subject:', error);
      return null;
    }
  }

  /**
   * Get subject by ID
   */
  async getSubjectById(subjectId: string): Promise<SubjectConfig | null> {
    if (this.subjectCache.has(subjectId)) {
      return this.subjectCache.get(subjectId) || null;
    }

    try {
      const { data, error } = await supabase
        .from('learning_subjects')
        .select('*')
        .eq('id', subjectId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const config = data as SubjectConfig;
      this.subjectCache.set(subjectId, config);
      return config;
    } catch (error) {
      console.error('Error loading subject by ID:', error);
      return null;
    }
  }

  /**
   * Get subject by key
   */
  async getSubjectByKey(subjectKey: string): Promise<SubjectConfig | null> {
    try {
      const { data, error } = await supabase
        .from('learning_subjects')
        .select('*')
        .eq('subject_key', subjectKey)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const config = data as SubjectConfig;
      this.subjectCache.set(config.id, config);
      return config;
    } catch (error) {
      console.error('Error loading subject by key:', error);
      return null;
    }
  }

  /**
   * Get default subject
   */
  async getDefaultSubject(): Promise<SubjectConfig | null> {
    try {
      const { data, error } = await supabase
        .from('learning_subjects')
        .select('*')
        .eq('is_default', true)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const config = data as SubjectConfig;
      this.subjectCache.set(config.id, config);
      return config;
    } catch (error) {
      console.error('Error loading default subject:', error);
      return null;
    }
  }

  /**
   * Parse syllabus from subject config
   */
  getSyllabus(subject: SubjectConfig): Syllabus {
    return subject.syllabus_data as Syllabus;
  }

  /**
   * Get system prompt from subject config
   */
  getSystemPrompt(subject: SubjectConfig): string {
    return subject.system_prompt_template;
  }

  /**
   * Get skill areas from subject config
   */
  getSkillAreas(subject: SubjectConfig): any[] {
    return subject.skill_areas || [];
  }

  /**
   * Get phase profile from subject config
   */
  getPhaseProfile(subject: SubjectConfig, phaseId: number): any {
    const profiles = subject.phase_context_profiles || {};
    return profiles[phaseId] || null;
  }

  /**
   * Enroll user in a subject
   */
  async enrollUser(userId: string, subjectId: string, isPrimary: boolean = false): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_subject_enrollments')
        .insert({
          user_id: userId,
          subject_id: subjectId,
          is_primary: isPrimary
        });

      if (error) throw error;

      // Clear cache
      this.enrollmentCache.delete(userId);
      return true;
    } catch (error) {
      console.error('Error enrolling user:', error);
      return false;
    }
  }

  /**
   * Get all subjects user is enrolled in
   */
  async getUserEnrollments(userId: string): Promise<SubjectConfig[]> {
    try {
      const { data, error } = await supabase
        .from('user_subject_enrollments')
        .select(`
          subject_id,
          is_primary,
          enrolled_at,
          learning_subjects (*)
        `)
        .eq('user_id', userId)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Extract subject configs and filter out inactive subjects
      const subjects = data
        .map((enrollment: any) => enrollment.learning_subjects)
        .filter((subject: any) => subject && subject.status === 'active')
        .map((subject: any) => {
          const config = subject as SubjectConfig;
          this.subjectCache.set(config.id, config);
          return config;
        });

      return subjects;
    } catch (error) {
      console.error('Error loading user enrollments:', error);
      return [];
    }
  }

  /**
   * Set primary subject for user
   */
  async setPrimarySubject(userId: string, subjectId: string): Promise<boolean> {
    try {
      // First, unset all primary flags for this user
      await supabase
        .from('user_subject_enrollments')
        .update({ is_primary: false })
        .eq('user_id', userId);

      // Then set the new primary
      const { error } = await supabase
        .from('user_subject_enrollments')
        .update({ is_primary: true })
        .eq('user_id', userId)
        .eq('subject_id', subjectId);

      if (error) throw error;

      // Clear cache
      this.enrollmentCache.delete(userId);
      return true;
    } catch (error) {
      console.error('Error setting primary subject:', error);
      return false;
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.subjectCache.clear();
    this.enrollmentCache.clear();
  }
}

export const subjectConfigService = SubjectConfigService.getInstance();
