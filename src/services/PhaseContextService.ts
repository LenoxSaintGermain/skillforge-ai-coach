// Phase-specific context service for comprehensive, blog-style content generation
import { SubjectConfig } from './SubjectConfigService';

export interface PhaseProfile {
  id: number;
  titleShort: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focus: 'concepts' | 'design' | 'hands-on' | 'advanced' | 'deployment';
  keyTerms: string[];
  contentType: 'conceptual' | 'practical' | 'mixed';
}

export class PhaseContextService {
  private static instance: PhaseContextService;
  
  // Default Gemini profiles (used as fallback)
  private readonly defaultPhaseProfiles: Record<number, PhaseProfile> = {
    1: {
      id: 1,
      titleShort: "GenAI Fundamentals",
      difficulty: 'beginner',
      focus: 'concepts',
      keyTerms: ['GenAI', 'LLMs', 'Gemini basics', 'AI interaction'],
      contentType: 'conceptual'
    },
    2: {
      id: 2,
      titleShort: "Project Ideation",
      difficulty: 'beginner',
      focus: 'design',
      keyTerms: ['project planning', 'AI research', 'brainstorming'],
      contentType: 'practical'
    },
    3: {
      id: 3,
      titleShort: "Building Prototype",
      difficulty: 'intermediate',
      focus: 'hands-on',
      keyTerms: ['Google AI Studio', 'coding', 'prototyping'],
      contentType: 'practical'
    },
    4: {
      id: 4,
      titleShort: "Advanced Features",
      difficulty: 'intermediate',
      focus: 'advanced',
      keyTerms: ['RAG', 'multi-agent', 'data integration'],
      contentType: 'mixed'
    },
    5: {
      id: 5,
      titleShort: "Deployment & Ethics",
      difficulty: 'advanced',
      focus: 'deployment',
      keyTerms: ['deployment', 'responsible AI', 'enterprise'],
      contentType: 'mixed'
    }
  };

  static getInstance(): PhaseContextService {
    if (!PhaseContextService.instance) {
      PhaseContextService.instance = new PhaseContextService();
    }
    return PhaseContextService.instance;
  }

  /**
   * Get phase profile with subject-aware fallback
   */
  getPhaseProfile(phaseId: number, subjectConfig?: SubjectConfig | null): PhaseProfile | null {
    // Try subject-specific profile first
    if (subjectConfig?.phase_context_profiles?.[phaseId]) {
      return subjectConfig.phase_context_profiles[phaseId];
    }
    // Fallback to default
    return this.defaultPhaseProfiles[phaseId] || null;
  }

  /**
   * Build comprehensive prompt with subject-aware context
   */
  buildComprehensivePrompt(
    phaseId: number, 
    phaseObjective: string, 
    keyConcepts: { title: string; description: string }[],
    subjectConfig?: SubjectConfig | null
  ): string {
    const profile = this.getPhaseProfile(phaseId, subjectConfig);

    if (!profile) {
      return 'Generate a helpful beginner-level article about the fundamentals of AI.';
    }

    // Safe fallback for keyConcepts
    const safeKeyConcepts = Array.isArray(keyConcepts) ? keyConcepts : [];
    const keyConceptsList = safeKeyConcepts.length
      ? safeKeyConcepts.map(c => `- **${c.title}:** ${c.description}`).join('\n')
      : '- Provide an accessible overview of this phase, covering at least three essential concepts with practical examples.';

    const contentGuidance = profile.contentType === 'conceptual'
      ? 'Focus on clear explanations, real-world analogies, and conceptual understanding. Avoid overly technical jargon.'
      : profile.contentType === 'practical'
      ? 'Provide actionable steps, code snippets (if applicable), and practical examples that users can apply.'
      : 'Balance conceptual explanations with practical applications and examples.';

    const prompt = `
      **Objective:** Generate a comprehensive, blog-style article for the learning phase: "${profile.titleShort}".

      **Target Audience:** ${profile.difficulty} learners with a focus on ${profile.focus}.

      **Core Task:** Write a detailed and engaging article that covers all the key concepts for this phase. The article should be a single, cohesive piece of content that does not require any further clicks to reveal information.

      **Phase Learning Objective:** ${phaseObjective}

      **Key Concepts to Cover in Detail:**
      ${keyConceptsList}

      **Content Structure and Style:**
      1.  **Introduction:** Start with an engaging introduction that outlines the phase's learning objective.
      2.  **Body:** Create a dedicated section for each key concept. Each section should be well-structured with subheadings, explanations, and examples.
      3.  **Conclusion:** End with a summary of the key takeaways and a brief look ahead.
      4.  **Tone:** Maintain an encouraging, educational, and clear tone.
      5.  **Formatting:** Use the provided HTML classes to structure the content visually.

      **${contentGuidance}**

      **CRITICAL HTML Formatting Rules:**
      - Your entire response MUST be ONLY HTML content.
      - Use classes: llm-container, llm-title, llm-subtitle, llm-text, llm-code, llm-highlight, llm-task.
      - Do NOT include any interactive elements like buttons or elements with 'data-interaction-id' attributes, except for a single "Back to Syllabus" button if you want to provide one at the end.
      - End your article with a "Further Exploration" section that includes a placeholder: [VIDEO_RECOMMENDATIONS_PLACEHOLDER] - this will be replaced with relevant video content.
    `;

    return prompt;
  }
}

export const phaseContextService = PhaseContextService.getInstance();