import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles, ChevronRight, ChevronLeft, Check, Edit2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from './ColorPicker';

interface SubjectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (generatedData: any) => void;
}

export const SubjectWizard = ({ open, onOpenChange, onComplete }: SubjectWizardProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Step 1: Topic input
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState('');
  const [goals, setGoals] = useState<string[]>(['']);

  // Generated data
  const [syllabus, setSyllabus] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [systemPrompt, setSystemPrompt] = useState('');

  // Editable states
  const [editingSyllabus, setEditingSyllabus] = useState(false);

  const callWizardAPI = async (action: string, data: any) => {
    const { data: result, error } = await supabase.functions.invoke('ai-subject-wizard', {
      body: { action, ...data }
    });

    if (error) throw error;
    if (!result?.success) throw new Error(result?.error || 'Generation failed');
    return result.data;
  };

  const handleStep1Next = async () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Please enter a topic to teach", variant: "destructive" });
      return;
    }

    setLoading(true);
    setLoadingMessage('Analyzing your topic and searching for latest information...');

    try {
      // Generate syllabus
      const syllabusData = await callWizardAPI('generate_syllabus', {
        topic,
        description,
        audience,
        goals: goals.filter(g => g.trim())
      });

      setSyllabus(syllabusData);
      setStep(2);
      toast({ title: "Syllabus generated!", description: "Review and edit as needed" });
    } catch (error) {
      console.error('Wizard error:', error);
      toast({ 
        title: "Generation failed", 
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleStep2Next = async () => {
    setLoading(true);
    setLoadingMessage('Generating title, branding, and metadata...');

    try {
      const metadataData = await callWizardAPI('generate_metadata', { topic, description });
      setMetadata(metadataData);
      setStep(3);
      toast({ title: "Metadata generated!", description: "Customize branding and details" });
    } catch (error) {
      console.error('Wizard error:', error);
      toast({ 
        title: "Generation failed", 
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleStep3Next = async () => {
    setLoading(true);
    setLoadingMessage('Crafting personalized AI coach system prompt...');

    try {
      const promptData = await callWizardAPI('generate_prompt', { topic, description, syllabus });
      setSystemPrompt(promptData.system_prompt);
      setStep(4);
      toast({ title: "System prompt generated!", description: "Final review before creating" });
    } catch (error) {
      console.error('Wizard error:', error);
      toast({ 
        title: "Generation failed", 
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleComplete = () => {
    const completeData = {
      title: metadata.title,
      subject_key: metadata.subject_key,
      tagline: metadata.tagline,
      overall_goal: metadata.overall_goal,
      hero_description: metadata.hero_description,
      primary_color: metadata.primary_color,
      secondary_color: metadata.secondary_color,
      syllabus_data: syllabus,
      system_prompt_template: systemPrompt,
      skill_areas: metadata.tags || []
    };

    onComplete(completeData);
    onOpenChange(false);
    resetWizard();
  };

  const resetWizard = () => {
    setStep(1);
    setTopic('');
    setDescription('');
    setAudience('');
    setGoals(['']);
    setSyllabus(null);
    setMetadata(null);
    setSystemPrompt('');
  };

  const updatePhase = (index: number, field: string, value: any) => {
    const newPhases = [...syllabus.phases];
    newPhases[index] = { ...newPhases[index], [field]: value };
    setSyllabus({ ...syllabus, phases: newPhases });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Subject Creation Wizard
          </DialogTitle>
          <DialogDescription>
            Step {step} of 4: {step === 1 ? 'Topic Input' : step === 2 ? 'Review Syllabus' : step === 3 ? 'Customize Metadata' : 'Review & Create'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Topic Input */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic">What do you want to teach? *</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Vibecoding with Gemini, Advanced Prompt Engineering, Data Analysis with Python"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Provide more context about what learners should achieve..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="audience">Target Audience (Optional)</Label>
                <Input
                  id="audience"
                  placeholder="e.g., Developers, Product Managers, Marketing Teams"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label>Learning Goals (Optional)</Label>
                {goals.map((goal, i) => (
                  <Input
                    key={i}
                    placeholder={`Goal ${i + 1}`}
                    value={goal}
                    onChange={(e) => {
                      const newGoals = [...goals];
                      newGoals[i] = e.target.value;
                      setGoals(newGoals);
                    }}
                    className="mb-2"
                    disabled={loading}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGoals([...goals, ''])}
                  disabled={loading}
                >
                  + Add Goal
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Review Syllabus */}
          {step === 2 && syllabus && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Generated Syllabus</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingSyllabus(!editingSyllabus)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  {editingSyllabus ? 'Done Editing' : 'Edit'}
                </Button>
              </div>

              <div className="space-y-3">
                {syllabus.phases.map((phase: any, i: number) => (
                  <Card key={i}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {editingSyllabus ? (
                          <Input
                            value={phase.title}
                            onChange={(e) => updatePhase(i, 'title', e.target.value)}
                          />
                        ) : (
                          `Phase ${i + 1}: ${phase.title}`
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {editingSyllabus ? (
                        <Textarea
                          value={phase.description}
                          onChange={(e) => updatePhase(i, 'description', e.target.value)}
                          rows={3}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{phase.description}</p>
                      )}
                      <div>
                        <Label className="text-xs">Expected Outputs:</Label>
                        <ul className="list-disc list-inside text-sm">
                          {phase.expectedOutputs.map((output: string, j: number) => (
                            <li key={j}>{output}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Customize Metadata */}
          {step === 3 && metadata && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={metadata.title}
                  onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="subject_key">Subject Key (URL-friendly)</Label>
                <Input
                  id="subject_key"
                  value={metadata.subject_key}
                  onChange={(e) => setMetadata({ ...metadata, subject_key: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={metadata.tagline}
                  onChange={(e) => setMetadata({ ...metadata, tagline: e.target.value })}
                  maxLength={60}
                />
              </div>

              <div>
                <Label htmlFor="overall_goal">Overall Goal</Label>
                <Textarea
                  id="overall_goal"
                  value={metadata.overall_goal}
                  onChange={(e) => setMetadata({ ...metadata, overall_goal: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="hero_description">Hero Description</Label>
                <Textarea
                  id="hero_description"
                  value={metadata.hero_description}
                  onChange={(e) => setMetadata({ ...metadata, hero_description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ColorPicker
                  label="Primary Color"
                  value={metadata.primary_color}
                  onChange={(color) => setMetadata({ ...metadata, primary_color: color })}
                />
                <ColorPicker
                  label="Secondary Color"
                  value={metadata.secondary_color}
                  onChange={(color) => setMetadata({ ...metadata, secondary_color: color })}
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {metadata.tags.map((tag: string, i: number) => (
                    <Badge key={i} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review System Prompt */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="system_prompt">AI Coach System Prompt</Label>
                <Textarea
                  id="system_prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This defines how the AI coach will interact with learners. Placeholders like {'{user_name}'} will be replaced dynamically.
                </p>
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Ready to Create
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p><strong>Title:</strong> {metadata?.title}</p>
                  <p><strong>Phases:</strong> {syllabus?.phases?.length}</p>
                  <p><strong>Colors:</strong> <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: metadata?.primary_color }}></span> <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: metadata?.secondary_color }}></span></p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground">{loadingMessage}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => step > 1 ? setStep(step - 1) : onOpenChange(false)}
            disabled={loading}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 4 ? (
            <Button
              onClick={step === 1 ? handleStep1Next : step === 2 ? handleStep2Next : handleStep3Next}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={loading}>
              <Check className="h-4 w-4 mr-2" />
              Create Subject
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
