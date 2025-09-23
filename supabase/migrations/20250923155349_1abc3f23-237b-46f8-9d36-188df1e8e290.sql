-- Create content cache table for storing generated content
CREATE TABLE public.content_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  context_hash TEXT NOT NULL,
  phase_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL,
  content TEXT NOT NULL,
  generation_metadata JSONB DEFAULT '{}',
  success_score INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days')
);

-- Create user interactions table for tracking engagement
CREATE TABLE public.user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID,
  phase_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL,
  interaction_data JSONB DEFAULT '{}',
  success_rating INTEGER,
  time_spent INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content templates table for reusable prompt components
CREATE TABLE public.content_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT NOT NULL UNIQUE,
  template_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.content_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for content_cache
CREATE POLICY "Users can manage their own content cache" 
ON public.content_cache 
FOR ALL 
USING (auth.uid() = user_id);

-- Create policies for user_interactions
CREATE POLICY "Users can manage their own interactions" 
ON public.user_interactions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create policies for content_templates (public read, system manage)
CREATE POLICY "Anyone can view active templates" 
ON public.content_templates 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "System can manage templates" 
ON public.content_templates 
FOR ALL 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_content_cache_context ON public.content_cache (user_id, context_hash, phase_id);
CREATE INDEX idx_content_cache_expires ON public.content_cache (expires_at);
CREATE INDEX idx_user_interactions_user_phase ON public.user_interactions (user_id, phase_id, created_at);
CREATE INDEX idx_content_templates_key ON public.content_templates (template_key);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_content_cache_updated_at
BEFORE UPDATE ON public.content_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_templates_updated_at
BEFORE UPDATE ON public.content_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content templates
INSERT INTO public.content_templates (template_key, template_content, category) VALUES
('phase_introduction', 'Create an interactive introduction for phase: {{phase_title}}. Focus on {{key_concepts}} with hands-on examples.', 'curriculum'),
('quiz_feedback', 'Provide constructive feedback for user answer: "{{user_answer}}" to question about {{topic}}. Include next learning steps.', 'assessment'),
('concept_explanation', 'Explain {{concept}} in the context of {{phase_title}}. Use interactive examples and practical applications.', 'education'),
('submission_response', 'Acknowledge and build upon user submission: "{{user_input}}" for {{interaction_type}}. Provide constructive next steps.', 'interaction');