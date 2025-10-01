import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bug, Lightbulb, MessageCircle, Palette, Zap, Check } from "lucide-react";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledType?: "bug_report" | "feature_request" | "general" | "ui_ux" | "performance";
}

const FeedbackModal = ({ open, onOpenChange, prefilledType }: FeedbackModalProps) => {
  const { currentUser } = useUser();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const [feedbackType, setFeedbackType] = useState(prefilledType || "general");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium");

  const feedbackTypes = [
    { value: "bug_report", label: "Bug Report", icon: Bug, color: "text-destructive" },
    { value: "feature_request", label: "Feature Request", icon: Lightbulb, color: "text-yellow-500" },
    { value: "general", label: "General Feedback", icon: MessageCircle, color: "text-blue-500" },
    { value: "ui_ux", label: "UI/UX Issue", icon: Palette, color: "text-purple-500" },
    { value: "performance", label: "Performance Issue", icon: Zap, color: "text-orange-500" },
  ];

  const getBrowserInfo = () => {
    return {
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      platform: navigator.platform,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit feedback.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("beta_feedback")
        .insert({
          user_id: currentUser.id,
          feedback_type: feedbackType,
          title,
          description,
          priority,
          current_page: location.pathname,
          browser_info: getBrowserInfo(),
        })
        .select()
        .single();

      if (error) throw error;

      setTicketId(data.id.slice(0, 8).toUpperCase());
      setIsSuccess(true);

      toast({
        title: "Feedback Submitted!",
        description: "Thank you for helping us improve the platform.",
      });

      // Reset form after 3 seconds and close
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setPriority("medium");
        setFeedbackType(prefilledType || "general");
        setIsSuccess(false);
        onOpenChange(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission Failed",
        description: "Unable to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsSuccess(false);
      onOpenChange(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl mb-2">Thank You!</DialogTitle>
            <DialogDescription className="text-base mb-4">
              Your feedback has been submitted successfully.
            </DialogDescription>
            <div className="bg-muted rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground mb-1">Ticket ID</p>
              <p className="text-lg font-mono font-semibold">{ticketId}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              We'll review your feedback and get back to you soon.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent font-bold">
              BETA
            </span>
            Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve by sharing your thoughts, reporting bugs, or suggesting features.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-type">Feedback Type</Label>
            <Select value={feedbackType} onValueChange={(value: any) => setFeedbackType(value)}>
              <SelectTrigger id="feedback-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${type.color}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief summary of your feedback"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Please provide as much detail as possible..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
            <p className="text-muted-foreground">
              <span className="font-semibold">Current Page:</span> {location.pathname}
            </p>
            <p className="text-muted-foreground text-xs">
              Browser information will be automatically collected to help us diagnose issues.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
