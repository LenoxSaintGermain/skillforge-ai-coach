-- Fix 1: Drop the overly permissive "Users can update vote counts" policy on learning_resources
DROP POLICY IF EXISTS "Users can update vote counts" ON public.learning_resources;

-- Fix 2: Drop the overly permissive "System can manage templates" policy on content_templates
DROP POLICY IF EXISTS "System can manage templates" ON public.content_templates;

-- Fix 3: Create a proper admin-only policy for content_templates management
CREATE POLICY "Admins can manage templates"
ON public.content_templates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));