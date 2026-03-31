import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { registerStudent } from '@/services/authService';
import { db } from '@/services/firebase'; 
import { collection, query, where, getDocs } from 'firebase/firestore';

const ApplicationPage = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
  
    // Name Validation
    if (!fullName.trim()) e.fullName = 'Full name is required.';
    else if (!/^[A-Za-z\s]+$/.test(fullName)) e.fullName = 'Name must contain only alphabetical letters.';
    else if (!/^[A-Za-z]+(?:\s+[A-Za-z]+)+$/.test(fullName.trim())) e.fullName = 'Enter both first and last name.';

    // Student ID Validation
    if (!studentId?.trim()) e.studentId = 'Student ID is required.';
    else if (!/^\d+$/.test(studentId)) e.studentId = 'Student ID must contain only numerical values.';
    else if (studentId.length !== 8) e.studentId = 'Student ID must be exactly 8 digits long.';

    // Email Validation (Detailed messages to replace browser pop-ups)
    if (!studentEmail.trim()) {
      e.studentEmail = 'Email is required.';
    } else if (!studentEmail.includes('@')) {
      e.studentEmail = `Please include an '@' in the email address. '${studentEmail}' is missing an '@'.`;
    } else if (studentEmail.startsWith('@')) {
      e.studentEmail = `Please include a part followed by '@'. '${studentEmail}' is incomplete.`;
    } else if (!studentEmail.endsWith('@torontomu.ca')) {
      e.studentEmail = 'Must be a valid @torontomu.ca email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) {
      e.studentEmail = 'Invalid email format.';
    }
    
    // Secure Password Validation
    // Logic: 8+ chars, 1 upper, 1 lower, 1 number, 1 symbol
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    
    if (!password) {
      e.password = 'Password is required.';
    } else if (!passwordRegex.test(password)) {
      e.password = 'Password must be 8+ characters with at least one uppercase, one lowercase, one number, and one symbol.';
    }
    
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      const q = query(collection(db, 'users'), where('studentId', '==', studentId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setErrors(prev => ({ ...prev, studentId: 'This Student ID is already registered.' }));
        setLoading(false);
        return; 
      }

      const result = await registerStudent(fullName, studentId, studentEmail, password);
      
      if (result.success) {
        setSubmitted(true);
        toast.success('Application submitted successfully!');
      } else {
        toast.error(result.error || 'Failed to submit application');
      }
    } catch (err) {
      toast.error('An error occurred during validation');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="card-elevated w-full max-w-md text-center animate-fade-in">
          <CardContent className="pt-8 pb-8">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-success" />
            <h2 className="font-heading text-2xl font-bold">Application Submitted!</h2>
            <p className="mt-2 text-muted-foreground">
              Your co-op application has been received. Status: <span className="status-badge status-applied">Applied</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              You can now log in with your email and password.
            </p>
            <Button className="mt-6" onClick={() => navigate('/login/student')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="card-elevated w-full max-w-lg animate-fade-in">
        <CardHeader>
          <Button variant="ghost" size="sm" className="mb-2 w-fit" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <CardTitle className="font-heading text-2xl">Co-op Application</CardTitle>
          <CardDescription>Create your account and submit your application</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Added noValidate to stop the browser pop-ups */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                placeholder="Full Name" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
              />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input 
                id="studentId" 
                placeholder="12345678" 
                value={studentId} 
                onChange={(e) => setStudentId(e.target.value)} 
              />
              {errors.studentId && <p className="text-xs text-destructive">{errors.studentId}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="studentEmail">Student Email</Label>
              <Input 
                id="studentEmail" 
                type="email" 
                placeholder="username@torontomu.ca" 
                value={studentEmail} 
                onChange={(e) => setStudentEmail(e.target.value)} 
              />
              {errors.studentEmail && <p className="text-xs text-destructive">{errors.studentEmail}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationPage;