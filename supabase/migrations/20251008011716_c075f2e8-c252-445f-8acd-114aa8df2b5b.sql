-- Add admin role for the current user
INSERT INTO public.user_roles (user_id, role)
VALUES ('4aa1e221-a9d4-4fa0-a937-a1b9049b57a4', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;