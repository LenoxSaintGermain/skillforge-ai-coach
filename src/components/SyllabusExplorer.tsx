
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { geminiSyllabus } from '@/data/GeminiSyllabus';
import { useAI } from '@/contexts/AIContext';
import { useUser } from '@/contexts/UserContext';
import { SyllabusPhase } from '@/models/Syllabus';
import { Brain, BookOpen, CheckCircle, ArrowRight, Eye } from 'lucide-react';
import InteractiveCurriculumCanvas from './InteractiveCurriculumCanvas';
import { contentCacheService } from '@/services/ContentCacheService';
import { geminiProgressService } from '@/services/GeminiProgressService';

const PhaseCard = ({
  phase,
  isActive,
  exploredPhases,
  onSelect
}: {
  phase: SyllabusPhase;
  isActive: boolean;
  exploredPhases: Set<number>;
  onSelect: () => void;
}) => {
  const isExplored = exploredPhases.has(phase.id);
  // If a phase is explored, we consider it 100% complete for this UI.
  const taskProgress = isExplored ? 100 : 0;
  const isCompleted = isExplored;

  const cardBorderClass = isActive
    ? 'border-primary shadow-md'
    : isCompleted
      ? 'border-green-500 hover:border-green-600'
      : 'hover:border-primary/50';

  return (
    <Card className={`transition-all ${cardBorderClass}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant={isActive ? "default" : isCompleted ? "secondary" : "outline"} className="mb-2">
            {isCompleted ? "Completed" : `Phase ${phase.id}`}
          </Badge>
          {isCompleted && (
            <div title="Completed">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          )}
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
          variant={isActive ? "default" : isCompleted ? "secondary" : "outline"}
          className="w-full"
          onClick={onSelect}
        >
          {isActive ? 'Current Phase' : 'View Completed'}
        </Button>
      </CardFooter>
    </Card>
  );
};

const SyllabusExplorer = ({ onLearningModeChange }: { onLearningModeChange?: (isLearning: boolean) => void }) => {
  const { coachService, isServiceReady, error } = useAI();
  const { currentUser, isAuthenticated, hasSession, activeSubject } = useUser();
  const [currentPhaseId, setCurrentPhaseId] = useState(1);
  const [isLearningMode, setIsLearningMode] = useState(false);
  const [exploredPhases, setExploredPhases] = useState<Set<number>>(new Set());
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  // Use active subject syllabus or fallback to Gemini
  const syllabus = activeSubject ? activeSubject.syllabus_data : geminiSyllabus;
  const currentPhase = syllabus.phases.find(p => p.id === currentPhaseId);
  
  // If no phase found, default to first phase
  useEffect(() => {
    if (!currentPhase && syllabus.phases.length > 0) {
      setCurrentPhaseId(syllabus.phases[0].id);
    }
  }, [currentPhase, syllabus.phases]);

  // Load explored phases from database
  useEffect(() => {
    const loadExploredPhases = async () => {
      if (currentUser?.user_id) {
        setIsLoadingProgress(true);
        try {
          const phases = await contentCacheService.getExploredPhases(
            currentUser.user_id,
            activeSubject?.id
          );
          setExploredPhases(new Set(phases));
          
          // Also save to localStorage as backup
          localStorage.setItem('exploredPhases', JSON.stringify(phases));
        } catch (error) {
          console.error('Error loading explored phases:', error);
          // Try to load from localStorage as fallback
          const savedPhases = localStorage.getItem('exploredPhases');
          if (savedPhases) {
            setExploredPhases(new Set(JSON.parse(savedPhases)));
          }
        } finally {
          setIsLoadingProgress(false);
        }
      } else if (hasSession) {
        // If we have a session but no currentUser yet, try to load from localStorage
        const savedPhases = localStorage.getItem('exploredPhases');
        if (savedPhases) {
          setExploredPhases(new Set(JSON.parse(savedPhases)));
        }
      }
    };

    loadExploredPhases();
  }, [currentUser?.user_id, hasSession]);

  // Refresh progress when returning from learning mode
  const refreshProgress = async () => {
    if (currentUser?.user_id) {
      setIsLoadingProgress(true);
      try {
        const phases = await contentCacheService.getExploredPhases(currentUser.user_id);
        setExploredPhases(new Set(phases));
        localStorage.setItem('exploredPhases', JSON.stringify(phases));
      } catch (error) {
        console.error('Error refreshing progress:', error);
      } finally {
        setIsLoadingProgress(false);
      }
    }
  };

  
  const handlePhaseSelect = (phaseId: number) => {
    console.log(`📚 Selecting phase ${phaseId}`);
    setCurrentPhaseId(phaseId);
    console.log(`✅ Phase ${phaseId} selected`);
  };

  const handlePhaseChange = async (newPhaseId: number) => {
    if (newPhaseId >= 1 && newPhaseId <= 5) {
      setCurrentPhaseId(newPhaseId);
      // Mark previous phase as explored when navigating
      const updatedPhases = new Set([...exploredPhases, currentPhaseId]);
      setExploredPhases(updatedPhases);
      // Save to localStorage as backup
      localStorage.setItem('exploredPhases', JSON.stringify([...updatedPhases]));
      
      // Sync progress with learning goals only when authenticated
      if (currentUser?.user_id && isAuthenticated) {
        await geminiProgressService.syncProgress(currentUser.user_id);
      }
    }
  };

  const handleEnterLearningMode = async () => {
    setIsLearningMode(true);
    // Mark current phase as explored when entering learning mode
    const updatedPhases = new Set([...exploredPhases, currentPhaseId]);
    setExploredPhases(updatedPhases);
    // Save to localStorage as backup
    localStorage.setItem('exploredPhases', JSON.stringify([...updatedPhases]));
    
    // Sync progress with learning goals only when authenticated
    if (currentUser?.user_id && isAuthenticated) {
      await geminiProgressService.syncProgress(currentUser.user_id);
    }
    
    onLearningModeChange?.(true);
  };
  
  if (isLearningMode && currentPhase) {
    return (
      <InteractiveCurriculumCanvas 
        phase={currentPhase} 
          onBackToSyllabus={async () => {
            setIsLearningMode(false);
            onLearningModeChange?.(false);
            // Refresh progress and sync learning goal when returning to syllabus
            await refreshProgress();
            if (currentUser?.user_id && isAuthenticated) {
              await geminiProgressService.syncProgress(currentUser.user_id);
            }
          }}
        onPhaseChange={handlePhaseChange}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        {activeSubject?.logo_url ? (
          <img 
            src={activeSubject.logo_url} 
            alt={activeSubject.title} 
            className="h-8 w-8 object-contain"
          />
        ) : (
          <Brain className="h-6 w-6" style={{ color: activeSubject?.primary_color || 'hsl(var(--skillforge-primary))' }} />
        )}
        <h2 className="text-2xl font-bold">{activeSubject?.title || 'Learning Syllabus'}</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{syllabus.title}</CardTitle>
          <CardDescription>{syllabus.overallGoal}</CardDescription>
          
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
        {syllabus.phases.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            isActive={currentPhaseId === phase.id}
            exploredPhases={exploredPhases}
            onSelect={() => handlePhaseSelect(phase.id)}
          />
        ))}
      </div>
      
      {!currentPhase ? (
        <div className="mt-8 flex justify-center p-12">
          <p className="text-muted-foreground">Loading phase data...</p>
        </div>
      ) : (
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
                  onClick={handleEnterLearningMode}
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
                        <BookOpen className="h-4 w-4 text-secondary" />
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
      )}
    </div>
  );
};

export default SyllabusExplorer;
