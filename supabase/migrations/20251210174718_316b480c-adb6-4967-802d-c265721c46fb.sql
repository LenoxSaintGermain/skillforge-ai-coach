-- Create saved_learning_paths table
CREATE TABLE public.saved_learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  persona TEXT NOT NULL,
  goal TEXT NOT NULL,
  rationale TEXT,
  pathway JSONB NOT NULL,
  use_case_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_learning_paths ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own paths
CREATE POLICY "Users can manage their own saved learning paths"
ON public.saved_learning_paths
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_saved_learning_paths_updated_at
BEFORE UPDATE ON public.saved_learning_paths
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();