import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Compass, Zap, GraduationCap, ExternalLink, ArrowRight, Loader2, Bookmark, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { catalog, CatalogItem, formatDuration, getCatalogUrl } from '@/data/googleCloudCatalog';
import { useUser } from '@/contexts/UserContext';
import AuthPromptModal from './AuthPromptModal';

interface Step {
  id: string;
  reason: string;
  step_name: string;
}

interface Pathway {
  rationale: string;
  pathway: Step[];
}

interface LearningPathGeneratorProps {
  onEnterApp?: () => void;
  prefillData?: { persona: string; goal: string; useCaseId?: string };
}

export interface LearningPathGeneratorRef {
  scrollIntoView: () => void;
  prefill: (persona: string, goal: string, useCaseId?: string) => void;
}

const LearningPathGenerator = forwardRef<LearningPathGeneratorRef, LearningPathGeneratorProps>(
  ({ onEnterApp, prefillData }, ref) => {
  const [persona, setPersona] = useState(prefillData?.persona || '');
  const [goal, setGoal] = useState(prefillData?.goal || '');
  const [useCaseId, setUseCaseId] = useState<string | undefined>(prefillData?.useCaseId);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState<Pathway | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();
  const { currentUser, isAuthenticated } = useUser();
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    scrollIntoView: () => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    prefill: (newPersona: string, newGoal: string, newUseCaseId?: string) => {
      setPersona(newPersona);
      setGoal(newGoal);
      setUseCaseId(newUseCaseId);
      setResult(null);
      setSaved(false);
    }
  }));

  // Check for pending path to save after auth
  useEffect(() => {
    if (isAuthenticated && currentUser?.user_id) {
      const pendingPath = sessionStorage.getItem('pendingLearningPath');
      if (pendingPath) {
        try {
          const pathData = JSON.parse(pendingPath);
          savePath(pathData);
          sessionStorage.removeItem('pendingLearningPath');
        } catch (error) {
          console.error('Error parsing pending path:', error);
        }
      }
    }
  }, [isAuthenticated, currentUser?.user_id]);

  const savePath = async (pathData: { persona: string; goal: string; rationale: string; pathway: Step[]; useCaseId?: string }) => {
    if (!currentUser?.user_id) return;
    
    setSaving(true);
    try {
      const title = `${pathData.persona} - ${pathData.goal.slice(0, 50)}${pathData.goal.length > 50 ? '...' : ''}`;
      
      const { error } = await supabase
        .from('saved_learning_paths')
        .insert([{
          user_id: currentUser.user_id,
          title,
          persona: pathData.persona,
          goal: pathData.goal,
          rationale: pathData.rationale,
          pathway: pathData.pathway as unknown as import('@/integrations/supabase/types').Json,
          use_case_id: pathData.useCaseId || null
        }]);

      if (error) throw error;

      setSaved(true);
      toast({
        title: 'Learning Path Saved!',
        description: 'Access it anytime from your dashboard.',
      });
    } catch (error: any) {
      console.error('Error saving path:', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save learning path. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (!result) return;

    if (!isAuthenticated) {
      // Store path for after auth
      sessionStorage.setItem('pendingLearningPath', JSON.stringify({
        persona,
        goal,
        rationale: result.rationale,
        pathway: result.pathway,
        useCaseId
      }));
      setShowAuthModal(true);
      return;
    }

    savePath({
      persona,
      goal,
      rationale: result.rationale,
      pathway: result.pathway,
      useCaseId
    });
  };

  const handleGenerate = async () => {
    if (!persona || !goal) {
      toast({
        title: "Missing Information",
        description: "Please fill in both your persona and goal.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setSaved(false);

    try {
      const { data, error } = await supabase.functions.invoke('learning-path-ai', {
        body: { persona, goal }
      });

      if (error) {
        throw error;
      }

      if (data?.pathway) {
        setResult(data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error("Error generating path:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate learning path. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCatalogItem = (id: string): CatalogItem | undefined => {
    return catalog.find(c => c.id === id);
  };

  const stepConfig = [
    { icon: Compass, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { icon: Zap, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    { icon: GraduationCap, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' }
  ];

  return (
    <>
      <div ref={containerRef} className="relative rounded-3xl bg-card border border-border overflow-hidden shadow-xl">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-secondary/5 rounded-full blur-3xl opacity-60" />

        <div className="relative p-8 sm:p-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>SkillForge AI Engine</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Forge Your Custom Learning Path
            </h2>
            <p className="text-lg text-muted-foreground">
              Tell us who you are and what you want to achieve. Gemini will analyze Google Cloud's full catalog 
              to build a tailored curriculum just for you.
            </p>
          </div>

          {/* Input Form */}
          <div className="max-w-xl mx-auto space-y-4">
            <div>
              <Label htmlFor="persona" className="text-sm font-medium text-foreground">
                I am a... (Persona)
              </Label>
              <div className="mt-2">
                <Input
                  id="persona"
                  placeholder="e.g. Data Analyst, DevOps Engineer, Sales Leader"
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="goal" className="text-sm font-medium text-foreground">
                I want to... (Goal)
              </Label>
              <div className="mt-2">
                <Input
                  id="goal"
                  placeholder="e.g. Predict customer churn using BigQuery, Build AI chatbots with Gemini"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !persona || !goal}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Forging Path...
                </>
              ) : (
                <>
                  Generate Pathway
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mt-12"
              >
                {/* Rationale */}
                <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 mb-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Curator's Rationale</h3>
                      <p className="text-muted-foreground">{result.rationale}</p>
                    </div>
                    <Button
                      onClick={handleSave}
                      disabled={saving || saved}
                      variant={saved ? "secondary" : "outline"}
                      size="sm"
                      className="shrink-0 gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : saved ? (
                        <>
                          <Check className="w-4 h-4" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          Save Path
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Pathway Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {result.pathway.map((step, index) => {
                    const item = getCatalogItem(step.id);
                    if (!item) return null;

                    const config = stepConfig[index] || stepConfig[0];
                    const Icon = config.icon;

                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
                          <div className={`h-1 ${config.bgColor}`} />
                          <CardContent className="pt-6 flex flex-col h-full">
                            {/* Step Header */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`p-2 rounded-lg ${config.bgColor}`}>
                                <Icon className={`w-6 h-6 ${config.color}`} />
                              </div>
                              <div>
                                <p className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>
                                  {step.step_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDuration(item.duration_minutes)} • {item.level}
                                </p>
                              </div>
                            </div>

                            {/* Title */}
                            <h4 className="text-base font-semibold text-foreground mb-2 line-clamp-2">
                              {item.title}
                            </h4>

                            {/* Reason */}
                            <p className="text-sm text-muted-foreground mb-4 flex-grow">
                              {step.reason}
                            </p>

                            {/* Footer */}
                            <div className="mt-auto pt-4 border-t border-border">
                              {/* Products */}
                              <div className="flex flex-wrap gap-1 mb-3">
                                {item.products.slice(0, 3).map(prod => (
                                  <Badge key={prod} variant="secondary" className="text-[10px] px-2 py-0">
                                    {prod}
                                  </Badge>
                                ))}
                                {item.products.length > 3 && (
                                  <Badge variant="secondary" className="text-[10px] px-2 py-0">
                                    +{item.products.length - 3}
                                  </Badge>
                                )}
                              </div>

                              {/* Link */}
                              <a
                                href={getCatalogUrl(item.title)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center text-sm font-medium ${config.color} hover:opacity-80 transition-opacity`}
                              >
                                Start Learning
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Practice CTA */}
                {onEnterApp && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 text-center"
                  >
                    <div className="inline-flex flex-col items-center gap-3 p-6 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                      <p className="text-sm text-muted-foreground">
                        Learn from Google Cloud → Practice in SkillForge
                      </p>
                      <Button onClick={onEnterApp} variant="default" className="group">
                        Practice These Skills in SkillForge
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthPromptModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
});

LearningPathGenerator.displayName = 'LearningPathGenerator';

export default LearningPathGenerator;
