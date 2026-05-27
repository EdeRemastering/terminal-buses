import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import type { Role } from '@/common/types';

interface GuardProps {
  children: ReactNode;
}

interface RoleGuardProps extends GuardProps {
  allowedRoles: Role[];
}

export const AuthGuard = ({ children }: GuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-muted-foreground">Cargando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const PublicGuard = ({ children }: GuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-muted-foreground">Cargando...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { effectiveRole, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-muted-foreground">Cargando...</div>;
  }

  if (!isAuthenticated || !effectiveRole || !allowedRoles.includes(effectiveRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
