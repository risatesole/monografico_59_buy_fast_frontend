'use server';

import { cookies } from 'next/headers';
import { updateTag } from 'next/cache';

export interface StockDecreaseInput {
  sku: string;
  quantity: number;
  reason: string;
}

export interface CreateStockDecreaseResult {
  ok: boolean;
  status: number;
  message: string;
  data?: unknown;
}

export async function createStockDecrease(
  input: StockDecreaseInput
): Promise<CreateStockDecreaseResult> {
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
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/admin/inventory/stockmovement/decrease/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
          'X-CSRFToken': csrfToken,
          Referer: process.env.FRONTEND_URL!,
        },
        body: JSON.stringify(input),
        cache: 'no-store',
      }
    );

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        (json && typeof json === 'object' && 'message' in json && String(json.message)) ||
        (json && typeof json === 'object' && 'detail' in json && String(json.detail)) ||
        `Error ${response.status} al registrar la salida de inventario`;

      return {
        ok: false,
        status: response.status,
        message,
        data: json,
      };
    }

    updateTag('stock-movement-list');
    if (input.sku) updateTag(input.sku);

    const message =
      (json && typeof json === 'object' && 'message' in json && String(json.message)) ||
      'Salida de inventario registrada correctamente';

    return {
      ok: true,
      status: response.status,
      message,
      data: json && typeof json === 'object' && 'data' in json ? json.data : json,
    };
  } catch (error) {
    console.error('[Create Stock Decrease Error]:', error);
    return {
      ok: false,
      status: 500,
      message: 'No se pudo conectar con el servidor. Intenta nuevamente.',
    };
  }
}
