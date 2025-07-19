import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUser } from '@/contexts/UserContext';
import { Loader2, Brain, Sparkles } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, signUp, isLoading } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: '',
    industry: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('signin');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await login(formData.email, formData.password);
      if (error) {
        setError(error.message || 'Failed to sign in');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await signUp(formData.email, formData.password, formData.name);
      if (error) {
        setError(error.message || 'Failed to create account');
      } else {
        setError(null);
        setActiveTab('signin');
        // Show success message
        setTimeout(() => {
          setError('Account created successfully! Please sign in.');
        }, 100);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-skillforge-light to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-skillforge-primary mr-2" />
            <h1 className="text-2xl font-bold">SkillForge AI</h1>
          </div>
          <p className="text-muted-foreground">Master AI skills with personalized coaching</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="h-5 w-5 text-skillforge-secondary mr-2" />
              <CardTitle>Welcome</CardTitle>
            </div>
            <CardDescription>
              Sign in to continue your AI learning journey or create a new account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                  </div>
                  
                  {error && (
                    <Alert variant={error.includes('successfully') ? 'default' : 'destructive'}>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-skillforge-primary hover:bg-skillforge-dark"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role (Optional)</Label>
                      <Input
                        id="role"
                        type="text"
                        placeholder="Product Manager"
                        value={formData.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry (Optional)</Label>
                      <Input
                        id="industry"
                        type="text"
                        placeholder="Technology"
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <Alert variant={error.includes('successfully') ? 'default' : 'destructive'}>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-skillforge-primary hover:bg-skillforge-dark"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Demo credentials: demo@skillforge.ai / password123
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;