import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, type UserRole } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  role: UserRole;
}

const mockUsers = {
  student: { id: 'STU-10001', name: 'Alice Johnson', email: 'alice.johnson@university.edu', role: 'student' as UserRole, studentId: 'STU-10001', passwordSetup: true },
  employer: { id: 'EMP-001', name: 'Jane Thompson', email: 'jane@techcorp.com', role: 'employer' as UserRole, company: 'TechCorp Inc.' },
  coordinator: { id: 'COORD-001', name: 'Dr. Sarah Williams', email: 'sarah.williams@university.edu', role: 'coordinator' as UserRole },
};

const LoginPage = ({ role }: LoginPageProps) => {
  const navigate = useNavigate();
  const { login } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    // Mock login
    const user = mockUsers[role];
    login(user);
    toast.success(`Welcome back, ${user.name}!`);
    navigate(`/dashboard/${role}`);
  };

  const titles = { student: 'Student Login', employer: 'Employer Login', coordinator: 'Coordinator Login' };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="card-elevated w-full max-w-md animate-fade-in">
        <CardHeader>
          <Button variant="ghost" size="sm" className="mb-2 w-fit" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <CardTitle className="font-heading text-2xl">{titles[role]}</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {role === 'student' && (
              <button type="button" className="text-sm text-primary hover:underline" onClick={() => toast.info('Password reset link sent to your email')}>
                Forgot password?
              </button>
            )}
            <Button type="submit" className="w-full">Sign In</Button>
            <p className="text-center text-xs text-muted-foreground">
              Demo: enter any email/password to proceed
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
