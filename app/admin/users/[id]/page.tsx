import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import UserDetailsClient from './userClient';
import { fetchUserFromBackend } from '@/lib/users';
import UserService from '@/services/user';

type UserDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  const { id } = await params;

  // Server-to-server call, so there's no CORS issue going straight to the
  // backend. We forward the session cookie so the Django "employee only"
  // check succeeds.
  const cookieStore = await cookies();
  const user = await fetchUserFromBackend(id, cookieStore.toString());

  if (!user) {
    notFound();
  }

  // The currently logged-in admin, not the account being viewed — needed to
  // gate the matricula editor to superusers only (matricula edits are
  // superuser-only server-side too, see users_api_view.py).
  const actingUser = await new UserService().getCurrentUser();

  return <UserDetailsClient initialUser={user} isActingSuperuser={!!actingUser?.is_superuser} />;
}
