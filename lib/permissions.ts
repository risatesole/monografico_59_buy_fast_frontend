import type { User } from '@/entities/user';

export const PERMISSION_CODES = [
  'employees.view',
  'employees.manage',
  'customers.view',
  'customers.manage',
  'products.view',
  'products.create',
  'products.edit',
  'inventory.view',
  'inventory.manage',
  'orders.view',
  'orders.manage',
  'reports.create',
] as const;

export type PermissionCode = (typeof PERMISSION_CODES)[number];

export function isSuperuser(user: User | null | undefined): boolean {
  return !!user?.is_superuser;
}

export function hasPermission(user: User | null | undefined, code: PermissionCode): boolean {
  if (!user) return false;
  if (isSuperuser(user)) return true;
  return !!user.profile?.permissions.includes(code);
}
