
import ScenarioGenerator from "@/components/ScenarioGenerator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ScenarioGeneratorPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => navigate('/scenarios')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Scenarios
      </Button>
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">AI Learning Scenario Generator</h1>
        <p className="text-muted-foreground mt-2">
          Create personalized AI learning experiences tailored to your role and industry
        </p>
      </div>
      
      <ScenarioGenerator />
    </div>
  );
};

export default ScenarioGeneratorPage;
