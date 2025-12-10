import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Compass, Zap, GraduationCap, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { catalog, CatalogItem, formatDuration, getCatalogUrl } from '@/data/googleCloudCatalog';

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
}

const LearningPathGenerator = ({ onEnterApp }: LearningPathGeneratorProps) => {
  const [persona, setPersona] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Pathway | null>(null);
  const { toast } = useToast();

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
    <div className="relative rounded-3xl bg-card border border-border overflow-hidden shadow-xl">
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
                <h3 className="text-lg font-semibold text-foreground mb-2">Curator's Rationale</h3>
                <p className="text-muted-foreground">{result.rationale}</p>
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
  );
};

export default LearningPathGenerator;
