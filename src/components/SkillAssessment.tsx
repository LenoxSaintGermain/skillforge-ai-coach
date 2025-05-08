
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, HelpCircle, ArrowRight, Award } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

const sampleQuestions: Question[] = [
  {
    id: '1',
    text: 'Which of the following best describes what a prompt engineer does?',
    options: [
      { id: '1a', text: 'Designs physical prompts for user interfaces', isCorrect: false },
      { id: '1b', text: 'Creates and optimizes inputs for AI models to get desired outputs', isCorrect: true },
      { id: '1c', text: 'Writes programming prompts for coding bootcamps', isCorrect: false },
      { id: '1d', text: 'Develops hardware that prompts users for input', isCorrect: false },
    ],
    explanation: 'Prompt engineers specialize in crafting inputs (prompts) that guide AI models to produce specific desired outputs. They understand how to phrase requests, provide context, and structure information to get the most effective results from AI systems.'
  },
  {
    id: '2',
    text: 'What is the main purpose of using few-shot learning in prompt design?',
    options: [
      { id: '2a', text: 'To reduce computational resources needed', isCorrect: false },
      { id: '2b', text: 'To provide the model with several examples of desired input-output pairs', isCorrect: true },
      { id: '2c', text: 'To limit the number of possible responses', isCorrect: false },
      { id: '2d', text: 'To test the model with challenging inputs', isCorrect: false },
    ],
    explanation: 'Few-shot learning in prompt design involves providing the AI model with a few examples that demonstrate the desired input-output relationship. This helps guide the model to understand the pattern you want it to follow for new inputs.'
  },
  {
    id: '3',
    text: 'Which technique involves breaking down complex tasks into simpler subtasks for AI models?',
    options: [
      { id: '3a', text: 'Model distillation', isCorrect: false },
      { id: '3b', text: 'Chain-of-thought prompting', isCorrect: true },
      { id: '3c', text: 'Transfer learning', isCorrect: false },
      { id: '3d', text: 'Token optimization', isCorrect: false },
    ],
    explanation: 'Chain-of-thought prompting is a technique where you guide the AI through a step-by-step reasoning process to solve complex problems. By breaking down the task into logical steps, you help the model arrive at better answers, especially for problems requiring multi-step reasoning.'
  },
];

const SkillAssessment = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  
  const currentQuestion = sampleQuestions[currentQuestionIndex];
  const totalQuestions = sampleQuestions.length;
  const progress = (currentQuestionIndex / totalQuestions) * 100;
  
  const handleAnswerSelect = (optionId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: optionId
    });
  };
  
  const handleNextQuestion = () => {
    setShowExplanation(false);
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setAssessmentComplete(true);
    }
  };
  
  const isAnswerCorrect = () => {
    const selectedOptionId = selectedAnswers[currentQuestion.id];
    const selectedOption = currentQuestion.options.find(option => option.id === selectedOptionId);
    return selectedOption?.isCorrect || false;
  };
  
  const getCorrectAnswers = () => {
    return Object.keys(selectedAnswers).filter(questionId => {
      const question = sampleQuestions.find(q => q.id === questionId);
      const selectedOptionId = selectedAnswers[questionId];
      const selectedOption = question?.options.find(option => option.id === selectedOptionId);
      return selectedOption?.isCorrect || false;
    }).length;
  };
  
  if (assessmentComplete) {
    const correctAnswers = getCorrectAnswers();
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    return (
      <div className="container py-8 max-w-3xl mx-auto">
        <Card className="border-t-4 border-skillforge-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
            <CardDescription>Your Prompt Engineering Skill Assessment Results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center py-6">
              <Award className="h-16 w-16 text-skillforge-primary mb-4" />
              <h2 className="text-4xl font-bold">{score}%</h2>
              <p className="text-muted-foreground">
                You got {correctAnswers} out of {totalQuestions} questions correct
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Skill Level Assessment</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Beginner</span>
                  <span className="text-sm">Intermediate</span>
                  <span className="text-sm">Advanced</span>
                  <span className="text-sm">Expert</span>
                </div>
                <div className="relative pt-4">
                  <Progress value={score} className="h-2" />
                  <div 
                    className="absolute top-0 transform -translate-x-1/2" 
                    style={{ left: `${score}%` }}
                  >
                    <div className="w-3 h-3 rounded-full bg-skillforge-primary"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 pt-4">
              <h3 className="font-semibold">Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Prompt Engineering Basics</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Strengthen your fundamental understanding of prompt design principles.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Advanced Techniques</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Learn chain-of-thought and few-shot learning techniques.
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button className="bg-skillforge-primary hover:bg-skillforge-dark">
              View Learning Path
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Prompt Engineering Skill Assessment</CardTitle>
          <CardDescription>Question {currentQuestionIndex + 1} of {totalQuestions}</CardDescription>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-medium">{currentQuestion.text}</h3>
          
          <RadioGroup
            value={selectedAnswers[currentQuestion.id]}
            onValueChange={handleAnswerSelect}
          >
            {currentQuestion.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2 py-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id}>{option.text}</Label>
              </div>
            ))}
          </RadioGroup>
          
          {showExplanation && (
            <div className={`p-4 rounded-md mt-4 ${
              isAnswerCorrect() ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start">
                {isAnswerCorrect() ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">
                    {isAnswerCorrect() ? 'Correct!' : 'Incorrect'}
                  </p>
                  <p className="text-sm mt-1">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setShowExplanation(true)}
            disabled={!selectedAnswers[currentQuestion.id] || showExplanation}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Check Answer
          </Button>
          <Button 
            onClick={handleNextQuestion}
            disabled={!selectedAnswers[currentQuestion.id]}
            className="bg-skillforge-primary hover:bg-skillforge-dark"
          >
            {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Complete Assessment'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SkillAssessment;
