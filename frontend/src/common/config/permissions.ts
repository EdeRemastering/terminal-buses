import type { Role } from '@/common/types';

export type Permission =
  | 'trip:create'
  | 'trip:edit'
  | 'trip:delete'
  | 'trip:manage-passengers'
  | 'bus:create'
  | 'bus:edit'
  | 'bus:delete'
  | 'route:create'
  | 'route:edit'
  | 'route:delete'
  | 'passenger:create'
  | 'passenger:edit'
  | 'passenger:delete'
  | 'driver:create'
  | 'driver:edit'
  | 'driver:delete'
  | 'user:create'
  | 'user:delete'
  | 'dashboard:stats'
  | 'report:download';

export const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: [
    'trip:create',
    'trip:edit',
    'trip:delete',
    'trip:manage-passengers',
    'bus:create',
    'bus:edit',
    'bus:delete',
    'route:create',
    'route:edit',
    'route:delete',
    'passenger:create',
    'passenger:edit',
    'passenger:delete',
    'driver:create',
    'driver:edit',
    'driver:delete',
    'user:create',
    'user:delete',
    'dashboard:stats',
    'report:download',
  ],
  SECRETARY: [
    'trip:create',
    'trip:edit',
    'trip:manage-passengers',
    'bus:create',
    'bus:edit',
    'route:create',
    'route:edit',
    'passenger:create',
    'passenger:edit',
    'driver:create',
    'driver:edit',
    'dashboard:stats',
  ],
  DRIVER: [],
};
