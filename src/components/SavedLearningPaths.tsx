import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  ExternalLink, 
  Calendar, 
  Target, 
  User, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { catalog, formatDuration, getCatalogUrl } from '@/data/googleCloudCatalog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Step {
  id: string;
  reason: string;
  step_name: string;
}

interface SavedPath {
  id: string;
  title: string;
  persona: string;
  goal: string;
  rationale: string | null;
  pathway: Step[];
  use_case_id: string | null;
  created_at: string;
}

const SavedLearningPaths = () => {
  const { currentUser } = useUser();
  const { toast } = useToast();
  const [paths, setPaths] = useState<SavedPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (currentUser?.user_id) {
      fetchPaths();
    }
  }, [currentUser?.user_id]);

  const fetchPaths = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_learning_paths')
        .select('*')
        .eq('user_id', currentUser?.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Parse the pathway JSONB field
      const parsedPaths = (data || []).map(path => ({
        ...path,
        pathway: typeof path.pathway === 'string' ? JSON.parse(path.pathway) : path.pathway
      }));
      
      setPaths(parsedPaths);
    } catch (error) {
      console.error('Error fetching saved paths:', error);
      toast({
        title: 'Error',
        description: 'Failed to load saved learning paths.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('saved_learning_paths')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      setPaths(prev => prev.filter(p => p.id !== deleteId));
      toast({
        title: 'Deleted',
        description: 'Learning path removed from your saved paths.'
      });
    } catch (error) {
      console.error('Error deleting path:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete learning path.',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const getCatalogItem = (id: string) => {
    return catalog.find(c => c.id === id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (paths.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Saved Learning Paths</h3>
          <p className="text-muted-foreground max-w-md">
            Generate a personalized learning path from the homepage and save it to access it here anytime.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {paths.map((path) => (
          <motion.div
            key={path.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{path.title}</CardTitle>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {path.persona}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {path.goal.length > 40 ? path.goal.slice(0, 40) + '...' : path.goal}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(path.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{path.pathway.length} courses</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExpandedId(expandedId === path.id ? null : path.id)}
                    >
                      {expandedId === path.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(path.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <AnimatePresence>
                {expandedId === path.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent className="pt-0 border-t">
                      {/* Rationale */}
                      {path.rationale && (
                        <div className="bg-muted/50 rounded-lg p-4 mb-4 mt-4">
                          <p className="text-sm text-muted-foreground">{path.rationale}</p>
                        </div>
                      )}

                      {/* Courses */}
                      <div className="grid gap-3 mt-4">
                        {path.pathway.map((step, index) => {
                          const item = getCatalogItem(step.id);
                          if (!item) return null;

                          return (
                            <div 
                              key={step.id}
                              className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-sm font-semibold text-primary">{index + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm">{item.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{step.reason}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {formatDuration(item.duration_minutes)}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {item.level}
                                  </Badge>
                                </div>
                              </div>
                              <a
                                href={getCatalogUrl(item.title)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0"
                              >
                                <Button size="sm" variant="outline" className="gap-1">
                                  Start
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Learning Path?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove this learning path from your saved paths.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SavedLearningPaths;
