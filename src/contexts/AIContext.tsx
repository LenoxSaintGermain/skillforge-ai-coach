
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AICoachService } from '@/services/AICoachService';
import { JarvisCoachService } from '@/services/JarvisCoachService';

interface AIContextType {
  aiCoachService: AICoachService;
  jarvisCoachService: JarvisCoachService;
  activeCoach: 'ai' | 'jarvis';
  setActiveCoach: (coach: 'ai' | 'jarvis') => void;
  isLoading: boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aiCoachService] = useState<AICoachService>(() => new AICoachService());
  const [jarvisCoachService] = useState<JarvisCoachService>(() => new JarvisCoachService());
  const [activeCoach, setActiveCoach] = useState<'ai' | 'jarvis'>('ai');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeService = async () => {
      try {
        // Initialize the AI coach service here
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize AI Coach Service:", error);
        setIsLoading(false);
      }
    };

    initializeService();
  }, [aiCoachService, jarvisCoachService]);

  return (
    <AIContext.Provider value={{ 
      aiCoachService, 
      jarvisCoachService, 
      activeCoach, 
      setActiveCoach, 
      isLoading 
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = (): AIContextType => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
