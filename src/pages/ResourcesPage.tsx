
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
import { ArrowRight, FileIcon, BookOpen, Video, Globe, Download, Search, Sparkles, ThumbsUp, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'documentation' | 'video' | 'tutorial' | 'template' | 'article';
  url: string;
  tags: string[];
  source?: string;
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
  const [aiResources, setAiResources] = useState<Resource[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>(resources);
  const { toast } = useToast();

  // Load AI-discovered resources from database
  useEffect(() => {
    loadAiResources();
  }, []);

  const loadAiResources = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_resources')
        .select('*')
        .order('votes', { ascending: false })
        .order('quality_score', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data) {
        const formattedResources: Resource[] = data.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          type: r.type as Resource['type'],
          url: r.url,
          tags: r.tags || [],
          source: r.source,
          quality_score: r.quality_score || undefined,
          votes: r.votes || 0,
          created_at: r.created_at,
        }));
        setAiResources(formattedResources);
        setAllResources([...resources, ...formattedResources]);
      }
    } catch (error) {
      console.error('Error loading AI resources:', error);
    }
  };

  const discoverResources = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Please enter a topic",
        description: "Tell us what you want to learn about",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchStatus('Searching the web...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('discover-resources', {
        body: { 
          query: searchQuery,
          userId: user?.id 
        }
      });

      if (error) throw error;

      setSearchStatus(`Found ${data.count} resources!`);
      
      toast({
        title: "Resources discovered! ✨",
        description: `Found ${data.count} high-quality resources about "${searchQuery}"`,
      });

      // Reload resources
      await loadAiResources();
      setSearchQuery('');

    } catch (error) {
      console.error('Error discovering resources:', error);
      toast({
        title: "Discovery failed",
        description: error instanceof Error ? error.message : "Failed to discover resources",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
      setTimeout(() => setSearchStatus(''), 3000);
    }
  };

  const handleVote = async (resourceId: string) => {
    try {
      const resource = allResources.find(r => r.id === resourceId);
      if (!resource || resource.source !== 'ai-curated') return;

      const { error } = await supabase
        .from('learning_resources')
        .update({ votes: (resource.votes || 0) + 1 })
        .eq('id', resourceId);

      if (error) throw error;

      // Update local state
      setAllResources(prev => 
        prev.map(r => r.id === resourceId ? { ...r, votes: (r.votes || 0) + 1 } : r)
      );
      setAiResources(prev => 
        prev.map(r => r.id === resourceId ? { ...r, votes: (r.votes || 0) + 1 } : r)
      );

      toast({
        title: "Vote recorded!",
        description: "Thanks for helping improve our resource quality",
      });

    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">AI Learning Resources</h1>
          <p className="text-muted-foreground">
            Discover high-quality resources powered by AI web search
          </p>
        </div>

        {/* AI Search Interface */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Discover Resources with AI
            </CardTitle>
            <CardDescription>
              Tell us what you want to learn, and AI will search the web for the best resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., RAG systems, LangChain tutorials, prompt engineering..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && discoverResources()}
                disabled={isSearching}
                className="flex-1"
              />
              <Button 
                onClick={discoverResources} 
                disabled={isSearching}
                size="lg"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
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
              <p className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-pulse" />
                {searchStatus}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allResources.map((resource) => (
            <Card key={resource.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getIconForResourceType(resource.type)}
                  <Badge>{resource.type}</Badge>
                  {resource.source === 'ai-curated' && (
                    <Badge variant="secondary" className="ml-auto">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI-Discovered
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
                    <Badge variant={resource.quality_score >= 8 ? "default" : "secondary"}>
                      {resource.quality_score}/10
                    </Badge>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link to={resource.url.startsWith('http') ? resource.url : resource.url} target={resource.url.startsWith('http') ? "_blank" : undefined}>
                    View Resource
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {resource.source === 'ai-curated' && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleVote(resource.id)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {resource.votes ? <span className="ml-1 text-xs">{resource.votes}</span> : null}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
