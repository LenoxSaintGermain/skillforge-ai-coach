
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUser } from '@/contexts/UserContext';
import { ScenarioService, Scenario } from '@/services/ScenarioService';
import { Brain, Lightbulb, Clock, Puzzle, ArrowRight, PlusCircle, Search } from 'lucide-react';
import { Form, FormField, FormItem, FormControl, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useAI } from '@/contexts/AIContext';

// Initialize the scenario service
const scenarioService = new ScenarioService();

// Define custom form values type
interface CustomFormValues {
  customRole: string;
  customIndustry: string;
}

const ScenarioGenerator = () => {
  const { currentUser } = useUser();
  const { aiCoachService } = useAI();
  const [role, setRole] = useState(currentUser?.role || '');
  const [industry, setIndustry] = useState(currentUser?.industry || '');
  const [description, setDescription] = useState('');
  const [generatedScenario, setGeneratedScenario] = useState<Scenario | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearchingIndustry, setIsSearchingIndustry] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  
  // Role and industry select state
  const [showCustomRoleDialog, setShowCustomRoleDialog] = useState(false);
  const [showCustomIndustryDialog, setShowCustomIndustryDialog] = useState(false);
  
  // Form for custom inputs
  const customRoleForm = useForm<CustomFormValues>({
    defaultValues: { customRole: '' }
  });
  
  const customIndustryForm = useForm<CustomFormValues>({
    defaultValues: { customIndustry: '' }
  });
  
  // Predefined roles and industries
  const predefinedRoles = [
    "Developer", "Data Scientist", "Product Manager", "Business Analyst", 
    "Marketing Specialist", "Student", "Executive"
  ];
  
  const predefinedIndustries = [
    "Technology", "Finance", "Healthcare", "Retail", "Education", 
    "Manufacturing", "Media & Entertainment"
  ];
  
  // Handle adding a custom role
  const handleAddCustomRole = (data: CustomFormValues) => {
    if (data.customRole) {
      setRole(data.customRole);
      setShowCustomRoleDialog(false);
      customRoleForm.reset();
    }
  };
  
  // Handle adding a custom industry
  const handleAddCustomIndustry = (data: CustomFormValues) => {
    if (data.customIndustry) {
      setIndustry(data.customIndustry);
      setShowCustomIndustryDialog(false);
      customIndustryForm.reset();
    }
  };
  
  // Search for industry suggestions using Gemini
  const searchIndustryName = async (query: string) => {
    if (!query) return;
    
    setIsSearchingIndustry(true);
    
    try {
      const prompt = `List 5 specific industry names related to "${query}", returned as a simple comma-separated list with no other text. Be specific and accurate.`;
      
      // Using AI coach service to get suggestions
      const response = await aiCoachService.getResponse(prompt);
      
      // Parse response and set search results
      const industries = response.split(',').map(industry => industry.trim()).filter(Boolean);
      setSearchResults(industries);
    } catch (error) {
      console.error('Error searching for industry names:', error);
    } finally {
      setIsSearchingIndustry(false);
    }
  };
  
  const handleGenerateScenario = async () => {
    if (!role || !industry) return;
    
    setIsGenerating(true);
    setGeneratedScenario({ loading: true } as Scenario);
    
    try {
      const userProfile = {
        role,
        industry,
        aiKnowledgeLevel: currentUser?.ai_knowledge_level || 'Beginner'
      };
      
      const learningGoals = currentUser?.learning_goals || [];
      
      // Pass description to the scenario generation service
      const scenario = await scenarioService.generateScenario(userProfile, learningGoals, description);
      setGeneratedScenario(scenario);
    } catch (error) {
      console.error('Error generating scenario:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-skillforge-primary" />
            Generate Personalized Learning Scenario
          </CardTitle>
          <CardDescription>
            Create a custom AI learning scenario tailored to your role and industry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="role">Your Role</Label>
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
              
              {/* Custom Role Dialog */}
              <Dialog open={showCustomRoleDialog || role === "custom-role"} onOpenChange={(open) => {
                setShowCustomRoleDialog(open);
                if (!open && role === "custom-role") setRole("");
              }}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Custom Role</DialogTitle>
                    <DialogDescription>
                      Enter your specific job role or position
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
                              <Input placeholder="e.g., AI Ethics Officer" {...field} />
                            </FormControl>
                            <FormDescription>
                              Be specific to get the most relevant scenario
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
            </div>
            
            <div>
              <Label htmlFor="industry">Your Industry</Label>
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
              
              {/* Custom Industry Dialog */}
              <Dialog open={showCustomIndustryDialog || industry === "custom-industry"} onOpenChange={(open) => {
                setShowCustomIndustryDialog(open);
                if (!open && industry === "custom-industry") setIndustry("");
              }}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Custom Industry</DialogTitle>
                    <DialogDescription>
                      Enter your specific industry or search for suggestions
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
                                <Input placeholder="e.g., Sustainable Agriculture" {...field} />
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
                        <div className="text-sm text-muted-foreground">
                          Searching for industry suggestions...
                        </div>
                      )}
                      
                      {searchResults.length > 0 && (
                        <div className="border rounded-md p-2">
                          <p className="text-sm font-medium mb-1">Suggestions:</p>
                          <div className="flex flex-wrap gap-1">
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
          </div>
          
          <div className="mt-6">
            <Label htmlFor="description">Scenario Description (optional)</Label>
            <Textarea 
              id="description"
              placeholder="Describe what you'd like to learn or the specific AI challenge you want to address..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 h-24"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Provide details to help Gemini generate a more tailored scenario for your needs
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleGenerateScenario} 
            disabled={!role || !industry || isGenerating}
            className="bg-skillforge-primary hover:bg-skillforge-dark"
          >
            {isGenerating ? "Generating..." : "Generate Scenario"}
            {!isGenerating && <Brain className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
      
      {generatedScenario && !generatedScenario.loading && (
        <Card className="border-t-4 border-t-skillforge-primary animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="text-xl">{generatedScenario.title}</CardTitle>
            <CardDescription className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              <span className="mr-3">Estimated time: {generatedScenario.estimatedTime}</span> 
              <Puzzle className="mr-1 h-4 w-4" />
              <span>Difficulty: {generatedScenario.difficultyLevel}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Context</h4>
              <p className="text-sm text-muted-foreground">{generatedScenario.context}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Challenge</h4>
              <p className="text-sm text-muted-foreground">{generatedScenario.challenge}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Key Tasks</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {generatedScenario.tasks.map((task, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{task.description}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Skills You'll Develop</h4>
              <div className="flex flex-wrap gap-2">
                {generatedScenario.skillsAddressed.map((skill, index) => (
                  <span key={index} className="text-xs bg-skillforge-light text-skillforge-dark px-2 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button className="bg-skillforge-primary hover:bg-skillforge-dark">
              Start Scenario
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default ScenarioGenerator;
