'use server';

import { cookies } from 'next/headers';
import { updateTag } from 'next/cache';

export interface StockMovementInput {
  sku: string;
  quantity: number;
  document_reference: string;
}

export interface CreateStockMovementResult {
  ok: boolean;
  status: number;
  message: string;
  data?: unknown;
}

export async function createStockMovement(
  input: StockMovementInput
): Promise<CreateStockMovementResult> {
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
        'No se encontrΓö£Γöé el token CSRF (cookie "csrftoken"). AsegΓö£Γòærate de haber iniciado sesiΓö£Γöén.',
    };
  }

  if (!process.env.BACKEND_URL) {
    return {
      ok: false,
      status: 500,
      message: 'BACKEND_URL no estΓö£├¡ configurado en el entorno del servidor.',
    };
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/admin/inventory/stockmovement/`,
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
        `Error ${response.status} al registrar la entrada de inventario`;

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
      'Entrada de inventario registrada correctamente';

    return {
      ok: true,
      status: response.status,
      message,
      data: json && typeof json === 'object' && 'data' in json ? json.data : json,
    };
  } catch (error) {
    console.error('[Create Stock Movement Error]:', error);
    return {
      ok: false,
      status: 500,
      message: 'No se pudo conectar con el servidor. Intenta nuevamente.',
    };
  }
}
