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
  const [draftId, setDraftId] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);

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

  const callWizardAPI = async (action: string, data: any, maxRetries = 3) => {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const { data: result, error } = await supabase.functions.invoke('ai-subject-wizard', {
          body: { action, ...data }
        });

        if (error) {
          if (error.message?.includes('timeout') || error.message?.includes('network')) {
            throw error; // Let caller handle network errors
          }
          throw error;
        }
        
        if (!result?.success) throw new Error(result?.error || 'Generation failed');
        setRetryCount(0); // Reset on success
        return result.data;
      } catch (error) {
        attempt++;
        
        if (attempt >= maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        setRetryCount(attempt);
        
        toast({
          title: `Retrying... (${attempt}/${maxRetries})`,
          description: "The AI is taking longer than expected",
        });
      }
    }
  };

  const saveDraft = async (updates: Partial<any>) => {
    if (!draftId) return;
    
    setSavingDraft(true);
    try {
      const { subjectAdminService } = await import('@/services/SubjectAdminService');
      await subjectAdminService.updateDraft(draftId, updates);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Draft save error:', error);
      toast({
        title: "Draft Save Failed",
        description: "Could not save progress. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setSavingDraft(false);
    }
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
      
      // Create draft immediately after successful generation
      setLoadingMessage('Saving your progress...');
      const { subjectAdminService } = await import('@/services/SubjectAdminService');
      const draft = await subjectAdminService.createDraft({
        title: topic,
        overall_goal: description || topic,
        syllabus_data: syllabusData,
        system_prompt_template: 'Draft - to be generated',
      });

      if (draft) {
        setDraftId(draft.id);
        setLastSaved(new Date());
        toast({ 
          title: "✓ Draft saved!", 
          description: "Your progress is safe. You can continue anytime.",
        });
      }
      
      setStep(2);
    } catch (error) {
      console.error('Wizard error:', error);
      const err = error as Error;
      
      if (err.message?.includes('timeout')) {
        toast({ 
          title: "Request Timed Out", 
          description: "The AI is taking longer than expected. Please try again.",
          variant: "destructive" 
        });
      } else if (err.message?.includes('network')) {
        toast({ 
          title: "Connection Lost", 
          description: "Check your internet connection and try again.",
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Generation failed", 
          description: err.message || "Please try again",
          variant: "destructive" 
        });
      }
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleStep2Next = async () => {
    setLoading(true);
    setLoadingMessage('Generating title, branding, and metadata...');

    try {
      // Update draft with edited syllabus
      if (draftId) {
        await saveDraft({ syllabus_data: syllabus });
      }

      const metadataData = await callWizardAPI('generate_metadata', { topic, description });
      setMetadata(metadataData);
      setStep(3);
      toast({ title: "Metadata generated!", description: "Customize branding and details" });
    } catch (error) {
      console.error('Wizard error:', error);
      const err = error as Error;
      toast({ 
        title: "Generation failed", 
        description: err.message || "Your draft is saved. You can try again anytime.",
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
      // Update draft with metadata
      if (draftId && metadata) {
        await saveDraft({ 
          title: metadata.title,
          subject_key: metadata.subject_key,
          tagline: metadata.tagline,
          hero_description: metadata.hero_description,
          primary_color: metadata.primary_color,
          secondary_color: metadata.secondary_color,
        });
      }

      const promptData = await callWizardAPI('generate_prompt', { topic, description, syllabus, metadata });
      setSystemPrompt(promptData.system_prompt);
      setStep(4);
      toast({ title: "System prompt generated!", description: "Final review before creating" });
    } catch (error) {
      console.error('Wizard error:', error);
      const err = error as Error;
      toast({ 
        title: "Generation failed", 
        description: err.message || "Your draft is saved. You can try again anytime.",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleComplete = async () => {
    if (!syllabus || !metadata || !systemPrompt) {
      toast({ title: "Incomplete", description: "Please complete all steps", variant: "destructive" });
      return;
    }

    // Update draft one final time and change status to active
    if (draftId) {
      setLoading(true);
      setLoadingMessage('Publishing your course...');
      
      try {
        const { subjectAdminService } = await import('@/services/SubjectAdminService');
        await subjectAdminService.updateDraft(draftId, {
          system_prompt_template: systemPrompt,
          status: 'active' as any,
        });

        toast({ 
          title: "🎉 Course published!", 
          description: "Your course is now live and ready for students.",
        });

        onComplete({
          id: draftId,
          subject_key: metadata.subject_key,
          title: metadata.title,
          tagline: metadata.tagline,
          overall_goal: metadata.overall_goal,
          hero_description: metadata.hero_description,
          primary_color: metadata.primary_color,
          secondary_color: metadata.secondary_color,
          syllabus_data: syllabus,
          system_prompt_template: systemPrompt,
          skill_areas: metadata.tags || [],
          phase_context_profiles: {},
          status: 'active',
        });

        resetWizard();
        onOpenChange(false);
      } catch (error) {
        console.error('Publish error:', error);
        toast({ 
          title: "Publish Failed", 
          description: "Could not publish the course. Please try again.",
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
        setLoadingMessage('');
      }
    } else {
      // Fallback if no draft (shouldn't happen)
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
      resetWizard();
      onOpenChange(false);
    }
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
    setDraftId(null);
    setLastSaved(null);
    setSavingDraft(false);
    setRetryCount(0);
  };

  const updatePhase = (index: number, field: string, value: any) => {
    const newPhases = [...syllabus.phases];
    newPhases[index] = { ...newPhases[index], [field]: value };
    setSyllabus({ ...syllabus, phases: newPhases });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && draftId) {
        toast({
          title: "Draft saved",
          description: "Your progress is saved. Resume anytime from the Subjects page.",
        });
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <DialogTitle>AI Subject Creation Wizard</DialogTitle>
            </div>
            {draftId && (
              <Badge variant="secondary" className="text-xs">
                {savingDraft ? 'Saving...' : lastSaved ? `Saved ${Math.floor((Date.now() - lastSaved.getTime()) / 60000)}m ago` : 'Draft'}
              </Badge>
            )}
          </div>
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
