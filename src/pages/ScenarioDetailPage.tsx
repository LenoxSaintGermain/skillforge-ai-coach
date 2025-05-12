import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from 'lucide-react';
import ScenarioWorkflow from '@/components/ScenarioWorkflow';
import { ScenarioService } from '@/services/ScenarioService';
import CoachChatPanel from "@/components/CoachChatPanel";

const scenarioService = new ScenarioService();

const ScenarioDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      const foundScenario = scenarioService.getScenarioById(id);
      if (foundScenario) {
        setScenario(foundScenario);
      }
      setIsLoading(false);
    }
  }, [id]);
  
  const handleComplete = () => {
    // Handle scenario completion, like saving progress
    navigate('/scenarios');
  };
  
  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center">
        <p>Loading scenario...</p>
      </div>
    );
  }
  
  if (!scenario) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Scenario Not Found</h1>
        <p className="mb-4">The scenario you're looking for could not be found.</p>
        <Button onClick={() => navigate('/scenarios')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Scenarios
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => navigate('/scenarios')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Scenarios
      </Button>
      
      <Tabs defaultValue="workflow" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="workflow" className="space-y-6">
          <ScenarioWorkflow 
            scenario={scenario} 
            onComplete={handleComplete} 
          />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <div className="bg-background border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Progress Analytics</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-1">Completion Status</h4>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">45% complete</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Time Spent</h4>
                <p className="text-2xl font-bold">27 minutes</p>
                <p className="text-sm text-muted-foreground">Out of estimated {scenario.estimatedTime}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Skills Development</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {scenario.skillsAddressed.map((skill, index) => (
                    <div key={index} className="bg-muted p-2 rounded-md">
                      <p className="text-sm font-medium">{skill}</p>
                      <div className="w-full bg-background rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-primary h-1.5 rounded-full" 
                          style={{ width: `${Math.floor(Math.random() * 60) + 20}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <CoachChatPanel initialExpanded={false} />
    </div>
  );
};

export default ScenarioDetailPage;
