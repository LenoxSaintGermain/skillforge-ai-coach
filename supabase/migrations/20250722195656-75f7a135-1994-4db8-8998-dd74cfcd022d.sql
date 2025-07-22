
-- Fix Test User Alpha demo data population
-- First, let's clean up any partial data and repopulate everything properly

-- Update Test User Alpha's profile with complete details
UPDATE public.profiles 
SET 
  industry = 'Food Service',
  role = 'Restaurant Manager',
  ai_knowledge_level = 'Beginner',
  bio = 'Restaurant manager looking to integrate AI tools to improve customer service and operational efficiency. Passionate about leveraging technology to enhance customer experience and streamline operations.'
WHERE user_id = '4aa1e221-a9d4-4fa0-a937-a1b9049b57a4';

-- Clear existing data first to avoid duplicates
DELETE FROM public.learning_goals WHERE user_id = '4aa1e221-a9d4-4fa0-a937-a1b9049b57a4';
DELETE FROM public.achievements WHERE user_id = '4aa1e221-a9d4-4fa0-a937-a1b9049b57a4';
DELETE FROM public.user_scenario_progress WHERE user_id = '4aa1e221-a9d4-4fa0-a937-a1b9049b57a4';
DELETE FROM public.ai_coaching_sessions WHERE user_id = '4aa1e221-a9d4-4fa0-a937-a1b9049b57a4';
DELETE FROM public.skill_assessments WHERE user_id = '4aa1e221-a9d4-4fa0-a937-a1b9049b57a4';
DELETE FROM public.syllabus_progress WHERE user_id = '4aa1e221-a9d4-4fa0-a937-a1b9049b57a4';

-- Insert learning goals for Test User Alpha
INSERT INTO public.learning_goals (user_id, skill_area, description, target_date, progress) VALUES
('4aa1e221-a9d4-4fa0-a937-a1b9049b57a4', 'AI Customer Service', 'Master AI Customer Service Tools for restaurant operations', '2024-12-31', 35),
('4aa1e221-a9d4-4fa0-a937-a1b9049b57a4', 'AI Ethics', 'Understand AI Ethics and Best Practices in business applications', '2025-03-31', 15),
('4aa1e221-a9d4-4fa0-a937-a1b9049b57a4', 'AI Operations', 'Implement AI-driven Inventory Management systems', '2025-06-30', 5);

-- Insert achievements for Test User Alpha
INSERT INTO public.achievements (user_id, title, description, achievement_type, badge_icon) VALUES
('4aa1e221-a9d4-4fa0-a937-a1b9049b57a4', 'First Steps', 'Completed profile setup and started your AI learning journey', 'setup', '🎯'),
('4aa1e221-a9d4-4fa0-a937-a1b9049b57a4', 'Learning Enthusiast', 'Set your first learning goal and showed commitment to growth', 'milestone', '📚'),
('4aa1e221-a9d4-4fa0-a937-a1b9049b57a4', 'AI Explorer', 'Started your first scenario and began hands-on learning', 'progress', '🚀'),
('4aa1e221-a9d4-4fa0-a937-a1b9049b57a4', 'Quick Learner', 'Completed your first week of consistent learning', 'streak', '⚡'),
('4aa1e221-a9d4-4fa0-a937-a1b9049b57a4', 'Question Master', 'Asked thoughtful questions to your AI coach', 'engagement', '🤔');

-- Insert scenario progress (using any existing scenario or create placeholder)
INSERT INTO public.user_scenario_progress (user_id, scenario_id, status, progress_data, started_at, feedback, score) VALUES
('4aa1e221-a9d4-4fa0-a937-a1b9049b57a4', 
 COALESCE((SELECT id FROM public.scenarios LIMIT 1), gen_random_uuid()),
 'in_progress',
 '{"completed_steps": ["introduction", "basic_prompts"], "current_step": "advanced_prompts", "total_steps": 4}',
 NOW() - INTERVAL '3 days',
 'Great progress! Your understanding of basic AI prompts is solid. Focus on refining your advanced prompting techniques.',
 75);

-- Insert Gemini training syllabus progress
INSERT INTO public.syllabus_progress (user_id, syllabus_name, current_module, progress_percentage, completed_modules, last_accessed) VALUES
('4aa1e221-a9d4-4fa0-a937-a1b9049b57a4', 'gemini', 'Understanding AI Prompts', 35, ARRAY['Introduction to AI', 'AI Fundamentals'], NOW() - INTERVAL '1 hour');

-- Insert AI coaching sessions history
INSERT INTO public.ai_coaching_sessions (user_id, coach_type, started_at, ended_at, session_duration, conversation_data) VALUES
('4aa1e221-a9d4-4fa0-a937-a1b9049b57a4', 'jarvis', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '25 minutes', 1500, 
'{"messages": [{"role": "user", "content": "How do I start with AI in my restaurant?"}, {"role": "assistant", "content": "Great question! Start by identifying repetitive tasks like order taking or customer inquiries. AI can help automate these processes."}, {"role": "user", "content": "What about customer service specifically?"}, {"role": "assistant", "content": "AI chatbots can handle common questions about menu items, hours, and reservations, freeing your staff for more complex customer needs."}], "topics_covered": ["AI basics", "restaurant applications", "customer service automation"]}'),

('4aa1e221-a9d4-4fa0-a937-a1b9049b57a4', 'general', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '18 minutes', 1080, 
'{"messages": [{"role": "user", "content": "Im new to AI. Where should I begin?"}, {"role": "assistant", "content": "Welcome to SkillForge! I recommend starting with our basic AI concepts module, then moving to practical applications in your industry."}, {"role": "user", "content": "How long will it take to learn?"}, {"role": "assistant", "content": "It depends on your goals, but most users see practical results within 2-3 weeks of consistent practice."}], "topics_covered": ["getting started", "learning path", "expectations"]}'),

('4aa1e221-a9d4-4fa0-a937-a1b9049b57a4', 'jarvis', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '12 minutes', 720, 
'{"messages": [{"role": "user", "content": "I am working on the customer service scenario but stuck on advanced prompts"}, {"role": "assistant", "content": "Advanced prompts require specificity. Instead of asking What should I order?, try Can you recommend a vegetarian dish under $15 that is gluten-free?"}, {"role": "user", "content": "That makes sense! More context leads to better responses?"}, {"role": "assistant", "content": "Exactly! The more specific context you provide, the more helpful and accurate the AI response will be."}], "topics_covered": ["advanced prompting", "scenario guidance", "practical tips"]}');

-- Insert skill assessment data
INSERT INTO public.skill_assessments (user_id, assessment_type, skill_area, score, assessment_data) VALUES
('4aa1e221-a9d4-4fa0-a937-a1b9049b57a4', 'baseline', 'AI Fundamentals', 75, 
'{"total_questions": 20, "correct_answers": 15, "time_taken": 1200, "strengths": ["Basic AI concepts", "Understanding of automation benefits", "Business application awareness"], "improvement_areas": ["Advanced prompting techniques", "AI ethics considerations", "Technical implementation details"], "question_breakdown": {"ai_basics": 8, "practical_applications": 5, "ethics_and_safety": 2}, "recommendations": ["Focus on advanced prompting module", "Review AI ethics best practices", "Practice with more complex scenarios"]}');
