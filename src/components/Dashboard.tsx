
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ScenarioGenerator from "./ScenarioGenerator";
import { useUser } from "@/contexts/UserContext";
import { Brain, Target, BookOpen, Trophy, ArrowRight, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const RecommendationCard = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => {
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
        <Button variant="outline" size="sm" className="w-full">
          <span>Explore</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const { currentUser } = useUser();
  
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
          <span className="font-medium ml-1">{currentUser.aiKnowledgeLevel}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-t-4 border-skillforge-secondary">
          <CardHeader>
            <CardTitle className="text-xl">Your Learning Progress</CardTitle>
            <CardDescription>Track your skills development</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentUser.learningGoals?.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-sm font-medium">{goal.skillArea}</div>
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
              title="Prompt Engineering" 
              description="Learn advanced techniques to craft effective prompts for AI models."
              icon={<Brain className="h-4 w-4 text-skillforge-primary" />}
            />
            
            <RecommendationCard 
              title="AI Implementation" 
              description="Explore strategies for integrating AI into product workflows."
              icon={<Target className="h-4 w-4 text-skillforge-secondary" />}
            />
          </CardContent>
        </Card>
      </div>
      
      <ScenarioGenerator />
    </div>
  );
};

export default Dashboard;
