import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Lightbulb, Target, Zap } from "lucide-react";

interface ScenarioIntroductionProps {
  onGetStarted: () => void;
}

const ScenarioIntroduction = ({ onGetStarted }: ScenarioIntroductionProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center text-blue-900 dark:text-blue-100">
            <Zap className="mr-2 h-6 w-6" />
            AI-Guided Learning Scenarios
          </CardTitle>
          <CardDescription className="text-blue-800 dark:text-blue-200">
            Hands-on learning experiences that teach you to use Google's AI tools effectively in your professional role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <Target className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">Real-World Challenges</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Solve actual problems from your industry using AI tools
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Lightbulb className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">Step-by-Step Guidance</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Each task includes specific prompts and instructions
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <ExternalLink className="h-5 w-5 text-purple-600 mt-1" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">Google AI Tools</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Use Gemini and AI Studio in realistic scenarios
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How It Works:</h4>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li><strong>1.</strong> Choose or generate a scenario for your role and industry</li>
              <li><strong>2.</strong> Follow the guided tasks using provided AI prompts</li>
              <li><strong>3.</strong> Practice with real Google AI tools (Gemini & AI Studio)</li>
              <li><strong>4.</strong> Get feedback and track your progress</li>
            </ol>
          </div>
          
          <div className="flex justify-center pt-4">
            <Button 
              onClick={onGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
            >
              Get Started with AI Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScenarioIntroduction;