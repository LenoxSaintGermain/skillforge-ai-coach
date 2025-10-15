import { useState, useEffect } from 'react';
import { SubjectConfig } from '@/services/SubjectConfigService';
import { subjectAdminService } from '@/services/SubjectAdminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Copy, Trash2, Star, Sparkles } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { JsonEditor } from './JsonEditor';
import { SyllabusBuilder } from './SyllabusBuilder';
import { SubjectWizard } from './SubjectWizard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState<SubjectConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectConfig | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<SubjectConfig>>({
    subject_key: '',
    title: '',
    tagline: '',
    overall_goal: '',
    hero_description: '',
    primary_color: '#8B5CF6',
    secondary_color: '#EC4899',
    logo_url: '',
    syllabus_data: { phases: [] },
    system_prompt_template: '',
    skill_areas: [],
    phase_context_profiles: {},
    status: 'active',
    is_default: false,
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const data = await subjectAdminService.getAllSubjects();
      setSubjects(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load subjects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingSubject(null);
    setFormData({
      subject_key: '',
      title: '',
      tagline: '',
      overall_goal: '',
      hero_description: '',
      primary_color: '#8B5CF6',
      secondary_color: '#EC4899',
      logo_url: '',
      syllabus_data: { phases: [] },
      system_prompt_template: '',
      skill_areas: [],
      phase_context_profiles: {},
      status: 'active',
      is_default: false,
    });
    setIsFormOpen(true);
  };

  const handleWizardComplete = (generatedData: any) => {
    setFormData({
      ...formData,
      ...generatedData,
      status: 'active',
      is_default: false
    });
    setEditingSubject(null);
    setIsFormOpen(true);
    toast({
      title: "Subject generated!",
      description: "Review and save the AI-generated subject configuration"
    });
  };

  const openEditDialog = (subject: SubjectConfig) => {
    setEditingSubject(subject);
    setFormData(subject);
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    try {
      // Generate subject_key from title if empty
      if (!formData.subject_key && formData.title) {
        formData.subject_key = formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }

      if (editingSubject) {
        await subjectAdminService.updateSubject(editingSubject.id, formData);
        toast({
          title: 'Success',
          description: 'Subject updated successfully',
        });
      } else {
        await subjectAdminService.createSubject(formData);
        toast({
          title: 'Success',
          description: 'Subject created successfully',
        });
      }

      setIsFormOpen(false);
      loadSubjects();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save subject',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async (subject: SubjectConfig) => {
    try {
      await subjectAdminService.duplicateSubject(subject.id);
      toast({
        title: 'Success',
        description: 'Subject duplicated successfully',
      });
      loadSubjects();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate subject',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!subjectToDelete) return;

    try {
      await subjectAdminService.deleteSubject(subjectToDelete);
      toast({
        title: 'Success',
        description: 'Subject deleted successfully',
      });
      loadSubjects();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete subject',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSubjectToDelete(null);
    }
  };

  const handleToggleStatus = async (subject: SubjectConfig) => {
    try {
      const newStatus = subject.status === 'active' ? 'archived' : 'active';
      await subjectAdminService.updateSubject(subject.id, { status: newStatus } as any);
      toast({
        title: 'Success',
        description: `Subject ${newStatus === 'active' ? 'activated' : 'archived'}`,
      });
      loadSubjects();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleSetDefault = async (subjectId: string) => {
    try {
      await subjectAdminService.setDefaultSubject(subjectId);
      toast({
        title: 'Success',
        description: 'Default subject updated',
      });
      loadSubjects();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to set default subject',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading subjects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Subject Management</h2>
          <p className="text-muted-foreground">Create and manage learning subjects</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsWizardOpen(true)} className="bg-gradient-to-r from-primary to-secondary">
            <Sparkles className="h-4 w-4 mr-2" />
            Create with AI Wizard
          </Button>
          <Button onClick={openCreateDialog} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create Manually
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subjects</CardTitle>
          <CardDescription>Manage subjects, their content, and configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.title}</TableCell>
                  <TableCell>
                    <code className="text-sm">{subject.subject_key}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={subject.status === 'active' ? 'default' : 'secondary'}>
                      {subject.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {subject.is_default && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(subject)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDuplicate(subject)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSubjectToDelete(subject.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={subject.status === 'active'}
                        onCheckedChange={() => handleToggleStatus(subject)}
                      />
                      {!subject.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(subject.id)}
                        >
                          Set Default
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSubject ? 'Edit Subject' : 'Create Subject'}</DialogTitle>
            <DialogDescription>
              Configure the subject details, branding, and syllabus
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
              <TabsTrigger value="prompt">Prompt</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Gemini Training"
                />
              </div>
              <div>
                <Label>Subject Key *</Label>
                <Input
                  value={formData.subject_key}
                  onChange={(e) => setFormData({ ...formData, subject_key: e.target.value })}
                  placeholder="e.g., gemini-training"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lowercase, hyphenated. Auto-generated from title if empty.
                </p>
              </div>
              <div>
                <Label>Tagline</Label>
                <Input
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Short description (max 60 chars)"
                  maxLength={60}
                />
              </div>
              <div>
                <Label>Overall Goal *</Label>
                <Textarea
                  value={formData.overall_goal}
                  onChange={(e) => setFormData({ ...formData, overall_goal: e.target.value })}
                  placeholder="What will learners achieve?"
                  rows={3}
                />
              </div>
              <div>
                <Label>Hero Description</Label>
                <Textarea
                  value={formData.hero_description || ''}
                  onChange={(e) => setFormData({ ...formData, hero_description: e.target.value })}
                  placeholder="Landing page description"
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                />
                <Label>Set as Default Subject</Label>
              </div>
            </TabsContent>

            <TabsContent value="branding" className="space-y-4">
              <ColorPicker
                label="Primary Color"
                value={formData.primary_color || '#8B5CF6'}
                onChange={(color) => setFormData({ ...formData, primary_color: color })}
              />
              <ColorPicker
                label="Secondary Color"
                value={formData.secondary_color || '#EC4899'}
                onChange={(color) => setFormData({ ...formData, secondary_color: color })}
              />
              <div>
                <Label>Logo URL</Label>
                <Input
                  value={formData.logo_url || ''}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </TabsContent>

            <TabsContent value="syllabus" className="space-y-4">
              <SyllabusBuilder
                value={formData.syllabus_data}
                onChange={(syllabus) => setFormData({ ...formData, syllabus_data: syllabus })}
              />
            </TabsContent>

            <TabsContent value="prompt" className="space-y-4">
              <div>
                <Label>System Prompt Template *</Label>
                <Textarea
                  value={formData.system_prompt_template}
                  onChange={(e) => setFormData({ ...formData, system_prompt_template: e.target.value })}
                  placeholder="Enter the AI system prompt template..."
                  rows={12}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use variables: {'{user_name}'}, {'{user_role}'}, {'{subject_title}'}, {'{phase_title}'}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <JsonEditor
                label="Skill Areas (JSON)"
                value={formData.skill_areas}
                onChange={(value) => setFormData({ ...formData, skill_areas: value })}
                placeholder='["Skill 1", "Skill 2"]'
                rows={6}
              />
              <JsonEditor
                label="Phase Context Profiles (JSON)"
                value={formData.phase_context_profiles}
                onChange={(value) => setFormData({ ...formData, phase_context_profiles: value })}
                placeholder='{"1": {"key": "value"}}'
                rows={8}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingSubject ? 'Update' : 'Create'} Subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the subject. It will no longer be visible to users, but data will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI Wizard */}
      <SubjectWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onComplete={handleWizardComplete}
      />
    </div>
  );
};

export default SubjectManagement;
