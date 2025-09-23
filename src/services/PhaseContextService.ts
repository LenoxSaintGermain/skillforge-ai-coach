// Phase-specific micro-context service for content generation
export interface PhaseProfile {
  id: number;
  titleShort: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focus: 'concepts' | 'design' | 'hands-on' | 'advanced' | 'deployment';
  keyTerms: string[];
  contentType: 'conceptual' | 'practical' | 'mixed';
}

export interface MicroTemplate {
  key: string;
  template: string;
  maxLength: number;
}

export class PhaseContextService {
  private static instance: PhaseContextService;
  
  // Condensed phase profiles (under 100 chars each)
  private readonly phaseProfiles: Record<number, PhaseProfile> = {
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

  // Micro-templates (under 200 chars each)
  private readonly microTemplates: Record<string, MicroTemplate> = {
    // Beginner conceptual templates
    'beginner_introduction': {
      key: 'beginner_introduction',
      template: 'Welcome to {{phase_title}}! Let\'s start with the fundamentals of {{key_concept}}. Use simple language and examples.',
      maxLength: 180
    },
    'beginner_concept': {
      key: 'beginner_concept',
      template: 'Explain {{concept}} for beginners. Focus on understanding, not implementation. Include real-world examples.',
      maxLength: 160
    },
    'beginner_submit': {
      key: 'beginner_submit',
      template: 'Great job exploring {{concept}}! Let\'s build on that understanding with the next topic.',
      maxLength: 140
    },

    // Intermediate practical templates  
    'intermediate_introduction': {
      key: 'intermediate_introduction',
      template: 'Ready for {{phase_title}}? Let\'s dive into {{key_concept}} with hands-on practice.',
      maxLength: 150
    },
    'intermediate_hands_on': {
      key: 'intermediate_hands_on',
      template: 'Time to build! Let\'s work with {{concept}} step-by-step. Include code examples and tools.',
      maxLength: 160
    },
    'intermediate_submit': {
      key: 'intermediate_submit',
      template: 'Excellent progress on {{concept}}! Ready for the next challenge?',
      maxLength: 120
    },

    // Advanced deployment templates
    'advanced_introduction': {
      key: 'advanced_introduction',
      template: 'Advanced {{phase_title}}: Let\'s explore {{key_concept}} for production systems.',
      maxLength: 140
    },
    'advanced_practical': {
      key: 'advanced_practical',
      template: 'Implement {{concept}} with enterprise considerations. Include best practices and architecture.',
      maxLength: 170
    }
  };

  static getInstance(): PhaseContextService {
    if (!PhaseContextService.instance) {
      PhaseContextService.instance = new PhaseContextService();
    }
    return PhaseContextService.instance;
  }

  getPhaseProfile(phaseId: number): PhaseProfile | null {
    return this.phaseProfiles[phaseId] || null;
  }

  getMicroTemplate(phaseId: number, interactionType: string): MicroTemplate {
    const profile = this.getPhaseProfile(phaseId);
    if (!profile) {
      return this.microTemplates['beginner_introduction'];
    }

    // Smart template selection based on phase difficulty + interaction type
    const templateKey = this.selectTemplateKey(profile.difficulty, profile.focus, interactionType);
    return this.microTemplates[templateKey] || this.microTemplates['beginner_introduction'];
  }

  private selectTemplateKey(difficulty: string, focus: string, interactionType: string): string {
    // Map phase characteristics to appropriate templates
    if (difficulty === 'beginner') {
      switch (interactionType) {
        case 'introduction': return 'beginner_introduction';
        case 'submit': return 'beginner_submit';
        default: return 'beginner_concept';
      }
    }
    
    if (difficulty === 'intermediate') {
      switch (interactionType) {
        case 'introduction': return 'intermediate_introduction';
        case 'submit': return 'intermediate_submit';
        default: return focus === 'hands-on' ? 'intermediate_hands_on' : 'intermediate_introduction';
      }
    }

    if (difficulty === 'advanced') {
      switch (interactionType) {
        case 'introduction': return 'advanced_introduction';
        default: return 'advanced_practical';
      }
    }

    return 'beginner_introduction';
  }

  buildSmartPrompt(phaseId: number, interactionType: string, userInput?: string): string {
    const profile = this.getPhaseProfile(phaseId);
    const template = this.getMicroTemplate(phaseId, interactionType);
    
    if (!profile) {
      return 'Generate helpful beginner content about AI fundamentals.';
    }

    // Populate template with actual phase data
    let prompt = template.template
      .replace('{{phase_title}}', profile.titleShort)
      .replace('{{key_concept}}', profile.keyTerms[0] || 'AI concepts')
      .replace('{{concept}}', profile.keyTerms.join(', '))
      .replace('{{user_input}}', userInput || '');

    // Add content type guidance
    const contentGuidance = profile.contentType === 'conceptual' 
      ? ' Focus on understanding and explanation.'
      : profile.contentType === 'practical'
      ? ' Include actionable steps and examples.'
      : ' Balance concepts with practical application.';

    prompt += contentGuidance;

    // Add HTML formatting requirements
    prompt += '\n\nGenerate interactive HTML using classes: llm-container, llm-title, llm-text, llm-button, llm-code, llm-highlight, llm-task, llm-subtitle. Include data-interaction-id attributes.';

    return prompt;
  }
}

export const phaseContextService = PhaseContextService.getInstance();