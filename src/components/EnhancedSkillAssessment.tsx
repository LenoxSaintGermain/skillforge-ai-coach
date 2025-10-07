import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  Brain, 
  ArrowRight, 
  Award, 
  Target, 
  TrendingUp,
  Lightbulb,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useAI } from '@/contexts/AIContext';
import { toast } from 'sonner';
import { SkillAssessmentService, AssessmentQuestion, AssessmentResult } from '@/services/SkillAssessmentService';

const EnhancedSkillAssessment = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, refreshUserData } = useUser();
  const { coachService } = useAI();

  // Assessment state with session persistence
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const saved = sessionStorage.getItem('assessment_current_index');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [questions, setQuestions] = useState<AssessmentQuestion[]>(() => {
    const saved = sessionStorage.getItem('assessment_questions');
    return saved ? JSON.parse(saved) : [];
  });
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>(() => {
    const saved = sessionStorage.getItem('assessment_answers');
    return saved ? JSON.parse(saved) : {};
  });
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [sessionId] = useState(() => Date.now().toString()); // Unique session ID
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist state to sessionStorage
  useEffect(() => {
    if (questions.length > 0) {
      sessionStorage.setItem('assessment_questions', JSON.stringify(questions));
    }
  }, [questions]);

  useEffect(() => {
    sessionStorage.setItem('assessment_answers', JSON.stringify(userAnswers));
  }, [userAnswers]);

  useEffect(() => {
    sessionStorage.setItem('assessment_current_index', currentQuestionIndex.toString());
  }, [currentQuestionIndex]);

  // Generate AI-powered assessment questions
  const generateAssessmentQuestions = useCallback(async () => {
    if (!currentUser) return;

    setIsGeneratingQuestions(true);
    setError(null);

    try {
      const userLevel = currentUser.ai_knowledge_level || 'Beginner';
      const userRole = currentUser.role || 'Professional';
      const userIndustry = currentUser.industry || 'General';

      const systemPrompt = `You are Jarvis, an AI learning coach. Generate a prompt engineering skill assessment tailored to the user.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "question": "...",
      "options": [
        {"id": "a", "text": "...", "isCorrect": false, "explanation": "..."},
        {"id": "b", "text": "...", "isCorrect": true, "explanation": "..."}
      ],
      "category": "Prompt Structure|Context Management|Output Optimization|Advanced Techniques|Real-world",
      "difficulty": "beginner|intermediate|advanced",
      "scenario": "Real-world context"
    }
  ]
}`;

      const prompt = `Create 7 prompt engineering assessment questions for:
- Level: ${userLevel}
- Role: ${userRole}
- Industry: ${userIndustry}

Requirements:
• Test: prompt structure, context, output optimization, advanced techniques, real-world scenarios
• Multiple choice with 4 options each
• One correct answer per question
• Brief explanations (2-3 sentences max)
• Practical ${userRole} scenarios
• Appropriate ${userLevel} difficulty`;

      // Use structured output for reliable JSON generation
      const response = await coachService?.callGeminiAPI(prompt, systemPrompt, 2, true);

      if (!response) {
        throw new Error('Failed to generate assessment questions');
      }

      console.log('📝 Raw assessment response:', response.substring(0, 200));

      // Parse JSON response with repair fallback
      let questionsData;
      try {
        const trimmedResponse = response.trim();
        
        // Try direct parse first
        questionsData = JSON.parse(trimmedResponse);
        
        // Validate structure
        if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
          throw new Error('Invalid questions format in response');
        }
        
        // Validate each question has required fields
        const isValid = questionsData.questions.every((q: any) => 
          q.id && q.question && Array.isArray(q.options) && q.category
        );
        
        if (!isValid) {
          throw new Error('Questions missing required fields');
        }
        
        console.log(`✅ Parsed ${questionsData.questions.length} valid questions`);
      } catch (parseError) {
        console.error('JSON parse/validation error:', parseError);
        console.error('Response received:', response.substring(0, 500));
        toast.error('Failed to generate questions. Using default assessment.');
        questionsData = getDefaultQuestions();
      }

      setQuestions(questionsData.questions);
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Failed to generate personalized questions. Using default assessment.');
      setQuestions(getDefaultQuestions().questions);
    } finally {
      setIsGeneratingQuestions(false);
    }
  }, [currentUser, coachService]);

  // Initialize assessment only if no saved session exists
  useEffect(() => {
    if (currentUser && questions.length === 0 && !assessmentComplete) {
      generateAssessmentQuestions();
    }
  }, [currentUser, assessmentComplete, generateAssessmentQuestions]);

  // Default questions fallback
  const getDefaultQuestions = () => ({
    questions: [
      {
        id: 'q1',
        question: 'What is the most important element of an effective prompt?',
        options: [
          { id: 'a', text: 'Making it as long as possible', isCorrect: false, explanation: 'Length alone doesn\'t improve prompt quality.' },
          { id: 'b', text: 'Being clear and specific about desired output', isCorrect: true, explanation: 'Clarity and specificity help AI understand exactly what you want.' },
          { id: 'c', text: 'Using technical jargon', isCorrect: false, explanation: 'Technical jargon can confuse rather than clarify.' },
          { id: 'd', text: 'Including many examples', isCorrect: false, explanation: 'Too many examples can be overwhelming and counterproductive.' }
        ],
        category: 'Prompt Structure',
        difficulty: 'beginner' as const,
        scenario: 'You need to create a prompt for generating marketing copy.'
      },
      {
        id: 'q2',
        question: 'Which technique helps AI understand the desired format and style?',
        options: [
          { id: 'a', text: 'Zero-shot prompting', isCorrect: false, explanation: 'Zero-shot provides no examples of the desired format.' },
          { id: 'b', text: 'Few-shot prompting with examples', isCorrect: true, explanation: 'Few-shot prompting shows the AI exactly what format and style you want.' },
          { id: 'c', text: 'Using shorter prompts', isCorrect: false, explanation: 'Shorter prompts may lack necessary context.' },
          { id: 'd', text: 'Repeating the same instruction', isCorrect: false, explanation: 'Repetition doesn\'t improve understanding.' }
        ],
        category: 'Advanced Techniques',
        difficulty: 'intermediate' as const
      },
      {
        id: 'q3',
        question: 'What\'s the best approach when an AI response doesn\'t meet your expectations?',
        options: [
          { id: 'a', text: 'Ask the same question again', isCorrect: false, explanation: 'Repeating the same prompt likely yields similar results.' },
          { id: 'b', text: 'Give up and try a different tool', isCorrect: false, explanation: 'The issue is often with the prompt, not the tool.' },
          { id: 'c', text: 'Refine the prompt with more specific instructions', isCorrect: true, explanation: 'Iterative refinement with clearer instructions usually improves results.' },
          { id: 'd', text: 'Use more technical language', isCorrect: false, explanation: 'Technical language doesn\'t necessarily improve clarity.' }
        ],
        category: 'Output Optimization',
        difficulty: 'intermediate' as const,
        scenario: 'You\'ve received a generic response that doesn\'t address your specific needs.'
      }
    ]
  });

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? (currentQuestionIndex / totalQuestions) * 100 : 0;

  const handleAnswerSelect = (optionId: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
    setShowExplanation(false);
  };

  const handleShowExplanation = () => {
    setShowExplanation(true);
  };

  const handleNextQuestion = async () => {
    setShowExplanation(false);
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Complete assessment
      await completeAssessment();
    }
  };

  const completeAssessment = async () => {
    setIsLoading(true);
    
    try {
      // Analyze results
      const result = SkillAssessmentService.analyzeAssessmentResults(questions, userAnswers);
      setAssessmentResult(result);
      
      // Save to database if user is authenticated
      if (isAuthenticated && currentUser) {
        await SkillAssessmentService.saveAssessmentResults(
          currentUser.user_id,
          questions,
          userAnswers,
          result
        );
        
        // Update learning progress and profile knowledge level
        await SkillAssessmentService.updateLearningProgress(currentUser.user_id, result);
        
        // Refresh user data to show updated knowledge level on dashboard
        await refreshUserData();
        
        toast.success('Assessment completed and saved!');
      }
      
      setAssessmentComplete(true);
    } catch (error) {
      console.error('Error completing assessment:', error);
      toast.error('Assessment completed but couldn\'t save results. Please try again.');
      
      // Still show results even if save failed
      const result = SkillAssessmentService.analyzeAssessmentResults(questions, userAnswers);
      setAssessmentResult(result);
      setAssessmentComplete(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    // Clear session storage
    sessionStorage.removeItem('assessment_questions');
    sessionStorage.removeItem('assessment_answers');
    sessionStorage.removeItem('assessment_current_index');
    
    // Reset state
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowExplanation(false);
    setAssessmentComplete(false);
    setAssessmentResult(null);
    setQuestions([]);
    
    // Generate new questions
    generateAssessmentQuestions();
  };

  const getSelectedOption = () => {
    const selectedId = userAnswers[currentQuestion?.id];
    return currentQuestion?.options.find(opt => opt.id === selectedId);
  };

  const isAnswerCorrect = () => {
    const selectedOption = getSelectedOption();
    return selectedOption?.isCorrect || false;
  };

  // Loading state
  if (isGeneratingQuestions) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <Card className="border-t-4 border-primary">
          <CardContent className="py-16 text-center">
            <Brain className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">Creating Your Personalized Assessment</h2>
            <p className="text-muted-foreground mb-4">
              Our AI is generating questions tailored to your background as a {currentUser?.role || 'professional'} 
              with {currentUser?.ai_knowledge_level || 'mixed'} experience level.
            </p>
            <div className="w-full max-w-xs mx-auto">
              <Progress value={66} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <Card className="border-t-4 border-destructive">
          <CardContent className="py-16 text-center">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRestart} className="bg-primary hover:bg-primary/90">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results page
  if (assessmentComplete && assessmentResult) {
    return (
      <div className="container py-8 max-w-4xl mx-auto space-y-6">
        {/* Back navigation */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Main results card */}
        <Card className="border-t-4 border-primary">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <Award className="h-20 w-20 text-primary" />
            </div>
            <CardTitle className="text-3xl">Assessment Complete!</CardTitle>
            <CardDescription className="text-lg">
              Your Comprehensive Prompt Engineering Skill Report
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Score overview */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-4 p-6 bg-primary/10 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    {Math.round((assessmentResult.score / assessmentResult.maxScore) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold capitalize">{assessmentResult.skillLevel}</div>
                  <div className="text-sm text-muted-foreground">Skill Level</div>
                </div>
              </div>
              
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {assessmentResult.score} out of {assessmentResult.maxScore} questions correct
              </Badge>
            </div>

            {/* Category breakdown */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Target className="h-5 w-5" />
                Skill Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(assessmentResult.categoryScores).map(([category, score]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{category}</span>
                      <span className="text-sm text-muted-foreground">{score.toFixed(0)}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths and improvements */}
            <div className="grid md:grid-cols-2 gap-6">
              {assessmentResult.strengths.length > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                      <TrendingUp className="h-5 w-5" />
                      Your Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {assessmentResult.strengths.map((strength, index) => (
                        <li key={index} className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {assessmentResult.improvementAreas.length > 0 && (
                <Card className="bg-orange-50 border-orange-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                      <Lightbulb className="h-5 w-5" />
                      Growth Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {assessmentResult.improvementAreas.map((area, index) => (
                        <li key={index} className="flex items-center gap-2 text-orange-600">
                          <Target className="h-4 w-4" />
                          {area}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Personalized Learning Path</h3>
              <div className="grid gap-4">
                {assessmentResult.recommendations.map((rec, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                        </div>
                        {rec.actionUrl && (
                          <Button 
                            size="sm" 
                            onClick={() => navigate(rec.actionUrl!)}
                            className="ml-4"
                          >
                            Start
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Detailed feedback */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Detailed Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {assessmentResult.detailedFeedback.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-2">{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </CardContent>

          <CardFooter className="flex justify-between pt-6">
            <Button variant="outline" onClick={handleRestart}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retake Assessment
            </Button>
            <Button onClick={() => navigate('/scenarios')} className="bg-primary hover:bg-primary/90">
              Start Learning Journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Questions not loaded yet
  if (!questions.length) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-16 text-center">
            <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading assessment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main assessment interface
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      {/* Back navigation */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/dashboard')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card className="border-t-4 border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">AI-Powered Skill Assessment</CardTitle>
              <CardDescription>
                Question {currentQuestionIndex + 1} of {totalQuestions} • {currentQuestion?.category}
              </CardDescription>
            </div>
            <Badge variant="outline" className="capitalize">
              {currentQuestion?.difficulty}
            </Badge>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Scenario context */}
          {currentQuestion?.scenario && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Scenario:</p>
                <p className="text-sm">{currentQuestion.scenario}</p>
              </CardContent>
            </Card>
          )}

          {/* Question */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium leading-relaxed">{currentQuestion?.question}</h3>
            
            <RadioGroup
              value={userAnswers[currentQuestion?.id] || ''}
              onValueChange={handleAnswerSelect}
              className="space-y-3"
            >
              {currentQuestion?.options.map((option) => (
                <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer leading-relaxed">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Explanation */}
          {showExplanation && (
            <Card className={`${
              isAnswerCorrect() ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {isAnswerCorrect() ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="space-y-2">
                    <p className="font-semibold">
                      {isAnswerCorrect() ? 'Correct!' : 'Not quite right'}
                    </p>
                    <p className="text-sm leading-relaxed">
                      {getSelectedOption()?.explanation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pt-6">
          <Button 
            variant="outline" 
            onClick={handleShowExplanation}
            disabled={!userAnswers[currentQuestion?.id] || showExplanation}
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            Show Explanation
          </Button>
          <Button 
            onClick={handleNextQuestion}
            disabled={!userAnswers[currentQuestion?.id] || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Complete Assessment'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EnhancedSkillAssessment;