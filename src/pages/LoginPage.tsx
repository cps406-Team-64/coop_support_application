import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, type UserRole } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { loginUser } from '@/services/authService';

interface LoginPageProps {
  role: UserRole;
}

const LoginPage = ({ role }: LoginPageProps) => {
  const navigate = useNavigate();
  const { login } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};

    // Email Validation (Matches ApplicationPage logic)
    if (!email.trim()) {
      e.email = 'Email is required.';
    } else if (!email.includes('@')) {
      e.email = `Please include an '@' in the email address. '${email}' is missing an '@'.`;
    } else if (email.startsWith('@')) {
      e.email = `Please include a part followed by '@'. '${email}' is incomplete.`;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Invalid email format.';
    }

    if (!password) {
      e.password = 'Password is required.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    
    if (!validate()) return;
    
    setLoading(true);
    const result = await loginUser(email, password);
    setLoading(false);
    
    if (result.success && result.user) {
      const user = result.user;

      if (user.role !== role) {
        toast.error(`This account is a ${user.role}. Access denied.`);
        return;
      }
      
      login(user);
      toast.success(`Welcome, ${user.fullName || user.name || 'User'}!`);
      navigate(`/dashboard/${role}`);
    } else {
      // Check if error is credential-related
      if (result.error?.includes('invalid-credential') || result.error?.includes('auth/user-not-found') || result.error?.includes('auth/wrong-password')) {
        setErrors({ password: 'Incorrect email or password.' });
      } else {
        toast.error(result.error || 'Login failed');
      }
    }
  };

  const titles = { 
    student: 'Student Login', 
    employer: 'Employer Login', 
    coordinator: 'Coordinator Login' 
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader>
          <Button variant="ghost" size="sm" className="mb-2 w-fit" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <CardTitle className="text-2xl">{titles[role]}</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {/* noValidate prevents the default browser pop-up */}
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;