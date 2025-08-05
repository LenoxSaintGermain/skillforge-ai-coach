
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AICoachService } from '@/services/AICoachService';
import { JarvisCoachService } from '@/services/JarvisCoachService';

interface AIContextType {
  aiCoachService: AICoachService;
  jarvisCoachService: JarvisCoachService;
  activeCoach: 'ai' | 'jarvis';
  setActiveCoach: (coach: 'ai' | 'jarvis') => void;
  isLoading: boolean;
  error: string | null;
  isServiceReady: boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aiCoachService] = useState<AICoachService>(() => {
    try {
      return new AICoachService();
    } catch (error) {
      console.error("Failed to create AICoachService:", error);
      return new AICoachService(); // fallback
    }
  });
  
  const [jarvisCoachService] = useState<JarvisCoachService>(() => {
    try {
      return new JarvisCoachService();
    } catch (error) {
      console.error("Failed to create JarvisCoachService:", error);
      return new JarvisCoachService(); // fallback
    }
  });
  
  const [activeCoach, setActiveCoach] = useState<'ai' | 'jarvis'>('ai');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isServiceReady, setIsServiceReady] = useState<boolean>(false);

  useEffect(() => {
    const initializeServices = async () => {
      console.log('🚀 Initializing AI services...');
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Test basic service functionality
        if (typeof aiCoachService.initializeCoach !== 'function') {
          throw new Error('AICoachService not properly initialized');
        }
        
        if (typeof jarvisCoachService.initializeJarvis !== 'function') {
          throw new Error('JarvisCoachService not properly initialized');
        }
        
        console.log('✅ AI services initialized successfully');
        setIsServiceReady(true);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during AI service initialization';
        console.error('❌ Failed to initialize AI services:', errorMessage);
        setError(errorMessage);
        
        // Still mark as ready to allow fallback behavior
        setIsServiceReady(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeServices();
  }, [aiCoachService, jarvisCoachService]);

  return (
    <AIContext.Provider value={{ 
      aiCoachService, 
      jarvisCoachService, 
      activeCoach, 
      setActiveCoach, 
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
