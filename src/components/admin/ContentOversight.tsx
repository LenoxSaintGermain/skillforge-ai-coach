import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Link2, FileText, Star, Trash2, CheckCircle, Eye } from 'lucide-react';

const ContentOversight = () => {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    try {
      const [scenariosRes, resourcesRes, templatesRes] = await Promise.all([
        supabase.from('scenarios').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('learning_resources').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('prompt_templates').select('*').eq('is_public', true).order('created_at', { ascending: false }).limit(50),
      ]);

      setScenarios(scenariosRes.data || []);
      setResources(resourcesRes.data || []);
      setTemplates(templatesRes.data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteScenario = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scenario?')) return;
    
    try {
      const { error } = await supabase.from('scenarios').delete().eq('id', id);
      if (error) throw error;
      
      toast({ title: 'Success', description: 'Scenario deleted successfully' });
      fetchAllContent();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete scenario', variant: 'destructive' });
    }
  };

  const verifyResource = async (id: string, isVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('learning_resources')
        .update({ is_verified: !isVerified })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({ 
        title: 'Success', 
        description: isVerified ? 'Resource unverified' : 'Resource verified successfully' 
      });
      fetchAllContent();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update resource', variant: 'destructive' });
    }
  };

  const deleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      const { error } = await supabase.from('learning_resources').delete().eq('id', id);
      if (error) throw error;
      
      toast({ title: 'Success', description: 'Resource deleted successfully' });
      fetchAllContent();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete resource', variant: 'destructive' });
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const { error } = await supabase.from('prompt_templates').delete().eq('id', id);
      if (error) throw error;
      
      toast({ title: 'Success', description: 'Template deleted successfully' });
      fetchAllContent();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete template', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading content...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Oversight</CardTitle>
        <CardDescription>Monitor and manage platform content</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scenarios" className="space-y-4">
          <TabsList>
            <TabsTrigger value="scenarios">
              <BookOpen className="h-4 w-4 mr-2" />
              Scenarios ({scenarios.length})
            </TabsTrigger>
            <TabsTrigger value="resources">
              <Link2 className="h-4 w-4 mr-2" />
              Resources ({resources.length})
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileText className="h-4 w-4 mr-2" />
              Templates ({templates.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scenarios.map((scenario) => (
                    <TableRow key={scenario.id}>
                      <TableCell className="font-medium">{scenario.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{scenario.difficulty_level}</Badge>
                      </TableCell>
                      <TableCell>{scenario.industry || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(scenario.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteScenario(scenario.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="resources">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">{resource.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{resource.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{resource.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <span className="text-sm">{resource.quality_score || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {resource.is_verified ? (
                          <Badge className="bg-green-500">Verified</Badge>
                        ) : (
                          <Badge variant="outline">Unverified</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(resource.url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => verifyResource(resource.id, resource.is_verified)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteResource(resource.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{template.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.difficulty_level}</Badge>
                      </TableCell>
                      <TableCell>{template.usage_count}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <span className="text-sm">{template.rating?.toFixed(1) || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ContentOversight;
