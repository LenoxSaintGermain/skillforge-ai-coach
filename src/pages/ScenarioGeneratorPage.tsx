
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
      
      <ScenarioGenerator />
    </div>
  );
};

export default ScenarioGeneratorPage;
