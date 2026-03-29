import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const EmployerSignup = () => {
  const navigate = useNavigate();
  const { login } = useAppStore();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!company.trim()) e.company = 'Company is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email format';
    if (!password || password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    login({ id: `EMP-${Date.now()}`, name, email, role: 'employer', company });
    toast.success('Account created successfully!');
    navigate('/dashboard/employer');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="card-elevated w-full max-w-md animate-fade-in">
        <CardHeader>
          <Button variant="ghost" size="sm" className="mb-2 w-fit" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <CardTitle className="font-heading text-2xl">Employer Registration</CardTitle>
          <CardDescription>Create your employer account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { id: 'name', label: 'Full Name', value: name, setter: setName, placeholder: 'John Doe' },
              { id: 'company', label: 'Company', value: company, setter: setCompany, placeholder: 'Acme Corp' },
              { id: 'email', label: 'Email', value: email, setter: setEmail, placeholder: 'you@company.com', type: 'email' },
              { id: 'password', label: 'Password', value: password, setter: setPassword, placeholder: '••••••••', type: 'password' },
            ].map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input id={field.id} type={field.type || 'text'} placeholder={field.placeholder} value={field.value} onChange={(e) => field.setter(e.target.value)} />
                {errors[field.id] && <p className="text-xs text-destructive">{errors[field.id]}</p>}
              </div>
            ))}
            <Button type="submit" className="w-full">Create Account</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerSignup;
