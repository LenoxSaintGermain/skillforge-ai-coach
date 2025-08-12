import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, MessageCircle, RefreshCw, ArrowLeft } from "lucide-react";
import YouTubePlayer from "./YouTubePlayer";
import { useAI } from "@/contexts/AIContext";
import { SyllabusPhase } from "@/models/Syllabus";
import { useUser } from "@/contexts/UserContext";
import { syllabusProgressService } from "@/services/SyllabusProgressService";
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
  const { currentUser } = useUser();
  
  const [llmContent, setLlmContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showRetry, setShowRetry] = useState(false);
  const [coachMessage, setCoachMessage] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  
  // New state for interactive content management
  const [contentState, setContentState] = useState<'overview' | 'concept-detail'>('overview');
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [exploredConcepts, setExploredConcepts] = useState<Set<string>>(new Set());
  const [contentCache, setContentCache] = useState<Map<string, string>>(new Map());
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  
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


  // Generate fallback content when API fails - simplified without "bottom bit"
  const generateFallbackContent = useCallback((): string => {
    const conceptsWithStatus = phase.keyConceptsAndActivities.map((concept, index) => {
      const isExplored = exploredConcepts.has(concept.title);
      return `
        <div class="llm-concept ${isExplored ? 'llm-concept-explored' : ''}" data-interaction-id="phase-${phase.id}-concept-${index}">
          <h3>${concept.title} ${isExplored ? '✓' : ''}</h3>
          <p>${concept.description}</p>
          <button class="llm-button ${isExplored ? 'llm-button-secondary' : ''}" data-interaction-id="phase-${phase.id}-explore-${index}">
            ${isExplored ? 'Review Concept' : 'Explore This Concept'}
          </button>
        </div>
      `;
    }).join('');

    return `
      <div class="llm-container">
        <h1 class="llm-title" data-interaction-id="phase-${phase.id}-title-main">${phase.title}</h1>
        
        <div class="llm-highlight">
          <p><strong>Objective:</strong> ${phase.objective}</p>
          <div class="llm-progress">
            <span>Progress: ${exploredConcepts.size}/${phase.keyConceptsAndActivities.length} concepts explored</span>
            <div style="width: 100%; height: 8px; background-color: #e2e8f0; border-radius: 4px; margin-top: 8px;">
              <div style="width: ${(exploredConcepts.size / phase.keyConceptsAndActivities.length) * 100}%; height: 100%; background-color: #3b82f6; border-radius: 4px; transition: width 0.3s ease;"></div>
            </div>
          </div>
        </div>
        
        <div class="llm-concept-grid">
          ${conceptsWithStatus}
        </div>
        
        <div style="text-align: center; margin-top: 2rem;">
          <button class="llm-button" data-interaction-id="phase-${phase.id}-coach-help">
            Ask AI Coach for Help
          </button>
        </div>
      </div>
    `;
  }, [phase, exploredConcepts]);

  // Video loading state
  const [phaseVideos, setPhaseVideos] = useState<Array<{id: string, title: string, description: string}>>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosError, setVideosError] = useState<string | null>(null);

  // Load videos for current phase
  useEffect(() => {
    const loadPhaseVideos = async () => {
      setVideosLoading(true);
      setVideosError(null);
      
      try {
        console.log('Loading videos for phase:', phase.id);
        
        const { videoService } = await import('@/services/VideoService');
        await videoService.initialize();
        
        const videos = await videoService.getVideosForPhase(phase.id);
        console.log('Found videos:', videos);
        
        const mappedVideos = videos.map(video => ({
          id: video.id,
          title: video.title,
          description: `${video.bestFor} • ${video.duration || 'Watch now'} • ${video.category}`
        }));
        
        setPhaseVideos(mappedVideos);
      } catch (error) {
        console.error('Error loading phase videos:', error);
        setVideosError('Failed to load videos from catalog');
        
        // Fallback videos
        const fallbackMappings: { [key: number]: Array<{id: string, title: string, description: string}> } = {
          1: [
            { id: "Py5aHOLpAMg", title: "Google AI Studio Tutorial for Beginners: Master it in 10 Minutes!", description: "Complete beginners, quick introduction • 9:59 • Beginner Tutorials" },
            { id: "G2fqAlgmoPo", title: "Introduction to Generative AI Studio", description: "Understanding the platform fundamentals • AI Fundamentals" }
          ],
          2: [
            { id: "4oyqd7CB09c", title: "Introduction to Gemini APIs and AI Studio", description: "API integration basics • 18:07 • Developer-Focused Content" },
            { id: "13EPujO40iE", title: "Google AI Studio In 26 Minutes", description: "Comprehensive beginner introduction • 26:00 • Beginner Tutorials" }
          ],
          3: [
            { id: "zxye_ZfRpD0", title: "How to Build an AI Recipe Generator with Python, Tkinter and Gemini API", description: "Python developers building GUI apps • 8:04 • Practical Applications" },
            { id: "VwpDvvNjN2I", title: "Fine tuning Gemini with Google AI Studio", description: "Basic fine-tuning introduction • 7:18 • Model Training & Fine-tuning" },
            { id: "B1RKFL6ASts", title: "Gemini API and Flutter: Practical, AI-driven apps with Google AI tools", description: "Mobile app developers • Practical Applications" }
          ],
          4: [
            { id: "TGaoZpvs1Fo", title: "Unlock Gemini's Powers in Google AI Studio (Full Guide)", description: "Complete feature exploration • 28:08 • Advanced Features" },
            { id: "Y10WeRIDKiw", title: "How to use the Gemini APIs: Advanced techniques", description: "Advanced API usage patterns • Developer-Focused Content" }
          ],
          5: [
            { id: "8qg_6OWE8cc", title: "Take your AI projects further with Google AI Studio", description: "Scaling up existing projects • Short • Advanced Features" },
            { id: "VRT8YNiD7xg", title: "Google Gemini APIs and AI Studio: Accelerating creative workflows", description: "Creative and research applications • 50:24 • Developer-Focused Content" }
          ]
        };
        
        setPhaseVideos(fallbackMappings[phase.id] || []);
      } finally {
        setVideosLoading(false);
      }
    };

    loadPhaseVideos();
  }, [phase.id]);

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

  // Call Gemini API for HTML generation
  const callGeminiForGeneration = useCallback(async (prompt: string): Promise<string> => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      console.log('Calling Gemini API with prompt preview:', prompt.substring(0, 100));
      
      const { data, error } = await supabase.functions.invoke('gemini-api', {
        body: {
          prompt,
          systemPrompt: buildSystemPrompt(phase),
          temperature: 0.7,
          maxTokens: 2000
        }
      });

      if (error) {
        console.error('Supabase function invoke error:', error);
        // Check if it's an API key issue
        if (error.message?.includes('GEMINI_API_KEY not configured') || 
            error.message?.includes('No API key found')) {
          toast.error('Gemini API key not configured. Please add your API key in the project settings.');
          return generateFallbackContent();
        }
        throw new Error(`API error: ${error.message || 'Unknown error'}`);
      }

      if (!data?.generatedText) {
        console.error('No generated text in response:', data);
        throw new Error('No content generated from API');
      }

      console.log('Successfully generated content:', data.generatedText.substring(0, 100));
      return data.generatedText;
    } catch (error) {
      console.error('Gemini API call failed:', error);
      // Return fallback content on API failure
      toast.warning('Using simplified content due to API issues');
      return generateFallbackContent();
    }
  }, [phase, buildSystemPrompt, generateFallbackContent]);

  // Enhanced click handler with loading states and timeout handling
  const handleContentClick = useCallback(async (event: MouseEvent) => {
    let targetElement = event.target as HTMLElement;

    // Find element with interaction ID
    while (
      targetElement &&
      targetElement !== contentRef.current &&
      !targetElement.dataset.interactionId
    ) {
      targetElement = targetElement.parentElement as HTMLElement;
    }

    if (!targetElement || !targetElement.dataset.interactionId) return;

    event.preventDefault();
    
    const interactionId = targetElement.dataset.interactionId;
    
    if (interactionId.includes('explore')) {
      setIsLoading(true);
      toast.info("Generating detailed content... this may take a few seconds");
      
      try {
        // Extract concept index from interaction ID
        const conceptIndex = interactionId.split('-').pop();
        const concept = phase.keyConceptsAndActivities[parseInt(conceptIndex || '0')];
        
        if (concept) {
          // Update state immediately for user feedback
          setSelectedConcept(concept.title);
          setExploredConcepts(prev => {
            const newSet = new Set([...prev, concept.title]);
            // Save to localStorage for persistence
            localStorage.setItem(`explored-concepts-${phase.id}`, JSON.stringify([...newSet]));
            
            // Save progress to database
            if (currentUser?.user_id) {
              const progressPercentage = syllabusProgressService.calculateProgress(
                newSet, 
                new Set(), // completed phases not tracked here
                5 // total phases
              );
              
              syllabusProgressService.saveProgressDual(currentUser.user_id, {
                syllabus_name: 'Gemini AI Studio Training',
                current_module: `Phase ${phase.id}: ${phase.title}`,
                progress_percentage: progressPercentage,
                completed_modules: [...newSet],
                last_accessed: new Date()
              }).catch(error => {
                console.warn('Failed to save progress to database:', error);
              });
            }
            
            return newSet;
          });
          
          // Check cache first
          const cacheKey = `concept-${phase.id}-${conceptIndex}`;
          if (contentCache.has(cacheKey)) {
            setLlmContent(contentCache.get(cacheKey)!);
            setContentState('concept-detail');
            toast.success("Content loaded from cache!");
          } else {
            // Generate detailed content with timeout
            const detailPrompt = `Generate detailed interactive content for the concept "${concept.title}". 
            Include:
            - Back navigation button to overview
            - Comprehensive explanation with examples
            - Practical exercises or mini-tasks
            - Visual diagrams if applicable
            - Interactive elements for deeper exploration
            
            Description: ${concept.description}
            Phase context: ${phase.title}
            
            IMPORTANT: Include a button with data-interaction-id="phase-${phase.id}-back-to-overview" to return to the main view.`;
            
            // Set progressive loading messages
            setLoadingMessage("Generating content...");
            const loadingTimer1 = setTimeout(() => setLoadingMessage("Still working, this usually takes 10-15 seconds..."), 8000);
            const loadingTimer2 = setTimeout(() => setLoadingMessage("Almost done, finalizing content..."), 15000);
            const loadingTimer3 = setTimeout(() => setLoadingMessage("Taking longer than usual, but still processing..."), 20000);
            
            // Set a timeout for API call - increased to 25 seconds
            const timeoutPromise = new Promise<string>((_, reject) => 
              setTimeout(() => {
                clearTimeout(loadingTimer1);
                clearTimeout(loadingTimer2);
                clearTimeout(loadingTimer3);
                reject(new Error('Content generation timed out'));
              }, 25000)
            );
            
            try {
              const detailedContent = await Promise.race([
                callGeminiForGeneration(detailPrompt),
                timeoutPromise
              ]);
              
              if (detailedContent) {
                setContentCache(prev => new Map([...prev, [cacheKey, detailedContent]]));
                setLlmContent(detailedContent);
                setContentState('concept-detail');
                setLoadingMessage('');
                toast.success("Detailed content generated!");
              } else {
                throw new Error('No content generated');
              }
            } catch (error: any) {
              console.error('Content generation failed:', error);
              setLoadingMessage('');
              
              // Detect content blocker issues
              const isNetworkBlocked = error.message?.includes('NetworkError') || 
                                      error.message?.includes('ERR_BLOCKED_BY_CONTENT_BLOCKER') ||
                                      error.message?.includes('Failed to fetch') ||
                                      error.name === 'TypeError' ||
                                      error.message?.includes('fetch');
              
              if (error.message.includes('timed out')) {
                setShowRetry(true);
                toast.error('Generation timed out. You can retry or view simplified content.');
                return; // Don't show fallback immediately
              } else if (isNetworkBlocked) {
                setShowRetry(true);
                toast.error('Content blocked by ad blocker or network filter. Please check your browser settings and retry.');
                return; // Don't show fallback immediately
              } else {
                toast.error('Generation failed. Showing simplified content.');
              }
              
              // Fallback detailed content
              const fallbackDetailContent = `
                <div class="llm-container">
                  <button class="llm-button" data-interaction-id="phase-${phase.id}-back-to-overview">← Back to Overview</button>
                  <h1 class="llm-title">${concept.title}</h1>
                  <div class="llm-highlight">
                    <p><strong>Description:</strong> ${concept.description}</p>
                  </div>
                  <div class="llm-text">
                    <p>This concept is part of ${phase.title}. Explore the detailed information and practice exercises to master this topic.</p>
                    <p>For more detailed content, try refreshing or check your internet connection.</p>
                  </div>
                  <div style="text-align: center; margin-top: 2rem;">
                    <button class="llm-button" data-interaction-id="phase-${phase.id}-coach-help">
                      Ask AI Coach About This Concept
                    </button>
                  </div>
                </div>
              `;
              setLlmContent(fallbackDetailContent);
              setContentState('concept-detail');
            }
          }
        }
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
        setShowRetry(false);
      }
    } else if (interactionId.includes('back-to-overview')) {
      // Return to overview with immediate feedback
      setContentState('overview');
      setSelectedConcept(null);
      const overviewContent = generateFallbackContent();
      setLlmContent(overviewContent);
      toast.success("Returned to overview");
    } else if (interactionId.includes('retry-generation')) {
      setShowRetry(false);
      // Retry the last concept exploration
      if (selectedConcept) {
        const conceptIndex = phase.keyConceptsAndActivities.findIndex(c => c.title === selectedConcept);
        if (conceptIndex >= 0) {
          // Trigger re-exploration with the same logic
          const retryId = `phase-${phase.id}-explore-${conceptIndex}`;
          const retryEvent = new MouseEvent('click');
          Object.defineProperty(retryEvent, 'target', {
            value: { dataset: { interactionId: retryId } }
          });
          handleContentClick(retryEvent);
          return;
        }
      }
    } else if (interactionId.includes('use-fallback')) {
      setShowRetry(false);
      // Show fallback content immediately
      const fallbackDetailContent = `
        <div class="llm-container">
          <button class="llm-button" data-interaction-id="phase-${phase.id}-back-to-overview">← Back to Overview</button>
          <h1 class="llm-title">${selectedConcept || 'Concept Details'}</h1>
          <div class="llm-highlight">
            <p><strong>Description:</strong> Simplified content due to generation timeout.</p>
          </div>
          <div class="llm-text">
            <p>This concept is part of ${phase.title}. For more detailed content, please try again or check your internet connection.</p>
          </div>
          <div style="text-align: center; margin-top: 2rem;">
            <button class="llm-button" data-interaction-id="phase-${phase.id}-coach-help">
              Ask AI Coach About This Concept
            </button>
          </div>
        </div>
      `;
      setLlmContent(fallbackDetailContent);
      setContentState('concept-detail');
    } else if (interactionId.includes('coach')) {
      setIsCoachOpen(true);
      setCoachMessage('How can I help you with this topic?');
    }
    
    // Record interaction
    const newInteraction: InteractionData = {
      id: interactionId,
      type: interactionId.split('-')[2] || 'unknown',
      value: targetElement.textContent?.substring(0, 100),
      timestamp: new Date(),
      phaseContext: phase.id
    };
    
    setCurriculumContext(prev => ({
      ...prev,
      interactionHistory: [...prev.interactionHistory.slice(-9), newInteraction]
    }));
    
  }, [phase, contentCache, generateFallbackContent, callGeminiForGeneration]);

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

  // Removed script execution for safety and performance

  // Initialize the canvas with static content and load saved progress
  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    try {
      // Load saved explored concepts from localStorage and database
      const loadProgress = async () => {
        try {
          // Load from localStorage first for immediate display
          const savedConcepts = localStorage.getItem(`explored-concepts-${phase.id}`);
          if (savedConcepts) {
            const conceptNames = JSON.parse(savedConcepts);
            setExploredConcepts(new Set(conceptNames));
          }

          // Load from database if available
          if (currentUser?.user_id) {
            const dbProgress = await syllabusProgressService.getProgress(
              currentUser.user_id, 
              'Gemini AI Studio Training'
            );
            
            if (dbProgress && dbProgress.completed_modules) {
              setExploredConcepts(new Set(dbProgress.completed_modules));
            }
          }
        } catch (error) {
          console.error('Error loading saved progress:', error);
        }
      };

      loadProgress();
      
      // Load static content immediately without API calls
      const fallbackContent = generateFallbackContent();
      setLlmContent(fallbackContent);
      setError(null);
      setContentState('overview');
    } catch (error) {
      console.error('Initialization failed:', error);
      setError('Failed to load content');
      // Minimal fallback
      setLlmContent(`
        <div class="llm-container">
          <h1 class="llm-title">${phase.title}</h1>
          <p class="llm-text">${phase.objective}</p>
        </div>
      `);
    } finally {
      isInitializing.current = false;
    }
  }, [phase]);

  // Set up click event listener for the content area
  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    contentElement.addEventListener('click', handleContentClick);
    
    return () => {
      contentElement.removeEventListener('click', handleContentClick);
    };
  }, [handleContentClick]);

  // Enhanced coach interaction with better timeout handling
  const handleCoachInteraction = useCallback(async () => {
    if (!userInput.trim()) {
      toast.error("Please enter a question for the coach");
      return;
    }

    const currentInput = userInput;
    setUserInput('');
    setCoachMessage('Coach is analyzing your question...');

    // Add timeout for coach interaction
    const coachTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Coach response timed out')), 15000)
    );

    try {
      const response = await Promise.race([
        coachService.getResponse(
          `${currentInput} [Context: User is exploring ${phase.title}. Recent interactions: ${curriculumContext.interactionHistory.slice(-3).map(h => h.id).join(', ')}]`
        ),
        coachTimeoutPromise
      ]);
      
      // Type guard to ensure response is a string
      const responseText = typeof response === 'string' ? response : 'I received your question but had trouble generating a response.';
      setCoachMessage(responseText);
      toast.success("Coach response received!");
    } catch (error) {
      console.error('Coach interaction failed:', error);
      if (error.message.includes('timed out')) {
        setCoachMessage("My response is taking longer than usual. Please try a shorter, more specific question.");
        toast.error("Coach response timed out");
      } else {
        setCoachMessage('I\'m having trouble responding right now. Try rephrasing your question!');
        toast.error("Coach interaction failed");
      }
      setUserInput(currentInput);
    }
  }, [userInput, coachService, phase.title, curriculumContext.interactionHistory]);

  const handleRefresh = useCallback(() => {
    // Simple refresh without API calls
    const fallbackContent = generateFallbackContent();
    setLlmContent(fallbackContent);
    toast.success('Content refreshed!');
  }, [generateFallbackContent]);

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
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{phase.title}</h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Phase {phase.id} of 5</span>
                <div className="w-16 h-1 bg-muted rounded-full">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${(phase.id / 5) * 100}%` }}
                  />
                </div>
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
                onClick={onClose}
                className="bg-card hover:bg-muted flex items-center gap-1"
                title="Back to Syllabus"
              >
                <ArrowLeft className="h-3 w-3" />
                <span className="text-xs">Back</span>
              </Button>
            </div>
          </div>
        </div>

        {/* AI-Generated Interactive Content */}
        <div 
          ref={contentRef}
          className="p-8 min-h-screen"
          style={{ paddingTop: '8rem' }} // Fixed 8rem for header clearance
          dangerouslySetInnerHTML={{ __html: llmContent }}
        />

        {/* Loading overlay with progressive messages */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center max-w-md px-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground mb-2">
                {loadingMessage || 'Generating interactive content...'}
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
        )}

        {/* Retry overlay */}
        {showRetry && (
          <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
            <div className="text-center max-w-md px-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Content Generation Failed</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Content generation failed. This may be due to network blocking or timeout.
                </p>
                <div className="bg-muted p-4 rounded-lg text-left space-y-2">
                  <p className="font-medium text-sm">If you're seeing this error:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Check if your ad blocker is blocking this site</li>
                    <li>• Try disabling browser content filters</li>
                    <li>• Refresh the page and try again</li>
                    <li>• Try in incognito/private browsing mode</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => {
                    const retryEvent = new MouseEvent('click');
                    Object.defineProperty(retryEvent, 'target', {
                      value: { dataset: { interactionId: `phase-${phase.id}-retry-generation` } }
                    });
                    handleContentClick(retryEvent);
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  Retry Generation
                </Button>
                <Button 
                  onClick={() => {
                    const fallbackEvent = new MouseEvent('click');
                    Object.defineProperty(fallbackEvent, 'target', {
                      value: { dataset: { interactionId: `phase-${phase.id}-use-fallback` } }
                    });
                    handleContentClick(fallbackEvent);
                  }}
                  variant="outline"
                >
                  Use Simplified Content
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* YouTube Videos Section for All Phases */}
        {contentState === 'overview' && (
          <div className="absolute bottom-20 left-4 right-4 z-10">
            <Card className="p-4 max-h-64 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🎥 Hands-On Video Tutorials
                {videosError && <span className="text-xs text-yellow-600">(Fallback videos)</span>}
              </h3>
              
              {videosLoading && (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">Loading video tutorials...</div>
                </div>
              )}
              
              {!videosLoading && phaseVideos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {phaseVideos.map((video) => (
                    <YouTubePlayer
                      key={video.id}
                      videoId={video.id}
                      title={video.title}
                      description={video.description}
                      onWatched={() => {
                        const newWatchedVideos = new Set(watchedVideos);
                        newWatchedVideos.add(video.id);
                        setWatchedVideos(newWatchedVideos);
                        toast.success("Video marked as watched!");
                      }}
                    />
                  ))}
                </div>
              )}
              
              {!videosLoading && phaseVideos.length === 0 && (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">No videos available for this phase</div>
                </div>
              )}
            </Card>
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