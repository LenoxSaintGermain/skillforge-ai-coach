
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Scenario } from '@/services/ScenarioService';
import { ChevronRight, CheckCircle, Clock, BookOpen, Puzzle, Award } from 'lucide-react';

interface ScenarioWorkflowProps {
  scenario: Scenario;
  onComplete?: () => void;
}

const ScenarioWorkflow: React.FC<ScenarioWorkflowProps> = ({ scenario, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const steps = [
    {
      title: "Introduction",
      description: "Understand the scenario context and objectives",
      icon: <BookOpen className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Scenario Context</h3>
          <p>{scenario.context}</p>
          
          <h3 className="text-lg font-medium">Challenge</h3>
          <p>{scenario.challenge}</p>
          
          <h3 className="text-lg font-medium">Skills You'll Develop</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {scenario.skillsAddressed.map((skill, index) => (
              <span key={index} className="text-xs bg-skillforge-light text-skillforge-dark px-2 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Tasks",
      description: "Complete the required scenario tasks",
      icon: <Puzzle className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Required Tasks</h3>
          <ul className="space-y-3">
            {scenario.tasks.map((task, index) => (
              <li key={index} className="flex items-start">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary mr-2">
                  {completedSteps.includes(index) ? 
                    <CheckCircle className="h-4 w-4 text-primary" /> : 
                    <span className="text-xs font-medium">{index + 1}</span>
                  }
                </div>
                <div>
                  <p className="text-sm">{task}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-1 h-7 text-xs"
                    onClick={() => {
                      if (!completedSteps.includes(index)) {
                        setCompletedSteps(prev => [...prev, index]);
                      }
                    }}
                  >
                    {completedSteps.includes(index) ? "Completed" : "Mark as complete"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )
    },
    {
      title: "Resources",
      description: "Helpful materials and guidance",
      icon: <BookOpen className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Available Resources</h3>
          <ul className="space-y-2">
            {scenario.resources.map((resource, index) => (
              <li key={index} className="text-sm flex items-center">
                <span className="mr-2">•</span>
                <span>{resource}</span>
              </li>
            ))}
          </ul>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-2">
                Request AI Coach Help
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AI Coach Assistance</DialogTitle>
                <DialogDescription>
                  Ask your AI coach specific questions about this scenario.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p>Your AI coach can help with:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Understanding the context better</li>
                  <li>Breaking down complex tasks</li>
                  <li>Providing additional resources</li>
                  <li>Guiding you through implementation steps</li>
                </ul>
                <Button className="w-full">Open Coach Chat</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )
    },
    {
      title: "Submission",
      description: "Submit your solution and get feedback",
      icon: <Award className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Evaluation Criteria</h3>
          <ul className="space-y-2">
            {scenario.evaluationCriteria.map((criteria, index) => (
              <li key={index} className="text-sm flex items-center">
                <span className="mr-2">•</span>
                <span>{criteria}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Submit Your Solution</h3>
            <p className="text-sm text-muted-foreground">
              Submit a summary of your approach and implementation for this scenario.
              Your submission will be evaluated based on the criteria above.
            </p>
            <textarea 
              className="w-full h-32 p-2 border rounded-md" 
              placeholder="Describe your solution approach and implementation..."
            />
            
            <Button 
              className="w-full" 
              onClick={() => {
                // Here we would handle submission logic
                if (onComplete) {
                  onComplete();
                }
              }}
            >
              Submit Solution
            </Button>
          </div>
        </div>
      )
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{scenario.title}</h2>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Clock className="mr-1 h-4 w-4" />
            <span>{scenario.estimatedTime}</span>
            <span className="mx-2">•</span>
            <span>{scenario.difficultyLevel}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-background border rounded-lg p-4">
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div 
                className={`flex flex-col items-center ${currentStep === index ? 'text-primary' : 
                  completedSteps.includes(index) ? 'text-primary/70' : 'text-muted-foreground'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                  ${currentStep === index ? 'bg-primary text-white' : 
                  completedSteps.includes(index) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {step.icon}
                </div>
                <span className="text-xs mt-1">{step.title}</span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`h-px flex-1 mx-2 ${
                  completedSteps.includes(index) ? 'bg-primary/70' : 'bg-muted'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="mt-6">
          {steps[currentStep].content}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <Button
              onClick={() => {
                if (currentStep === steps.length - 1) {
                  // Final step - handle completion
                  if (onComplete) {
                    onComplete();
                  }
                } else {
                  // Move to next step
                  if (!completedSteps.includes(currentStep)) {
                    setCompletedSteps(prev => [...prev, currentStep]);
                  }
                  setCurrentStep(prev => prev + 1);
                }
              }}
            >
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioWorkflow;
