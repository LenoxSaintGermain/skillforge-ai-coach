import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScenarioService, Scenario } from '@/services/ScenarioService';
import { Play, Clock, Search, Filter, ChevronRight, Puzzle } from 'lucide-react';

// Initialize the scenario service
const scenarioService = new ScenarioService();

const ScenarioCard = ({ scenario }: { scenario: Scenario }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{scenario.title}</CardTitle>
        <CardDescription className="flex items-center">
          <Clock className="mr-1 h-4 w-4" />
          <span>{scenario.estimatedTime}</span>
          <span className="mx-2">•</span>
          <span>{scenario.difficultyLevel}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{scenario.context}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {scenario.skillsAddressed.slice(0, 3).map((skill, index) => (
            <span key={index} className="text-xs bg-skillforge-light text-skillforge-dark px-2 py-1 rounded-full">
              {skill}
            </span>
          ))}
          {scenario.skillsAddressed.length > 3 && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              +{scenario.skillsAddressed.length - 3} more
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          className="w-full bg-skillforge-primary hover:bg-skillforge-dark"
          onClick={() => navigate(`/scenario/${scenario.id}`)}
        >
          <Play className="mr-2 h-4 w-4" />
          Start Scenario
        </Button>
      </CardFooter>
    </Card>
  );
};

const ScenarioExplorer = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadScenarios = async () => {
      try {
        // In a real app, this would fetch scenarios from an API
        const allScenarios = scenarioService.getScenarios();
        setScenarios(allScenarios);
      } catch (error) {
        console.error('Error loading scenarios:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadScenarios();
  }, []);
  
  // Filter scenarios based on search query
  const filteredScenarios = scenarios.filter(scenario =>
    scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scenario.context.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scenario.skillsAddressed.some(skill => 
      skill.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Puzzle className="h-6 w-6 mr-2 text-skillforge-secondary" />
            Learning Scenarios
          </h1>
          <p className="text-muted-foreground">
            Practice your AI skills with these interactive scenarios
          </p>
        </div>
        
        <div className="w-full md:w-auto flex space-x-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search scenarios..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <p>Loading scenarios...</p>
        </div>
      ) : filteredScenarios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No scenarios found matching your search.</p>
          <Button 
            variant="link" 
            onClick={() => setSearchQuery('')}
            className="mt-2"
          >
            Clear search
          </Button>
        </Card>
      )}
      
      <div className="flex justify-center pt-4">
        <Button 
          variant="outline" 
          className="flex items-center"
          onClick={() => navigate('/scenario/generate')}
        >
          Generate Custom Scenario
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ScenarioExplorer;
