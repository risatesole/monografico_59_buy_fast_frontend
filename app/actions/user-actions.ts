'use server';

import { cookies } from 'next/headers';
import type { User } from '@/entities/user';

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/me`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.data.user as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}
