import { supabase } from "@/integrations/supabase/client";
import { SubjectConfig, subjectConfigService } from "./SubjectConfigService";
import { broadcastEnrollmentsUpdated } from "./EnrollmentEvents";

export class SubjectAdminService {
  private static instance: SubjectAdminService;

  static getInstance(): SubjectAdminService {
    if (!SubjectAdminService.instance) {
      SubjectAdminService.instance = new SubjectAdminService();
    }
    return SubjectAdminService.instance;
  }

  /**
   * Create a draft subject (no validation, temporary subject_key)
   */
  async createDraft(subjectData: Partial<SubjectConfig>): Promise<SubjectConfig | null> {
    try {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const draftKey = `draft_${timestamp}_${randomId}`;

      const { data, error } = await supabase
        .from('learning_subjects')
        .insert({
          subject_key: draftKey,
          title: subjectData.title || 'Untitled Draft',
          overall_goal: subjectData.overall_goal || 'Draft in progress',
          system_prompt_template: subjectData.system_prompt_template || 'Draft - to be generated',
          tagline: subjectData.tagline,
          hero_description: subjectData.hero_description,
          primary_color: subjectData.primary_color || '#8B5CF6',
          secondary_color: subjectData.secondary_color || '#EC4899',
          logo_url: subjectData.logo_url,
          syllabus_data: subjectData.syllabus_data || { phases: [] },
          skill_areas: subjectData.skill_areas || [],
          phase_context_profiles: subjectData.phase_context_profiles || {},
          status: 'draft' as any,
          is_default: false,
        } as any)
        .select()
        .single();

      if (error) throw error;

      return data as SubjectConfig;
    } catch (error) {
      console.error('Error creating draft:', error);
      throw error;
    }
  }

