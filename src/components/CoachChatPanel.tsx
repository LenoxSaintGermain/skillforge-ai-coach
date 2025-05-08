
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
  const { aiCoachService, jarvisCoachService, activeCoach, setActiveCoach } = useAI();
  const { currentUser } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Handle controlled vs uncontrolled expansion state
  const expanded = controlledExpanded !== undefined ? controlledExpanded : isExpanded;
  
  // Initialize coach on component mount
  useEffect(() => {
    if (!currentUser) return;
    
    const initializeCoach = async () => {
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
    };
    
    initializeCoach();
  }, [aiCoachService, currentUser, jarvisCoachService, activeCoach]);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentUser) return;
    
    // Add user message to chat
    const userMessage = {
      role: 'user' as const,
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Get AI coach response
    let response;
    if (activeCoach === 'jarvis') {
      response = await jarvisCoachService.processUserMessage(inputValue);
    } else {
      response = await aiCoachService.processUserMessage(inputValue);
    }
    
    const assistantMessage = {
      role: 'assistant' as const,
      content: response,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, assistantMessage]);
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
    setActiveCoach(newCoach);
    
    // Reset messages when switching coaches
    setMessages([]);
    
    // Initialize the new coach
    if (currentUser) {
      const initializeNewCoach = async () => {
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
