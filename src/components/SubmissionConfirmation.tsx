
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface SubmissionConfirmationProps {
  scenarioId: string;
  onViewResults: () => void;
}

const SubmissionConfirmation: React.FC<SubmissionConfirmationProps> = ({ 
  scenarioId, 
  onViewResults 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-6 animate-fade-in">
      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="h-12 w-12 text-green-500" />
      </div>
      <h3 className="text-xl font-medium text-center mb-2">Congratulations!</h3>
      <p className="text-center mb-6 max-w-md">
        You've successfully completed this scenario and submitted your solution.
        Your progress has been recorded and skills have been updated.
      </p>
      
      <div className="w-full max-w-md space-y-3">
        <Button 
          className="w-full bg-skillforge-primary hover:bg-skillforge-primary/90"
          onClick={onViewResults}
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
  );
};

export default SubmissionConfirmation;
