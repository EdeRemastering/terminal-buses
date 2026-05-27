import { useCallback } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { rolePermissions, type Permission } from '@/common/config/permissions';

export function usePermissions() {
  const { effectiveRole } = useAuth();

  const can = useCallback(
    (permission: Permission) => {
      if (!effectiveRole) return false;
      return rolePermissions[effectiveRole]?.includes(permission) ?? false;
    },
    [effectiveRole],
  );

  const isAdmin = effectiveRole === 'ADMIN';
  const isSecretary = effectiveRole === 'SECRETARY';
  const isDriver = effectiveRole === 'DRIVER';

  return { can, role: effectiveRole, isAdmin, isSecretary, isDriver };
}
