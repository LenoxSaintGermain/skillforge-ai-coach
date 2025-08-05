
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AICoachService } from '@/services/AICoachService';

interface AIContextType {
  coachService: AICoachService;
  isLoading: boolean;
  error: string | null;
  isServiceReady: boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coachService] = useState<AICoachService>(() => {
    try {
      return new AICoachService();
    } catch (error) {
      console.error("Failed to create CoachService:", error);
      return new AICoachService(); // fallback
    }
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isServiceReady, setIsServiceReady] = useState<boolean>(false);

  useEffect(() => {
    const initializeServices = async () => {
      console.log('🚀 Initializing coach service...');
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Test basic service functionality
        if (typeof coachService.initializeCoach !== 'function') {
          throw new Error('CoachService not properly initialized');
        }
        
        console.log('✅ Coach service initialized successfully');
        setIsServiceReady(true);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during coach service initialization';
        console.error('❌ Failed to initialize coach service:', errorMessage);
        setError(errorMessage);
        
        // Still mark as ready to allow fallback behavior
        setIsServiceReady(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeServices();
  }, [coachService]);

  return (
    <AIContext.Provider value={{ 
      coachService, 
      isLoading,
      error,
      isServiceReady
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
