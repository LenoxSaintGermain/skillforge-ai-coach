-- ============================================================================
-- SkillForge AI Coach — Consolidated Cloud SQL Migration
-- ============================================================================
-- This schema is derived from the 19 Supabase migrations, adapted for Cloud SQL.
-- Key changes from Supabase:
--   1. Removed all auth.users references (use application-managed user IDs)
--   2. Removed Supabase-specific RLS policies (use app-level auth in Cloud Run)
--   3. Removed auth.uid() function calls
--   4. Preserved all tables, triggers, and functions
-- ============================================================================

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE subject_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE user_role_type AS ENUM ('admin', 'moderator', 'user');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- User profiles (linked by user_id from Identity Platform/Firebase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,  -- Firebase UID (string, not UUID)
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  industry TEXT,
  ai_knowledge_level TEXT DEFAULT 'Beginner',
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User roles for RBAC
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  role user_role_type NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Learning goals
CREATE TABLE learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  description TEXT NOT NULL,
  skill_area TEXT NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Scenarios
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty_level TEXT NOT NULL DEFAULT 'Beginner',
  industry TEXT,
  role TEXT,
  estimated_duration INTEGER,
  learning_objectives TEXT[],
  tags TEXT[],
  scenario_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User scenario progress
CREATE TABLE user_scenario_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'abandoned')),
  progress_data JSONB,
  score INTEGER,
  completion_time INTEGER,
  feedback TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, scenario_id)
);

-- Skill assessments
CREATE TABLE skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  skill_area TEXT NOT NULL,
  assessment_type TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  assessment_data JSONB,
  taken_at TIMESTAMPTZ DEFAULT now()
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT,
  earned_at TIMESTAMPTZ DEFAULT now()
);

-- AI coaching sessions
CREATE TABLE ai_coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE SET NULL,
  coach_type TEXT NOT NULL DEFAULT 'general',
  conversation_data JSONB,
  session_duration INTEGER,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- Syllabus progress
CREATE TABLE syllabus_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  syllabus_name TEXT NOT NULL,
  current_module TEXT,
  completed_modules TEXT[],
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  last_accessed TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, syllabus_name)
);

-- Content cache
CREATE TABLE content_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id TEXT,
  content_type TEXT,
  content_data JSONB,
  subject_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Learning resources
CREATE TABLE learning_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  type TEXT,
  tags TEXT[],
  source TEXT DEFAULT 'manual',
  quality_score INTEGER,
  votes INTEGER DEFAULT 0,
  topic_area TEXT,
  added_by_user_id TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Feedback
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  feedback_type TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  page_context TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prompt experiments
CREATE TABLE prompt_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  response_data JSONB,
  performance_metrics JSONB,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Scenario analytics
CREATE TABLE scenario_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  user_id TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- MULTI-SUBJECT FRAMEWORK TABLES
-- ============================================================================

-- Learning subjects (master configuration)
CREATE TABLE learning_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT,
  overall_goal TEXT NOT NULL,
  primary_color TEXT DEFAULT '#8B5CF6',
  secondary_color TEXT DEFAULT '#EC4899',
  logo_url TEXT,
  hero_description TEXT,
  syllabus_data JSONB NOT NULL,
  system_prompt_template TEXT NOT NULL,
  skill_areas JSONB DEFAULT '[]'::jsonb,
  phase_context_profiles JSONB DEFAULT '{}'::jsonb,
  status subject_status DEFAULT 'active',
  is_default BOOLEAN DEFAULT false,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  total_enrollments INTEGER DEFAULT 0,
  content_cached_count INTEGER DEFAULT 0
);

-- User subject enrollments
CREATE TABLE user_subject_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  subject_id UUID NOT NULL REFERENCES learning_subjects(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  last_accessed TIMESTAMPTZ,
  UNIQUE(user_id, subject_id)
);

-- Add subject_id FK to content_cache
ALTER TABLE content_cache ADD CONSTRAINT fk_content_cache_subject 
  FOREIGN KEY (subject_id) REFERENCES learning_subjects(id);

-- Saved learning paths
CREATE TABLE saved_learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  pathway_data JSONB NOT NULL,
  persona TEXT,
  goal TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_learning_goals_user_id ON learning_goals(user_id);
CREATE INDEX idx_user_scenario_progress_user_id ON user_scenario_progress(user_id);
CREATE INDEX idx_skill_assessments_user_id ON skill_assessments(user_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_ai_coaching_sessions_user_id ON ai_coaching_sessions(user_id);
CREATE INDEX idx_syllabus_progress_user_id ON syllabus_progress(user_id);
CREATE INDEX idx_content_cache_subject_id ON content_cache(subject_id);
CREATE INDEX idx_content_cache_subject_phase ON content_cache(subject_id, phase_id);
CREATE INDEX idx_user_subject_enrollments_user ON user_subject_enrollments(user_id);
CREATE INDEX idx_user_subject_enrollments_primary ON user_subject_enrollments(user_id, is_primary);
CREATE INDEX idx_prompt_experiments_user_id ON prompt_experiments(user_id);
CREATE INDEX idx_scenario_analytics_scenario_id ON scenario_analytics(scenario_id);
CREATE INDEX idx_learning_resources_topic ON learning_resources(topic_area);
CREATE INDEX idx_saved_learning_paths_user_id ON saved_learning_paths(user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_goals_updated_at BEFORE UPDATE ON learning_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scenarios_updated_at BEFORE UPDATE ON scenarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_scenario_progress_updated_at BEFORE UPDATE ON user_scenario_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_syllabus_progress_updated_at BEFORE UPDATE ON syllabus_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_subjects_updated_at BEFORE UPDATE ON learning_subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_cache_updated_at BEFORE UPDATE ON content_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_resources_updated_at BEFORE UPDATE ON learning_resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prompt_experiments_updated_at BEFORE UPDATE ON prompt_experiments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Role check helper function (replaces Supabase has_role())
CREATE OR REPLACE FUNCTION has_role(p_user_id TEXT, p_role user_role_type)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = p_user_id AND role = p_role
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
