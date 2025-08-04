
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  role?: string;
  industry?: string;
  ai_knowledge_level?: string;
  avatar_url?: string;
  bio?: string;
  learning_goals?: LearningGoal[];
  achievements?: Achievement[];
  created_at?: string;
  updated_at?: string;
}

export interface LearningGoal {
  id: string;
  user_id: string;
  description: string;
  skill_area: string;
  progress: number;
  target_date?: string;
}

export interface Achievement {
  id: string;
  achievement_type: string;
  title: string;
  description?: string;
  badge_icon?: string;
  earned_at: string;
}

interface UserContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch user profile and related data
  const fetchUserData = async (userId: string): Promise<User | null> => {
    try {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        
        // If profile doesn't exist, create a basic one
        if (profileError.code === 'PGRST116') {
          console.log('Creating basic profile for user:', userId);
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              name: 'New User',
              ai_knowledge_level: 'Beginner'
            })
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating profile:', createError);
            return null;
          }
          
          return {
            ...newProfile,
            learning_goals: [],
            achievements: []
          };
        }
        
        return null;
      }

      // Fetch learning goals
      const { data: learningGoals } = await supabase
        .from('learning_goals')
        .select('*')
        .eq('user_id', userId);

      // Fetch achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      return {
        ...profile,
        learning_goals: learningGoals || [],
        achievements: achievements || []
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (session?.user?.id) {
      const userData = await fetchUserData(session.user.id);
      setCurrentUser(userData);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Use setTimeout to prevent deadlock
          setTimeout(async () => {
            try {
              const userData = await fetchUserData(session.user.id);
              setCurrentUser(userData);
            } catch (error) {
              console.error('Error fetching user data:', error);
              setCurrentUser(null);
            } finally {
              setIsLoading(false);
            }
          }, 0);
        } else {
          setCurrentUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session only once
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setIsLoading(false);
      }
      // Auth state change will handle session cases
    }).catch((error) => {
      console.error('Error getting session:', error);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name
          }
        }
      });
      
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('user_id', currentUser.user_id);

      if (error) throw error;
      
      // Refresh user data
      await refreshUserData();
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
      isAuthenticated: !!session?.user, 
      isLoading,
      session,
      login,
      signUp, 
      logout, 
      updateUser,
      refreshUserData
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
