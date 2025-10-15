import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { SubjectConfig, subjectConfigService } from '@/services/SubjectConfigService';
import { contentCacheService } from '@/services/ContentCacheService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, BookOpen, CheckCircle, Clock, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SubjectLandingPage = () => {
  const { subjectKey } = useParams<{ subjectKey: string }>();
  const navigate = useNavigate();
  const { currentUser, activeSubject, setActiveSubject } = useUser();
  const { toast } = useToast();
  
  const [subject, setSubject] = useState<SubjectConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exploredPhases, setExploredPhases] = useState<Set<number>>(new Set());
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    const loadSubject = async () => {
      setIsLoading(true);
      try {
        let loadedSubject: SubjectConfig | null = null;
        
        if (subjectKey) {
          // Load subject by key from URL
          loadedSubject = await subjectConfigService.getSubjectByKey(subjectKey);
        } else if (activeSubject) {
          // Use active subject if no key in URL
          loadedSubject = activeSubject;
        } else {
          // Fall back to default subject
          loadedSubject = await subjectConfigService.getDefaultSubject();
        }
        
        if (!loadedSubject) {
          toast({
            title: 'Subject not found',
            description: 'The requested subject could not be found.',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }
        
        setSubject(loadedSubject);
        
        // Load user progress if authenticated
        if (currentUser?.user_id) {
          const phases = await contentCacheService.getExploredPhases(
            currentUser.user_id,
            loadedSubject.id
          );
          setExploredPhases(new Set(phases));
        }
      } catch (error) {
        console.error('Error loading subject:', error);
        console.error('User ID:', currentUser?.user_id);
        toast({
          title: 'Error',
          description: 'Failed to load subject information.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSubject();
  }, [subjectKey, activeSubject, currentUser, navigate, toast]);

  const handleStartLearning = async () => {
    if (!subject || !currentUser?.user_id) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to start learning.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setIsEnrolling(true);
    try {
      // Enroll user if not already enrolled
      await subjectConfigService.enrollUser(currentUser.user_id, subject.id, true);
      
      // Set as active subject
      setActiveSubject(subject);
      
      toast({
        title: 'Ready to learn!',
        description: `Starting ${subject.title}`,
      });
      
      // Navigate to training page
      navigate('/gemini-training');
    } catch (error) {
      console.error('Error enrolling in subject:', error);
      toast({
        title: 'Error',
        description: 'Failed to start learning. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!subject) {
    return null;
  }

  const syllabus = subject.syllabus_data;
  if (!syllabus || !Array.isArray(syllabus.phases)) {
    console.error('Invalid syllabus data:', syllabus);
    toast({
      title: 'Error',
      description: 'Subject syllabus data is invalid.',
      variant: 'destructive',
    });
    navigate('/');
    return null;
  }
  const totalPhases = syllabus.phases.length;
  const completedPhases = exploredPhases.size;
  const progressPercentage = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;
  const isEnrolled = activeSubject?.id === subject.id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div 
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${subject.primary_color}15, ${subject.secondary_color}15)`
        }}
      >
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {subject.logo_url && (
              <div className="flex justify-center mb-6">
                <img 
                  src={subject.logo_url} 
                  alt={subject.title}
                  className="h-20 w-20 object-contain"
                />
              </div>
            )}
            
            <Badge 
              className="mb-4"
              style={{ 
                backgroundColor: `${subject.primary_color}20`,
                color: subject.primary_color,
                borderColor: subject.primary_color
              }}
            >
              {subject.tagline || 'Learning Path'}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              {subject.title}
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              {subject.hero_description || subject.overall_goal}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Button 
                size="lg"
                onClick={handleStartLearning}
                disabled={isEnrolling}
                style={{ 
                  backgroundColor: subject.primary_color,
                  color: 'white'
                }}
                className="hover:opacity-90 transition-opacity"
              >
                {isEnrolling ? 'Enrolling...' : isEnrolled ? 'Continue Learning' : 'Start Learning'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              {isEnrolled && (
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/gemini-training')}
                >
                  View Syllabus
                  <BookOpen className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
            
            {isEnrolled && currentUser && (
              <Card className="mt-8 max-w-md mx-auto">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>{completedPhases} of {totalPhases} phases completed</span>
                    <span className="font-semibold">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className="h-2"
                    style={{
                      ['--progress-background' as string]: subject.primary_color
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: `${subject.primary_color}20` }}
                >
                  <Target className="h-6 w-6" style={{ color: subject.primary_color }} />
                </div>
                <h3 className="font-semibold text-lg">{totalPhases} Phases</h3>
                <p className="text-sm text-muted-foreground">Structured learning path</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: `${subject.secondary_color}20` }}
                >
                  <BookOpen className="h-6 w-6" style={{ color: subject.secondary_color }} />
                </div>
                <h3 className="font-semibold text-lg">Hands-on Practice</h3>
                <p className="text-sm text-muted-foreground">Interactive exercises</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: `${subject.primary_color}20` }}
                >
                  <Clock className="h-6 w-6" style={{ color: subject.primary_color }} />
                </div>
                <h3 className="font-semibold text-lg">Self-Paced</h3>
                <p className="text-sm text-muted-foreground">Learn at your speed</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Syllabus Overview */}
      <div className="container mx-auto px-4 py-12 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Learning Path</h2>
          
          <div className="space-y-4">
            {syllabus.phases.map((phase, index) => {
              const isCompleted = exploredPhases.has(phase.id);
              
              return (
                <Card 
                  key={phase.id}
                  className={`transition-all ${isCompleted ? 'border-green-500' : ''}`}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div 
                        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                        style={{
                          backgroundColor: isCompleted ? '#22c55e20' : `${subject.primary_color}20`,
                          color: isCompleted ? '#22c55e' : subject.primary_color
                        }}
                      >
                        {isCompleted ? <CheckCircle className="h-6 w-6" /> : index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{phase.title}</CardTitle>
                          {isCompleted && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                              Completed
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-base">
                          {phase.objective}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-12 text-center">
            <Button 
              size="lg"
              onClick={handleStartLearning}
              disabled={isEnrolling}
              style={{ 
                backgroundColor: subject.primary_color,
                color: 'white'
              }}
              className="hover:opacity-90 transition-opacity"
            >
              {isEnrolling ? 'Enrolling...' : isEnrolled ? 'Continue Learning' : 'Start Your Journey'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectLandingPage;
