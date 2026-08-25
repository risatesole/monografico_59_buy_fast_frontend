import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import UserService from '@/services/user';
import { hasPermission } from '@/lib/permissions';

export default async function ProductsEditLayout({ children }: { children: ReactNode }) {
  const userService = new UserService();
  const user = await userService.getCurrentUser();

  if (!hasPermission(user, 'products.edit')) {
    redirect('/admin');
  }

  return children;
}
