// src/components/ProtectedRoute.tsx
import { useUserRole } from '../hooks/useUserRole';

interface Props {
  children: React.ReactNode;
  allowedRole: 'student' | 'coordinator' | 'employer';
  requiredStatus?: string[];
}

export const ProtectedRoute: React.FC<Props> = ({ 
  children, 
  allowedRole, 
  requiredStatus 
}) => {
  const { claims, loading } = useUserRole();

  if (loading) return <div>Loading...</div>;

  if (!claims || claims.role !== allowedRole) {
    return <div>Access Denied</div>;
  }

  if (allowedRole === 'student' && requiredStatus && claims.status) {
    if (!requiredStatus.includes(claims.status)) {
      return <div>Application status: {claims.status}</div>;
    }
  }

  return <>{children}</>;
};