import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Briefcase, Shield } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: 'Student',
      description: 'Apply for co-op, upload reports, and track your placement status.',
      icon: GraduationCap,
      loginPath: '/login/student',
      signupLabel: 'Apply for Co-op',
      signupPath: '/apply',
    },
    {
      title: 'Employer',
      description: 'Manage student evaluations, submit forms, and review placements.',
      icon: Briefcase,
      loginPath: '/login/employer',
      signupLabel: 'Create Account',
      signupPath: '/signup/employer',
    },
    {
      title: 'Coordinator',
      description: 'Oversee applications, manage student accounts, and track placements.',
      icon: Shield,
      loginPath: '/login/coordinator',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-12 text-center animate-fade-in">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
          <GraduationCap className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">Co-op Portal</h1>
        <p className="mt-2 text-lg text-muted-foreground">Cooperative Education Management System</p>
      </div>

      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {roles.map((role) => (
          <Card key={role.title} className="card-elevated flex flex-col">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <role.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-heading">{role.title}</CardTitle>
              <CardDescription className="text-sm">{role.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto flex flex-col gap-2">
              <Button onClick={() => navigate(role.loginPath)} className="w-full">
                Sign In
              </Button>
              {role.signupPath && (
                <Button variant="outline" onClick={() => navigate(role.signupPath)} className="w-full">
                  {role.signupLabel}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
