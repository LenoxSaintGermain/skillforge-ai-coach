
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { geminiSyllabus } from '@/data/GeminiSyllabus';
import { useAI } from '@/contexts/AIContext';
import { SyllabusPhase } from '@/models/Syllabus';
import { Brain, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import InteractiveCurriculumCanvas from './InteractiveCurriculumCanvas';

import { contentCacheService } from '@/services/ContentCacheService';

const PhaseCard = ({ 
  phase, 
  isActive, 
  isCompleted,
  onSelect 
}: { 
  phase: SyllabusPhase; 
  isActive: boolean;
  isCompleted: boolean;
  onSelect: () => void;
}) => {
  const taskProgress = isCompleted ? 100 : 0;
  const cardVariant = isCompleted ? 'border-green-500' : isActive ? 'border-skillforge-primary' : 'hover:border-skillforge-primary/50';

  return (
    <Card className={`transition-all ${cardVariant} ${isCompleted ? 'shadow-lg' : isActive ? 'shadow-md' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant={isCompleted ? "success" : isActive ? "default" : "outline"} className="mb-2">
            {isCompleted ? "Completed" : `Phase ${phase.id}`}
          </Badge>
          {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
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
          <Progress value={taskProgress} className={`h-1 ${isCompleted ? 'text-green-500' : ''}`} />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant={isCompleted ? "secondary" : isActive ? "default" : "outline"}
          className="w-full"
          onClick={onSelect}
        >
          {isCompleted ? 'View Completed' : isActive ? 'Current Phase' : 'Select Phase'}
        </Button>
      </CardFooter>
    </Card>
  );
};

const SyllabusExplorer = ({ onLearningModeChange }: { onLearningModeChange?: (isLearning: boolean) => void }) => {
  const { coachService, isServiceReady, error } = useAI();
  const [currentPhaseId, setCurrentPhaseId] = useState(1);
  const [isLearningMode, setIsLearningMode] = useState(false);
  const [currentPhaseId, setCurrentPhaseId] = useState(1);
  const [isLearningMode, setIsLearningMode] = useState(false);
  const [exploredPhases, setExploredPhases] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchExploredPhases = async () => {
      const phases = await contentCacheService.getExploredPhases();
      setExploredPhases(new Set(phases));
    };
    fetchExploredPhases();
  }, []);

  const handlePhaseSelect = (phaseId: number) => {
    console.log(`📚 Selecting phase ${phaseId}`);
    setCurrentPhaseId(phaseId);
    console.log(`✅ Phase ${phaseId} selected`);
  };
  
  const currentPhase = geminiSyllabus.phases.find(phase => phase.id === currentPhaseId) || geminiSyllabus.phases[0];

  if (isLearningMode && currentPhase) {
    return (
      <InteractiveCurriculumCanvas 
        phase={currentPhase} 
        onBackToSyllabus={() => {
          setIsLearningMode(false);
          onLearningModeChange?.(false);
        }} 
      />
    );
  }

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
            isCompleted={exploredPhases.has(phase.id)}
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
                    setIsLearningMode(true);
                    onLearningModeChange?.(true);
                  }}
                  disabled={!isServiceReady}
                >
                  <span>{isServiceReady ? 'Start Learning' : 'Initializing...'}</span>
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
                    console.log('🎯 Getting task guidance...');
                  }}
                  disabled={!isServiceReady}
                >
                  <span>{isServiceReady ? 'Get Task Guidance' : 'Initializing...'}</span>
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
