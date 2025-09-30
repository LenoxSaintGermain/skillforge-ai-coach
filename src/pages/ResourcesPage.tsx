import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowRight, FileIcon, BookOpen, Video, Globe, Download, Search, Sparkles, Loader2, ThumbsUp, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'documentation' | 'video' | 'tutorial' | 'template' | 'article';
  url: string;
  tags: string[];
  source?: 'ai-curated' | 'manual';
  quality_score?: number;
  votes?: number;
  created_at?: string;
}

const resources: Resource[] = [
  {
    id: '1',
    title: 'Gemini API Documentation',
    description: 'Official Google documentation for the Gemini API, includes guides, references, and sample code.',
    type: 'documentation',
    url: 'https://ai.google.dev/docs',
    tags: ['Gemini', 'API', 'Documentation']
  },
  {
    id: '2',
    title: 'Prompt Engineering Best Practices',
    description: 'A comprehensive guide to effective prompt design techniques for generative AI applications.',
    type: 'article',
    url: 'https://www.promptingguide.ai/',
    tags: ['Prompt Engineering', 'Best Practices', 'Techniques']
  },
  {
    id: '3',
    title: 'Introduction to Chain-of-Thought Prompting',
    description: 'Learn how to implement chain-of-thought techniques to improve reasoning in AI systems.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=hfIUstzHs9A',
    tags: ['Chain-of-Thought', 'Advanced Techniques', 'Reasoning']
  },
  {
    id: '4',
    title: 'AI Safety & Responsible AI Implementation',
    description: 'Guidelines for implementing AI in a safe and responsible manner across different domains.',
    type: 'documentation',
    url: 'https://ai.google/responsibility/',
    tags: ['AI Ethics', 'Safety', 'Responsible AI']
  },
  {
    id: '5',
    title: 'AI Project Planning Template',
    description: 'A structured template for planning AI implementation projects with key considerations and steps.',
    type: 'template',
    url: '/templates/ai-project-planning.pdf',
    tags: ['Planning', 'Project Management', 'Template']
  },
  {
    id: '6',
    title: 'Building Conversational AI Applications',
    description: 'Step-by-step tutorial for creating effective conversational AI experiences with Gemini.',
    type: 'tutorial',
    url: 'https://developers.google.com/learn/pathways/generative-ai',
    tags: ['Conversational AI', 'Tutorial', 'Implementation']
  }
];

const getIconForResourceType = (type: Resource['type']) => {
  switch (type) {
    case 'documentation':
      return <BookOpen className="h-5 w-5" />;
    case 'video':
      return <Video className="h-5 w-5" />;
    case 'tutorial':
      return <FileIcon className="h-5 w-5" />;
    case 'template':
      return <Download className="h-5 w-5" />;
    case 'article':
      return <Globe className="h-5 w-5" />;
    default:
      return <FileIcon className="h-5 w-5" />;
  }
};

const ResourcesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const [dynamicResources, setDynamicResources] = useState<Resource[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>(resources);
  const { toast } = useToast();

  // Load dynamic resources from database
  useEffect(() => {
    loadDynamicResources();
  }, []);

  const loadDynamicResources = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_resources')
        .select('*')
        .order('votes', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        const formattedResources: Resource[] = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          type: item.type as Resource['type'],
          url: item.url,
          tags: item.tags || [],
          source: item.source as 'ai-curated' | 'manual',
          quality_score: item.quality_score || undefined,
          votes: item.votes || 0,
          created_at: item.created_at
        }));
        setDynamicResources(formattedResources);
        setAllResources([...resources, ...formattedResources]);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  };

  const discoverResources = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a topic to discover resources about",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setSearchStatus('Searching the web with Gemini...');

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase.functions.invoke('discover-resources', {
        body: { 
          query: searchQuery,
          userId: user?.id
        }
      });

      if (error) throw error;

      setSearchStatus(`Found ${data.count || 0} resources! Analyzing quality...`);

      setTimeout(() => {
        toast({
          title: "Resources discovered!",
          description: `Added ${data.count || 0} new resources about "${searchQuery}"`,
        });
        
        // Reload resources
        loadDynamicResources();
        setSearchQuery('');
        setSearchStatus('');
      }, 1000);

    } catch (error) {
      console.error('Discovery error:', error);
      toast({
        title: "Discovery failed",
        description: error instanceof Error ? error.message : "Failed to discover resources",
        variant: "destructive"
      });
      setSearchStatus('');
    } finally {
      setIsSearching(false);
    }
  };

  const handleVote = async (resourceId: string, currentVotes: number) => {
    try {
      const { error } = await supabase
        .from('learning_resources')
        .update({ votes: currentVotes + 1 })
        .eq('id', resourceId);

      if (error) throw error;

      // Update local state
      setDynamicResources(prev => 
        prev.map(r => r.id === resourceId ? { ...r, votes: (r.votes || 0) + 1 } : r)
      );
      setAllResources(prev =>
        prev.map(r => r.id === resourceId ? { ...r, votes: (r.votes || 0) + 1 } : r)
      );

      toast({
        title: "Vote recorded",
        description: "Thanks for helping improve our resource quality!",
      });
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">AI Learning Resources</h1>
          <p className="text-muted-foreground">
            Explore curated resources or let AI discover new ones for your learning journey
          </p>
        </div>

        {/* AI Discovery Interface */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>AI-Powered Resource Discovery</CardTitle>
            </div>
            <CardDescription>
              Use Gemini with Google Search to discover the best learning resources on any topic
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="What do you want to learn? (e.g., 'RAG systems', 'LangChain tutorials')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && discoverResources()}
                disabled={isSearching}
                className="flex-1"
              />
              <Button 
                onClick={discoverResources}
                disabled={isSearching || !searchQuery.trim()}
                size="lg"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Discover
                  </>
                )}
              </Button>
            </div>

            {searchStatus && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>{searchStatus}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Try:</span>
              {['Vector databases', 'Prompt engineering', 'Fine-tuning LLMs', 'RAG pipelines'].map(topic => (
                <Button
                  key={topic}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery(topic)}
                  disabled={isSearching}
                >
                  {topic}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Resources Count */}
        {dynamicResources.length > 0 && (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <span className="font-semibold">{dynamicResources.length}</span> AI-discovered resources available
            </AlertDescription>
          </Alert>
        )}

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allResources.map((resource) => (
            <Card key={resource.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getIconForResourceType(resource.type)}
                    <Badge>{resource.type}</Badge>
                  </div>
                  {resource.source === 'ai-curated' && (
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI
                    </Badge>
                  )}
                </div>
                <CardTitle className="line-clamp-2">{resource.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {resource.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                {resource.quality_score && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Quality:</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-2 rounded-full ${
                            i < resource.quality_score! ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{resource.quality_score}/10</span>
                  </div>
                )}

                {resource.votes !== undefined && resource.source === 'ai-curated' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(resource.id, resource.votes || 0)}
                    className="w-full"
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Helpful ({resource.votes})
                  </Button>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    View Resource
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
