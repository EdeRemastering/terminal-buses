import type { ReactNode } from 'react';
import { usePermissions } from '@/common/hooks/usePermissions';
import type { Permission } from '@/common/config/permissions';

interface PermissionGateProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export const PermissionGate = ({ permission, children, fallback = null }: PermissionGateProps) => {
  const { can } = usePermissions();

  if (can(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
