
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
  lastInteraction: Date;
}
