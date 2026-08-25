import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import UserService from '@/services/user';
import { isSuperuser } from '@/lib/permissions';

export default async function ProfilesLayout({ children }: { children: ReactNode }) {
  const userService = new UserService();
  const user = await userService.getCurrentUser();

  if (!isSuperuser(user)) {
    redirect('/admin');
  }

  return children;
}
