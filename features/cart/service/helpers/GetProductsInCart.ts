import type { GetCartResponse } from '@/features/cart/types/GetCartResponse';

export async function getCart(cookieHeader?: string): Promise<GetCartResponse> {
  const isServer = typeof window === 'undefined';

  const url = isServer ? `${process.env.BACKEND_URL}/api/v1/cart/` : '/api/v1/cart';

  const response = await fetch(url, {
    ...(isServer ? { cache: 'no-store' as const } : { credentials: 'include' as const }),
    ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<GetCartResponse>;
}
