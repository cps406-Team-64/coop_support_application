import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const ApplicationPage = () => {
  const navigate = useNavigate();
  const { addApplication } = useAppStore();
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!studentId.trim()) e.studentId = 'Student ID is required';
    else if (!/^d{9}$/.test(studentId)) e.studentId = 'Format: 50XXXXXX (e.g. STU-10001)';
    if (!studentEmail.trim()) e.studentEmail = 'Email is required';
    else if (!/^[^\s@]+@university\.ca$/.test(studentEmail)) e.studentEmail = 'Must be a @university.ca email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const success = addApplication({
      studentName: fullName,
      studentId,
      studentEmail,
      status: 'Applied',
      createdAt: new Date().toISOString(),
    });
    if (!success) {
      toast.error('A student with this ID or email has already applied.');
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="card-elevated w-full max-w-md text-center animate-fade-in">
          <CardContent className="pt-8 pb-8">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-success" />
            <h2 className="font-heading text-2xl font-bold">Application Submitted!</h2>
            <p className="mt-2 text-muted-foreground">Your co-op application has been received. Status: <span className="status-badge status-applied">Applied</span></p>
            <p className="mt-1 text-sm text-muted-foreground">You will be notified when your status changes.</p>
            <Button className="mt-6" onClick={() => navigate('/')}>Return Home</Button>
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
          <CardDescription>Submit your co-op placement application</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Alice Johnson" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input id="studentId" placeholder="STU-10001" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
              {errors.studentId && <p className="text-xs text-destructive">{errors.studentId}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentEmail">Student Email</Label>
              <Input id="studentEmail" type="email" placeholder="you@university.edu" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
              {errors.studentEmail && <p className="text-xs text-destructive">{errors.studentEmail}</p>}
            </div>
            <Button type="submit" className="w-full">Submit Application</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationPage;
