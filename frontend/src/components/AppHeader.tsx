import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { LogOut, GraduationCap } from 'lucide-react';

const AppHeader = () => {
  const { currentUser, logout } = useAppStore();
  const location = useLocation();
  const isAuthPage = location.pathname === '/' || location.pathname.startsWith('/login') || location.pathname.startsWith('/signup');

  if (isAuthPage && !currentUser) return null;

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
      <div className="page-container flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
          <GraduationCap className="h-6 w-6 text-primary" />
          Co-op Portal
        </Link>
        {currentUser && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {currentUser.name} <span className="status-badge status-applied ml-1 capitalize">{currentUser.role}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={() => { logout(); window.location.href = '/'; }}>
              <LogOut className="mr-1 h-4 w-4" /> Sign out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
