import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Scenario, ScenarioService } from '@/services/ScenarioService';
import { ChevronRight, CheckCircle, Clock, BookOpen, Puzzle, Award, Star } from 'lucide-react';
import { useAI } from '@/contexts/AIContext';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { Textarea } from "@/components/ui/textarea";
import { useUser } from '@/contexts/UserContext';
import CoachChatPanel from '@/components/CoachChatPanel';

interface ScenarioWorkflowProps {
  scenario: Scenario;
  onComplete?: () => void;
}

const scenarioService = new ScenarioService();

const ScenarioWorkflow: React.FC<ScenarioWorkflowProps> = ({ scenario, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [updatedScenario, setUpdatedScenario] = useState<Scenario>(scenario);
  const [solutionText, setSolutionText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [userProgress, setUserProgress] = useState<any>(null);
  const [showCoachChat, setShowCoachChat] = useState(false);
  
  const { } = useAI();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useUser();
  
  useEffect(() => {
    const loadScenarioProgress = async () => {
      if (!currentUser || !isAuthenticated) return;
      
      try {
        // Load user progress for this scenario
        const progress = await scenarioService.getUserScenarioProgress(scenario.id, currentUser.user_id);
        setUserProgress(progress);
        
        // Initialize completed steps from progress data
        const completedTaskIds = progress?.progress_data?.completedTasks || [];
        setCompletedSteps(completedTaskIds);
        
        // Update scenario with completion status
        const updatedScenarioData = { ...scenario };
        updatedScenarioData.tasks = (updatedScenarioData.tasks || []).map(task => ({
          ...task,
          isCompleted: completedTaskIds.includes(task.id)
        }));
        
        setUpdatedScenario(updatedScenarioData);
        setIsSubmitted(progress?.status === 'completed');
      } catch (error) {
        console.error('Error loading scenario progress:', error);
        // Initialize with default values
        setCompletedSteps([]);
        setUpdatedScenario(scenario);
      }
    };
    
    loadScenarioProgress();
  }, [scenario, currentUser, isAuthenticated]);
  
  const handleMarkTaskComplete = async (taskId: string, isCompleted: boolean) => {
    if (!currentUser || !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to track your progress.",
        variant: "destructive",
      });
      return;
    }

    const newCompletedSteps = isCompleted 
      ? [...completedSteps, taskId] 
      : completedSteps.filter(id => id !== taskId);
    
    setCompletedSteps(newCompletedSteps);
    
    try {
      // Update progress in database
      await scenarioService.updateScenarioProgress(scenario.id, currentUser.user_id, newCompletedSteps);
      
      // Update local scenario state
      const refreshedScenario = { ...updatedScenario };
      (refreshedScenario.tasks || []).forEach(task => {
        task.isCompleted = newCompletedSteps.includes(task.id);
      });
      
      // Update completion stats
      const totalTasks = (refreshedScenario.tasks || []).length;
      const completedCount = newCompletedSteps.length;
      refreshedScenario.completionStats = {
        ...refreshedScenario.completionStats,
        percentComplete: Math.round((completedCount / totalTasks) * 100)
      };
      
      setUpdatedScenario(refreshedScenario);

      // Update coach context with new progress
      const { coachService } = useAI();
      if (coachService && showCoachChat) {
        coachService.updateScenarioProgress(newCompletedSteps, currentStep);
      }
      
      toast({
        title: isCompleted ? "Task completed!" : "Task marked as incomplete",
        description: "Your progress has been saved.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
      // Revert local state on error
      setCompletedSteps(isCompleted 
        ? completedSteps.filter(id => id !== taskId)
        : [...completedSteps, taskId]
      );
    }
  };
  
  const handleOpenCoachChat = () => {
    setShowCoachChat(true);
    toast({
      title: "Coach activated",
      description: "Your coach is ready to help with this scenario.",
      duration: 3000,
    });
  };
  
  const handleSubmitSolution = async () => {
    if (!currentUser || !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit your solution.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Mark all tasks as complete
      const allTaskIds = (updatedScenario.tasks || []).map(task => task.id);
      setCompletedSteps(allTaskIds);
      
      // Mark scenario as completed in database
      await scenarioService.completeScenario(scenario.id, currentUser.user_id, solutionText);
      
      setIsSubmitted(true);
      
      // Update local state
      const completedScenario = { ...updatedScenario };
      completedScenario.tasks = (completedScenario.tasks || []).map(task => ({
        ...task,
        isCompleted: true
      }));
      
      completedScenario.completionStats = {
        ...completedScenario.completionStats,
        percentComplete: 100,
        completedDate: new Date()
      };
      
      setUpdatedScenario(completedScenario);
      
      toast({
        title: "Solution submitted!",
        description: "Your work has been submitted for evaluation.",
        duration: 3000,
      });
      
      // Show feedback dialog
      setShowFeedbackDialog(true);
    } catch (error) {
      console.error('Error submitting solution:', error);
      toast({
        title: "Error",
        description: "Failed to submit solution. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleFeedbackSubmit = async () => {
    if (!currentUser || !isAuthenticated) return;

    try {
      // Save feedback to database
      await scenarioService.saveFeedback(scenario.id, currentUser.user_id, feedbackText, feedbackRating);
      
      setShowFeedbackDialog(false);
      
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
        duration: 3000,
      });
      
      // Navigate to completion view or call onComplete
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleViewResults = () => {
    // Navigate to the analytics tab on the scenario detail page
    navigate(`/scenario/${scenario.id}?tab=analytics`);
  };
  
  const steps = [
    {
      title: "Introduction",
      description: "Understand the scenario context and objectives",
      icon: <BookOpen className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Scenario Context</h3>
          <p>{updatedScenario.context}</p>
          
          <h3 className="text-lg font-medium">Challenge</h3>
          <p>{updatedScenario.challenge}</p>
          
          <h3 className="text-lg font-medium">Skills You'll Develop</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {(updatedScenario.skillsAddressed || []).map((skill, index) => (
              <span key={index} className="text-xs bg-skillforge-light text-skillforge-dark px-2 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium">Estimated Completion Time</h3>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-skillforge-primary" />
              <span>{updatedScenario.estimatedTime}</span>
            </div>
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
            {(updatedScenario.tasks || []).map((task, index) => (
              <li key={index} className="flex items-start">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary mr-2">
                  {completedSteps.includes(task.id) ? 
                    <CheckCircle className="h-4 w-4 text-primary" /> : 
                    <span className="text-xs font-medium">{index + 1}</span>
                  }
                </div>
                <div>
                  <p className="text-sm">{task.description}</p>
                  <Button 
                    variant={completedSteps.includes(task.id) ? "secondary" : "ghost"}
                    size="sm" 
                    className="mt-1 h-7 text-xs"
                    onClick={() => handleMarkTaskComplete(task.id, !completedSteps.includes(task.id))}
                  >
                    {completedSteps.includes(task.id) ? "Completed ✓" : "Mark as complete"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Progress:</strong> {updatedScenario.completionStats?.percentComplete || 0}% complete
            </p>
            <div className="w-full bg-background rounded-full h-2.5 mt-1">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${updatedScenario.completionStats?.percentComplete || 0}%` }}
              ></div>
            </div>
          </div>
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
            {(updatedScenario.resources || []).map((resource, index) => (
              <li key={index} className="text-sm flex items-center">
                <span className="mr-2">•</span>
                <span>{resource}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Need Help?</h4>
            <p className="text-sm mb-3">
              Ask your AI coach specific questions about this scenario. Your coach can provide guidance, additional resources, and help you work through challenging aspects.
            </p>
            <Button 
              className="w-full bg-skillforge-primary hover:bg-skillforge-primary/90"
              onClick={handleOpenCoachChat}
            >
              Chat with AI Coach
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              AI coach interactions so far: {updatedScenario.completionStats?.coachInteractions || 0}
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Submission",
      description: "Submit your solution and get feedback",
      icon: <Award className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          {!isSubmitted ? (
            <>
              <h3 className="text-lg font-medium">Evaluation Criteria</h3>
              <ul className="space-y-2">
                {(updatedScenario.evaluationCriteria || []).map((criteria, index) => (
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
                <Textarea 
                  className="w-full h-32 p-2 border rounded-md" 
                  placeholder="Describe your solution approach and implementation..."
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                />
                
                <Button 
                  className="w-full"
                  disabled={!solutionText.trim()}
                  onClick={handleSubmitSolution}
                >
                  Submit Solution
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-xl font-medium text-center mb-2">Congratulations!</h3>
              <p className="text-center mb-6">
                You've successfully completed this scenario and submitted your solution.
              </p>
              
              <div className="w-full max-w-md space-y-3">
                <Button 
                  className="w-full bg-skillforge-primary hover:bg-skillforge-primary/90"
                  onClick={handleViewResults}
                >
                  View Your Results
                </Button>
                
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate('/scenarios')}
                >
                  Explore More Scenarios
                </Button>
              </div>
            </div>
          )}
        </div>
      )
    }
  ];

  // Feedback dialog
  const FeedbackDialog = () => (
    <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share your feedback</DialogTitle>
          <DialogDescription>
            How was your experience with this scenario? Your feedback helps us improve.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Rating</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFeedbackRating(rating)}
                  className={`p-1 rounded-full transition-colors ${
                    feedbackRating >= rating 
                      ? 'text-yellow-400 hover:text-yellow-500' 
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="feedback" className="text-sm font-medium block mb-2">
              Comments (optional)
            </label>
            <Textarea
              id="feedback"
              placeholder="Tell us what you liked or how we can improve this scenario..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full"
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
              Skip
            </Button>
            <Button onClick={handleFeedbackSubmit}>
              Submit Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{updatedScenario.title}</h2>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Clock className="mr-1 h-4 w-4" />
            <span>{updatedScenario.estimatedTime}</span>
            <span className="mx-2">•</span>
            <span>{updatedScenario.difficultyLevel}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-background border rounded-lg p-4">
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div 
                className={`flex flex-col items-center ${currentStep === index ? 'text-primary' : 
                  completedSteps.length > 0 && index === 0 ? 'text-primary/70' : 'text-muted-foreground'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                  ${currentStep === index ? 'bg-primary text-white' : 
                  completedSteps.length > 0 && index === 0 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {step.icon}
                </div>
                <span className="text-xs mt-1">{step.title}</span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`h-px flex-1 mx-2 ${
                  index < currentStep ? 'bg-primary/70' : 'bg-muted'
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
                  // Final step - if already submitted, handle completion
                  if (isSubmitted) {
                    // Navigate to scenarios or call onComplete
                    if (onComplete) {
                      onComplete();
                    } else {
                      navigate('/scenarios');
                    }
                  } else {
                    // Otherwise highlight the submit solution button
                    toast({
                      title: "Submit your solution",
                      description: "Please submit your solution to complete this scenario.",
                      duration: 3000,
                    });
                  }
                } else {
                  // Move to next step
                  setCurrentStep(prev => prev + 1);
                }
              }}
            >
              {currentStep === steps.length - 1 ? (isSubmitted ? 'Finish' : 'Complete') : 'Next'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <FeedbackDialog />
      
      {/* Coach Chat Panel */}
      <CoachChatPanel 
        isExpanded={showCoachChat}
        scenario={updatedScenario}
        userProgress={userProgress}
      />
    </div>
  );
};

export default ScenarioWorkflow;
