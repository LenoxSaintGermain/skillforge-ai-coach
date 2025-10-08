import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Award, BookOpen, Clock, Shield } from 'lucide-react';

interface UserDetailModalProps {
  user: {
    id: string;
    user_id: string;
    name: string;
    email: string | null;
    role: string | null;
    industry: string | null;
    ai_knowledge_level: string | null;
    created_at: string;
  };
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

interface UserStats {
  scenariosCompleted: number;
  totalTimeSpent: number;
  achievements: number;
  currentRole: string | null;
}

export const UserDetailModal = ({ user, open, onClose, onUpdate }: UserDetailModalProps) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('user');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchUserStats();
      fetchUserRole();
    }
  }, [open, user.user_id]);

  const fetchUserStats = async () => {
    try {
      const [progressRes, achievementsRes] = await Promise.all([
        supabase
          .from('user_scenario_progress')
          .select('status, completion_time')
          .eq('user_id', user.user_id),
        supabase
          .from('achievements')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.user_id),
      ]);

      const completed = progressRes.data?.filter(p => p.status === 'completed').length || 0;
      const totalTime = progressRes.data?.reduce((sum, p) => sum + (p.completion_time || 0), 0) || 0;

      setStats({
        scenariosCompleted: completed,
        totalTimeSpent: totalTime,
        achievements: achievementsRes.count || 0,
        currentRole: null,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async () => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.user_id)
        .maybeSingle();

      if (data) {
        setSelectedRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const updateUserRole = async () => {
    try {
      // First, delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.user_id);

      // Then insert new role if not 'user'
      if (selectedRole !== 'user') {
        const { error } = await supabase
          .from('user_roles')
          .insert({ 
            user_id: user.user_id, 
            role: selectedRole as 'admin' | 'moderator' | 'user'
          });

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user.name}</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roles">Role Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Scenarios</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.scenariosCompleted}</div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats ? formatTime(stats.totalTimeSpent) : '0m'}
                      </div>
                      <p className="text-xs text-muted-foreground">Total learning time</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.achievements}</div>
                      <p className="text-xs text-muted-foreground">Earned</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Role:</span>
                      <Badge variant="outline">{user.role || 'Not set'}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Industry:</span>
                      <span className="text-sm">{user.industry || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">AI Knowledge:</span>
                      <Badge variant="secondary">{user.ai_knowledge_level || 'Not assessed'}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  System Role
                </CardTitle>
                <CardDescription>
                  Assign system-level permissions to this user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User (No special privileges)</SelectItem>
                    <SelectItem value="moderator">Moderator (Can manage content)</SelectItem>
                    <SelectItem value="admin">Admin (Full access)</SelectItem>
                  </SelectContent>
                </Select>

                <div className="text-sm text-muted-foreground">
                  {selectedRole === 'admin' && (
                    <p>⚠️ Admins have full access to all platform features and user data.</p>
                  )}
                  {selectedRole === 'moderator' && (
                    <p>Moderators can review and manage user-submitted content.</p>
                  )}
                  {selectedRole === 'user' && (
                    <p>Standard user with access to learning features only.</p>
                  )}
                </div>

                <Button onClick={updateUserRole} className="w-full">
                  Update Role
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
