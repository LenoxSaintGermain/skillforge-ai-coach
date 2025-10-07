// Skill area constants to maintain consistency across the application
export const SKILL_AREAS = {
  GEMINI_TRAINING: 'Gemini Training',
  PROMPT_ENGINEERING: 'Prompt Engineering',
  AI_IMPLEMENTATION: 'AI Implementation',
  MODEL_TRAINING: 'Model Training',
  API_INTEGRATION: 'API Integration',
} as const;

export type SkillArea = typeof SKILL_AREAS[keyof typeof SKILL_AREAS];
