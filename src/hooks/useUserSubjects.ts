import { useState, useEffect, useCallback } from 'react';
import { SubjectConfig, subjectConfigService } from '@/services/SubjectConfigService';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { contentCacheService } from '@/services/ContentCacheService';
import { ENROLLMENTS_UPDATED } from '@/services/EnrollmentEvents';

interface UseUserSubjectsReturn {
  enrolledSubjects: SubjectConfig[];
  isLoading: boolean;
  error: Error | null;
  switchSubject: (subjectId: string) => Promise<void>;
  refreshEnrollments: () => Promise<void>;
}

export const useUserSubjects = (): UseUserSubjectsReturn => {
  const { currentUser, setActiveSubject, activeSubject } = useUser();
  const { toast } = useToast();
  const [enrolledSubjects, setEnrolledSubjects] = useState<SubjectConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEnrollments = useCallback(async () => {
    if (!currentUser?.user_id) {
      setEnrolledSubjects([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const subjects = await subjectConfigService.getUserEnrollments(currentUser.user_id);
      setEnrolledSubjects(subjects);
    } catch (err) {
      console.error('Error fetching user enrollments:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch enrollments'));
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.user_id]);

  useEffect(() => {
    fetchEnrollments();

    // Listen for enrollment update events
    const handleEnrollmentsUpdate = () => {
      fetchEnrollments();
    };

    window.addEventListener(ENROLLMENTS_UPDATED, handleEnrollmentsUpdate);

    // Refetch when tab becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchEnrollments();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener(ENROLLMENTS_UPDATED, handleEnrollmentsUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchEnrollments]);

  const switchSubject = useCallback(async (subjectId: string) => {
    if (!currentUser?.user_id) return;

    try {
      // Find the subject being switched to
      const newSubject = enrolledSubjects.find(s => s.id === subjectId);
      if (!newSubject) {
        throw new Error('Subject not found');
      }

      // Set as primary in database
      const success = await subjectConfigService.setPrimarySubject(
        currentUser.user_id,
        subjectId
      );

      if (!success) {
        throw new Error('Failed to switch subject');
      }

      // Clear content cache for the old subject
      if (activeSubject) {
        await contentCacheService.clearSubjectCache(activeSubject.id);
      }

      // Update active subject in context
      setActiveSubject(newSubject);

      toast({
        title: 'Subject switched',
        description: `Now learning: ${newSubject.title}`,
      });

      // Refresh the page to reload subject-specific content
      window.location.reload();
    } catch (err) {
      console.error('Error switching subject:', err);
      toast({
        title: 'Error',
        description: 'Failed to switch subject. Please try again.',
        variant: 'destructive',
      });
    }
  }, [currentUser?.user_id, enrolledSubjects, activeSubject, setActiveSubject, toast]);

  const refreshEnrollments = useCallback(async () => {
    await fetchEnrollments();
  }, [fetchEnrollments]);

  return {
    enrolledSubjects,
    isLoading,
    error,
    switchSubject,
    refreshEnrollments,
  };
};
