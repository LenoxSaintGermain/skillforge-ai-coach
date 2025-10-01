-- Create beta_feedback table for comprehensive user feedback
CREATE TABLE public.beta_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug_report', 'feature_request', 'general', 'ui_ux', 'performance')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  current_page TEXT,
  browser_info JSONB DEFAULT '{}'::jsonb,
  attachments TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'in_progress', 'resolved', 'closed')),
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
ON public.beta_feedback
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own feedback
CREATE POLICY "Users can create feedback"
ON public.beta_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own feedback
CREATE POLICY "Users can update their own feedback"
ON public.beta_feedback
FOR UPDATE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_beta_feedback_updated_at
BEFORE UPDATE ON public.beta_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_beta_feedback_user_id ON public.beta_feedback(user_id);
CREATE INDEX idx_beta_feedback_status ON public.beta_feedback(status);
CREATE INDEX idx_beta_feedback_created_at ON public.beta_feedback(created_at DESC);