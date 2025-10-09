export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: string
          badge_icon: string | null
          description: string | null
          earned_at: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          achievement_type: string
          badge_icon?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          title: string
          user_id: string
        }
        Update: {
          achievement_type?: string
          badge_icon?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_coaching_sessions: {
        Row: {
          coach_type: string
          conversation_data: Json | null
          ended_at: string | null
          id: string
          scenario_id: string | null
          session_duration: number | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          coach_type?: string
          conversation_data?: Json | null
          ended_at?: string | null
          id?: string
          scenario_id?: string | null
          session_duration?: number | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          coach_type?: string
          conversation_data?: Json | null
          ended_at?: string | null
          id?: string
          scenario_id?: string | null
          session_duration?: number | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_coaching_sessions_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_feedback: {
        Row: {
          admin_response: string | null
          attachments: string[] | null
          browser_info: Json | null
          created_at: string
          current_page: string | null
          description: string
          feedback_type: string
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          attachments?: string[] | null
          browser_info?: Json | null
          created_at?: string
          current_page?: string | null
          description: string
          feedback_type: string
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          attachments?: string[] | null
          browser_info?: Json | null
          created_at?: string
          current_page?: string | null
          description?: string
          feedback_type?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_cache: {
        Row: {
          content: string
          context_hash: string
          created_at: string
          expires_at: string | null
          generation_metadata: Json | null
          id: string
          interaction_type: string
          phase_id: string
          subject_id: string | null
          success_score: number | null
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          content: string
          context_hash: string
          created_at?: string
          expires_at?: string | null
          generation_metadata?: Json | null
          id?: string
          interaction_type: string
          phase_id: string
          subject_id?: string | null
          success_score?: number | null
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          content?: string
          context_hash?: string
          created_at?: string
          expires_at?: string | null
          generation_metadata?: Json | null
          id?: string
          interaction_type?: string
          phase_id?: string
          subject_id?: string | null
          success_score?: number | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_cache_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "learning_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      content_templates: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean | null
          template_content: string
          template_key: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          template_content: string
          template_key: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          template_content?: string
          template_key?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      learning_goals: {
        Row: {
          created_at: string | null
          description: string
          id: string
          progress: number | null
          skill_area: string
          target_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          progress?: number | null
          skill_area: string
          target_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          progress?: number | null
          skill_area?: string
          target_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_resources: {
        Row: {
          added_by_user_id: string | null
          created_at: string
          description: string
          id: string
          is_verified: boolean | null
          quality_score: number | null
          source: string
          tags: string[] | null
          title: string
          topic_area: string | null
          type: string
          url: string
          votes: number | null
        }
        Insert: {
          added_by_user_id?: string | null
          created_at?: string
          description: string
          id?: string
          is_verified?: boolean | null
          quality_score?: number | null
          source?: string
          tags?: string[] | null
          title: string
          topic_area?: string | null
          type: string
          url: string
          votes?: number | null
        }
        Update: {
          added_by_user_id?: string | null
          created_at?: string
          description?: string
          id?: string
          is_verified?: boolean | null
          quality_score?: number | null
          source?: string
          tags?: string[] | null
          title?: string
          topic_area?: string | null
          type?: string
          url?: string
          votes?: number | null
        }
        Relationships: []
      }
      learning_subjects: {
        Row: {
          content_cached_count: number | null
          created_at: string | null
          created_by: string | null
          hero_description: string | null
          id: string
          is_default: boolean | null
          logo_url: string | null
          overall_goal: string
          phase_context_profiles: Json | null
          primary_color: string | null
          secondary_color: string | null
          skill_areas: Json | null
          status: Database["public"]["Enums"]["subject_status"] | null
          subject_key: string
          syllabus_data: Json
          system_prompt_template: string
          tagline: string | null
          title: string
          total_enrollments: number | null
          updated_at: string | null
        }
        Insert: {
          content_cached_count?: number | null
          created_at?: string | null
          created_by?: string | null
          hero_description?: string | null
          id?: string
          is_default?: boolean | null
          logo_url?: string | null
          overall_goal: string
          phase_context_profiles?: Json | null
          primary_color?: string | null
          secondary_color?: string | null
          skill_areas?: Json | null
          status?: Database["public"]["Enums"]["subject_status"] | null
          subject_key: string
          syllabus_data: Json
          system_prompt_template: string
          tagline?: string | null
          title: string
          total_enrollments?: number | null
          updated_at?: string | null
        }
        Update: {
          content_cached_count?: number | null
          created_at?: string | null
          created_by?: string | null
          hero_description?: string | null
          id?: string
          is_default?: boolean | null
          logo_url?: string | null
          overall_goal?: string
          phase_context_profiles?: Json | null
          primary_color?: string | null
          secondary_color?: string | null
          skill_areas?: Json | null
          status?: Database["public"]["Enums"]["subject_status"] | null
          subject_key?: string
          syllabus_data?: Json
          system_prompt_template?: string
          tagline?: string | null
          title?: string
          total_enrollments?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ai_knowledge_level: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          id: string
          industry: string | null
          name: string
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_knowledge_level?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name: string
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_knowledge_level?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name?: string
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      prompt_experiments: {
        Row: {
          context_data: Json | null
          created_at: string
          id: string
          is_favorite: boolean | null
          model_used: string
          performance_metrics: Json | null
          prompt_text: string
          response_data: Json | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context_data?: Json | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          model_used?: string
          performance_metrics?: Json | null
          prompt_text: string
          response_data?: Json | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context_data?: Json | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          model_used?: string
          performance_metrics?: Json | null
          prompt_text?: string
          response_data?: Json | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prompt_learning_progress: {
        Row: {
          best_practices_learned: string[] | null
          created_at: string
          current_challenge_id: string | null
          current_level: string
          exercises_completed: number
          experience_points: number
          id: string
          last_practice_session: string | null
          skill_area: string
          updated_at: string
          user_id: string
        }
        Insert: {
          best_practices_learned?: string[] | null
          created_at?: string
          current_challenge_id?: string | null
          current_level?: string
          exercises_completed?: number
          experience_points?: number
          id?: string
          last_practice_session?: string | null
          skill_area: string
          updated_at?: string
          user_id: string
        }
        Update: {
          best_practices_learned?: string[] | null
          created_at?: string
          current_challenge_id?: string | null
          current_level?: string
          exercises_completed?: number
          experience_points?: number
          id?: string
          last_practice_session?: string | null
          skill_area?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prompt_skill_assessments: {
        Row: {
          answers_data: Json
          assessment_type: string
          completed_at: string
          id: string
          improvement_areas: string[] | null
          max_score: number
          questions_data: Json
          recommendations: Json | null
          score: number
          skill_level: string
          strengths: string[] | null
          user_id: string
        }
        Insert: {
          answers_data?: Json
          assessment_type?: string
          completed_at?: string
          id?: string
          improvement_areas?: string[] | null
          max_score?: number
          questions_data?: Json
          recommendations?: Json | null
          score?: number
          skill_level?: string
          strengths?: string[] | null
          user_id: string
        }
        Update: {
          answers_data?: Json
          assessment_type?: string
          completed_at?: string
          id?: string
          improvement_areas?: string[] | null
          max_score?: number
          questions_data?: Json
          recommendations?: Json | null
          score?: number
          skill_level?: string
          strengths?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty_level: string
          id: string
          is_public: boolean | null
          rating: number | null
          tags: string[] | null
          template_text: string
          title: string
          updated_at: string
          usage_count: number | null
          use_cases: string[] | null
          user_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string
          id?: string
          is_public?: boolean | null
          rating?: number | null
          tags?: string[] | null
          template_text: string
          title: string
          updated_at?: string
          usage_count?: number | null
          use_cases?: string[] | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string
          id?: string
          is_public?: boolean | null
          rating?: number | null
          tags?: string[] | null
          template_text?: string
          title?: string
          updated_at?: string
          usage_count?: number | null
          use_cases?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      scenarios: {
        Row: {
          created_at: string | null
          description: string
          difficulty_level: string
          estimated_duration: number | null
          id: string
          industry: string | null
          learning_objectives: string[] | null
          role: string | null
          scenario_data: Json | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          difficulty_level?: string
          estimated_duration?: number | null
          id?: string
          industry?: string | null
          learning_objectives?: string[] | null
          role?: string | null
          scenario_data?: Json | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          difficulty_level?: string
          estimated_duration?: number | null
          id?: string
          industry?: string | null
          learning_objectives?: string[] | null
          role?: string | null
          scenario_data?: Json | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      skill_assessments: {
        Row: {
          assessment_data: Json | null
          assessment_type: string
          id: string
          score: number
          skill_area: string
          taken_at: string | null
          user_id: string
        }
        Insert: {
          assessment_data?: Json | null
          assessment_type: string
          id?: string
          score: number
          skill_area: string
          taken_at?: string | null
          user_id: string
        }
        Update: {
          assessment_data?: Json | null
          assessment_type?: string
          id?: string
          score?: number
          skill_area?: string
          taken_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      syllabus_progress: {
        Row: {
          completed_modules: string[] | null
          created_at: string | null
          current_module: string | null
          id: string
          last_accessed: string | null
          progress_percentage: number | null
          syllabus_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_modules?: string[] | null
          created_at?: string | null
          current_module?: string | null
          id?: string
          last_accessed?: string | null
          progress_percentage?: number | null
          syllabus_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_modules?: string[] | null
          created_at?: string | null
          current_module?: string | null
          id?: string
          last_accessed?: string | null
          progress_percentage?: number | null
          syllabus_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_data: Json | null
          interaction_type: string
          phase_id: string
          session_id: string | null
          success_rating: number | null
          time_spent: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_data?: Json | null
          interaction_type: string
          phase_id: string
          session_id?: string | null
          success_rating?: number | null
          time_spent?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_data?: Json | null
          interaction_type?: string
          phase_id?: string
          session_id?: string | null
          success_rating?: number | null
          time_spent?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_scenario_progress: {
        Row: {
          completed_at: string | null
          completion_time: number | null
          created_at: string | null
          feedback: string | null
          id: string
          progress_data: Json | null
          scenario_id: string
          score: number | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completion_time?: number | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          progress_data?: Json | null
          scenario_id: string
          score?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completion_time?: number | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          progress_data?: Json | null
          scenario_id?: string
          score?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_scenario_progress_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subject_enrollments: {
        Row: {
          enrolled_at: string | null
          id: string
          is_primary: boolean | null
          last_accessed: string | null
          subject_id: string
          user_id: string
        }
        Insert: {
          enrolled_at?: string | null
          id?: string
          is_primary?: boolean | null
          last_accessed?: string | null
          subject_id: string
          user_id: string
        }
        Update: {
          enrolled_at?: string | null
          id?: string
          is_primary?: boolean | null
          last_accessed?: string | null
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subject_enrollments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "learning_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      subject_status: "draft" | "active" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      subject_status: ["draft", "active", "archived"],
    },
  },
} as const
