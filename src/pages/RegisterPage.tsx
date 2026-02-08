import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register({ email, password, full_name: fullName });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Could not create account',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-ai items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Rocket className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Boson Chief</h1>
              <p className="text-white/70">Project Management</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Join the Future of Work
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Experience enterprise management reimagined with dual AI agents working in harmony to optimize your workflow.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <h4 className="font-bold text-2xl">50%</h4>
              <p className="text-sm text-white/70">Time saved on scheduling</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <h4 className="font-bold text-2xl">3x</h4>
              <p className="text-sm text-white/70">Faster project insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-ai">
                <Rocket className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Create account</CardTitle>
            <CardDescription>
              Get started with Boson Chief today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={8}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full gradient-primary text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Create account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
