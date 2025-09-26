import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from '@/contexts/UserContext';
import { EnhancedScenarioService, EnhancedScenario, GenerationProgress, ScenarioTemplate } from '@/services/EnhancedScenarioService';
import { 
  Brain, 
  Lightbulb, 
  Clock, 
  Puzzle, 
  ArrowRight, 
  PlusCircle, 
  Search, 
  Sparkles,
  RefreshCw,
  History,
  Star,
  Target,
  Zap,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { Form, FormField, FormItem, FormControl, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useAI } from '@/contexts/AIContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

const enhancedScenarioService = new EnhancedScenarioService();

interface CustomFormValues {
  customRole: string;
  customIndustry: string;
}

const EnhancedScenarioGenerator = () => {
  const { currentUser } = useUser();
  const { coachService } = useAI();
  const navigate = useNavigate();
  
  // Generation state
  const [role, setRole] = useState(currentUser?.role || '');
  const [industry, setIndustry] = useState(currentUser?.industry || '');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  // UI state
  const [generatedScenario, setGeneratedScenario] = useState<EnhancedScenario | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const [isSearchingIndustry, setIsSearchingIndustry] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  
  // Templates and history
  const [templates, setTemplates] = useState<ScenarioTemplate[]>([]);
  const [scenarioHistory, setScenarioHistory] = useState<EnhancedScenario[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Dialog state
  const [showCustomRoleDialog, setShowCustomRoleDialog] = useState(false);
  const [showCustomIndustryDialog, setShowCustomIndustryDialog] = useState(false);

  // Forms
  const customRoleForm = useForm<CustomFormValues>({
    defaultValues: { customRole: '' }
  });
  
  const customIndustryForm = useForm<CustomFormValues>({
    defaultValues: { customIndustry: '' }
  });
  
  // Predefined options with enhanced selections
  const predefinedRoles = [
    "Software Developer", "Data Scientist", "Product Manager", "Business Analyst", 
    "Marketing Manager", "Content Creator", "Customer Success Manager", "Sales Professional",
    "HR Manager", "Operations Manager", "Consultant", "Entrepreneur", "Student", "Executive"
  ];
  
  const predefinedIndustries = [
    "Technology", "Finance & Banking", "Healthcare", "Retail & E-commerce", "Education", 
    "Manufacturing", "Media & Entertainment", "Real Estate", "Consulting", "Non-profit",
    "Automotive", "Energy", "Telecommunications", "Travel & Hospitality"
  ];

  // Load templates and history on mount
  useEffect(() => {
    loadTemplates();
    if (currentUser) {
      loadScenarioHistory();
    }
  }, [currentUser]);

  const loadTemplates = async () => {
    try {
      const templates = await enhancedScenarioService.getScenarioTemplates('scenario');
      setTemplates(templates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadScenarioHistory = async () => {
    if (!currentUser?.user_id) return;
    
    try {
      const history = await enhancedScenarioService.getUserScenarioHistory(currentUser.user_id);
      setScenarioHistory(history);
    } catch (error) {
      console.error('Error loading scenario history:', error);
    }
  };

  // Handle custom role/industry
  const handleAddCustomRole = (data: CustomFormValues) => {
    if (data.customRole) {
      setRole(data.customRole);
      setShowCustomRoleDialog(false);
      customRoleForm.reset();
    }
  };
  
  const handleAddCustomIndustry = (data: CustomFormValues) => {
    if (data.customIndustry) {
      setIndustry(data.customIndustry);
      setShowCustomIndustryDialog(false);
      customIndustryForm.reset();
    }
  };

  // AI-powered industry search
  const searchIndustryName = async (query: string) => {
    if (!query) return;
    
    setIsSearchingIndustry(true);
    
    try {
      const prompt = `List 5 specific, modern industry names related to "${query}". Include emerging sectors and niche markets. Return as comma-separated list only.`;
      const response = await coachService.getResponse(prompt);
      const industries = response.split(',').map(industry => industry.trim()).filter(Boolean);
      setSearchResults(industries.slice(0, 5));
    } catch (error) {
      console.error('Error searching for industry names:', error);
      toast.error('Failed to search for industry suggestions');
    } finally {
      setIsSearchingIndustry(false);
    }
  };

  // Enhanced scenario generation
  const handleGenerateScenario = async () => {
    if (!role || !industry) {
      toast.error('Please select both role and industry');
      return;
    }
    
    setIsGenerating(true);
    setGeneratedScenario(null);
    setGenerationProgress(null);
    
    try {
      const userProfile = {
        id: currentUser?.id || 'temp-user',
        user_id: currentUser?.user_id || 'temp-user',
        name: currentUser?.name || 'User',
        email: currentUser?.email || 'user@example.com',
        role,
        industry,
        ai_knowledge_level: currentUser?.ai_knowledge_level || 'Beginner'
      };
      
      const learningGoals = currentUser?.learning_goals || [];
      
      const scenario = await enhancedScenarioService.generateEnhancedScenario(
        userProfile,
        learningGoals,
        description,
        selectedTemplate || undefined,
        (progress) => setGenerationProgress(progress)
      );
      
      setGeneratedScenario(scenario);
      
      // Refresh history after successful generation
      if (currentUser) {
        setTimeout(loadScenarioHistory, 1000);
      }
      
      toast.success('Scenario generated successfully!', {
        description: 'Your personalized AI learning scenario is ready.'
      });
      
    } catch (error) {
      console.error('Error generating enhanced scenario:', error);
      toast.error('Failed to generate scenario', {
        description: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  const handleStartScenario = () => {
    if (generatedScenario?.id) {
      navigate(`/scenario/${generatedScenario.id}`);
    }
  };

  const regenerateScenario = () => {
    setGeneratedScenario(null);
    handleGenerateScenario();
  };

  const useFromHistory = (scenario: EnhancedScenario) => {
    setGeneratedScenario(scenario);
    setShowHistory(false);
    toast.success('Scenario loaded from history');
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Scenario Generator
          <Badge variant="secondary" className="ml-2">Enhanced with Gemini 2.0</Badge>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Create personalized, cutting-edge AI learning experiences powered by Google's latest Gemini models
        </p>
      </div>

      {/* Main Generation Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Panel - Generation Controls */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Personalization Settings
              </CardTitle>
              <CardDescription>
                Customize your learning experience based on your role and industry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Role Selection */}
                <div>
                  <Label htmlFor="role" className="flex items-center gap-2">
                    Your Role
                    {currentUser?.role && <Badge variant="outline" className="text-xs">From Profile</Badge>}
                  </Label>
                  <div className="mt-1.5">
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {predefinedRoles.map((predefinedRole) => (
                          <SelectItem key={predefinedRole} value={predefinedRole}>
                            {predefinedRole}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom-role">
                          <span className="flex items-center">
                            <PlusCircle className="mr-2 h-4 w-4" /> 
                            Add Custom Role
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Industry Selection */}
                <div>
                  <Label htmlFor="industry" className="flex items-center gap-2">
                    Your Industry
                    {currentUser?.industry && <Badge variant="outline" className="text-xs">From Profile</Badge>}
                  </Label>
                  <div className="mt-1.5">
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {predefinedIndustries.map((predefinedIndustry) => (
                          <SelectItem key={predefinedIndustry} value={predefinedIndustry}>
                            {predefinedIndustry}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom-industry">
                          <span className="flex items-center">
                            <PlusCircle className="mr-2 h-4 w-4" /> 
                            Add Custom Industry
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Learning Focus (Optional)
                </Label>
                <Textarea 
                  id="description"
                  placeholder="Describe specific AI skills, tools, or challenges you want to focus on..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1.5 h-20"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Be specific to get the most relevant and personalized scenario
                </p>
              </div>

              {/* Template Selection */}
              {templates.length > 0 && (
                <div>
                  <Label className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Scenario Template (Optional)
                  </Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Choose a template or generate from scratch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Custom Generation</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setShowHistory(true)}
                disabled={scenarioHistory.length === 0}
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                History ({scenarioHistory.length})
              </Button>
              
              <div className="flex gap-2">
                {generatedScenario && (
                  <Button 
                    variant="outline"
                    onClick={regenerateScenario}
                    disabled={isGenerating}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Regenerate
                  </Button>
                )}
                
                <Button 
                  onClick={handleGenerateScenario} 
                  disabled={!role || !industry || isGenerating}
                  className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Scenario
                      <Zap className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Generation Progress */}
          {isGenerating && generationProgress && (
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{generationProgress.message}</span>
                    <span className="text-sm text-muted-foreground">{generationProgress.progress}%</span>
                  </div>
                  <Progress value={generationProgress.progress} className="h-2" />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3" />
                    Powered by Gemini 2.0 Flash
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generated Scenario Display */}
          {generatedScenario && (
            <Card className="border-l-4 border-l-primary animate-in fade-in-50 duration-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {generatedScenario.title}
                      {generatedScenario.quality_score && generatedScenario.quality_score > 85 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          High Quality
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {generatedScenario.estimated_duration} minutes
                      </span>
                      <span className="flex items-center gap-1">
                        <Puzzle className="h-4 w-4" />
                        {generatedScenario.difficulty_level}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {generatedScenario.tasks.length} tasks
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Context</h4>
                      <p className="text-sm text-muted-foreground">{generatedScenario.context}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Challenge</h4>
                      <p className="text-sm text-muted-foreground">{generatedScenario.challenge}</p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 rounded-lg border">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        AI Tools You'll Master
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <a 
                          href="https://gemini.google.com/app/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-center"
                        >
                          🤖 Gemini AI →
                        </a>
                        <a 
                          href="https://aistudio.google.com/prompts/new_chat" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 transition-colors text-center"
                        >
                          🔬 AI Studio →
                        </a>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tasks" className="space-y-4">
                    {generatedScenario.tasks.map((task, index) => (
                      <Card key={task.id} className="border-l-2 border-l-muted">
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <Badge variant="outline" className="mt-0.5">
                                {index + 1}
                              </Badge>
                              <div className="flex-1">
                                <h5 className="font-medium text-sm">{task.description}</h5>
                                {task.evaluation_tips && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    💡 {task.evaluation_tips}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Skills You'll Develop</h4>
                      <div className="flex flex-wrap gap-2">
                        {generatedScenario.skills_addressed.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Learning Objectives</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {generatedScenario.learning_objectives.map((objective, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              
              <CardFooter>
                <Button 
                  onClick={handleStartScenario} 
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Start This Scenario
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}
          
        </div>

        {/* Right Panel - Additional Features */}
        <div className="space-y-6">
          
          {/* User Profile Summary */}
          {currentUser && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="text-xs space-y-1">
                  <div><strong>Role:</strong> {currentUser.role || 'Not set'}</div>
                  <div><strong>Industry:</strong> {currentUser.industry || 'Not set'}</div>
                  <div><strong>AI Level:</strong> {currentUser.ai_knowledge_level || 'Beginner'}</div>
                  {currentUser.learning_goals && currentUser.learning_goals.length > 0 && (
                    <div>
                      <strong>Goals:</strong>
                      <div className="mt-1 space-y-1">
                        {currentUser.learning_goals.slice(0, 2).map((goal, index) => (
                          <Badge key={index} variant="outline" className="text-xs block w-fit">
                            {goal.skill_area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span>Scenarios Generated</span>
                  <Badge variant="secondary">{scenarioHistory.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Available Templates</span>
                  <Badge variant="secondary">{templates.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>AI Model</span>
                  <Badge variant="outline" className="text-xs">Gemini 2.0</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Your Scenario History
            </DialogTitle>
            <DialogDescription>
              Previous scenarios you've generated - click to reuse
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4">
            {scenarioHistory.map((scenario) => (
              <Card key={scenario.id} className="cursor-pointer hover:bg-muted/50" onClick={() => useFromHistory(scenario)}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">{scenario.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {scenario.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{scenario.role}</Badge>
                        <Badge variant="outline" className="text-xs">{scenario.industry}</Badge>
                      </div>
                    </div>
                    {scenario.quality_score && (
                      <Badge variant="secondary" className="ml-2">
                        {scenario.quality_score}/100
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {scenarioHistory.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No scenarios generated yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Role Dialog */}
      <Dialog open={showCustomRoleDialog || role === "custom-role"} onOpenChange={(open) => {
        setShowCustomRoleDialog(open);
        if (!open && role === "custom-role") setRole("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Role</DialogTitle>
            <DialogDescription>
              Enter your specific job role or position for more personalized scenarios
            </DialogDescription>
          </DialogHeader>
          
          <Form {...customRoleForm}>
            <form onSubmit={customRoleForm.handleSubmit(handleAddCustomRole)} className="space-y-4">
              <FormField
                control={customRoleForm.control}
                name="customRole"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="e.g., AI Ethics Specialist, UX Researcher" {...field} />
                    </FormControl>
                    <FormDescription>
                      Be specific to get the most relevant scenario generation
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setShowCustomRoleDialog(false);
                  if (role === "custom-role") setRole("");
                }}>
                  Cancel
                </Button>
                <Button type="submit">Add Role</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Custom Industry Dialog */}
      <Dialog open={showCustomIndustryDialog || industry === "custom-industry"} onOpenChange={(open) => {
        setShowCustomIndustryDialog(open);
        if (!open && industry === "custom-industry") setIndustry("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Industry</DialogTitle>
            <DialogDescription>
              Enter your specific industry or search for AI-powered suggestions
            </DialogDescription>
          </DialogHeader>
          
          <Form {...customIndustryForm}>
            <form onSubmit={customIndustryForm.handleSubmit(handleAddCustomIndustry)} className="space-y-4">
              <FormField
                control={customIndustryForm.control}
                name="customIndustry"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input placeholder="e.g., Sustainable Agriculture, FinTech" {...field} />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => searchIndustryName(field.value)}
                          disabled={isSearchingIndustry || !field.value}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {isSearchingIndustry && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent" />
                  AI is finding industry suggestions...
                </div>
              )}
              
              {searchResults.length > 0 && (
                <div className="border rounded-md p-3">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Suggestions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {searchResults.map((result, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        size="sm"
                        type="button"
                        className="text-xs"
                        onClick={() => {
                          customIndustryForm.setValue('customIndustry', result);
                        }}
                      >
                        {result}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setShowCustomIndustryDialog(false);
                  if (industry === "custom-industry") setIndustry("");
                }}>
                  Cancel
                </Button>
                <Button type="submit">Add Industry</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default EnhancedScenarioGenerator;