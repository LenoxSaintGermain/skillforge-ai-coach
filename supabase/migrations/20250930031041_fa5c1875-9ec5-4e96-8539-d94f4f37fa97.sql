-- Create learning_resources table for AI-discovered resources
CREATE TABLE public.learning_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('documentation', 'video', 'tutorial', 'template', 'article')),
  tags TEXT[] DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'ai-curated' CHECK (source IN ('ai-curated', 'manual')),
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 10),
  votes INTEGER DEFAULT 0,
  topic_area TEXT,
  added_by_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_verified BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;

-- Create policies for learning_resources
CREATE POLICY "Anyone can view resources"
  ON public.learning_resources
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create resources"
  ON public.learning_resources
  FOR INSERT
  WITH CHECK (auth.uid() = added_by_user_id OR added_by_user_id IS NULL);

CREATE POLICY "Users can update vote counts"
  ON public.learning_resources
  FOR UPDATE
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_learning_resources_topic_area ON public.learning_resources(topic_area);
CREATE INDEX idx_learning_resources_quality_score ON public.learning_resources(quality_score DESC);
CREATE INDEX idx_learning_resources_votes ON public.learning_resources(votes DESC);
CREATE INDEX idx_learning_resources_created_at ON public.learning_resources(created_at DESC);