import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubjectConfig, subjectConfigService } from '@/services/SubjectConfigService';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { contentCacheService } from '@/services/ContentCacheService';
import { ENROLLMENTS_UPDATED } from '@/services/EnrollmentEvents';

interface UseUserSubjectsReturn {
  enrolledSubjects: SubjectConfig[];
  allSubjects: SubjectConfig[];
  isLoading: boolean;
  error: Error | null;
  switchSubject: (subjectId: string) => Promise<void>;
  refreshEnrollments: () => Promise<void>;
  isEnrolled: (subjectId: string) => boolean;
}

export const useUserSubjects = (): UseUserSubjectsReturn => {
  const { currentUser, setActiveSubject, activeSubject } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [enrolledSubjects, setEnrolledSubjects] = useState<SubjectConfig[]>([]);
  const [allSubjects, setAllSubjects] = useState<SubjectConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEnrollments = useCallback(async () => {
    if (!currentUser?.user_id) {
      setEnrolledSubjects([]);
      setAllSubjects([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch both enrolled subjects and all active subjects in parallel
      const [enrolled, all] = await Promise.all([
        subjectConfigService.getUserEnrollments(currentUser.user_id),
        subjectConfigService.getAllActiveSubjects()
      ]);
      
      setEnrolledSubjects(enrolled);
      setAllSubjects(all);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch subjects'));
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
      // Find the subject being switched to (check both enrolled and all subjects)
      let newSubject = enrolledSubjects.find(s => s.id === subjectId);
      const isAlreadyEnrolled = !!newSubject;
      
      if (!newSubject) {
        newSubject = allSubjects.find(s => s.id === subjectId);
      }
      
      if (!newSubject) {
        throw new Error('Subject not found');
      }

      // If not enrolled, enroll first
      if (!isAlreadyEnrolled) {
        toast({
          title: 'Enrolling...',
          description: `Enrolling in ${newSubject.title}`,
        });

        const enrolled = await subjectConfigService.enrollUser(
          currentUser.user_id,
          subjectId,
          true // Set as primary during enrollment
        );

        if (!enrolled) {
          throw new Error('Failed to enroll in subject');
        }
      } else {
        // Set as primary in database if already enrolled
        const success = await subjectConfigService.setPrimarySubject(
          currentUser.user_id,
          subjectId
        );

        if (!success) {
          throw new Error('Failed to switch subject');
        }
      }

      // Clear content cache for the old subject
      if (activeSubject) {
        await contentCacheService.clearSubjectCache(activeSubject.id);
      }

      // Update active subject in context
      setActiveSubject(newSubject);

      toast({
        title: isAlreadyEnrolled ? 'Subject switched' : 'Enrolled & switched',
        description: `Now learning: ${newSubject.title}`,
      });

      // Navigate to subject landing page
      navigate(`/subject/${newSubject.subject_key}`);
    } catch (err) {
      console.error('Error switching subject:', err);
      toast({
        title: 'Error',
        description: 'Failed to switch subject. Please try again.',
        variant: 'destructive',
      });
    }
  }, [currentUser?.user_id, enrolledSubjects, allSubjects, activeSubject, setActiveSubject, toast]);

  const refreshEnrollments = useCallback(async () => {
    await fetchEnrollments();
  }, [fetchEnrollments]);

  const isEnrolled = useCallback((subjectId: string): boolean => {
    return enrolledSubjects.some(s => s.id === subjectId);
  }, [enrolledSubjects]);

  return {
    enrolledSubjects,
    allSubjects,
    isLoading,
    error,
    switchSubject,
    refreshEnrollments,
    isEnrolled,
  };
};
