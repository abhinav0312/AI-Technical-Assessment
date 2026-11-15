import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Authenticating DevMind environment...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#1a1a1a] text-[#eff2f6] p-6">
        <div className="max-w-md text-center p-8 border border-[#383838] rounded-2xl bg-[#262626] shadow-xl">
          <h2 className="text-xl font-bold text-rose-400">Access Restricted</h2>
          <p className="text-sm text-[#9ca3af] mt-2">
            Your current role (<span className="capitalize font-bold text-[#ffffff]">{user.role}</span>) does not have authorization to view this resource.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
