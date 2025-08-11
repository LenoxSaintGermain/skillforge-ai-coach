import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, MessageCircle, RefreshCw } from "lucide-react";
import { useAI } from "@/contexts/AIContext";
import { SyllabusPhase } from "@/models/Syllabus";
import { User } from "@/contexts/UserContext";
import { toast } from "sonner";
import "@/styles/llm-curriculum.css";

interface InteractiveCurriculumCanvasProps {
  phase: SyllabusPhase;
  onClose: () => void;
}

interface InteractionData {
  id: string;
  type: string;
  value?: string;
  timestamp: Date;
  phaseContext: number;
}

interface CurriculumContext {
  currentPhase: number;
  interactionHistory: InteractionData[];
  userPreferences: {
    visualStyle: 'diagram' | 'flowchart' | 'mindmap';
    complexity: 'beginner' | 'intermediate' | 'advanced';
    focus: string[];
  };
  learningPath: string[];
}

const InteractiveCurriculumCanvas: React.FC<InteractiveCurriculumCanvasProps> = ({ 
  phase, 
  onClose 
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const isInitializing = useRef(false);
  const { coachService } = useAI();
  
  const [llmContent, setLlmContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coachMessage, setCoachMessage] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isCoachOpen, setIsCoachOpen] = useState(true);
  
  const [curriculumContext, setCurriculumContext] = useState<CurriculumContext>({
    currentPhase: phase.id,
    interactionHistory: [],
    userPreferences: {
      visualStyle: 'diagram',
      complexity: 'intermediate',
      focus: ['concepts', 'practical']
    },
    learningPath: []
  });

  // System prompt for curriculum-specific AI generation
  const buildSystemPrompt = useCallback((phase: SyllabusPhase): string => {
    return `**Role:**
You are "Jarvis", an expert AI Curriculum Visualizer and Interactive Learning Coach. Your mission is to create engaging, visual learning experiences for ${phase.title}.

**User Context:**
- **Current Phase:** ${phase.title} (Phase ${phase.id})
- **Learning Objective:** ${phase.objective}
- **User Preferences:** Visual learner seeking interactive, concept-driven content
- **Complexity Level:** Intermediate (adaptable based on interaction patterns)

**Instructions:**
1. **Interactive HTML Output:** Your entire response MUST be ONLY HTML content (no markdown, no explanations)
2. **Styling Contract:** Use ONLY these predefined CSS classes:
   - llm-container: Main content wrapper (ALWAYS use as root)
   - llm-title, llm-subtitle: Headings (h1, h2, h3 with these classes)
   - llm-text: Body text paragraphs
   - llm-concept: Individual concept cards (use with div)
   - llm-concept-grid: Grid container for concepts
   - llm-button: Interactive buttons (use with button tag)
   - llm-input, llm-textarea: Form inputs for user responses
   - llm-code: Code examples and syntax highlighting
   - llm-connection: Visual connection lines between elements
   - llm-highlight: Important highlighted information boxes
   - llm-task: Practical task sections
   - llm-progress: Progress indicators
   - llm-interactive: Hover-enabled elements
   - llm-flow-container, llm-flow-node: Flow diagrams
   - llm-mindmap: Mind map visualizations
   - llm-timeline: Timeline components
   - llm-architecture: Architecture diagrams

3. **Interactivity Rules (CRITICAL):**
   - ALL clickable elements MUST have data-interaction-id attribute
   - Format: "phase-${phase.id}-[element-type]-[unique-id]"
   - For form inputs: Add data-value-from="input_id" to buttons that collect input
   - Examples: "phase-1-concept-genai", "phase-2-quiz-submit", "phase-3-input-response"

4. **Dynamic Response Patterns:**
   - Create quizzes with input fields and submit buttons
   - Include exploration paths that branch based on user interest
   - Add progressive disclosure (click to reveal more details)
   - Use data-value-from for collecting user input before processing

5. **User Experience Guidelines:**
   - Start with overview, then allow drilling down into specifics
   - Create clear visual hierarchies with proper heading structure
   - Include interactive elements that respond to user exploration patterns
   - Show relationships between concepts visually using connections

**EXAMPLE STRUCTURES:**

Basic Layout:
<div class="llm-container">
  <h1 class="llm-title" data-interaction-id="phase-X-title-main">Phase Title</h1>
  <div class="llm-highlight">
    <p class="llm-text"><strong>Objective:</strong> Phase objective here</p>
  </div>
  <div class="llm-concept-grid">
    <div class="llm-concept llm-interactive" data-interaction-id="phase-X-concept-1">
      <h3>Concept Title</h3>
      <p class="llm-text">Description here</p>
      <button class="llm-button" data-interaction-id="phase-X-explore-1">Explore</button>
    </div>
  </div>
</div>

Interactive Quiz Pattern:
<div class="llm-task">
  <h3 class="llm-subtitle">Quick Check</h3>
  <p class="llm-text">What is your understanding of this concept?</p>
  <textarea id="user-response" class="llm-textarea" placeholder="Share your thoughts..."></textarea>
  <button class="llm-button" data-interaction-id="phase-X-quiz-submit" data-value-from="user-response">
    Submit Response
  </button>
</div>

Current Phase: ${phase.title}
Objective: ${phase.objective}
Key Concepts: ${phase.keyConceptsAndActivities.map(concept => concept.title).join(', ')}

Generate an engaging, interactive visualization using the exact CSS classes above.`;
  }, []);

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

    event.preventDefault();

    let interactionValue: string | undefined;

    // Check if we need to get a value from another element (e.g., a form input)
    if (targetElement.dataset.valueFrom) {
      const inputElement = document.getElementById(
        targetElement.dataset.valueFrom,
      ) as HTMLInputElement | HTMLTextAreaElement;
      if (inputElement) {
        interactionValue = inputElement.value;
      }
    }

    const interactionData: InteractionData = {
      id: targetElement.dataset.interactionId,
      type: targetElement.dataset.interactionType || 'generic_click',
      value: interactionValue || targetElement.textContent || '',
      timestamp: new Date(),
      phaseContext: phase.id
    };

    // Add to interaction history
    setCurriculumContext(prev => ({
      ...prev,
      interactionHistory: [...prev.interactionHistory.slice(-10), interactionData]
    }));

    // Send interaction to AI for response
    setIsLoading(true);
    try {
      const contextPrompt = buildInteractionPrompt(interactionData, curriculumContext);
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
    }
  }, [phase.id, curriculumContext]);

  // Build contextual prompt for interactions
  const buildInteractionPrompt = useCallback((
    interaction: InteractionData, 
    context: CurriculumContext
  ): string => {
    const recentInteractions = context.interactionHistory.slice(-3)
      .map(h => `${h.type}: ${h.id} (${h.value})`)
      .join(', ');

    return `${buildSystemPrompt(phase)}

INTERACTION CONTEXT:
- User clicked: ${interaction.id}
- Element type: ${interaction.type}
- Content: ${interaction.value}
- Recent interactions: ${recentInteractions}

USER PREFERENCES:
- Visual Style: ${context.userPreferences.visualStyle}
- Complexity: ${context.userPreferences.complexity}
- Focus Areas: ${context.userPreferences.focus.join(', ')}

RESPONSE REQUIREMENTS:
1. Generate updated HTML content that responds to the user's click
2. If they clicked a concept, provide detailed explanation with examples
3. If they clicked a task, show step-by-step guidance
4. If they clicked a connection, reveal related concepts
5. Include new interactive elements with unique data-interaction-id attributes
6. Maintain visual consistency with the existing design

Generate the updated interactive visualization:`;
  }, [phase, buildSystemPrompt]);

  // Call Gemini API for HTML generation
  const callGeminiForGeneration = useCallback(async (prompt: string): Promise<string> => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('gemini-api', {
        body: {
          prompt,
          systemPrompt: buildSystemPrompt(phase),
          temperature: 0.7,
          maxTokens: 2000
        }
      });

      if (error) {
        throw new Error(`API error: ${error.message}`);
      }

      return data?.generatedText || '';
    } catch (error) {
      console.error('Gemini API call failed:', error);
      return generateFallbackContent();
    }
  }, [phase, buildSystemPrompt]);

  // Generate fallback content when API fails
  const generateFallbackContent = useCallback((): string => {
    return `
      <div class="llm-container">
        <h1 class="llm-title" data-interaction-id="phase-${phase.id}-title-main">${phase.title}</h1>
        
        <div class="llm-highlight">
          <p><strong>Objective:</strong> ${phase.objective}</p>
        </div>
        
        <div class="llm-concept-grid">
          ${phase.keyConceptsAndActivities.map((concept, index) => `
            <div class="llm-concept" data-interaction-id="phase-${phase.id}-concept-${index}">
              <h3>${concept.title}</h3>
              <p>${concept.description}</p>
              <button class="llm-button" data-interaction-id="phase-${phase.id}-explore-${index}">
                Explore This Concept
              </button>
            </div>
          `).join('')}
        </div>

        <div class="llm-connection"></div>

        <div class="llm-task" data-interaction-id="phase-${phase.id}-task-main">
          <h3>Core Practical Task</h3>
          <p><strong>Description:</strong> ${phase.corePracticalTask.description}</p>
          <p><strong>Details:</strong> ${phase.corePracticalTask.taskDetails}</p>
          <button class="llm-button" data-interaction-id="phase-${phase.id}-start-task">
            Start This Task
          </button>
        </div>

        <div class="llm-connection"></div>
        
        <div style="text-align: center; margin-top: 2rem;">
          <button class="llm-button" data-interaction-id="phase-${phase.id}-coach-help">
            Ask AI Coach for Help
          </button>
        </div>
      </div>
    `;
  }, [phase]);

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

  // Initialize the canvas with AI-generated content
  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    const initializeCanvas = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // For now, always use the styled fallback content to ensure styling works
        console.log('Loading beautifully styled curriculum content...');
        const fallbackContent = generateFallbackContent();
        setLlmContent(fallbackContent);
        executeInlineScripts(fallbackContent);
        
        toast.success('Interactive curriculum loaded with beautiful styling!');
      } catch (error) {
        console.error('Initialization failed:', error);
        setError('Failed to load interactive content');
        // Always use fallback on error
        const fallbackContent = generateFallbackContent();
        setLlmContent(fallbackContent);
      } finally {
        setIsLoading(false);
        isInitializing.current = false;
      }
    };

    initializeCanvas();
  }, [phase, buildSystemPrompt, callGeminiForGeneration, generateFallbackContent]);

  // Set up click event listener for the content area
  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    contentElement.addEventListener('click', handleContentClick);
    
    return () => {
      contentElement.removeEventListener('click', handleContentClick);
    };
  }, [handleContentClick]);

  // Handle coach interactions
  const handleCoachInteraction = useCallback(async () => {
    if (!userInput.trim()) return;

    const currentInput = userInput;
    setUserInput('');
    setCoachMessage('Coach is analyzing your question...');

    try {
      const response = await coachService.getResponse(
        `${currentInput} [Context: User is exploring ${phase.title}. Recent interactions: ${curriculumContext.interactionHistory.slice(-3).map(h => h.id).join(', ')}]`
      );
      setCoachMessage(response);
    } catch (error) {
      console.error('Coach interaction failed:', error);
      setCoachMessage('I\'m having trouble responding right now. Try rephrasing your question!');
      setUserInput(currentInput);
    }
  }, [userInput, coachService, phase.title, curriculumContext.interactionHistory]);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    const refreshedContent = await callGeminiForGeneration(buildSystemPrompt(phase));
    setLlmContent(refreshedContent);
    executeInlineScripts(refreshedContent);
    setIsLoading(false);
    toast.success('Content refreshed!');
  }, [callGeminiForGeneration, buildSystemPrompt, phase]);

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
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <Card className="p-2 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </Card>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="absolute top-4 right-4 z-10" 
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* AI-Generated Interactive Content */}
        <div 
          ref={contentRef}
          className="p-8 min-h-full"
          dangerouslySetInnerHTML={{ __html: llmContent }}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Generating interactive content...</p>
            </div>
          </div>
        )}

        {/* Coach Panel */}
        {isCoachOpen && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <Card className="p-4 max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground mb-3 whitespace-pre-wrap break-words">
                    {coachMessage || 'Hello! I\'m here to help you explore this curriculum. Click on any element above or ask me questions!'}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCoachInteraction()}
                      placeholder="Ask about this phase..."
                      className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleCoachInteraction} 
                      disabled={!userInput.trim()}
                    >
                      Send
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsCoachOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Coach Toggle Button */}
        {!isCoachOpen && (
          <Button 
            variant="default" 
            size="sm" 
            className="absolute bottom-4 right-4 z-10" 
            onClick={() => setIsCoachOpen(true)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Coach
          </Button>
        )}
      </div>
    </div>
  );
};

export default InteractiveCurriculumCanvas;