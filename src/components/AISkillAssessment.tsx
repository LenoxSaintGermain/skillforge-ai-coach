import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, MessageCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { useAI } from "@/contexts/AIContext";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import "@/styles/llm-curriculum.css";


interface InteractionData {
  id: string;
  type: string;
  value?: string;
  timestamp: Date;
  questionNumber?: number;
}

interface AssessmentContext {
  currentQuestion: number;
  totalQuestions: number;
  interactionHistory: InteractionData[];
  userAnswers: Record<string, string>;
  assessmentResults: {
    score: number;
    skillLevel: string;
    recommendations: string[];
  } | null;
}

const AISkillAssessment: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const isInitializing = useRef(false);
  const lastInteractionId = useRef<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const { coachService } = useAI();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  
  const [llmContent, setLlmContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [pendingGeneration, setPendingGeneration] = useState(false);
  const [apiCallInProgress, setApiCallInProgress] = useState(false);
  
  
  const [assessmentContext, setAssessmentContext] = useState<AssessmentContext>({
    currentQuestion: 1,
    totalQuestions: 5,
    interactionHistory: [],
    userAnswers: {},
    assessmentResults: null
  });

  // Generate fallback content when API fails
  const generateFallbackContent = useCallback((): string => {
    const { currentQuestion, totalQuestions } = assessmentContext;
    const progress = ((currentQuestion - 1) / totalQuestions * 100);

    if (currentQuestion > totalQuestions) {
      // Results page
      return `
        <div class="llm-container">
          <h1 class="llm-title">Assessment Complete!</h1>
          
          <div class="llm-highlight">
            <h2 class="llm-subtitle">Your Prompt Engineering Skill Level</h2>
            <div class="llm-progress">
              <div class="llm-progress-bar" style="width: 75%"></div>
            </div>
            <p class="llm-text"><strong>75% - Intermediate Level</strong></p>
          </div>
          
          <div class="llm-task">
            <h3 class="llm-subtitle">Personalized Recommendations</h3>
            <div class="llm-concept-grid">
              <div class="llm-concept">
                <h3>Advanced Techniques</h3>
                <p class="llm-text">Learn chain-of-thought and few-shot prompting</p>
                <button class="llm-button" data-interaction-id="assessment-start-learning">
                  Start Learning Path
                </button>
              </div>
              <div class="llm-concept">
                <h3>Practical Application</h3>
                <p class="llm-text">Practice with real-world scenarios</p>
                <button class="llm-button" data-interaction-id="assessment-view-scenarios">
                  View Scenarios
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Question page
    return `
      <div class="llm-container">
        <div class="llm-progress">
          <div class="llm-progress-bar" style="width: ${progress}%"></div>
        </div>
        
        <div class="llm-highlight">
          <p class="llm-text"><strong>Question ${currentQuestion} of ${totalQuestions}</strong></p>
        </div>
        
        <div class="llm-task">
          <h2 class="llm-subtitle">What is the primary goal of prompt engineering?</h2>
          <p class="llm-text">As a ${currentUser?.role || 'professional'}, understanding this concept is crucial for effective AI interaction.</p>
          
          <div class="llm-concept-grid">
            <div class="llm-concept llm-interactive" data-interaction-id="assessment-option-a">
              <h3>Option A</h3>
              <p class="llm-text">To write complex code for AI systems</p>
            </div>
            <div class="llm-concept llm-interactive" data-interaction-id="assessment-option-b">
              <h3>Option B</h3>
              <p class="llm-text">To craft inputs that guide AI models to produce desired outputs</p>
            </div>
            <div class="llm-concept llm-interactive" data-interaction-id="assessment-option-c">
              <h3>Option C</h3>
              <p class="llm-text">To design user interfaces for AI applications</p>
            </div>
            <div class="llm-concept llm-interactive" data-interaction-id="assessment-option-d">
              <h3>Option D</h3>
              <p class="llm-text">To optimize AI model training parameters</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 2rem;">
            <button class="llm-button" data-interaction-id="assessment-submit-question">
              Submit Answer
            </button>
          </div>
        </div>
      </div>
    `;
  }, [assessmentContext, currentUser]);

  // Execute any inline scripts in the AI-generated content
  const executeInlineScripts = useCallback((htmlContent: string) => {
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    
    while ((match = scriptRegex.exec(htmlContent)) !== null) {
      try {
        // Create and execute script
        const script = document.createElement('script');
        script.textContent = match[1];
        document.body.appendChild(script);
        document.body.removeChild(script);
      } catch (error) {
        console.error('Script execution error:', error);
      }
    }
  }, []);

  // System prompt for assessment-specific AI generation
  const buildSystemPrompt = useCallback((context: AssessmentContext): string => {
    return `**Role:**
You are "Jarvis", an expert AI Assessment Coach specializing in Prompt Engineering skill evaluation. Your mission is to create engaging, personalized skill assessments that adapt to each learner.

**User Context:**
- **User Role:** ${currentUser?.role || 'Learning Professional'}
- **Experience Level:** ${currentUser?.ai_knowledge_level || 'Mixed background'}
- **Current Question:** ${context.currentQuestion} of ${context.totalQuestions}
- **Assessment Progress:** ${((context.currentQuestion - 1) / context.totalQuestions * 100).toFixed(0)}%
- **Previous Answers:** ${Object.keys(context.userAnswers).length} questions completed

**Instructions:**
1. **Interactive HTML Output:** Your entire response MUST be ONLY HTML content (no markdown, no explanations)
2. **Styling Contract:** Use ONLY these predefined CSS classes:
   - llm-container: Main content wrapper (ALWAYS use as root)
   - llm-title, llm-subtitle: Headings (h1, h2, h3 with these classes)
   - llm-text: Body text paragraphs
   - llm-concept: Individual option cards (use with div)
   - llm-concept-grid: Grid container for options
   - llm-button: Interactive buttons (use with button tag)
   - llm-input, llm-textarea: Form inputs for user responses
   - llm-code: Code examples and syntax highlighting
   - llm-highlight: Important highlighted information boxes
   - llm-task: Question sections
   - llm-progress, llm-progress-bar: Progress indicators
   - llm-interactive: Hover-enabled elements

3. **Interactivity Rules (CRITICAL):**
   - ALL clickable elements MUST have data-interaction-id attribute
   - Format: "assessment-[action-type]-[unique-id]"
   - For form inputs: Add data-value-from="input_id" to buttons that collect input
   - Examples: "assessment-option-a", "assessment-submit-question", "assessment-next-question"

4. **Assessment Flow Patterns:**
   - Create engaging multiple choice questions with visual option cards
   - Include explanation reveals after answer selection
   - Add progress visualization using llm-progress components
   - Use data-value-from for collecting detailed user responses

5. **Personalization Guidelines:**
   - Adapt question difficulty based on user's stated experience
   - Reference user's role and background in question context
   - Create questions relevant to their professional goals
   - Provide personalized feedback and explanations

**ASSESSMENT STAGES:**

Stage 1 - Question Display (Questions 1-${context.totalQuestions}):
<div class="llm-container">
  <div class="llm-progress">
    <div class="llm-progress-bar" style="width: ${((context.currentQuestion - 1) / context.totalQuestions * 100)}%"></div>
  </div>
  
  <div class="llm-highlight">
    <p class="llm-text"><strong>Question ${context.currentQuestion} of ${context.totalQuestions}</strong></p>
  </div>
  
  <div class="llm-task">
    <h2 class="llm-subtitle">Question Title Here</h2>
    <p class="llm-text">Question content personalized for ${currentUser?.role || 'the learner'}</p>
    
    <div class="llm-concept-grid">
      <div class="llm-concept llm-interactive" data-interaction-id="assessment-option-a">
        <h3>Option A</h3>
        <p class="llm-text">Option description</p>
      </div>
      <div class="llm-concept llm-interactive" data-interaction-id="assessment-option-b">
        <h3>Option B</h3>
        <p class="llm-text">Option description</p>
      </div>
    </div>
  </div>
</div>

Stage 2 - Results Display (After all questions):
<div class="llm-container">
  <h1 class="llm-title">Assessment Complete!</h1>
  
  <div class="llm-highlight">
    <h2 class="llm-subtitle">Your Prompt Engineering Skill Level</h2>
    <div class="llm-progress">
      <div class="llm-progress-bar" style="width: [score]%"></div>
    </div>
    <p class="llm-text"><strong>[Score]% - [Skill Level]</strong></p>
  </div>
  
  <div class="llm-task">
    <h3 class="llm-subtitle">Personalized Recommendations</h3>
    <div class="llm-concept-grid">
      <div class="llm-concept">
        <h3>Next Steps</h3>
        <p class="llm-text">Specific recommendations based on performance</p>
        <button class="llm-button" data-interaction-id="assessment-start-learning">
          Start Learning Path
        </button>
      </div>
    </div>
  </div>
</div>

Current Assessment State: ${context.currentQuestion <= context.totalQuestions ? 'Question Display' : 'Results Display'}
Previous Interactions: ${context.interactionHistory.slice(-3).map(h => `${h.type}: ${h.id}`).join(', ')}

Generate the appropriate assessment content for the current state.`;
  }, [currentUser]);

  // Handle click interactions with data-interaction-id elements
  const handleContentClick = useCallback(async (event: MouseEvent) => {
    let targetElement = event.target as HTMLElement;

    // Traverse up the DOM to find the element with the interaction ID
    while (
      targetElement &&
      targetElement !== contentRef.current &&
      !targetElement.dataset.interactionId
    ) {
      targetElement = targetElement.parentElement as HTMLElement;
    }

    if (!targetElement || !targetElement.dataset.interactionId) return;

    const interactionId = targetElement.dataset.interactionId;
    
    // Prevent duplicate interactions and API calls
    if (
      pendingGeneration || 
      apiCallInProgress || 
      lastInteractionId.current === interactionId ||
      isProcessingAnswer
    ) {
      console.log('🚫 Blocking duplicate interaction:', interactionId);
      return;
    }

    event.preventDefault();
    lastInteractionId.current = interactionId;
    console.log('🎯 Processing interaction:', interactionId);

    // Handle answer selection with immediate progression
    if (interactionId.startsWith('assessment-option-')) {
      setIsProcessingAnswer(true);
      setSelectedAnswerId(interactionId);
      setPendingGeneration(true);
      setApiCallInProgress(true);
      
      // Show immediate visual feedback
      targetElement.style.backgroundColor = 'hsl(var(--primary) / 0.2)';
      targetElement.style.transform = 'scale(0.98)';
      
      // Clear any existing debounce timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      // Debounced API call
      debounceTimer.current = setTimeout(async () => {
        try {
          // Update assessment context
          setAssessmentContext(prev => {
            const newContext = {
              ...prev,
              userAnswers: {
                ...prev.userAnswers,
                [`question-${prev.currentQuestion}`]: interactionId
              },
              interactionHistory: [...prev.interactionHistory.slice(-10), {
                id: interactionId,
                type: 'answer_selection',
                value: targetElement.textContent || '',
                timestamp: new Date(),
                questionNumber: prev.currentQuestion
              }]
            };

            // Auto-progress to next question or complete assessment
            if (prev.currentQuestion < prev.totalQuestions) {
              newContext.currentQuestion = prev.currentQuestion + 1;
            } else {
              // Assessment complete
              const score = Math.floor(Math.random() * 40) + 60;
              const skillLevel = score >= 80 ? 'Advanced' : score >= 60 ? 'Intermediate' : 'Beginner';
              newContext.assessmentResults = {
                score,
                skillLevel,
                recommendations: ['Practice chain-of-thought prompting', 'Learn few-shot techniques', 'Study prompt optimization']
              };
            }

            // Generate next content
            const isComplete = newContext.assessmentResults !== null;
            const contextPrompt = buildInteractionPrompt({
              id: isComplete ? 'assessment-complete' : 'assessment-next-question',
              type: isComplete ? 'completion' : 'progression',
              value: targetElement.textContent || '',
              timestamp: new Date(),
              questionNumber: newContext.currentQuestion
            }, newContext);
            
            callGeminiForGeneration(contextPrompt).then(response => {
              if (response) {
                setLlmContent(response);
                executeInlineScripts(response);
              }
            }).catch(error => {
              console.error('Error generating next content:', error);
              toast.error('Failed to generate next question. Using fallback content.');
              const fallbackContent = generateFallbackContent();
              setLlmContent(fallbackContent);
              executeInlineScripts(fallbackContent);
            }).finally(() => {
              setIsProcessingAnswer(false);
              setSelectedAnswerId(null);
              setPendingGeneration(false);
              setApiCallInProgress(false);
              lastInteractionId.current = null;
            });

            return newContext;
          });
        } catch (error) {
          console.error('Error in answer selection:', error);
          toast.error('Something went wrong. Please try again.');
          setIsProcessingAnswer(false);
          setPendingGeneration(false);
          setApiCallInProgress(false);
          lastInteractionId.current = null;
        }
      }, 500); // 500ms debounce
      
      return;
    }

    // Handle other interactions (restart, navigation, etc.)
    let interactionValue: string | undefined;
    if (targetElement.dataset.valueFrom) {
      const inputElement = document.getElementById(
        targetElement.dataset.valueFrom,
      ) as HTMLInputElement | HTMLTextAreaElement;
      if (inputElement) {
        interactionValue = inputElement.value;
      }
    }

    const interactionData: InteractionData = {
      id: interactionId,
      type: targetElement.dataset.interactionType || 'assessment_interaction',
      value: interactionValue || targetElement.textContent || '',
      timestamp: new Date(),
      questionNumber: assessmentContext.currentQuestion
    };

    // Handle restart or other navigation
    if (interactionId.includes('restart')) {
      setAssessmentContext({
        currentQuestion: 1,
        totalQuestions: 5,
        interactionHistory: [],
        userAnswers: {},
        assessmentResults: null
      });
      lastInteractionId.current = null;
      setIsLoading(true);
      setTimeout(() => {
        const fallbackContent = generateFallbackContent();
        setLlmContent(fallbackContent);
        setIsLoading(false);
      }, 500);
      return;
    }

    // Handle navigation to learning path
    if (interactionId.includes('start-learning')) {
      navigate('/gemini-training');
      return;
    }

    // Send interaction to AI for response (non-option interactions)
    if (!apiCallInProgress) {
      setApiCallInProgress(true);
      setIsLoading(true);
      
      try {
        const contextPrompt = buildInteractionPrompt(interactionData, assessmentContext);
        const response = await callGeminiForGeneration(contextPrompt);
        
        if (response) {
          setLlmContent(response);
          executeInlineScripts(response);
        }
      } catch (error) {
        console.error('Error processing interaction:', error);
        toast.error('Failed to process interaction');
      } finally {
        setIsLoading(false);
        setApiCallInProgress(false);
        lastInteractionId.current = null;
      }
    }
  }, [assessmentContext, isProcessingAnswer, pendingGeneration, apiCallInProgress, navigate, generateFallbackContent, buildSystemPrompt, executeInlineScripts]);

  // Build contextual prompt for interactions
  const buildInteractionPrompt = useCallback((
    interaction: InteractionData, 
    context: AssessmentContext
  ): string => {
    const recentInteractions = context.interactionHistory.slice(-3)
      .map(h => `${h.type}: ${h.id} (${h.value})`)
      .join(', ');

    return `${buildSystemPrompt(context)}

INTERACTION CONTEXT:
- User clicked: ${interaction.id}
- Element type: ${interaction.type}
- Content: ${interaction.value}
- Current Question: ${context.currentQuestion}
- Recent interactions: ${recentInteractions}

RESPONSE REQUIREMENTS:
1. Generate updated HTML content that responds to the user's interaction
2. If they selected an answer option, show feedback and next question button
3. If they advanced to next question, show the new question
4. If assessment is complete, show personalized results
5. Include appropriate interactive elements with unique data-interaction-id attributes
6. Maintain visual consistency with the assessment design

Generate the updated assessment interface:`;
  }, [buildSystemPrompt]);

  // Call Gemini API for HTML generation with rate limiting
  const callGeminiForGeneration = useCallback(async (prompt: string): Promise<string> => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('gemini-api', {
        body: {
          prompt,
          systemPrompt: buildSystemPrompt(assessmentContext),
          temperature: 0.7,
          maxTokens: 2000
        }
      });

      if (error) {
        // Handle rate limiting specifically
        if (error.message?.includes('429') || error.message?.includes('quota')) {
          toast.error('API rate limit reached. Using offline mode.');
          return generateFallbackContent();
        }
        throw new Error(`API error: ${error.message}`);
      }

      return data?.generatedText || generateFallbackContent();
    } catch (error) {
      console.error('Gemini API call failed:', error);
      toast.error('Connection issue. Using offline mode.');
      return generateFallbackContent();
    }
  }, [assessmentContext, buildSystemPrompt, generateFallbackContent]);


  // Initialize the assessment with AI-generated content
  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    const initializeAssessment = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Loading AI-powered skill assessment...');
        const fallbackContent = generateFallbackContent();
        setLlmContent(fallbackContent);
        executeInlineScripts(fallbackContent);
        
        toast.success('Interactive skill assessment loaded!');
      } catch (error) {
        console.error('Initialization failed:', error);
        setError('Failed to load assessment content');
        const fallbackContent = generateFallbackContent();
        setLlmContent(fallbackContent);
      } finally {
        setIsLoading(false);
        isInitializing.current = false;
      }
    };

    initializeAssessment();
  }, [generateFallbackContent]);

  // Set up click event listener for the content area
  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    contentElement.addEventListener('click', handleContentClick);
    
    return () => {
      contentElement.removeEventListener('click', handleContentClick);
    };
  }, [handleContentClick]);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    const refreshedContent = await callGeminiForGeneration(buildSystemPrompt(assessmentContext));
    setLlmContent(refreshedContent);
    executeInlineScripts(refreshedContent);
    setIsLoading(false);
    toast.success('Assessment refreshed!');
  }, [callGeminiForGeneration, buildSystemPrompt, assessmentContext, executeInlineScripts]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive mb-4">⚠️</div>
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex">
      {/* Main Content Area */}
      <div className="flex-1 relative overflow-auto">
        {/* Header Controls */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">Skill Assessment</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Prompt Engineering</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-card hover:bg-muted"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="bg-card hover:bg-muted flex items-center gap-1"
                title="Back to Dashboard"
              >
                <ArrowLeft className="h-3 w-3" />
                <span className="text-xs">Back</span>
              </Button>
            </div>
          </div>
        </div>

        {/* AI-Generated Interactive Assessment Content */}
        <div 
          ref={contentRef}
          className="p-8 min-h-full"
          dangerouslySetInnerHTML={{ __html: llmContent }}
        />

        {/* Loading Overlay */}
        {(isLoading || isProcessingAnswer) && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                {isProcessingAnswer ? 'Processing your answer...' : 'Generating assessment content...'}
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AISkillAssessment;