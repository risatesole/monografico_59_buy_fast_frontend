'use server';

import { cookies } from 'next/headers';
import { updateTag } from 'next/cache';

export interface CategoryImages {
  banner: string;
  cart: string;
  default: string;
}

export interface Category {
  id: number;
  slug: string;
  label: string;
  description: string;
  priority: number;
  images: CategoryImages;
}

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string;
  priority?: number;
  images?: Partial<CategoryImages>;
}

export type CategoryPatchInput = Partial<CategoryInput>;

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

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${process.env.BACKEND_URL}/api/v1/products/categories/`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('No se pudieron cargar las categorías.');
  }

  const json = await res.json();
  return (json.data ?? []) as Category[];
}

export async function getCategory(categoryId: string): Promise<ActionResult> {
  if (!process.env.BACKEND_URL) {
    return {
      ok: false,
      status: 500,
      message: 'BACKEND_URL no está configurado en el entorno del servidor.',
    };
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/products/categories/${categoryId}/`,
      { cache: 'no-store' }
    );

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        (json && typeof json === 'object' && 'error' in json && String(json.error)) ||
        `Error ${response.status} al buscar la categoría`;
      return { ok: false, status: response.status, message, data: json };
    }

    return {
      ok: true,
      status: response.status,
      message: 'Categoría encontrada',
      data: json && typeof json === 'object' && 'data' in json ? json.data : json,
    };
  } catch (error) {
    console.error('[Get Category Error]:', error);
    return {
      ok: false,
      status: 500,
      message: 'No se pudo conectar con el servidor. Intenta nuevamente.',
    };
  }
}

export async function createCategory(category: CategoryInput): Promise<ActionResult> {
  const { cookieHeader, csrfToken } = await authHeaders();

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
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/products/categories/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        'X-CSRFToken': csrfToken,
        Referer: process.env.FRONTEND_URL!,
      },
      body: JSON.stringify({ data: category }),
      cache: 'no-store',
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        (json && typeof json === 'object' && 'error' in json && String(json.error)) ||
        `Error ${response.status} al crear la categoría`;
      return { ok: false, status: response.status, message, data: json };
    }

    const message =
      (json && typeof json === 'object' && 'message' in json && String(json.message)) ||
      'Categoría creada correctamente';

    updateTag('categories');

    return {
      ok: true,
      status: response.status,
      message,
      data: json && typeof json === 'object' && 'data' in json ? json.data : json,
    };
  } catch (error) {
    console.error('[Create Category Error]:', error);
    return {
      ok: false,
      status: 500,
      message: 'No se pudo conectar con el servidor. Intenta nuevamente.',
    };
  }
}

export async function updateCategory(
  categoryId: string,
  patch: CategoryPatchInput
): Promise<ActionResult> {
  const { cookieHeader, csrfToken } = await authHeaders();

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
      `${process.env.BACKEND_URL}/api/v1/products/categories/${categoryId}/`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
          'X-CSRFToken': csrfToken,
          Referer: process.env.FRONTEND_URL!,
        },
        body: JSON.stringify({ data: patch }),
        cache: 'no-store',
      }
    );

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        (json && typeof json === 'object' && 'error' in json && String(json.error)) ||
        `Error ${response.status} al actualizar la categoría`;
      return { ok: false, status: response.status, message, data: json };
    }

    const message =
      (json && typeof json === 'object' && 'message' in json && String(json.message)) ||
      'Categoría actualizada correctamente';

    updateTag('categories');

    return {
      ok: true,
      status: response.status,
      message,
      data: json && typeof json === 'object' && 'data' in json ? json.data : json,
    };
  } catch (error) {
    console.error('[Update Category Error]:', error);
    return {
      ok: false,
      status: 500,
      message: 'No se pudo conectar con el servidor. Intenta nuevamente.',
    };
  }
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  const { cookieHeader, csrfToken } = await authHeaders();

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
      `${process.env.BACKEND_URL}/api/v1/products/categories/${categoryId}/`,
      {
        method: 'DELETE',
        headers: {
          Cookie: cookieHeader,
          'X-CSRFToken': csrfToken,
          Referer: process.env.FRONTEND_URL!,
        },
        cache: 'no-store',
      }
    );

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        (json && typeof json === 'object' && 'error' in json && String(json.error)) ||
        `Error ${response.status} al eliminar la categoría`;
      return { ok: false, status: response.status, message, data: json };
    }

    const message =
      (json && typeof json === 'object' && 'message' in json && String(json.message)) ||
      'Categoría eliminada correctamente';

    updateTag('categories');

    return { ok: true, status: response.status, message, data: json };
  } catch (error) {
    console.error('[Delete Category Error]:', error);
    return {
      ok: false,
      status: 500,
      message: 'No se pudo conectar con el servidor. Intenta nuevamente.',
    };
  }
}
