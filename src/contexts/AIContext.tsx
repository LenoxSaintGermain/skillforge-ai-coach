
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AICoachService } from '@/services/AICoachService';

interface AIContextType {
  aiCoachService: AICoachService;
  isLoading: boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aiCoachService] = useState<AICoachService>(() => new AICoachService());
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
  }, [aiCoachService]);

  return (
    <AIContext.Provider value={{ aiCoachService, isLoading }}>
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