  /**
   * Update a draft subject (no validation for drafts)
   */
  async updateDraft(draftId: string, updates: Partial<SubjectConfig>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('learning_subjects')
        .update(updates as any)
        .eq('id', draftId)
        .eq('status', 'draft');

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating draft:', error);
      throw error;
    }
  }

  /**
   * Create a new subject
   */
  async createSubject(subjectData: Partial<SubjectConfig>): Promise<SubjectConfig | null> {
    try {
      // Validate subject key uniqueness
      const isValid = await this.validateSubjectKey(subjectData.subject_key || '');
      if (!isValid) {
        throw new Error('Subject key already exists');
      }

      const { data, error } = await supabase
        .from('learning_subjects')
        .insert({
          subject_key: subjectData.subject_key!,
          title: subjectData.title!,
          overall_goal: subjectData.overall_goal!,
          system_prompt_template: subjectData.system_prompt_template!,
          tagline: subjectData.tagline,
          hero_description: subjectData.hero_description,
          primary_color: subjectData.primary_color || '#8B5CF6',
          secondary_color: subjectData.secondary_color || '#EC4899',
          logo_url: subjectData.logo_url,
          syllabus_data: subjectData.syllabus_data,
          skill_areas: subjectData.skill_areas || [],
          phase_context_profiles: subjectData.phase_context_profiles || {},
          status: (subjectData.status as 'active' | 'archived' | 'draft') || 'active',
          is_default: subjectData.is_default || false,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Clear cache
      subjectConfigService.clearCache();

      return data as SubjectConfig;
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  }

  /**
   * Update an existing subject
   */
  async updateSubject(subjectId: string, updates: Partial<SubjectConfig>): Promise<boolean> {
    try {
      // If updating subject_key, validate uniqueness
      if (updates.subject_key) {
        const isValid = await this.validateSubjectKey(updates.subject_key, subjectId);
        if (!isValid) {
          throw new Error('Subject key already exists');
        }
      }

      // If setting as default, unset all others first
      if (updates.is_default === true) {
        await supabase
          .from('learning_subjects')
          .update({ is_default: false })
          .neq('id', subjectId);
      }

      const { error } = await supabase
        .from('learning_subjects')
        .update(updates as any)
        .eq('id', subjectId);

      if (error) throw error;

      // Clear cache
      subjectConfigService.clearCache();

      return true;
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  }

  /**
   * Soft delete a subject (set status to archived)
   */
  async deleteSubject(subjectId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('learning_subjects')
        .update({ status: 'archived' as any })
        .eq('id', subjectId);

      if (error) throw error;

      // Clear cache
      subjectConfigService.clearCache();

      return true;
    } catch (error) {
      console.error('Error deleting subject:', error);
      return false;
    }
  }

  /**
   * Duplicate a subject
   */
  async duplicateSubject(subjectId: string): Promise<SubjectConfig | null> {
    try {
      // Get original subject
      const { data: original, error: fetchError } = await supabase
        .from('learning_subjects')
        .select('*')
        .eq('id', subjectId)
        .single();

      if (fetchError) throw fetchError;

      // Create copy with modified key and title
      const copy = {
        ...original,
        id: undefined,
        subject_key: `${original.subject_key}-copy`,
        title: `${original.title} (Copy)`,
        is_default: false,
        created_at: undefined,
        updated_at: undefined,
      };

      const { data, error } = await supabase
        .from('learning_subjects')
        .insert(copy)
        .select()
        .single();

      if (error) throw error;

      // Clear cache
      subjectConfigService.clearCache();

      return data as SubjectConfig;
    } catch (error) {
      console.error('Error duplicating subject:', error);
      return null;
    }
  }

  /**
   * Set a subject as the default
   */
  async setDefaultSubject(subjectId: string): Promise<boolean> {
    try {
      // Unset all defaults
      await supabase
        .from('learning_subjects')
        .update({ is_default: false })
        .neq('id', subjectId);

      // Set new default
      const { error } = await supabase
        .from('learning_subjects')
        .update({ is_default: true })
        .eq('id', subjectId);

      if (error) throw error;

      // Clear cache
      subjectConfigService.clearCache();

      return true;
    } catch (error) {
      console.error('Error setting default subject:', error);
      return false;
    }
  }

  /**
   * Validate subject key uniqueness
   */
  async validateSubjectKey(subjectKey: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('learning_subjects')
        .select('id')
        .eq('subject_key', subjectKey);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return !data || data.length === 0;
    } catch (error) {
      console.error('Error validating subject key:', error);
      return false;
    }
  }

  /**
   * Get enrollment count for a subject
   */
  async getEnrollmentCount(subjectId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_subject_enrollments')
        .select('id', { count: 'exact', head: true })
        .eq('subject_id', subjectId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Error getting enrollment count:', error);
      return 0;
    }
  }

  /**
   * Get all subjects (including inactive for admin)
   */
  async getAllSubjects(): Promise<SubjectConfig[]> {
    try {
      const { data, error } = await supabase
        .from('learning_subjects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []) as SubjectConfig[];
    } catch (error) {
      console.error('Error getting all subjects:', error);
      return [];
    }
  }

  /**
   * Enroll a specific user in a subject
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
      
      broadcastEnrollmentsUpdated();
      return true;
    } catch (error) {
      console.error('Error enrolling user:', error);
      return false;
    }
  }

  /**
   * Enroll all existing users in a subject
   */
  async enrollAllUsers(subjectId: string, isPrimary: boolean = false): Promise<number> {
    try {
      // Get all user IDs from profiles
      const { data: users, error: fetchError } = await supabase
        .from('profiles')
        .select('user_id');
      
      if (fetchError || !users) return 0;
      
      // Create enrollment records
      const enrollments = users.map(u => ({
        user_id: u.user_id,
        subject_id: subjectId,
        is_primary: isPrimary
      }));
      
      const { error: insertError } = await supabase
        .from('user_subject_enrollments')
        .insert(enrollments);
      
      if (insertError) throw insertError;
      
      broadcastEnrollmentsUpdated();
      return enrollments.length;
    } catch (error) {
      console.error('Error enrolling all users:', error);
      return 0;
    }
  }

  /**
   * Migrate all enrollments from one subject to another
   */
  async migrateEnrollments(fromSubjectId: string, toSubjectId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_subject_enrollments')
        .update({ subject_id: toSubjectId })
        .eq('subject_id', fromSubjectId)
        .select();

      if (error) throw error;

      broadcastEnrollmentsUpdated();
      return data?.length || 0;
    } catch (error) {
      console.error('Error migrating enrollments:', error);
      return 0;
    }
  }
}

export const subjectAdminService = SubjectAdminService.getInstance();
