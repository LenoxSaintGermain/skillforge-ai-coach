-- Fix scenarios table RLS policy to prevent unauthorized access to user-created scenarios

-- Remove the overly permissive policy that allows anyone to view all scenarios
DROP POLICY IF EXISTS "Anyone can view scenarios" ON public.scenarios;

-- Allow users to view their own scenarios
CREATE POLICY "Users can view their own scenarios"
ON public.scenarios
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to view system scenarios (where user_id is NULL)
CREATE POLICY "Users can view system scenarios"
ON public.scenarios
FOR SELECT
TO authenticated
USING (user_id IS NULL);