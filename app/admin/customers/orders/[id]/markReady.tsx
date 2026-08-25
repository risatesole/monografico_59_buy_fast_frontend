'use server';

import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';

export interface MarkReadyResult {
  ok: boolean;
  status: number;
  message: string;
  data?: unknown;
}

export async function markOrderReady(orderId: number, ready: boolean): Promise<MarkReadyResult> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(c => `${c.name}=${c.value}`)
    .join('; ');

  const csrfToken = cookieStore.get('csrftoken')?.value;

  if (!csrfToken) {
    return {
      ok: false,
      status: 403,
      message:
        'No se encontró el token CSRF (cookie "csrftoken"). Asegúrate de haber iniciado sesión.',
    };
  }

  if (!process.env.BACKEND_URL) {
    return {
      ok: false,
      status: 500,
      message: 'BACKEND_URL no está configurado en el entorno del servidor.',
    };
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/admin/orders/${orderId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        'X-CSRFToken': csrfToken,
        Referer: process.env.FRONTEND_URL!,
      },
      body: JSON.stringify({
        action: ready ? 'mark_ready' : 'unmark_ready',
      }),
      cache: 'no-store',
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        (json && typeof json === 'object' && 'message' in json && String(json.message)) ||
        (json && typeof json === 'object' && 'error' in json && String(json.error)) ||
        `Error ${response.status} al actualizar la orden`;

      return {
        ok: false,
        status: response.status,
        message,
        data: json,
      };
    }

    revalidateTag(`order-${orderId}`, 'default');
    revalidateTag('orders', 'default');

    return {
      ok: true,
      status: response.status,
      message: ready ? 'Orden marcada como lista para retirar' : 'Orden desmarcada',
      data: json,
    };
  } catch (error) {
    console.error('[Mark Order Ready Error]:', error);
    return {
      ok: false,
      status: 500,
      message: 'No se pudo conectar con el servidor. Intenta nuevamente.',
    };
  }
}
