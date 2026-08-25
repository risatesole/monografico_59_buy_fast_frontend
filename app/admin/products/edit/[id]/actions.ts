'use server';

import { cookies } from 'next/headers';
import { updateTag } from 'next/cache';

export interface ProductImageInput {
  type: string;
  url: string;
}

export interface VariantPatchInput {
  id: number;
  name?: string;
  description?: string;
  variantnumber?: number;
  thumbnail?: string;
  sku?: string;
  slug?: string;
  selling_price?: number;
  tax_rate?: string;
  minimum_stock?: number;
  images?: ProductImageInput[];
}

export interface ProductPatchInput {
  name?: string;
  category?: string;
  slug?: string;
  thumbnail?: string;
  tags?: string[];
  variants?: VariantPatchInput[];
}

export interface ActionResult {
  ok: boolean;
  status: number;
  message: string;
  data?: unknown;
}

async function authHeaders() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(c => `${c.name}=${c.value}`)
    .join('; ');
  const csrfToken = cookieStore.get('csrftoken')?.value;
  return { cookieHeader, csrfToken };
}

export async function getProduct(productId: string): Promise<ActionResult> {
  if (!process.env.BACKEND_URL) {
    return {
      ok: false,
      status: 500,
      message: 'BACKEND_URL no est├í configurado en el entorno del servidor.',
    };
  }

  const { cookieHeader, csrfToken } = await authHeaders();

  if (!csrfToken) {
    return {
      ok: false,
      status: 403,
      message:
        'No se encontr├│ el token CSRF (cookie "csrftoken"). Aseg├║rate de haber iniciado sesi├│n.',
    };
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/products/${productId}/`, {
      method: 'GET',
      headers: {
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        (json && typeof json === 'object' && 'error' in json && String(json.error)) ||
        `Error ${response.status} al buscar el producto`;
      return { ok: false, status: response.status, message, data: json };
    }

    return { ok: true, status: response.status, message: 'Producto encontrado', data: json };
  } catch (error) {
    console.error('[Get Product Error]:', error);
    return {
      ok: false,
      status: 500,
      message: 'No se pudo conectar con el servidor. Intenta nuevamente.',
    };
  }
}

export async function updateProduct(
  productId: string,
  patch: ProductPatchInput
): Promise<ActionResult> {
  const { cookieHeader, csrfToken } = await authHeaders();

  if (!csrfToken) {
    return {
      ok: false,
      status: 403,
      message:
        'No se encontr├│ el token CSRF (cookie "csrftoken"). Aseg├║rate de haber iniciado sesi├│n.',
    };
  }

  if (!process.env.BACKEND_URL) {
    return {
      ok: false,
      status: 500,
      message: 'BACKEND_URL no est├í configurado en el entorno del servidor.',
    };
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/products/${productId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        'X-CSRFToken': csrfToken,
        Referer: process.env.FRONTEND_URL!,
      },
      body: JSON.stringify({ data: patch }),
      cache: 'no-store',
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        (json && typeof json === 'object' && 'error' in json && String(json.error)) ||
        `Error ${response.status} al actualizar el producto`;
      return { ok: false, status: response.status, message, data: json };
    }

    updateTag('product-detail');
    if (patch.slug) updateTag(patch.slug);
    for (const variant of patch.variants ?? []) {
      if (variant.slug) updateTag(variant.slug);
    }

    const message =
      (json && typeof json === 'object' && 'message' in json && String(json.message)) ||
      'Producto actualizado correctamente';

    return {
      ok: true,
      status: response.status,
      message,
      data: json && typeof json === 'object' && 'data' in json ? json.data : json,
    };
  } catch (error) {
    console.error('[Update Product Error]:', error);
    return {
      ok: false,
      status: 500,
      message: 'No se pudo conectar con el servidor. Intenta nuevamente.',
    };
  }
}
