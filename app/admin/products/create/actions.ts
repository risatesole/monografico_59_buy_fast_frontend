'use server';

import { cookies } from 'next/headers';
import { updateTag } from 'next/cache';

export interface ProductImageInput {
  type: string;
  url: string;
}

export interface ProductVariantInput {
  name: string;
  description: string;
  variantnumber: number;
  thumbnail: string;
  sku: string;
  slug: string;
  selling_price: number;
  tax_rate: string;
  initial_inventory: number;
  minimum_stock: number;
  image_hero?: string;
  image_details?: string;
  image_thumbnail?: string;
  image_gallery?: string;
  image_lifestyle?: string;
  images: ProductImageInput[];
}

export interface ProductInput {
  name: string;
  category: string;
  slug: string;
  thumbnail: string;
  tags?: string[];
  variants: ProductVariantInput[];
}

export interface CreateProductResult {
  ok: boolean;
  status: number;
  message: string;
  data?: unknown;
}

export async function createProduct(product: ProductInput): Promise<CreateProductResult> {
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
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/products/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        'X-CSRFToken': csrfToken,
        Referer: process.env.FRONTEND_URL!,
      },
      body: JSON.stringify({ data: product }),
      cache: 'no-store',
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        (json && typeof json === 'object' && 'error' in json && String(json.error)) ||
        `Error ${response.status} al crear el producto`;

      return {
        ok: false,
        status: response.status,
        message,
        data: json,
      };
    }

    updateTag('product-detail');
    if (product.slug) updateTag(product.slug);
    for (const variant of product.variants) {
      if (variant.slug) updateTag(variant.slug);
    }

    const message =
      (json && typeof json === 'object' && 'message' in json && String(json.message)) ||
      'Producto creado correctamente';

    return {
      ok: true,
      status: response.status,
      message,
      data: json && typeof json === 'object' && 'data' in json ? json.data : json,
    };
  } catch (error) {
    console.error('[Create Product Error]:', error);
    return {
      ok: false,
      status: 500,
      message: 'No se pudo conectar con el servidor. Intenta nuevamente.',
    };
  }
}
