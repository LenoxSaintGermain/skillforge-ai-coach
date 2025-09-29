
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from 'lucide-react';
import ScenarioWorkflow from '@/components/ScenarioWorkflow';
import ScenarioAnalytics from '@/components/analytics/ScenarioAnalytics';
import { ScenarioService } from '@/services/ScenarioService';
import { EnhancedScenarioService } from '@/services/EnhancedScenarioService';
import CoachChatPanel from "@/components/CoachChatPanel";
import { useAI } from '@/contexts/AIContext';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const scenarioService = new ScenarioService();
const enhancedScenarioService = new EnhancedScenarioService();

const ScenarioDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [scenario, setScenario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('workflow');
  const { } = useAI();
  const { toast } = useToast();
  
  useEffect(() => {
    const loadScenario = async () => {
      if (id) {
        try {
          setIsLoading(true);
          setError(null);
          
          // Validate scenario ID format
          if (!id.match(/^[a-f0-9-]{36}$/) && !id.startsWith('enhanced-')) {
            throw new Error('Invalid scenario ID format');
          }
          
          // Try to load from enhanced scenarios first, then fall back to regular scenarios
          let foundScenario = await scenarioService.getScenarioById(id);
          
          if (!foundScenario) {
            console.log('Scenario not found in regular service, checking enhanced scenarios...');
            // If not found, try loading from database directly for enhanced scenarios
            const { data, error } = await supabase
              .from('scenarios')
              .select('*')
              .eq('id', id)
              .maybeSingle();
              
            if (!error && data) {
              // Transform database scenario to component format
              const scenarioData = typeof data.scenario_data === 'string' 
                ? JSON.parse(data.scenario_data) 
                : data.scenario_data || {};
              
              foundScenario = {
                id: data.id,
                title: data.title,
                context: scenarioData.context || data.description,
                challenge: scenarioData.challenge || 'Complete the learning tasks',
                tasks: scenarioData.tasks || [],
                resources: scenarioData.resources || [],
                evaluationCriteria: scenarioData.evaluation_criteria || [],
                skillsAddressed: scenarioData.skills_addressed || data.tags || [],
                difficultyLevel: data.difficulty_level || 'Intermediate',
                estimatedTime: `${data.estimated_duration || 90} minutes`
              };
            }
          }
          
          setScenario(foundScenario || null);
        } catch (err) {
          console.error('Error loading scenario:', err);
          setError(`Failed to load scenario: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadScenario();
    
    // Check for tab query parameter
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['workflow', 'analytics', 'gemini'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [id, location]);
  
  const handleComplete = () => {
    toast({
      title: "Scenario Completed!",
      description: "Great work! You've completed this scenario.",
      duration: 5000,
    });
    // Stay on the page but switch to analytics tab
    const newUrl = `/scenario/${id}?tab=analytics`;
    navigate(newUrl);
    setActiveTab('analytics');
  };
  
  const handleActivateJarvis = () => {
    toast({
      title: "Coach Activated",
      description: "Your coach is now ready to assist you with Gemini training.",
      duration: 3000,
    });
  };
  
  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center">
        <p>Loading scenario...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Error Loading Scenario</h1>
        <p className="mb-4">{error}</p>
        <Button onClick={() => navigate('/scenarios')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Scenarios
        </Button>
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="gemini">Gemini Training</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="workflow" className="space-y-6">
          <ScenarioWorkflow 
            scenario={scenario} 
            onComplete={handleComplete} 
          />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <ScenarioAnalytics scenarioId={id} scenario={scenario} />
        </TabsContent>
        
        <TabsContent value="gemini" className="space-y-6">
          <div className="bg-background border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Gemini Training Integration</h3>
            <p className="mb-4">This scenario can help you practice building with Google's Gemini AI model. Activate Jarvis, your specialized Gemini training assistant, to guide you through the Gemini syllabus.</p>
            
            <div className="bg-skillforge-light p-4 rounded-lg mb-6">
              <h4 className="text-skillforge-dark font-medium mb-2">Your Gemini Training Coach</h4>
              <p className="text-sm text-skillforge-dark/80 mb-4">
                Your coach will guide you through the "Building with Gemini: From Idea to Prototype" syllabus, helping you understand key concepts and complete practical exercises.
              </p>
              <Button 
                className="bg-skillforge-secondary hover:bg-skillforge-secondary/90 text-white" 
                onClick={handleActivateJarvis}
              >
                Activate Coach
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Gemini Exploration</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Explore Gemini's capabilities through guided exercises and real-world applications.
                </p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center">
                    <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs mr-2">✓</span>
                    Introduction to Gemini API
                  </li>
                  <li className="flex items-center">
                    <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs mr-2">✓</span>
                    Basic prompting techniques
                  </li>
                  <li className="flex items-center">
                    <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs mr-2">-</span>
                    Advanced prompt engineering
                  </li>
                </ul>
              </div>
              
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Integration with Scenario</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Apply Gemini's capabilities directly to this learning scenario.
                </p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center">
                    <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs mr-2">✓</span>
                    Research assistance
                  </li>
                  <li className="flex items-center">
                    <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs mr-2">-</span>
                    Solution prototyping
                  </li>
                  <li className="flex items-center">
                    <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs mr-2">-</span>
                    Implementation planning
                  </li>
                </ul>
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
