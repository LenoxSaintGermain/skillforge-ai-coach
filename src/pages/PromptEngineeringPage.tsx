import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PromptPlayground from '@/components/PromptPlayground';
import PromptEngineeringWorkflow from '@/components/PromptEngineeringWorkflow';
import AISkillAssessment from '@/components/AISkillAssessment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { 
  Brain, 
  Target, 
  Zap, 
  BarChart3, 
  BookOpen, 
  Users,
  TrendingUp,
  Award
} from 'lucide-react';

const PromptEngineeringPage = () => {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'AI-Powered Analysis',
      description: 'Get instant feedback on your prompts with detailed scoring and suggestions',
      color: 'bg-blue-500'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Personalized Learning',
      description: 'Adaptive exercises that match your skill level and learning pace',
      color: 'bg-green-500'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Real-time Practice',
      description: 'Interactive playground to experiment with different prompt techniques',
      color: 'bg-purple-500'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Progress Tracking',
      description: 'Monitor your improvement with detailed analytics and achievements',
      color: 'bg-orange-500'
    }
  ];

  const learningPaths = [
    {
      title: 'Complete Beginner',
      description: 'Start with basic prompt structure and fundamental concepts',
      duration: '2-3 weeks',
      exercises: 12,
      difficulty: 'Beginner'
    },
    {
      title: 'Intermediate Practitioner',
      description: 'Master context setting, specificity, and advanced techniques',
      duration: '3-4 weeks',
      exercises: 18,
      difficulty: 'Intermediate'
    },
    {
      title: 'Advanced Expert',
      description: 'Complex reasoning, multi-step prompts, and optimization',
      duration: '4-6 weeks',
      exercises: 24,
      difficulty: 'Advanced'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold">Prompt Engineering Mastery</h1>
            <p className="text-muted-foreground text-lg mt-2">
              Master the art of communicating with AI through structured learning and practice
            </p>
          </div>
          <TabsList className="grid w-fit grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="learn">Learn</TabsTrigger>
            <TabsTrigger value="practice">Practice</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-8">
          {/* Hero Section */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">
                    Transform Your AI Interactions
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Learn to craft precise, effective prompts that get better results from AI models. 
                    Our comprehensive platform combines theory with hands-on practice.
                  </p>
                  <div className="flex gap-4">
                    <Button 
                      size="lg"
                      onClick={() => setActiveTab('assessment')}
                    >
                      <Target className="w-5 h-5 mr-2" />
                      Start Assessment
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => setActiveTab('practice')}
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Try Playground
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <Card key={index} className="border-none shadow-sm">
                      <CardContent className="pt-4">
                        <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                          {feature.icon}
                        </div>
                        <h3 className="font-semibold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Paths */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Choose Your Learning Path</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {learningPaths.map((path, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{path.title}</CardTitle>
                        <Badge className={getDifficultyColor(path.difficulty)}>
                          {path.difficulty}
                        </Badge>
                      </div>
                      <BookOpen className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{path.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">{path.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Exercises:</span>
                        <span className="font-medium">{path.exercises}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4"
                      variant={index === 0 ? "default" : "outline"}
                      onClick={() => setActiveTab('learn')}
                    >
                      Start Learning
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          {currentUser && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-muted-foreground">Exercises Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">Beginner</div>
                    <div className="text-sm text-muted-foreground">Current Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-muted-foreground">XP Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">0</div>
                    <div className="text-sm text-muted-foreground">Achievements</div>
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  <Button onClick={() => setActiveTab('assessment')}>
                    <Award className="w-4 h-4 mr-2" />
                    Take Skill Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Community Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Join the Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Share Your Prompts</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Contribute to our community library of effective prompts and learn from others.
                  </p>
                  <Button variant="outline">
                    Browse Templates
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Get Help</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Stuck on a challenge? Get personalized feedback and guidance from our AI coach.
                  </p>
                  <Button variant="outline">
                    Ask for Help
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessment">
          <AISkillAssessment />
        </TabsContent>

        <TabsContent value="learn">
          <PromptEngineeringWorkflow />
        </TabsContent>

        <TabsContent value="practice">
          <PromptPlayground />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PromptEngineeringPage;