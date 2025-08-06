import React, { useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo } from "react";
import { Canvas as FabricCanvas, Circle, Rect, Textbox } from "fabric";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Palette, Square, Circle as CircleIcon, Type, Eraser, MessageCircle } from "lucide-react";
import { useAI } from "@/contexts/AIContext";
import { SyllabusPhase } from "@/models/Syllabus";
import { User } from "@/contexts/UserContext";
import { toast } from "sonner";
import { AIResponse, Action } from "@/services/AICoachService";

interface InteractiveLearningCanvasProps {
  phase: SyllabusPhase;
  onClose: () => void;
}

type ToolType = "select" | "draw" | "rectangle" | "circle" | "text" | "eraser";

const InteractiveLearningCanvas: React.FC<InteractiveLearningCanvasProps> = ({ phase, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout>();
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const initializedPhaseRef = useRef<string | null>(null);
  const phaseRef = useRef(phase);
  const { coachService } = useAI();
  const coachServiceRef = useRef(coachService);
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [activeColor, setActiveColor] = useState("#6366f1");
  const [isCoachOpen, setIsCoachOpen] = useState(true);
  const [coachMessage, setCoachMessage] = useState("Welcome! Your AI coach is initializing...");
  const [userInput, setUserInput] = useState("");
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [isCoachReady, setIsCoachReady] = useState(false);
  const [canvasError, setCanvasError] = useState<string | null>(null);

  useLayoutEffect(() => {
    phaseRef.current = phase;
    coachServiceRef.current = coachService;
  });

  // Memoize canvas dimensions
  const canvasDimensions = useMemo(() => ({
    width: Math.max(800, window.innerWidth - 400),
    height: Math.max(600, window.innerHeight - 100)
  }), []);

  // Initialize canvas robustly on mount
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    // This check prevents re-initialization if the canvas instance already exists.
    if (fabricCanvasRef.current) {
      return;
    }

    try {
      console.log("Initializing canvas...");

      const canvas = new FabricCanvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff",
      });

      fabricCanvasRef.current = canvas;

      // Initialize drawing brush
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = activeColor;
        canvas.freeDrawingBrush.width = 3;
      }

      console.log("Canvas created successfully");
      setIsCanvasReady(true);
      setCanvasError(null);

      addPhaseContent(canvas, phase);

      toast("Canvas ready!");
    } catch (error) {
      console.error("Canvas initialization failed:", error);
      setCanvasError("Failed to initialize canvas");
      toast.error("Canvas initialization failed");
    }

    return () => {
      console.log("Cleaning up canvas effect...");
      // Dispose the canvas, and critically, set the ref to null.
      // This allows the canvas to be re-initialized if the component re-mounts in Strict Mode.
      if (fabricCanvasRef.current && !fabricCanvasRef.current.disposed) {
        console.log("Disposing canvas instance...");
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Initialize coach separately with timeout
  useEffect(() => {
    const currentPhase = phaseRef.current;
    // Guard: Only initialize if canvas is ready and coach hasn't been initialized for this phase
    if (!isCanvasReady || initializedPhaseRef.current === currentPhase.title) {
      return;
    }

    // Mark this phase as having started initialization
    initializedPhaseRef.current = currentPhase.title;

    const initCoach = async () => {
      try {
        // Set timeout for coach initialization
        initTimeoutRef.current = setTimeout(() => {
          setCoachMessage("AI Coach is taking longer than expected. You can continue using the canvas!");
          setIsCoachReady(true);
        }, 10000); // 10 second timeout

        const mockUser: User = { 
          id: "user", 
          user_id: "user", 
          name: "User", 
          email: "user@example.com" 
        };
        
        const guidance = await coachServiceRef.current.initializeCoach(
          mockUser,
          `Starting interactive learning for: ${currentPhase.title}. ${currentPhase.objective}`
        );
        
        // Clear timeout if successful
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
        }
        
        handleAIActions(guidance);
        setIsCoachReady(true);
      } catch (error) {
        console.error("Coach initialization failed:", error);
        setCoachMessage(`Welcome to ${currentPhase.title}! Let's explore this topic together using the interactive canvas.`);
        setIsCoachReady(true);
        
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
        }
      }
    };

    // Delay coach initialization to prioritize canvas
    const delayedInit = setTimeout(initCoach, 500);

    return () => {
      clearTimeout(delayedInit);
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, [isCanvasReady]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = activeTool === "draw";
    
    if (activeTool === "draw" && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = activeColor;
    }
  }, [activeTool, activeColor]);

  const handleAIActions = useCallback((response: AIResponse) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    response.actions.forEach(action => {
      switch (action.type) {
        case 'speech':
          setCoachMessage(action.content);
          break;
        case 'canvas_object':
          let newObject;
          const defaultParams = {
            left: Math.random() * (canvas.width ?? 800) * 0.8,
            top: Math.random() * (canvas.height ?? 600) * 0.8,
            fill: activeColor,
          };
          const params = { ...defaultParams, ...action.params };

          switch (action.object) {
            case 'rect':
              newObject = new Rect({ ...params, width: 100, height: 100 });
              break;
            case 'circle':
              newObject = new Circle({ ...params, radius: 50 });
              break;
            case 'text':
              newObject = new Textbox(action.label || 'Text', { ...params, fontSize: 20 });
              break;
            default:
              console.warn(`Unknown canvas object type: ${action.object}`);
              return;
          }
          if (newObject) {
            canvas.add(newObject);
          }
          break;
        default:
          console.warn(`Unknown action type: ${(action as any).type}`);
      }
    });
    canvas.renderAll();
  }, [activeColor]);

  // Simple content addition without API calls
  const addPhaseContent = useCallback((canvas: FabricCanvas, phase: SyllabusPhase) => {
    try {
      // Add phase title
      const title = new Textbox(phase.title, {
        left: 50,
        top: 50,
        fontSize: 32,
        fill: "#1e293b",
        fontWeight: "bold",
        selectable: false,
      });
      canvas.add(title);

      // Add objective
      const objective = new Textbox(`Objective: ${phase.objective}`, {
        left: 50,
        top: 120,
        fontSize: 16,
        fill: "#475569",
        width: Math.min(600, canvas.width - 100),
        selectable: false,
      });
      canvas.add(objective);

      canvas.renderAll();
    } catch (error) {
      console.error("Failed to add phase content:", error);
    }
  }, []);

  const handleToolClick = useCallback((tool: ToolType) => {
    setActiveTool(tool);
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    try {
      if (tool === "rectangle") {
        const rect = new Rect({
          left: 200,
          top: 200,
          fill: activeColor,
          width: 100,
          height: 100,
          stroke: "#1e293b",
          strokeWidth: 2,
        });
        canvas.add(rect);
      } else if (tool === "circle") {
        const circle = new Circle({
          left: 200,
          top: 200,
          fill: activeColor,
          radius: 50,
          stroke: "#1e293b",
          strokeWidth: 2,
        });
        canvas.add(circle);
      } else if (tool === "text") {
        const text = new Textbox("Click to edit", {
          left: 200,
          top: 200,
          fontSize: 20,
          fill: activeColor,
        });
        canvas.add(text);
      } else if (tool === "eraser") {
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.color = "#ffffff";
        }
        canvas.isDrawingMode = true;
      }
    } catch (error) {
      console.error("Tool operation failed:", error);
      toast.error("Failed to add shape");
    }
  }, [activeColor]);

  const handleClear = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    try {
      canvas.clear();
      canvas.backgroundColor = "#ffffff";
      addPhaseContent(canvas, phase);
      toast("Canvas cleared and reset!");
    } catch (error) {
      console.error("Clear operation failed:", error);
      toast.error("Failed to clear canvas");
    }
  }, [phase, addPhaseContent]);

  const handleCoachInteraction = useCallback(async () => {
    if (!userInput.trim() || !isCoachReady) return;

    const currentInput = userInput;
    setUserInput("");
    setCoachMessage("Coach is thinking...");

    try {
      const response = await coachServiceRef.current.processUserMessage(
        `${currentInput} [Canvas context: User is working on ${phaseRef.current.title}. Canvas has ${fabricCanvasRef.current?.getObjects().length || 0} objects.]`
      );

      handleAIActions(response);
    } catch (error) {
      console.error("Coach interaction failed:", error);
      setCoachMessage("Sorry, I'm having trouble responding right now. Try rephrasing your question or ask something else!");
      setUserInput(currentInput); // Restore input on error
    }
  }, [userInput, isCoachReady, handleAIActions]);

  const colors = ["#6366f1", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];

  if (canvasError) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive mb-4">⚠️</div>
          <p className="text-destructive mb-4">{canvasError}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }

  if (!isCanvasReady) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up canvas...</p>
        </div>
      </div>
    );
  }

  return (
    // The main container is a flex layout. The coach side panel was previously a second flex item here.
    // It has been removed to create a cleaner, more integrated, and multi-modal AI experience directly on the canvas.
    <div className="fixed inset-0 bg-background z-50 flex">
      {/* Canvas Area */}
      <div className="flex-1 relative">
        {/* Toolbar */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <Card className="p-2 flex items-center gap-2">
            <Button
              variant={activeTool === "select" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTool("select")}
            >
              Select
            </Button>
            <Button
              variant={activeTool === "draw" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTool("draw")}
            >
              <Palette className="w-4 h-4" />
            </Button>
            <Button
              variant={activeTool === "rectangle" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("rectangle")}
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              variant={activeTool === "circle" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("circle")}
            >
              <CircleIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={activeTool === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("text")}
            >
              <Type className="w-4 h-4" />
            </Button>
            <Button
              variant={activeTool === "eraser" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolClick("eraser")}
            >
              <Eraser className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear}>
              Clear
            </Button>
          </Card>

          {/* Color Palette */}
          <Card className="p-2 flex items-center gap-1">
            {colors.map((color) => (
              <Button
                key={color}
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 border-2"
                style={{ 
                  backgroundColor: color,
                  borderColor: activeColor === color ? "#1e293b" : "transparent"
                }}
                onClick={() => setActiveColor(color)}
              />
            ))}
          </Card>
        </div>

        {/* Close Button */}
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 z-10"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Canvas */}
        <div ref={containerRef} className="w-full h-full overflow-hidden">
          <canvas ref={canvasRef} className="border-l border-border" />
        </div>
      </div>


    </div>
  );
};

export default InteractiveLearningCanvas;