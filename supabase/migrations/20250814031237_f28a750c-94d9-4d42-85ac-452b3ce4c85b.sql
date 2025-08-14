-- Create prompt engineering infrastructure tables

-- Table for user prompt experiments and history
CREATE TABLE public.prompt_experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Experiment',
  prompt_text TEXT NOT NULL,
  context_data JSONB DEFAULT '{}',
  model_used TEXT NOT NULL DEFAULT 'gemini',
  response_data JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for prompt engineering skill assessments
CREATE TABLE public.prompt_skill_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assessment_type TEXT NOT NULL DEFAULT 'general',
  questions_data JSONB NOT NULL DEFAULT '[]',
  answers_data JSONB NOT NULL DEFAULT '[]',
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 100,
  skill_level TEXT NOT NULL DEFAULT 'beginner',
  strengths TEXT[] DEFAULT '{}',
  improvement_areas TEXT[] DEFAULT '{}',
  recommendations JSONB DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for prompt engineering learning progress
CREATE TABLE public.prompt_learning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_area TEXT NOT NULL,
  current_level TEXT NOT NULL DEFAULT 'beginner',
  experience_points INTEGER NOT NULL DEFAULT 0,
  exercises_completed INTEGER NOT NULL DEFAULT 0,
  best_practices_learned TEXT[] DEFAULT '{}',
  current_challenge_id TEXT,
  last_practice_session TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_area)
);

-- Table for prompt templates and patterns
CREATE TABLE public.prompt_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  template_text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  difficulty_level TEXT NOT NULL DEFAULT 'beginner',
  use_cases TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.prompt_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prompt_experiments
CREATE POLICY "Users can manage their own prompt experiments" 
ON public.prompt_experiments 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for prompt_skill_assessments
CREATE POLICY "Users can manage their own skill assessments" 
ON public.prompt_skill_assessments 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for prompt_learning_progress
CREATE POLICY "Users can manage their own learning progress" 
ON public.prompt_learning_progress 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for prompt_templates
CREATE POLICY "Users can view public templates" 
ON public.prompt_templates 
FOR SELECT 
USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own templates" 
ON public.prompt_templates 
FOR ALL 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_prompt_experiments_updated_at
BEFORE UPDATE ON public.prompt_experiments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prompt_learning_progress_updated_at
BEFORE UPDATE ON public.prompt_learning_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prompt_templates_updated_at
BEFORE UPDATE ON public.prompt_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();