/**
 * UserContext — Dual-Mode Auth Provider
 * 
 * Supports both Supabase Auth (current) and Firebase Auth (GCP migration).
 * Set VITE_AUTH_PROVIDER=firebase in .env to switch to Firebase.
 * 
 * This design allows a gradual migration:
 *   1. Deploy with VITE_AUTH_PROVIDER=supabase (current behavior, no changes)
 *   2. Switch to VITE_AUTH_PROVIDER=firebase when GCP sandbox is ready
 *   3. Remove Supabase code paths after full migration
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { subjectConfigService, SubjectConfig } from '@/services/SubjectConfigService';

// Determine auth provider from env
const AUTH_PROVIDER = import.meta.env.VITE_AUTH_PROVIDER || 'supabase';

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

interface Session {
  user?: { id: string };
  access_token?: string;
}

interface UserContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  hasSession: boolean;
  isLoading: boolean;
  session: Session | null;
  activeSubject: SubjectConfig | null;
  setActiveSubject: (subject: SubjectConfig | null) => void;
  switchSubject: (subjectId: string) => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// ============================================================================
// SUPABASE AUTH PROVIDER (current)
// ============================================================================

function useSupabaseAuth() {
  // Lazy import to avoid loading Supabase when using Firebase
  const [supabaseClient, setSupabaseClient] = useState<any>(null);

  useEffect(() => {
    import('@/integrations/supabase/client').then(({ supabase }) => {
      setSupabaseClient(supabase);
    });
  }, []);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSubject, setActiveSubject] = useState<SubjectConfig | null>(null);

  const fetchUserData = async (userId: string): Promise<User | null> => {
    if (!supabaseClient) return null;
    try {
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabaseClient
            .from('profiles')
            .insert({ user_id: userId, name: 'New User', ai_knowledge_level: 'Beginner' })
            .select()
            .single();
          if (createError) return null;
          return { ...newProfile, learning_goals: [], achievements: [] };
        }
        return null;
      }

      const { data: learningGoals } = await supabaseClient
        .from('learning_goals').select('*').eq('user_id', userId);
      const { data: achievements } = await supabaseClient
        .from('achievements').select('*').eq('user_id', userId).order('earned_at', { ascending: false });

      return { ...profile, learning_goals: learningGoals || [], achievements: achievements || [] };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const refreshUserData = async () => {
    if (session?.user?.id && supabaseClient) {
      const userData = await fetchUserData(session.user.id);
      setCurrentUser(userData);
      if (userData?.user_id) {
        const subject = await subjectConfigService.getActiveSubject(userData.user_id);
        setActiveSubject(subject);
      }
    }
  };

  useEffect(() => {
    if (!supabaseClient) return;

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (_event: any, session: any) => {
        setSession(session);
        if (session?.user) {
          setTimeout(async () => {
            try {
              const userData = await fetchUserData(session.user.id);
              setCurrentUser(userData);
              if (userData?.user_id) {
                const subject = await subjectConfigService.getActiveSubject(userData.user_id);
                setActiveSubject(subject);
              }
            } catch {
              setCurrentUser(null);
              setActiveSubject(null);
            } finally {
              setIsLoading(false);
            }
          }, 0);
        } else {
          setCurrentUser(null);
          setActiveSubject(null);
          setIsLoading(false);
        }
      }
    );

    supabaseClient.auth.getSession().then(({ data: { session } }: any) => {
      if (!session) setIsLoading(false);
    }).catch(() => setIsLoading(false));

    return () => subscription.unsubscribe();
  }, [supabaseClient]);

  const login = async (email: string, password: string) => {
    if (!supabaseClient) return { error: { message: 'Auth not initialized' } };
    setIsLoading(true);
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!supabaseClient) return { error: { message: 'Auth not initialized' } };
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabaseClient.auth.signUp({
        email, password, options: { emailRedirectTo: redirectUrl, data: { name } }
      });
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!supabaseClient) return;
    setIsLoading(true);
    try {
      await supabaseClient.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!currentUser || !supabaseClient) return;
    setIsLoading(true);
    try {
      const { error } = await supabaseClient
        .from('profiles').update(userData).eq('user_id', currentUser.user_id);
      if (error) throw error;
      await refreshUserData();
    } finally {
      setIsLoading(false);
    }
  };

  return { currentUser, session, isLoading, activeSubject, setActiveSubject, login, signUp, logout, updateUser, refreshUserData };
}

// ============================================================================
// FIREBASE AUTH PROVIDER (GCP migration)
// ============================================================================

function useFirebaseAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSubject, setActiveSubject] = useState<SubjectConfig | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

  const fetchUserProfile = async (uid: string, token: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE}/data-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          table: 'profiles', select: '*',
          filters: [{ column: 'user_id', op: 'eq', value: uid }],
          single: true,
        }),
      });
      if (!response.ok) return null;
      const result = await response.json();
      return result.data || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    import('@/integrations/firebase/client').then(({ getFirebaseAuth, onAuthStateChanged }) => {
      const auth = getFirebaseAuth();

      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          setSession({ user: { id: firebaseUser.uid }, access_token: token });

          const profile = await fetchUserProfile(firebaseUser.uid, token);
          if (profile) {
            setCurrentUser(profile);
            if (profile.user_id) {
              const subject = await subjectConfigService.getActiveSubject(profile.user_id);
              setActiveSubject(subject);
            }
          } else {
            // Create profile on first login
            setCurrentUser({
              id: firebaseUser.uid,
              user_id: firebaseUser.uid,
              name: firebaseUser.displayName || 'New User',
              email: firebaseUser.email || undefined,
              ai_knowledge_level: 'Beginner',
              learning_goals: [],
              achievements: [],
            });
          }
        } else {
          setSession(null);
          setCurrentUser(null);
          setActiveSubject(null);
        }
        setIsLoading(false);
      });
    }).catch(() => {
      console.error('Failed to initialize Firebase Auth');
      setIsLoading(false);
    });

    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { getFirebaseAuth, signInWithEmailAndPassword } = await import('@/integrations/firebase/client');
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      const message = error?.code === 'auth/invalid-credential'
        ? 'Invalid email or password'
        : error?.code === 'auth/user-not-found'
          ? 'No account found with this email'
          : error?.code === 'auth/too-many-requests'
            ? 'Too many attempts. Please try again later.'
            : 'Failed to sign in';
      return { error: { message } };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { getFirebaseAuth, createUserWithEmailAndPassword, updateProfile } = await import('@/integrations/firebase/client');
      const auth = getFirebaseAuth();
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      return { error: null };
    } catch (error: any) {
      const message = error?.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists'
        : error?.code === 'auth/weak-password'
          ? 'Password is too weak. Use at least 6 characters.'
          : 'Failed to create account';
      return { error: { message } };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { getFirebaseAuth, signOut } = await import('@/integrations/firebase/client');
      await signOut(getFirebaseAuth());
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!currentUser || !session?.access_token) return;
    setIsLoading(true);
    try {
      await fetch(`${API_BASE}/data-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({
          table: 'profiles', action: 'update', data: userData,
          filters: [{ column: 'user_id', op: 'eq', value: currentUser.user_id }],
        }),
      });
      setCurrentUser(prev => prev ? { ...prev, ...userData } : null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (session?.user?.id && session.access_token) {
      const profile = await fetchUserProfile(session.user.id, session.access_token);
      if (profile) setCurrentUser(profile);
    }
  };

  return { currentUser, session, isLoading, activeSubject, setActiveSubject, login, signUp, logout, updateUser, refreshUserData };
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Select auth provider based on env variable
  const authHook = AUTH_PROVIDER === 'firebase' ? useFirebaseAuth : useSupabaseAuth;
  const {
    currentUser, session, isLoading, activeSubject, setActiveSubject,
    login, signUp, logout, updateUser, refreshUserData,
  } = authHook();

  const switchSubject = async (subjectId: string): Promise<void> => {
    if (!currentUser?.user_id) return;
    try {
      const success = await subjectConfigService.setPrimarySubject(currentUser.user_id, subjectId);
      if (!success) throw new Error('Failed to switch subject');
      const newSubject = await subjectConfigService.getSubjectById(subjectId);
      setActiveSubject(newSubject);
    } catch (error) {
      console.error('Switch subject error:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      isAuthenticated: !!session?.user && !!currentUser,
      hasSession: !!session?.user,
      isLoading,
      session: session as any,
      activeSubject,
      setActiveSubject,
      switchSubject,
      login,
      signUp,
      logout,
      updateUser,
      refreshUserData,
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
