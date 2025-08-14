import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  Trophy, 
  Target, 
  BookOpen,
  Zap,
  Brain,
  Award
} from 'lucide-react';

interface Exercise {
  title: string;
  description: string;
  scenario: string;
  starting_prompt: string;
  success_criteria: string[];
  hints: string[];
  difficulty_level: string;
  estimated_time: string;
  learning_objectives: string[];
}

interface LearningProgress {
  id?: string;
  skill_area: string;
  current_level: string;
  experience_points: number;
  exercises_completed: number;
  best_practices_learned: string[];
  current_challenge_id?: string;
}

const PromptEngineeringWorkflow = () => {
  const { currentUser } = useUser();
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [isGeneratingExercise, setIsGeneratingExercise] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [userPrompt, setUserPrompt] = useState('');
  const [exerciseStep, setExerciseStep] = useState<'intro' | 'practice' | 'evaluation' | 'complete'>('intro');

  useEffect(() => {
    if (currentUser) {
      loadUserProgress();
    }
  }, [currentUser]);

  const loadUserProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('prompt_learning_progress')
        .select('*')
        .eq('user_id', currentUser?.user_id)
        .eq('skill_area', 'prompt_engineering')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProgress(data);
      } else {
        // Create initial progress record
        const initialProgress = {
          user_id: currentUser?.user_id,
          skill_area: 'prompt_engineering',
          current_level: 'beginner',
          experience_points: 0,
          exercises_completed: 0,
          best_practices_learned: [],
        };

        const { data: newProgress, error: insertError } = await supabase
          .from('prompt_learning_progress')
          .insert(initialProgress)
          .select()
          .single();

        if (insertError) throw insertError;
        setProgress(newProgress);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      toast.error('Failed to load learning progress');
    }
  };

  const generatePersonalizedExercise = async () => {
    setIsGeneratingExercise(true);
    try {
      const { data, error } = await supabase.functions.invoke('prompt-engineering-ai', {
        body: {
          action: 'generate_exercise',
          userLevel: progress?.current_level || 'beginner',
          context: {
            completed_exercises: completedExercises.length,
            experience_points: progress?.experience_points || 0,
            best_practices_learned: progress?.best_practices_learned || []
          }
        }
      });

      if (error) throw error;
      setCurrentExercise(data.exercise);
      setExerciseStep('practice');
      toast.success('New exercise generated!');
    } catch (error) {
      console.error('Error generating exercise:', error);
      toast.error('Failed to generate exercise');
    } finally {
      setIsGeneratingExercise(false);
    }
  };

  const completeExercise = async () => {
    if (!progress || !currentExercise) return;

    try {
      const experienceGained = getExperienceForDifficulty(currentExercise.difficulty_level);
      const newExperiencePoints = progress.experience_points + experienceGained;
      const newLevel = calculateLevel(newExperiencePoints);

      const { error } = await supabase
        .from('prompt_learning_progress')
        .update({
          experience_points: newExperiencePoints,
          exercises_completed: progress.exercises_completed + 1,
          current_level: newLevel,
          last_practice_session: new Date().toISOString(),
          best_practices_learned: [...progress.best_practices_learned, ...currentExercise.learning_objectives]
        })
        .eq('id', progress.id);

      if (error) throw error;

      setProgress({
        ...progress,
        experience_points: newExperiencePoints,
        exercises_completed: progress.exercises_completed + 1,
        current_level: newLevel,
        best_practices_learned: [...progress.best_practices_learned, ...currentExercise.learning_objectives]
      });

      setCompletedExercises([...completedExercises, currentExercise.title]);
      setExerciseStep('complete');
      
      toast.success(`Exercise completed! +${experienceGained} XP`);
      
      // Check for level up
      if (newLevel !== progress.current_level) {
        toast.success(`Level up! You're now at ${newLevel} level!`);
      }
    } catch (error) {
      console.error('Error completing exercise:', error);
      toast.error('Failed to record exercise completion');
    }
  };

  const getExperienceForDifficulty = (difficulty: string): number => {
    switch (difficulty) {
      case 'beginner': return 10;
      case 'intermediate': return 25;
      case 'advanced': return 50;
      default: return 10;
    }
  };

  const calculateLevel = (experience: number): string => {
    if (experience >= 200) return 'expert';
    if (experience >= 100) return 'advanced';
    if (experience >= 50) return 'intermediate';
    return 'beginner';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'beginner': return <Circle className="w-5 h-5" />;
      case 'intermediate': return <Target className="w-5 h-5" />;
      case 'advanced': return <Brain className="w-5 h-5" />;
      case 'expert': return <Trophy className="w-5 h-5" />;
      default: return <Circle className="w-5 h-5" />;
    }
  };

  const progressPercentage = progress ? Math.min((progress.experience_points / 200) * 100, 100) : 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prompt Engineering Mastery</h1>
          <p className="text-muted-foreground">Build your prompt engineering skills step by step</p>
        </div>
        
        {progress && (
          <Card className="w-80">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getLevelIcon(progress.current_level)}
                  <span className="font-semibold capitalize">{progress.current_level}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {progress.experience_points} XP
                </div>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{progress.exercises_completed} exercises</span>
                <span>Level {progress.current_level}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {exerciseStep === 'intro' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Your Learning Journey
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {progress && (
                <>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{progress.exercises_completed}</div>
                      <div className="text-sm text-muted-foreground">Exercises Completed</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{progress.experience_points}</div>
                      <div className="text-sm text-muted-foreground">Experience Points</div>
                    </div>
                  </div>

                  {progress.best_practices_learned.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Skills Learned</h4>
                      <div className="flex flex-wrap gap-2">
                        {progress.best_practices_learned.slice(-6).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <Button 
                onClick={generatePersonalizedExercise} 
                disabled={isGeneratingExercise}
                className="w-full"
                size="lg"
              >
                <Zap className="w-4 h-4 mr-2" />
                {isGeneratingExercise ? 'Generating Exercise...' : 'Start New Exercise'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Learning Path
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { level: 'beginner', title: 'Basic Prompt Structure', completed: (progress?.current_level !== 'beginner') },
                  { level: 'intermediate', title: 'Context & Specificity', completed: ['advanced', 'expert'].includes(progress?.current_level || '') },
                  { level: 'advanced', title: 'Complex Reasoning', completed: progress?.current_level === 'expert' },
                  { level: 'expert', title: 'Master Techniques', completed: false },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground capitalize">{item.level} Level</div>
                    </div>
                    {progress?.current_level === item.level && (
                      <Badge variant="outline">Current</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {exerciseStep === 'practice' && currentExercise && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{currentExercise.title}</CardTitle>
                <p className="text-muted-foreground mt-1">{currentExercise.description}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={getDifficultyColor(currentExercise.difficulty_level)}>
                  {currentExercise.difficulty_level}
                </Badge>
                <Badge variant="outline">{currentExercise.estimated_time}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Scenario</h4>
              <p className="text-sm">{currentExercise.scenario}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Starting Prompt</h4>
              <div className="bg-muted p-3 rounded font-mono text-sm">
                {currentExercise.starting_prompt}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Success Criteria</h4>
              <ul className="space-y-1">
                {currentExercise.success_criteria.map((criteria, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Target className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {criteria}
                  </li>
                ))}
              </ul>
            </div>

            {currentExercise.hints.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Hints</h4>
                <ul className="space-y-1">
                  {currentExercise.hints.map((hint, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-blue-500 mt-0.5">💡</span>
                      {hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={completeExercise} className="flex-1">
                <Award className="w-4 h-4 mr-2" />
                Complete Exercise
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setExerciseStep('intro')}
              >
                Back to Overview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {exerciseStep === 'complete' && currentExercise && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Exercise Complete!</h3>
                <p className="text-muted-foreground">
                  You've successfully completed "{currentExercise.title}"
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    +{getExperienceForDifficulty(currentExercise.difficulty_level)}
                  </div>
                  <div className="text-sm text-muted-foreground">XP Gained</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentExercise.learning_objectives.length}
                  </div>
                  <div className="text-sm text-muted-foreground">New Skills</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {progress?.current_level}
                  </div>
                  <div className="text-sm text-muted-foreground">Current Level</div>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={generatePersonalizedExercise} 
                  disabled={isGeneratingExercise}
                  size="lg"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Next Exercise
                </Button>
                <br />
                <Button 
                  variant="outline" 
                  onClick={() => setExerciseStep('intro')}
                >
                  Back to Overview
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PromptEngineeringWorkflow;