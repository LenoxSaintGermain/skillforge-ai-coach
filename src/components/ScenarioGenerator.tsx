
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUser } from '@/contexts/UserContext';
import { ScenarioService, Scenario } from '@/services/ScenarioService';
import { Brain, Lightbulb, Clock, Puzzle, ArrowRight } from 'lucide-react';

// Initialize the scenario service
const scenarioService = new ScenarioService();

const ScenarioGenerator = () => {
  const { currentUser } = useUser();
  const [role, setRole] = useState(currentUser?.role || '');
  const [industry, setIndustry] = useState(currentUser?.industry || '');
  const [generatedScenario, setGeneratedScenario] = useState<Scenario | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerateScenario = async () => {
    if (!role || !industry) return;
    
    setIsGenerating(true);
    setGeneratedScenario({ loading: true } as Scenario);
    
    try {
      const userProfile = {
        role,
        industry,
        aiKnowledgeLevel: currentUser?.aiKnowledgeLevel || 'Beginner'
      };
      
      const learningGoals = currentUser?.learningGoals || [];
      
      const scenario = await scenarioService.generateScenario(userProfile, learningGoals);
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
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Developer">Developer</SelectItem>
                  <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                  <SelectItem value="Product Manager">Product Manager</SelectItem>
                  <SelectItem value="Business Analyst">Business Analyst</SelectItem>
                  <SelectItem value="Marketing Specialist">Marketing Specialist</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="industry">Your Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Media">Media & Entertainment</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                    <span>{task}</span>
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
