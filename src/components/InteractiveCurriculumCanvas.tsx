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
import { optimizedGeminiService } from "@/services/OptimizedGeminiService";
import { contentCacheService } from "@/services/ContentCacheService";
import "@/styles/llm-curriculum.css";

interface InteractiveCurriculumCanvasProps {
  phase: SyllabusPhase;
  onBackToSyllabus: () => void; // Updated prop name for consistency
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
  onBackToSyllabus 
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const isInitializing = useRef(false);
  const { coachService } = useAI();
  const { currentUser } = useUser(); // Keep currentUser as that's what UserContext provides
  const startTime = useRef<number>(Date.now());
  
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

  // Generates the initial, pre-interaction view.
  const generateFallbackContent = useCallback((): string => {
    return `
        <div class="llm-container">
          <h1 class="llm-title">${phase.title}</h1>
          <div class="llm-highlight">
            <p><strong>Objective:</strong> ${phase.objective}</p>
          </div>
          <div class="llm-text">
            <p>Welcome to this phase of your learning journey. When you're ready, click the button below to generate a comprehensive guide to this topic.</p>
          </div>
          <div style="text-align: center; margin-top: 2rem;">
            <button class="llm-button" data-interaction-id="phase-${phase.id}-start">
              Begin Learning
            </button>
          </div>
        </div>
    `;
  }, [phase]);

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

  // No longer needed, prompt construction is now in PhaseContextService
  // const buildSystemPrompt = ...

  // Call Gemini API for HTML generation
  const callGeminiForGeneration = useCallback(async (
    interactionType: 'introduction' | 'generate_full_content'
  ): Promise<string> => {
    if (!currentUser) {
      toast.error("You must be logged in to generate content.");
      return generateFallbackContent();
    }

    try {
      const response = await optimizedGeminiService.generateContent({
        userId: currentUser.user_id,
        phaseId: phase.id.toString(),
        interactionType,
        context: {
          phase: phase.title,
          objective: phase.objective,
          keyConcepts: phase.keyConceptsAndActivities,
        },
      });

      if (response.fromCache) {
        toast.success("Content loaded from cache");
      } else {
        toast.success("Comprehensive content generated!");
      }
      return response.content;
    } catch (error: any) {
      console.error('Gemini API call failed:', error);
      toast.error(`Content generation failed: ${error.message}`);
      return generateFallbackContent();
    }
  }, [phase, currentUser]);

  // Simplified click handler for the new blog-style format
  const handleContentClick = useCallback(async (event: MouseEvent) => {
    let targetElement = event.target as HTMLElement;

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
    
    if (interactionId.includes('start') || interactionId.includes('continue')) {
      setIsLoading(true);
      setLoadingMessage("Generating your comprehensive learning guide... this may take a moment.");
      toast.info("Generating comprehensive content...");
      
      try {
        const fullContent = await callGeminiForGeneration('generate_full_content');
        setLlmContent(fullContent);
        setContentState('concept-detail'); // We are now in the detailed view
      } catch (error) {
        console.error('Failed to generate full content:', error);
        toast.error('Failed to generate content. Please try again.');
        setLlmContent(generateFallbackContent()); // Revert to initial state on failure
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
    } else if (interactionId.includes('coach')) {
      setIsCoachOpen(true);
      setCoachMessage('How can I help you with this topic?');
    } else {
      console.log('Unhandled interaction in simplified view:', interactionId);
    }
    
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
    
  }, [phase, callGeminiForGeneration]);

  // buildInteractionPrompt is no longer needed

  // Removed script execution for safety and performance

  // buildInteractionPrompt is no longer needed

  // Initialize the canvas with the fallback content
  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    const initializeContent = () => {
      // Set the initial state to the overview, which prompts the user to start
      setLlmContent(generateFallbackContent());
      setContentState('overview');
      setError(null);
      isInitializing.current = false;
    };

    initializeContent();
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
                onClick={onBackToSyllabus}
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
          className="llm-container min-h-screen"
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

      {/* YouTube Videos Section for All Phases - Integrated into content flow */}
      {contentState === 'overview' && (
        <div className="mt-8 mb-6">
          <Card className="p-4 border-2 border-dashed border-primary/20">
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