import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Trophy, Target, TrendingUp, BookOpen } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface UserAnalyticsData {
  totalScenariosCompleted: number;
  totalTimeSpent: number;
  averageCompletionTime: number;
  skillProgress: Array<{
    skillName: string;
    progress: number;
    completedScenarios: number;
    type: 'scenario' | 'syllabus';
  }>;
  monthlyActivity: Array<{
    month: string;
    completed: number;
    timeSpent: number;
  }>;
  difficultyDistribution: Array<{
    level: string;
    count: number;
    percentage: number;
  }>;
  recentCompletions: Array<{
    scenarioTitle: string;
    completedAt: string;
    score: number;
  }>;
}

const UserAnalytics = () => {
  const { currentUser } = useUser();
  const [analyticsData, setAnalyticsData] = useState<UserAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.user_id) {
      fetchUserAnalytics();
    }
  }, [currentUser]);

  const fetchUserAnalytics = async () => {
    if (!currentUser?.user_id) return;

    try {
      setIsLoading(true);

      // Fetch user scenario progress data
      const { data: progressData, error: progressError } = await supabase
        .from('user_scenario_progress')
        .select(`
          *,
          scenarios!inner (
            title,
            difficulty_level,
            estimated_duration,
            scenario_data
          )
        `)
        .eq('user_id', currentUser.user_id);

      // Fetch syllabus progress data
      const { data: syllabusData, error: syllabusError } = await supabase
        .from('syllabus_progress')
        .select('*')
        .eq('user_id', currentUser.user_id);

      if (progressError) {
        console.error('Error fetching progress data:', progressError);
      }

      if (syllabusError) {
        console.error('Error fetching syllabus data:', syllabusError);
      }

      // Process the data for analytics
      const processedData = processAnalyticsData(progressData || [], syllabusData || []);
      setAnalyticsData(processedData);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processAnalyticsData = (progressData: any[], syllabusData: any[]): UserAnalyticsData => {
    const completedScenarios = progressData.filter(p => p.status === 'completed');
    
    // Total scenarios completed
    const totalScenariosCompleted = completedScenarios.length;
    
    // Total time spent (in hours)
    const totalTimeSpent = completedScenarios.reduce((total, scenario) => {
      return total + (scenario.completion_time || 0);
    }, 0) / 60; // Convert minutes to hours
    
    // Average completion time
    const averageCompletionTime = totalScenariosCompleted > 0 
      ? totalTimeSpent / totalScenariosCompleted 
      : 0;

    // Skill progress analysis - separate scenario-based and syllabus-based skills
    const scenarioSkillMap = new Map();
    completedScenarios.forEach(scenario => {
      // Try multiple sources for skills data
      const scenarioData = scenario.scenarios?.scenario_data || {};
      const skills = scenarioData.skillsAddressed 
        || scenario.scenarios?.learning_objectives 
        || scenario.scenarios?.tags 
        || [];
      
      skills.forEach((skill: string) => {
        if (!scenarioSkillMap.has(skill)) {
          scenarioSkillMap.set(skill, { count: 0, totalScore: 0, type: 'scenario' });
        }
        const current = scenarioSkillMap.get(skill);
        scenarioSkillMap.set(skill, {
          count: current.count + 1,
          totalScore: current.totalScore + (scenario.score || 0),
          type: 'scenario'
        });
      });
    });

    // Add syllabus progress as separate skill entries
    syllabusData.forEach(syllabus => {
      // Format syllabus name nicely
      const formatSyllabusName = (name: string) => {
        return name
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };
      
      const syllabusSkill = formatSyllabusName(syllabus.syllabus_name);
      scenarioSkillMap.set(syllabusSkill, { 
        count: syllabus.completed_modules?.length || 0,
        totalScore: syllabus.progress_percentage || 0,
        type: 'syllabus'
      });
    });

    const skillProgress = Array.from(scenarioSkillMap.entries()).map(([skillName, data]) => ({
      skillName,
      progress: data.type === 'syllabus' 
        ? data.totalScore 
        : Math.round(data.totalScore / data.count) || 0,
      completedScenarios: data.count,
      type: data.type
    }));

    // Monthly activity (last 6 months)
    const monthlyActivity = generateMonthlyActivity(completedScenarios);
    
    // Difficulty distribution
    const difficultyDistribution = generateDifficultyDistribution(completedScenarios);
    
    // Recent completions (last 5)
    const recentCompletions = completedScenarios
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
      .slice(0, 5)
      .map(scenario => ({
        scenarioTitle: scenario.scenarios?.title || 'Unknown Scenario',
        completedAt: scenario.completed_at,
        score: scenario.score || 0
      }));

    return {
      totalScenariosCompleted,
      totalTimeSpent: Math.round(totalTimeSpent * 10) / 10, // Round to 1 decimal
      averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
      skillProgress,
      monthlyActivity,
      difficultyDistribution,
      recentCompletions
    };
  };

  const generateMonthlyActivity = (completedScenarios: any[]) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthData = completedScenarios.filter(scenario => {
        const completedDate = new Date(scenario.completed_at);
        return completedDate >= monthStart && completedDate <= monthEnd;
      });
      
      months.push({
        month: monthName,
        completed: monthData.length,
        timeSpent: Math.round(monthData.reduce((total, s) => total + (s.completion_time || 0), 0) / 60)
      });
    }
    
    return months;
  };

  const generateDifficultyDistribution = (completedScenarios: any[]) => {
    const distribution = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    
    completedScenarios.forEach(scenario => {
      const difficulty = scenario.scenarios?.difficulty_level || 'Beginner';
      distribution[difficulty as keyof typeof distribution]++;
    });
    
    const total = completedScenarios.length;
    return Object.entries(distribution).map(([level, count]) => ({
      level,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Analytics Data Yet</h3>
          <p className="text-muted-foreground">Complete some scenarios to see your progress analytics!</p>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    completed: {
      label: "Completed",
      color: "hsl(var(--primary))",
    },
    timeSpent: {
      label: "Time Spent (hrs)",
      color: "hsl(var(--secondary))",
    },
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scenarios Completed</p>
                <p className="text-2xl font-bold">{analyticsData.totalScenariosCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-secondary mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">
                  {analyticsData.totalTimeSpent > 0 
                    ? `${analyticsData.totalTimeSpent}h` 
                    : '—'}
                </p>
                {analyticsData.totalTimeSpent === 0 && (
                  <p className="text-xs text-muted-foreground">Time tracking active</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-accent mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Completion</p>
                <p className="text-2xl font-bold">
                  {analyticsData.averageCompletionTime > 0 ? `${analyticsData.averageCompletionTime}h` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Skills Developed</p>
                <p className="text-2xl font-bold">{analyticsData.skillProgress.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Activity</CardTitle>
            <CardDescription>Scenarios completed and time spent over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={analyticsData.monthlyActivity}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="completed" fill="var(--color-completed)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Difficulty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Difficulty Distribution</CardTitle>
            <CardDescription>Breakdown of completed scenarios by difficulty level</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={analyticsData.difficultyDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ level, percentage }) => `${level}: ${percentage}%`}
                >
                  {analyticsData.difficultyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Skills Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Development Progress</CardTitle>
          <CardDescription>Your progress across different AI skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.skillProgress.length > 0 ? (
              analyticsData.skillProgress.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{skill.skillName}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium">{skill.progress}%</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {skill.type === 'syllabus' 
                          ? `(${skill.completedScenarios} modules)`
                          : `(${skill.completedScenarios} scenarios)`}
                      </span>
                    </div>
                  </div>
                  <Progress value={skill.progress} className="h-2" />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Complete scenarios or explore syllabi to track skill development
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Completions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Completions</CardTitle>
          <CardDescription>Your most recently completed scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.recentCompletions.length > 0 ? (
              analyticsData.recentCompletions.map((completion, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{completion.scenarioTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      <Calendar className="inline h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(completion.completedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-primary">{completion.score}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No completed scenarios yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAnalytics;