'use server';

import { cookies } from 'next/headers';

export interface UploadResult {
  ok: boolean;
  url?: string;
  message: string;
}

async function uploadFileTo(formData: FormData, path: string): Promise<UploadResult> {
  if (!process.env.BACKEND_URL) {
    return {
      ok: false,
      message: 'BACKEND_URL no est├í configurado en el entorno del servidor.',
    };
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(c => `${c.name}=${c.value}`)
    .join('; ');
  const csrfToken = cookieStore.get('csrftoken')?.value;

  if (!csrfToken) {
    return {
      ok: false,
      message:
        'No se encontr├│ el token CSRF (cookie "csrftoken"). Aseg├║rate de haber iniciado sesi├│n.',
    };
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false, message: 'No se seleccion├│ ning├║n archivo.' };
  }

  // Re-wrap in a fresh FormData for the outbound request. Do NOT set a
  // Content-Type header manually ΓÇö fetch will add the correct multipart
  // boundary automatically.
  const upstreamForm = new FormData();
  upstreamForm.append('file', file, file.name);

  try {
    const response = await fetch(`${process.env.BACKEND_URL}${path}`, {
      method: 'POST',
      headers: {
        Cookie: cookieHeader,
        'X-CSRFToken': csrfToken,
        Referer: process.env.FRONTEND_URL!,
      },
      body: upstreamForm,
      cache: 'no-store',
    });

    const json: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        extractField(json, 'detail') ??
        extractField(json, 'message') ??
        `Error ${response.status} al subir el archivo`;
      return { ok: false, message };
    }

    const url = extractField(json, 'url');

    if (!url) {
      return { ok: false, message: 'La respuesta del servidor no incluy├│ una URL.' };
    }

    return { ok: true, url, message: 'Archivo subido correctamente' };
  } catch (error) {
    console.error('[Upload Image Error]:', error);
    return {
      ok: false,
      message: 'No se pudo conectar con el servidor. Intenta nuevamente.',
    };
  }
}

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  return uploadFileTo(formData, '/api/v1/upload/');
}

export async function uploadAvatar(formData: FormData): Promise<UploadResult> {
  return uploadFileTo(formData, '/api/v1/me/avatar/');
}

/**
 * Safely pull a string field out of an unknown JSON response body without
 * resorting to `any`.
 */
function extractField(json: unknown, key: string): string | undefined {
  if (json && typeof json === 'object' && key in json) {
    const value = (json as Record<string, unknown>)[key];
    return value === undefined || value === null ? undefined : String(value);
  }
  return undefined;
}
