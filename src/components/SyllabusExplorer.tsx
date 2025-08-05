
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { geminiSyllabus } from '@/data/GeminiSyllabus';
import { useAI } from '@/contexts/AIContext';
import { SyllabusPhase } from '@/models/Syllabus';
import { Brain, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';

const PhaseCard = ({ 
  phase, 
  isActive, 
  completedTasks,
  onSelect 
}: { 
  phase: SyllabusPhase; 
  isActive: boolean;
  completedTasks: number[];
  onSelect: () => void;
}) => {
  const taskProgress = completedTasks.length > 0 ? 
    (completedTasks.filter(id => Math.floor(id / 100) === phase.id).length / phase.keyConceptsAndActivities.length) * 100 : 0;

  return (
    <Card className={`transition-all ${isActive ? 'border-skillforge-primary shadow-md' : 'hover:border-skillforge-primary/50'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant={isActive ? "default" : "outline"} className="mb-2">
            Phase {phase.id}
          </Badge>
          {taskProgress === 100 && <CheckCircle className="h-5 w-5 text-green-500" />}
        </div>
        <CardTitle>{phase.title}</CardTitle>
        <CardDescription className="line-clamp-2">{phase.objective}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(taskProgress)}%</span>
          </div>
          <Progress value={taskProgress} className="h-1" />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant={isActive ? "default" : "outline"} 
          className="w-full"
          onClick={onSelect}
        >
          {isActive ? 'Current Phase' : 'Select Phase'}
        </Button>
      </CardFooter>
    </Card>
  );
};

const SyllabusExplorer = () => {
  const { jarvisCoachService, setActiveCoach, isServiceReady, error } = useAI();
  const [currentPhaseId, setCurrentPhaseId] = useState(1);
  const [userProgress, setUserProgress] = useState(() => {
    try {
      return jarvisCoachService.getProgress();
    } catch (error) {
      console.error('Error getting user progress:', error);
      return {
        currentPhase: 1,
        completedTasks: [],
        lastInteraction: new Date(),
        phaseProgress: {
          1: { percentComplete: 0, conceptsUnderstanding: 0, practicalExercisesCompleted: 0 },
          2: { percentComplete: 0, conceptsUnderstanding: 0, practicalExercisesCompleted: 0 },
          3: { percentComplete: 0, conceptsUnderstanding: 0, practicalExercisesCompleted: 0 },
          4: { percentComplete: 0, conceptsUnderstanding: 0, practicalExercisesCompleted: 0 },
          5: { percentComplete: 0, conceptsUnderstanding: 0, practicalExercisesCompleted: 0 }
        }
      };
    }
  });
  
  const handlePhaseSelect = (phaseId: number) => {
    console.log(`📚 Selecting phase ${phaseId}`);
    
    try {
      setCurrentPhaseId(phaseId);
      
      if (isServiceReady) {
        jarvisCoachService.updateProgress(phaseId);
        setUserProgress(jarvisCoachService.getProgress());
      }
      
      setActiveCoach('jarvis');
      console.log(`✅ Phase ${phaseId} selected and coach activated`);
      
    } catch (error) {
      console.error('Error selecting phase:', error);
      // Still switch to Jarvis even if progress update fails
      setActiveCoach('jarvis');
    }
  };
  
  const currentPhase = geminiSyllabus.phases.find(phase => phase.id === currentPhaseId) || geminiSyllabus.phases[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-6 w-6 text-skillforge-primary" />
        <h2 className="text-2xl font-bold">Gemini Training Syllabus</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{geminiSyllabus.title}</CardTitle>
          <CardDescription>{geminiSyllabus.overallGoal}</CardDescription>
          
          {error && (
            <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Some AI features may have limited functionality: {error}
              </p>
            </div>
          )}
          
          {!isServiceReady && (
            <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                🤖 Initializing AI services...
              </p>
            </div>
          )}
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {geminiSyllabus.phases.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            isActive={currentPhaseId === phase.id}
            completedTasks={userProgress.completedTasks}
            onSelect={() => handlePhaseSelect(phase.id)}
          />
        ))}
      </div>
      
      <div className="mt-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="concepts">Key Concepts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Phase {currentPhase.id}</Badge>
                  <h3 className="text-lg font-semibold">{currentPhase.title}</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Objective</h4>
                    <p className="text-muted-foreground">{currentPhase.objective}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => {
                    console.log('🚀 Starting learning with Jarvis...');
                    setActiveCoach('jarvis');
                  }}
                  disabled={!isServiceReady}
                >
                  <span>{isServiceReady ? 'Start Learning with Jarvis' : 'Initializing...'}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Core Practical Task</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="font-medium">{currentPhase.corePracticalTask.description}</p>
                  <p className="text-muted-foreground">{currentPhase.corePracticalTask.taskDetails}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => {
                    console.log('🎯 Getting task guidance from Jarvis...');
                    setActiveCoach('jarvis');
                  }}
                  disabled={!isServiceReady}
                >
                  <span>{isServiceReady ? 'Get Task Guidance from Jarvis' : 'Initializing...'}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="concepts" className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Key Concepts & Activities</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {currentPhase.keyConceptsAndActivities.map((concept, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-skillforge-secondary" />
                        <h4 className="font-medium">{concept.title}</h4>
                      </div>
                      <p className="text-muted-foreground pl-6">{concept.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SyllabusExplorer;
