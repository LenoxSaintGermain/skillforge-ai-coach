import { useState } from "react";
import { MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeedbackModal from "./FeedbackModal";

const FeedbackWidget = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 h-14 px-6 rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold z-50 animate-in fade-in slide-in-from-bottom-4 duration-500"
        size="lg"
      >
        <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
        <span className="mr-1">BETA</span>
        <MessageSquare className="w-5 h-5" />
      </Button>

      <FeedbackModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
      />
    </>
  );
};

export default FeedbackWidget;
