import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { PlayCircle, Save, Star, BarChart3, Lightbulb, Target } from 'lucide-react';

interface PromptAnalysis {
  clarity_score: number;
  specificity_score: number;
  structure_score: number;
  context_score: number;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improved_version: string;
  skill_level_appropriate: boolean;
  estimated_effectiveness: string;
}

interface PromptExperiment {
  id?: string;
  title: string;
  prompt_text: string;
  model_used: string;
  context_data: any;
  response_data: any;
  performance_metrics: any;
  tags: string[];
  is_favorite: boolean;
}

const PromptPlayground = () => {
  const { currentUser } = useUser();
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [model, setModel] = useState('gemini');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [experiments, setExperiments] = useState<PromptExperiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadExperiments();
    }
  }, [currentUser]);

  const loadExperiments = async () => {
    try {
      const { data, error } = await supabase
        .from('prompt_experiments')
        .select('*')
        .eq('user_id', currentUser?.user_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setExperiments(data || []);
    } catch (error) {
      console.error('Error loading experiments:', error);
      toast.error('Failed to load experiments');
    }
  };

  const analyzePrompt = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('prompt-engineering-ai', {
        body: {
          action: 'analyze_prompt',
          prompt: prompt,
          userLevel: currentUser?.ai_knowledge_level || 'beginner'
        }
      });

      if (error) throw error;
      setAnalysis(data.analysis);
      toast.success('Prompt analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing prompt:', error);
      toast.error('Failed to analyze prompt');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateResponse = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }

    setIsGenerating(true);
    try {
      // Call Vertex AI for actual generation
      const { data, error } = await supabase.functions.invoke('vertex-ai', {
        body: {
          prompt: prompt,
          model: model,
          temperature: 0.7,
          maxTokens: 1000
        }
      });

      if (error) throw error;
      setGeneratedResponse(data.generatedText);
      toast.success('Response generated successfully!');
    } catch (error) {
      console.error('Error generating response:', error);
      toast.error('Failed to generate response');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveExperiment = async () => {
    if (!prompt.trim() || !title.trim()) {
      toast.error('Please enter both title and prompt');
      return;
    }

    try {
      const experimentData = {
        user_id: currentUser?.user_id,
        title: title,
        prompt_text: prompt,
        model_used: model,
        context_data: analysis ? JSON.parse(JSON.stringify({ analysis })) : {},
        response_data: generatedResponse ? JSON.parse(JSON.stringify({ response: generatedResponse })) : {},
        performance_metrics: analysis ? JSON.parse(JSON.stringify({
          overall_score: analysis.overall_score,
          clarity_score: analysis.clarity_score,
          specificity_score: analysis.specificity_score
        })) : {},
        tags: tags,
        is_favorite: false
      };

      const { error } = await supabase
        .from('prompt_experiments')
        .insert(experimentData);

      if (error) throw error;
      
      toast.success('Experiment saved successfully!');
      loadExperiments();
      
      // Reset form
      setTitle('');
      setPrompt('');
      setTags([]);
      setAnalysis(null);
      setGeneratedResponse('');
    } catch (error) {
      console.error('Error saving experiment:', error);
      toast.error('Failed to save experiment');
    }
  };

  const loadExperiment = (experiment: PromptExperiment) => {
    setSelectedExperiment(experiment.id || null);
    setTitle(experiment.title);
    setPrompt(experiment.prompt_text);
    setModel(experiment.model_used);
    setTags(experiment.tags || []);
    setAnalysis(experiment.context_data?.analysis || null);
    setGeneratedResponse(experiment.response_data?.response || '');
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Prompt Engineering Playground</h1>
        <div className="flex gap-2">
          <Button 
            onClick={analyzePrompt} 
            disabled={isAnalyzing || !prompt.trim()}
            variant="outline"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </Button>
          <Button 
            onClick={generateResponse} 
            disabled={isGenerating || !prompt.trim()}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
          <Button 
            onClick={saveExperiment} 
            disabled={!prompt.trim() || !title.trim()}
            variant="secondary"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Prompt Input & Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Prompt Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Experiment Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Describe your prompt experiment..."
                />
              </div>

              <div>
                <Label htmlFor="model">AI Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Gemini Pro</SelectItem>
                    <SelectItem value="claude">Claude 3</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prompt">Your Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt here..."
                  rows={8}
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} variant="outline" size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Display */}
          {generatedResponse && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {generatedResponse}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Analysis & History */}
        <div className="space-y-6">
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-4">
              {analysis ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Prompt Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Overall Score</span>
                        <span className={`text-lg font-bold ${getScoreColor(analysis.overall_score)}`}>
                          {analysis.overall_score}/10
                        </span>
                      </div>
                      <Progress value={analysis.overall_score * 10} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Clarity</span>
                        <div className="font-medium">{analysis.clarity_score}/10</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Specificity</span>
                        <div className="font-medium">{analysis.specificity_score}/10</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Structure</span>
                        <div className="font-medium">{analysis.structure_score}/10</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Context</span>
                        <div className="font-medium">{analysis.context_score}/10</div>
                      </div>
                    </div>

                    {analysis.strengths.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                        <ul className="text-sm space-y-1">
                          {analysis.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-blue-600 mb-2">Suggestions</h4>
                        <ul className="text-sm space-y-1">
                          {analysis.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.improved_version && (
                      <div>
                        <h4 className="font-medium mb-2">Improved Version</h4>
                        <div className="bg-muted p-3 rounded text-sm font-mono">
                          {analysis.improved_version}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Enter a prompt and click "Analyze" to get detailed feedback</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Experiments</CardTitle>
                </CardHeader>
                <CardContent>
                  {experiments.length > 0 ? (
                    <div className="space-y-3">
                      {experiments.map((experiment) => (
                        <div
                          key={experiment.id}
                          className={`p-3 rounded border cursor-pointer transition-colors hover:bg-muted ${
                            selectedExperiment === experiment.id ? 'border-primary' : ''
                          }`}
                          onClick={() => loadExperiment(experiment)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {experiment.title}
                            </h4>
                            {experiment.is_favorite && (
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {experiment.prompt_text}
                          </p>
                          <div className="flex gap-1 mt-2">
                            {experiment.tags?.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Save className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No experiments saved yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PromptPlayground;