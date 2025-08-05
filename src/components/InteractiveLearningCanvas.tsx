import React, { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, Textbox } from "fabric";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Palette, Square, Circle as CircleIcon, Type, Eraser, MessageCircle } from "lucide-react";
import { useAI } from "@/contexts/AIContext";
import { SyllabusPhase } from "@/models/Syllabus";
import { User } from "@/contexts/UserContext";
import { toast } from "sonner";

interface InteractiveLearningCanvasProps {
  phase: SyllabusPhase;
  onClose: () => void;
}

type ToolType = "select" | "draw" | "rectangle" | "circle" | "text" | "eraser";

const InteractiveLearningCanvas: React.FC<InteractiveLearningCanvasProps> = ({ phase, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [activeColor, setActiveColor] = useState("#6366f1");
  const [isCoachOpen, setIsCoachOpen] = useState(true);
  const [coachMessage, setCoachMessage] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { coachService } = useAI();

  useEffect(() => {
    if (!canvasRef.current || isInitialized) return;

    const initCanvas = async () => {
      try {
        setIsLoading(true);
        
        // Dispose existing canvas if any
        if (fabricCanvas) {
          fabricCanvas.dispose();
        }

        const canvas = new FabricCanvas(canvasRef.current!, {
          width: window.innerWidth - 400, // Leave space for coach panel
          height: window.innerHeight - 100,
          backgroundColor: "#ffffff",
        });

        // Initialize drawing brush
        canvas.freeDrawingBrush.color = activeColor;
        canvas.freeDrawingBrush.width = 3;

        setFabricCanvas(canvas);
        setIsInitialized(true);
        
        // Initialize with phase content
        await initializePhaseContent(canvas, phase);
        
        setIsLoading(false);
        toast("Interactive canvas ready!");
      } catch (error) {
        console.error("Canvas initialization failed:", error);
        setIsLoading(false);
        toast.error("Failed to initialize canvas");
      }
    };

    initCanvas();

    return () => {
      if (fabricCanvas && !fabricCanvas.disposed) {
        fabricCanvas.dispose();
      }
      setIsInitialized(false);
    };
  }, [phase.id]); // Only reinitialize when phase changes

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    
    if (activeTool === "draw" && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
    }
  }, [activeTool, activeColor, fabricCanvas]);

  const initializePhaseContent = async (canvas: FabricCanvas, phase: SyllabusPhase) => {
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
      width: 600,
      selectable: false,
    });
    canvas.add(objective);

    // Get initial coach guidance
    try {
      const mockUser: User = { 
        id: "user", 
        user_id: "user", 
        name: "User", 
        email: "user@example.com" 
      };
      const guidance = await coachService.initializeCoach(
        mockUser,
        `Starting interactive learning for: ${phase.title}. ${phase.objective}`
      );
      setCoachMessage(guidance);
    } catch (error) {
      console.error("Failed to get initial guidance:", error);
      setCoachMessage(`Welcome to ${phase.title}! Let's explore this topic together using the interactive canvas.`);
    }

    canvas.renderAll();
  };

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

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
      fabricCanvas.add(rect);
    } else if (tool === "circle") {
      const circle = new Circle({
        left: 200,
        top: 200,
        fill: activeColor,
        radius: 50,
        stroke: "#1e293b",
        strokeWidth: 2,
      });
      fabricCanvas.add(circle);
    } else if (tool === "text") {
      const text = new Textbox("Click to edit", {
        left: 200,
        top: 200,
        fontSize: 20,
        fill: activeColor,
      });
      fabricCanvas.add(text);
    } else if (tool === "eraser") {
      fabricCanvas.freeDrawingBrush.color = "#ffffff";
      fabricCanvas.isDrawingMode = true;
    }
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    initializePhaseContent(fabricCanvas, phase);
    toast("Canvas cleared and reset!");
  };

  const handleCoachInteraction = async () => {
    if (!userInput.trim()) return;

    try {
      const canvasState = fabricCanvas?.toJSON();
      const response = await coachService.processUserMessage(
        `${userInput} [Canvas context: User is working on ${phase.title}. Canvas has ${canvasState?.objects?.length || 0} objects.]`
      );
      setCoachMessage(response);
      setUserInput("");
    } catch (error) {
      console.error("Coach interaction failed:", error);
      toast.error("Failed to get coach response");
    }
  };

  const colors = ["#6366f1", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing interactive canvas...</p>
        </div>
      </div>
    );
  }

  return (
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
        <div className="w-full h-full overflow-hidden">
          <canvas ref={canvasRef} className="border-l border-border" />
        </div>
      </div>

      {/* Coach Panel */}
      {isCoachOpen && (
        <div className="w-96 border-l border-border bg-background flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">AI Learning Coach</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCoachOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <Badge variant="outline" className="mb-4">
              {phase.title}
            </Badge>
            
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-sm leading-relaxed">{coachMessage}</p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Key Concepts:</h4>
                <div className="space-y-2">
                  {phase.keyConceptsAndActivities.map((concept, index) => (
                    <div key={index} className="text-sm">
                      <strong>{concept.title}:</strong> {concept.description}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Core Task:</h4>
                <p className="text-sm text-muted-foreground">
                  {phase.corePracticalTask.description}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCoachInteraction()}
                placeholder="Ask your coach anything..."
                className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
              />
              <Button size="sm" onClick={handleCoachInteraction}>
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Coach Toggle Button (when closed) */}
      {!isCoachOpen && (
        <Button
          variant="default"
          size="sm"
          className="fixed bottom-4 right-4 z-10"
          onClick={() => setIsCoachOpen(true)}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Coach
        </Button>
      )}
    </div>
  );
};

export default InteractiveLearningCanvas;