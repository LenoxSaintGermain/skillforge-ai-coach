-- Fix 1: Improve handle_new_user function with input validation and error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
BEGIN
  -- Validate and sanitize name from metadata with length limit
  v_name := COALESCE(
    substring(NEW.raw_user_meta_data ->> 'name', 1, 100),
    substring(NEW.raw_user_meta_data ->> 'full_name', 1, 100),
    'New User'
  );
  
  -- Trim whitespace and ensure not empty
  v_name := TRIM(v_name);
  IF v_name = '' THEN
    v_name := 'New User';
  END IF;
  
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, v_name, NEW.email);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail authentication
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Fix 2: Fix the permissive "System can create achievements" policy
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can create achievements" ON public.achievements;

-- Create a more restrictive policy - users can only create achievements for themselves
CREATE POLICY "Users can earn their own achievements"
ON public.achievements
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add update and delete policies if not exist
DROP POLICY IF EXISTS "Users can update own achievements" ON public.achievements;
CREATE POLICY "Users can update own achievements"
ON public.achievements
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own achievements" ON public.achievements;
CREATE POLICY "Users can delete own achievements"
ON public.achievements
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);