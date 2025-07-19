export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
