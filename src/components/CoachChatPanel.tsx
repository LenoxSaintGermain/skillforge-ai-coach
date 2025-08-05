
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useAI } from '@/contexts/AIContext';
import { useUser } from '@/contexts/UserContext';
import { ConversationItem } from '@/services/AICoachService';
import { Brain, Send, X, Maximize, Minimize, MessageSquare } from 'lucide-react';

interface ChatMessageProps {
  message: ConversationItem;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'bg-skillforge-primary text-white' : 'bg-gray-100 dark:bg-gray-800'} rounded-lg px-4 py-2`}>
        <p className="text-sm">{message.content}</p>
        <p className="text-xs text-gray-400 mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

interface CoachChatPanelProps {
  isExpanded?: boolean;
  initialExpanded?: boolean;
  className?: string;
}

const CoachChatPanel = ({ 
  isExpanded: controlledExpanded, 
  initialExpanded = false,
  className = '' 
}: CoachChatPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ConversationItem[]>([]);
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const { aiCoachService, jarvisCoachService, activeCoach, setActiveCoach, error, isServiceReady } = useAI();
  const { currentUser } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Handle controlled vs uncontrolled expansion state
  const expanded = controlledExpanded !== undefined ? controlledExpanded : isExpanded;
  
  // Initialize coach on component mount
  useEffect(() => {
    if (!currentUser || !isServiceReady) {
      console.log('⏳ Waiting for user or services...', { currentUser: !!currentUser, isServiceReady });
      return;
    }
    
    const initializeCoach = async () => {
      console.log(`🤖 Initializing ${activeCoach} coach for ${currentUser.name}...`);
      
      try {
        setIsInitializing(true);
        setInitError(null);
        
        let welcomeMessage;
        
        if (activeCoach === 'jarvis') {
          welcomeMessage = await jarvisCoachService.initializeJarvis(currentUser.name);
        } else {
          welcomeMessage = await aiCoachService.initializeCoach(currentUser);
        }
        
        setMessages([{ 
          role: 'assistant', 
          content: welcomeMessage, 
          timestamp: new Date() 
        }]);
        
        console.log(`✅ ${activeCoach} coach initialized successfully`);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize coach';
        console.error(`❌ Failed to initialize ${activeCoach} coach:`, errorMessage);
        setInitError(errorMessage);
        
        // Provide fallback message
        const fallbackMessage = `Hello ${currentUser.name}! I'm having some connectivity issues, but I'm here to help. You can still ask me questions and I'll do my best to assist you.`;
        setMessages([{ 
          role: 'assistant', 
          content: fallbackMessage, 
          timestamp: new Date() 
        }]);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeCoach();
  }, [aiCoachService, currentUser, jarvisCoachService, activeCoach, isServiceReady]);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentUser) return;
    
    console.log(`📤 Sending message to ${activeCoach}:`, inputValue);
    
    // Add user message to chat
    const userMessage = {
      role: 'user' as const,
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputValue;
    setInputValue('');
    
    try {
      // Get AI coach response
      let response;
      if (activeCoach === 'jarvis') {
        response = await jarvisCoachService.processUserMessage(currentMessage);
      } else {
        response = await aiCoachService.processUserMessage(currentMessage);
      }
      
      const assistantMessage = {
        role: 'assistant' as const,
        content: response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      console.log(`📥 Received response from ${activeCoach}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get response';
      console.error(`❌ Error processing message with ${activeCoach}:`, errorMessage);
      
      // Add error message to chat
      const errorResponse = {
        role: 'assistant' as const,
        content: `I'm experiencing some technical difficulties. ${errorMessage.includes('blocked') ? 'It looks like a content blocker might be interfering.' : ''} Please try again in a moment.`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const toggleExpanded = () => {
    if (controlledExpanded === undefined) {
      setIsExpanded(!expanded);
    }
  };
  
  const handleSwitchCoach = () => {
    const newCoach = activeCoach === 'ai' ? 'jarvis' : 'ai';
    console.log(`🔄 Switching from ${activeCoach} to ${newCoach}`);
    
    setActiveCoach(newCoach);
    setMessages([]);
    setInitError(null);
    
    // Initialize the new coach
    if (currentUser && isServiceReady) {
      const initializeNewCoach = async () => {
        try {
          setIsInitializing(true);
          let welcomeMessage;
          
          if (newCoach === 'jarvis') {
            welcomeMessage = await jarvisCoachService.initializeJarvis(currentUser.name);
          } else {
            welcomeMessage = await aiCoachService.initializeCoach(currentUser);
          }
          
          setMessages([{ 
            role: 'assistant', 
            content: welcomeMessage, 
            timestamp: new Date() 
          }]);
          
          console.log(`✅ Successfully switched to ${newCoach}`);
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to switch coach';
          console.error(`❌ Failed to switch to ${newCoach}:`, errorMessage);
          setInitError(errorMessage);
          
          // Provide fallback message
          const fallbackMessage = `Hello ${currentUser.name}! I'm your ${newCoach === 'jarvis' ? 'Jarvis' : 'AI'} coach. I'm having some connectivity issues, but I'm here to help.`;
          setMessages([{ 
            role: 'assistant', 
            content: fallbackMessage, 
            timestamp: new Date() 
          }]);
        } finally {
          setIsInitializing(false);
        }
      };
      
      initializeNewCoach();
    }
  };
  
  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 flex flex-col ${className} ${expanded ? 'h-[500px] w-[350px]' : 'h-12 w-12'} 
      transition-all duration-300 ease-in-out`}
    >
      {/* Header/Toggle button */}
      {expanded ? (
        <div className={`flex items-center justify-between p-3 rounded-t-lg text-white shadow-lg ${activeCoach === 'jarvis' ? 'bg-skillforge-secondary' : 'bg-coach'}`}>
          <div className="flex items-center">
            <Brain size={20} className="mr-2" />
            <h3 className="font-medium text-sm">{activeCoach === 'jarvis' ? 'Jarvis' : 'AI Coach'}</h3>
          </div>
          <div className="flex items-center space-x-1">
            <div className="mr-2 flex items-center space-x-1">
              <span className="text-xs">AI</span>
              <Switch 
                checked={activeCoach === 'jarvis'} 
                onCheckedChange={handleSwitchCoach}
                className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white"
              />
              <span className="text-xs">Jarvis</span>
            </div>
            <Button size="sm" variant="ghost" onClick={toggleExpanded} className="h-6 w-6 p-0 text-white hover:bg-coach-dark">
              <Minimize size={16} />
            </Button>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-white hover:bg-coach-dark">
              <X size={16} />
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          onClick={toggleExpanded}
          size="icon" 
          className={`h-12 w-12 rounded-full ${activeCoach === 'jarvis' ? 'bg-skillforge-secondary hover:bg-skillforge-secondary/90' : 'bg-coach hover:bg-coach-dark'} shadow-lg animate-pulse-slow`}
        >
          <MessageSquare size={20} className="text-white" />
        </Button>
      )}
      
      {expanded && (
        <>
          {/* Chat messages */}
          <ScrollArea className="flex-1 bg-white dark:bg-gray-950 p-3 overflow-auto">
            <div className="flex flex-col">
              {(error || initError) && (
                <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ {error || initError}
                  </p>
                  {(error || initError)?.includes('blocked') && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                      This might be caused by a content blocker. The coach will still work with limited functionality.
                    </p>
                  )}
                </div>
              )}
              
              {isInitializing && (
                <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    🤖 Initializing {activeCoach === 'jarvis' ? 'Jarvis' : 'AI Coach'}...
                  </p>
                </div>
              )}
              
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Input area */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 rounded-b-lg">
            <div className="flex items-center gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activeCoach === 'jarvis' ? "Ask Jarvis about Gemini..." : "Ask your AI coach..."}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                size="icon" 
                className={activeCoach === 'jarvis' ? "bg-skillforge-secondary hover:bg-skillforge-secondary/90" : "bg-coach hover:bg-coach-dark"}
              >
                <Send size={16} className="text-white" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CoachChatPanel;
