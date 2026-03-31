import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { LogOut, GraduationCap } from 'lucide-react';

const AppHeader = () => {
  const { currentUser, logout } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isAuthPage = location.pathname === '/' || location.pathname.startsWith('/login') || location.pathname.startsWith('/signup');

  if (isAuthPage && !currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      {/* FIX 1: Removed 'page-container' and added 'w-full px-4 md:px-8' 
          to push content to the furthest left and right. 
      */}
      <div className="w-full px-4 md:px-8 flex items-center justify-between py-3">
        
        <Link to="/" className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
          <GraduationCap className="h-6 w-6 text-primary" />
          Co-op Portal
        </Link>

        {currentUser && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground flex items-center">
              {currentUser.fullName || currentUser.name} 
              {/* FIX 2: Updated badge styling to blue (bg-blue-100 text-blue-700)
                  matching the dashboard status style.
              */}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider capitalize">
                {currentUser.role}
              </span>
            </span>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" /> 
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;