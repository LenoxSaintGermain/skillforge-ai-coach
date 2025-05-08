
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id?: string;
  name: string;
  email?: string;
  role?: string;
  industry?: string;
  aiKnowledgeLevel?: string;
  learningGoals?: LearningGoal[];
  lastLoginDate?: Date | null;
  createdAt?: Date;
}

export interface LearningGoal {
  id: string;
  description: string;
  skillArea: string;
  progress: number;
}

interface UserContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const defaultUser: User = {
  id: '1',
  name: 'Demo User',
  email: 'demo@skillforge.ai',
  role: 'Product Manager',
  industry: 'Technology',
  aiKnowledgeLevel: 'Intermediate',
  lastLoginDate: null,
  learningGoals: [
    { id: '1', description: 'Learn prompt engineering for business use cases', skillArea: 'Prompt Engineering', progress: 25 },
    { id: '2', description: 'Understand AI model capabilities and limitations', skillArea: 'AI Fundamentals', progress: 40 },
    { id: '3', description: 'Implement AI in product development', skillArea: 'Implementation', progress: 10 },
  ]
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(defaultUser);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Mock login function for demonstration
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentUser(defaultUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock update user function
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentUser(prev => prev ? { ...prev, ...userData } : null);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      isAuthenticated: !!currentUser, 
      isLoading, 
      login, 
      logout, 
      updateUser 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
