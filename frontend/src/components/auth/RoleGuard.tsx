import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context';
import { LoadingScreen } from '../ui';
import { ROUTES } from '../../config/constants';
import type { UserRole } from '../../interfaces';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    // Redirigir según el rol
    if (profile.role === 'admin') {
      return <Navigate to={ROUTES.ADMIN} replace />;
    }
    return <Navigate to={ROUTES.CUSTOMER} replace />;
  }

  return <>{children}</>;
}
