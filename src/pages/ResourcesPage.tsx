
import React from 'react';
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
import { ArrowRight, FileIcon, BookOpen, Video, Globe, Download } from "lucide-react";
import { Link } from "react-router-dom";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'documentation' | 'video' | 'tutorial' | 'template' | 'article';
  url: string;
  tags: string[];
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
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground">
            Explore our curated collection of AI learning resources to enhance your skills
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Card key={resource.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getIconForResourceType(resource.type)}
                  <Badge>{resource.type}</Badge>
                </div>
                <CardTitle className="line-clamp-2">{resource.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {resource.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={resource.url.startsWith('http') ? resource.url : resource.url} target={resource.url.startsWith('http') ? "_blank" : undefined}>
                    View Resource
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
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
