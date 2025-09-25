
export interface ScenarioTask {
  id: string;
  description: string;
  aiActions?: string[];
  evaluationTips?: string;
  isCompleted: boolean;
}

export interface SyllabusPhase {
  id: number;
  title: string;
  objective: string;
  corePracticalTask: {
    description: string;
    taskDetails: string;
  };
  keyConceptsAndActivities: {
    title: string;
    description: string;
  }[];
  relevantSources?: string[];
}

export interface Syllabus {
  title: string;
  overallGoal: string;
  phases: SyllabusPhase[];
}

export interface UserSyllabusProgress {
  currentPhase: number;
  completedTasks: number[];
  completedPhases: number[];
  lastInteraction: Date;
  notes?: string[];
}

export interface ScenarioProgress {
  scenarioId: string;
  completedTasks: number[];
  startedAt: Date;
  lastInteraction: Date;
  completed: boolean;
  completedAt?: Date;
  notes?: string[];
}
