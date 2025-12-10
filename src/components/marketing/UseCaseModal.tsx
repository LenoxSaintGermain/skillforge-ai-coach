import { UseCase, useCases } from '@/data/useCases';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Users, Building2, Target, TrendingUp, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

interface UseCaseModalProps {
  useCase: UseCase | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectRelated: (id: string) => void;
  onGeneratePath?: (persona: string, goal: string, useCaseId: string) => void;
}

const difficultyColors = {
  beginner: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  intermediate: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  advanced: 'bg-rose-500/10 text-rose-600 border-rose-500/20'
};

const UseCaseModal = ({ useCase, isOpen, onClose, onSelectRelated, onGeneratePath }: UseCaseModalProps) => {
  if (!useCase) return null;

  const relatedUseCases = useCases.filter(uc => useCase.relatedCases.includes(uc.id));

  const handleGeneratePath = () => {
    if (useCase.suggestedPersona && useCase.suggestedGoal && onGeneratePath) {
      onGeneratePath(useCase.suggestedPersona, useCase.suggestedGoal, useCase.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between mb-2">
            <DialogTitle className="text-2xl font-bold pr-8">
              {useCase.title}
            </DialogTitle>
            <Badge className={`${difficultyColors[useCase.difficulty]} border shrink-0`}>
              {useCase.difficulty}
            </Badge>
          </div>
          <DialogDescription className="text-base">
            {useCase.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Value Proposition */}
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Key Value</h3>
                <p className="text-sm text-muted-foreground">{useCase.valueProposition}</p>
              </div>
            </div>
          </div>

          {/* Impact */}
          <div className="bg-secondary/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Expected Impact</h3>
                <p className="text-sm font-medium text-primary">{useCase.impact}</p>
              </div>
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Perfect For</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {useCase.targetAudience.map((audience, idx) => (
                <Badge key={idx} variant="secondary">
                  {audience}
                </Badge>
              ))}
            </div>
          </div>

          {/* Industries */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Industries</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {useCase.industry.map((industry, idx) => (
                <Badge key={idx} variant="outline">
                  {industry}
                </Badge>
              ))}
            </div>
          </div>

          {/* Related Use Cases */}
          {relatedUseCases.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">Related Use Cases</h3>
              <div className="grid grid-cols-1 gap-2">
                {relatedUseCases.map((related) => (
                  <motion.button
                    key={related.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      onSelectRelated(related.id);
                    }}
                    className="text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-secondary/50 transition-all"
                  >
                    <p className="font-medium text-sm text-foreground">{related.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {related.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col gap-3 pt-4 border-t">
            {useCase.suggestedPersona && useCase.suggestedGoal && onGeneratePath && (
              <Button onClick={handleGeneratePath} className="w-full gap-2">
                <GraduationCap className="w-4 h-4" />
                Learn Skills for This Use Case
              </Button>
            )}
            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1">
                <a href="/auth" onClick={(e) => { e.preventDefault(); window.location.href = '/auth'; }}>
                  Start Building
                </a>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <a 
                  href={useCase.technicalBlueprintUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  Technical Details
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UseCaseModal;
