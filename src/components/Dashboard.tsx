
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ScenarioGenerator from "./ScenarioGenerator";
import UserAnalytics from "./analytics/UserAnalytics";
import { useUser } from "@/contexts/UserContext";
import { Brain, Target, BookOpen, Trophy, ArrowRight, Award, Sparkles, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { geminiProgressService } from "@/services/GeminiProgressService";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SKILL_AREAS } from "@/constants/skillAreas";

const SkillCard = ({ skill, progress }: { skill: string; progress: number }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{skill}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardContent>
    </Card>
  );
};

const RecommendationCard = ({ title, description, icon, onClick }: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <div className="px-6 pb-4 mt-auto">
        <Button variant="outline" size="sm" className="w-full" onClick={onClick}>
          <span>Explore</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const { currentUser, isAuthenticated, hasSession, activeSubject } = useUser();
  const navigate = useNavigate();
  const [geminiProgress, setGeminiProgress] = useState<{
    progress: number;
    exploredPhases: number[];
    totalPhases: number;
    completedPhases: number;
  } | null>(null);
  const { toast } = useToast();
  
  // Load Gemini Training progress
  useEffect(() => {
    const loadGeminiProgress = async () => {
      if (currentUser?.user_id && isAuthenticated) {
        try {
          const progressInfo = await geminiProgressService.getProgressInfo(currentUser.user_id);
          setGeminiProgress(progressInfo);
          // Ensure the learning goal is synced only when fully authenticated
          await geminiProgressService.syncProgress(currentUser.user_id);
        } catch (error) {
          console.error('Error loading Gemini progress:', error);
          // Show basic progress from localStorage if available
          try {
            const savedPhases = localStorage.getItem('exploredPhases');
            if (savedPhases) {
              const phases = JSON.parse(savedPhases);
              const progress = Math.round((phases.length / 5) * 100);
              setGeminiProgress({
                progress,
                exploredPhases: phases,
                totalPhases: 5,
                completedPhases: phases.length
              });
            }
          } catch (localError) {
            console.error('Error loading local progress:', localError);
          }
        }
      } else if (hasSession && !currentUser) {
        // If we have a session but user data is still loading, show localStorage progress
        try {
          const savedPhases = localStorage.getItem('exploredPhases');
          if (savedPhases) {
            const phases = JSON.parse(savedPhases);
            const progress = Math.round((phases.length / 5) * 100);
            setGeminiProgress({
              progress,
              exploredPhases: phases,
              totalPhases: 5,
              completedPhases: phases.length
            });
          }
        } catch (error) {
          console.error('Error loading local progress during auth:', error);
        }
      }
    };

    loadGeminiProgress();
  }, [currentUser?.user_id, isAuthenticated, hasSession]);

  const handleRefreshGemini = async () => {
    if (!currentUser?.user_id) return;
    try {
      await geminiProgressService.syncProgress(currentUser.user_id);
      const progressInfo = await geminiProgressService.getProgressInfo(currentUser.user_id);
      setGeminiProgress(progressInfo);
      toast({ title: 'Progress synced', description: 'Gemini progress updated.' });
    } catch (error) {
      console.error('Failed to sync progress:', error);
      toast({ title: 'Sync failed', description: 'Please try again in a moment.', variant: 'destructive' });
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p>Please log in to view your dashboard.</p>
      </div>
    );
  }
  
  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {currentUser.name}</h1>
          <p className="text-muted-foreground">Continue your AI learning journey</p>
        </div>
        <div className="flex items-center bg-skillforge-light text-skillforge-dark px-4 py-2 rounded-lg">
          <Trophy className="h-5 w-5 mr-2" />
          <span>AI Knowledge Level: </span>
          <span className="font-medium ml-1">{currentUser.ai_knowledge_level}</span>
        </div>
      </div>
      
      {/* Active Subject Card */}
      {activeSubject && (
        <Card className="border-t-4 border-primary bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  {activeSubject.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {activeSubject.tagline || activeSubject.overall_goal}
                </CardDescription>
              </div>
              <Button 
                size="lg"
                onClick={() => navigate(`/subject/${activeSubject.subject_key}`)}
                className="gap-2"
              >
                Continue Learning
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="generator">Scenario Generator</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-t-4 border-skillforge-secondary">
              <CardHeader>
                <CardTitle className="text-xl">Your Learning Progress</CardTitle>
                <CardDescription>Track your skills development</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Gemini Training Progress */}
                  {geminiProgress && (
                    <div className="space-y-2 border rounded-lg p-3 bg-skillforge-light/10">
                      <div className="text-sm font-medium flex items-center">
                        <Sparkles className="h-4 w-4 mr-2 text-skillforge-secondary" />
                        Gemini Training Program
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          {geminiProgress.exploredPhases.length} of {geminiProgress.totalPhases} phases explored
                        </span>
                        <span className="text-xs font-medium">{geminiProgress.progress}%</span>
                      </div>
                      <Progress value={geminiProgress.progress} className="h-2" />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          {geminiProgress.progress === 100 ? 'All phases explored!' : 'In Progress'}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate('/gemini-training')}
                            className="h-6 text-xs"
                          >
                            Continue
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleRefreshGemini}
                            className="h-6 text-xs"
                          >
                            Refresh
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Regular Learning Goals */}
                  {currentUser.learning_goals?.filter(goal => goal.skill_area !== SKILL_AREAS.GEMINI_TRAINING).map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="text-sm font-medium">{goal.skill_area}</div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{goal.description}</span>
                        <span className="text-xs font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-t-4 border-skillforge-accent">
              <CardHeader>
                <CardTitle className="text-xl">Recommendations</CardTitle>
                <CardDescription>Personalized for your goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RecommendationCard 
                  title="Gemini Training Program" 
                  description="Follow a structured syllabus to learn building with Google's Gemini AI from idea to prototype."
                  icon={<Sparkles className="h-4 w-4 text-skillforge-secondary" />}
                  onClick={() => navigate('/gemini-training')}
                />
                
                <RecommendationCard 
                  title="Assess My Skills" 
                  description="Take a comprehensive assessment to evaluate your prompt engineering expertise."
                  icon={<Award className="h-4 w-4 text-skillforge-accent" />}
                  onClick={() => navigate('/assessment')}
                />
                
                <RecommendationCard 
                  title="Prompt Engineering" 
                  description="Learn advanced techniques to craft effective prompts for AI models."
                  icon={<Brain className="h-4 w-4 text-skillforge-primary" />}
                  onClick={() => navigate('/prompt-engineering')}
                />
                
                <RecommendationCard 
                  title="Learning Resources" 
                  description="Explore curated AI learning resources, tutorials, and documentation."
                  icon={<Target className="h-4 w-4 text-skillforge-secondary" />}
                  onClick={() => navigate('/resources')}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <BarChart3 className="mr-2 h-6 w-6 text-skillforge-primary" />
              Learning Analytics
            </h2>
            <p className="text-muted-foreground">Comprehensive insights into your AI learning journey</p>
          </div>
          <UserAnalytics />
        </TabsContent>
        
        <TabsContent value="generator" className="space-y-6">
          <ScenarioGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
