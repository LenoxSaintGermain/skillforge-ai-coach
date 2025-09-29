-- Fix RLS policies for scenarios table to allow user insertions
DROP POLICY IF EXISTS "Anyone can view scenarios" ON public.scenarios;
DROP POLICY IF EXISTS "Users can create scenarios" ON public.scenarios;
DROP POLICY IF EXISTS "Users can manage their own scenarios" ON public.scenarios;

-- Add user_id column to scenarios table if it doesn't exist
ALTER TABLE public.scenarios 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create comprehensive RLS policies for scenarios
CREATE POLICY "Anyone can view scenarios" 
ON public.scenarios 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own scenarios" 
ON public.scenarios 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenarios" 
ON public.scenarios 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenarios" 
ON public.scenarios 
FOR DELETE 
USING (auth.uid() = user_id);

-- Update existing scenarios to have a user_id (set to NULL for now)
-- This prevents existing data from being orphaned
UPDATE public.scenarios 
SET user_id = NULL 
WHERE user_id IS NULL;