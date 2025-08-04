import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MessageSquare, Target, TrendingUp, User } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ScenarioAnalyticsProps {
  scenarioId: string;
  scenario: any;
}

interface ScenarioProgressData {
  status: string;
  progress_data: any;
  score: number;
  completion_time: number;
  started_at: string;
  completed_at: string;
  feedback: string;
}

const ScenarioAnalytics = ({ scenarioId, scenario }: ScenarioAnalyticsProps) => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState<ScenarioProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.user_id && scenarioId) {
      fetchScenarioProgress();
    }
  }, [currentUser, scenarioId]);

  const fetchScenarioProgress = async () => {
    if (!currentUser?.user_id) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('user_scenario_progress')
        .select('*')
        .eq('user_id', currentUser.user_id)
        .eq('scenario_id', scenarioId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching scenario progress:', error);
        return;
      }

      setProgressData(data);
    } catch (error) {
      console.error('Error fetching scenario progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no progress data exists, show empty state
  if (!progressData) {
    return (
      <div className="bg-background border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Progress Analytics</h3>
        <div className="text-center py-8">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="text-lg font-medium mb-2">No Progress Data Yet</h4>
          <p className="text-muted-foreground mb-4">
            Start working on this scenario to see your progress analytics!
          </p>
          <Button 
            onClick={() => navigate(`/scenario/${scenarioId}?tab=workflow`)}
            className="bg-skillforge-primary hover:bg-skillforge-primary/90"
          >
            Start Scenario
          </Button>
        </div>
      </div>
    );
  }

  // Calculate completion percentage
  const completionPercentage = progressData.status === 'completed' ? 100 : 
    progressData.progress_data?.completedTasks?.length ? 
    Math.round((progressData.progress_data.completedTasks.length / (scenario.tasks?.length || 1)) * 100) : 0;

  // Format time
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const timeSpent = progressData.completion_time || 0;
  const estimatedTime = scenario.estimatedTime || '60 minutes';
  const estimatedMinutes = parseInt(estimatedTime.match(/\d+/)?.[0] || '60');

  return (
    <div className="bg-background border rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Progress Analytics</h3>
      
      <div className="space-y-6">
        {/* Completion Status */}
        <div>
          <h4 className="text-sm font-medium mb-3">Completion Status</h4>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-300" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>{completionPercentage}% complete</span>
            <span className={`font-medium ${progressData.status === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
              {progressData.status === 'completed' ? 'Completed' : 
               progressData.status === 'in_progress' ? 'In Progress' : 'Not Started'}
            </span>
          </div>
        </div>

        {/* Time and Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                <h4 className="font-medium">Time Spent</h4>
              </div>
              <p className="text-2xl font-bold">{formatTime(timeSpent)}</p>
              <p className="text-sm text-muted-foreground">
                Target: {estimatedTime}
                {timeSpent > 0 && (
                  <span className={`ml-2 ${timeSpent <= estimatedMinutes ? 'text-green-600' : 'text-orange-600'}`}>
                    ({timeSpent <= estimatedMinutes ? 'On track' : 'Over target'})
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-secondary">
            <CardContent className="p-4">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 mr-2 text-secondary" />
                <h4 className="font-medium">Performance Score</h4>
              </div>
              <p className="text-2xl font-bold">
                {progressData.score || 0}%
              </p>
              <p className="text-sm text-muted-foreground">
                {progressData.score >= 80 ? 'Excellent' : 
                 progressData.score >= 60 ? 'Good' : 
                 progressData.score >= 40 ? 'Fair' : 'Needs Improvement'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-md p-4">
            <div className="flex items-center mb-2">
              <Calendar className="h-5 w-5 mr-2 text-skillforge-secondary" />
              <h4 className="font-medium">Started</h4>
            </div>
            <p className="text-lg">
              {progressData.started_at 
                ? new Date(progressData.started_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Not started'
              }
            </p>
          </div>
          
          <div className="border rounded-md p-4">
            <div className="flex items-center mb-2">
              <Calendar className="h-5 w-5 mr-2 text-skillforge-secondary" />
              <h4 className="font-medium">Completed</h4>
            </div>
            <p className="text-lg">
              {progressData.completed_at
                ? new Date(progressData.completed_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'In Progress'
              }
            </p>
          </div>
        </div>

        {/* Task Progress */}
        {scenario.tasks && (
          <div>
            <h4 className="text-sm font-medium mb-3">Task Progress</h4>
            <div className="space-y-3">
              {scenario.tasks.map((task: any, index: number) => {
                const isCompleted = progressData.progress_data?.completedTasks?.includes(task.id || `task-${index}`);
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <span className={`text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {task.description}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Skills Development */}
        {scenario.skillsAddressed && (
          <div>
            <h4 className="text-sm font-medium mb-3">Skills Developed</h4>
            <div className="flex flex-wrap gap-2">
              {scenario.skillsAddressed.map((skill: string, index: number) => (
                <span 
                  key={index} 
                  className={`text-xs px-3 py-1 rounded-full ${
                    progressData.status === 'completed' 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-skillforge-light text-skillforge-dark border border-skillforge-light'
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* User Feedback */}
        {progressData.feedback && (
          <div>
            <h4 className="text-sm font-medium mb-2">Your Feedback</h4>
            <div className="bg-muted p-4 rounded-md border-l-4 border-l-primary">
              <p className="text-sm italic">"{progressData.feedback}"</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t">
          {progressData.status === 'completed' ? (
            <div className="flex justify-center">
              <Button 
                className="bg-skillforge-primary hover:bg-skillforge-primary/90"
                onClick={() => navigate('/scenarios')}
              >
                Explore More Scenarios
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button 
                onClick={() => navigate(`/scenario/${scenarioId}?tab=workflow`)}
                className="bg-skillforge-secondary hover:bg-skillforge-secondary/90"
              >
                {progressData.status === 'in_progress' ? 'Continue Scenario' : 'Start Scenario'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioAnalytics;