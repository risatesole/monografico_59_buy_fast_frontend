'use server';

import { cookies } from 'next/headers';

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

function extractMessage(json: unknown, fallback: string): string {
  if (json && typeof json === 'object' && 'message' in json) {
    const value = (json as Record<string, unknown>).message;
    if (typeof value === 'string' && value) return value;
  }
  return fallback;
}

export interface ProfilePatchInput {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export async function updateProfile(patch: ProfilePatchInput): Promise<ActionResult> {
  if (!process.env.BACKEND_URL) {
    return {
      ok: false,
      status: 500,
      message: 'BACKEND_URL no está configurado en el entorno del servidor.',
    };
  }

  const { cookieHeader, csrfToken } = await authHeaders();
  if (!csrfToken) {
    return {
      ok: false,
      status: 403,
      message:
        'No se encontró el token CSRF (cookie "csrftoken"). Asegúrate de haber iniciado sesión.',
    };
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/me/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        'X-CSRFToken': csrfToken,
        Referer: process.env.FRONTEND_URL!,
      },
      body: JSON.stringify(patch),
      cache: 'no-store',
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: extractMessage(json, `Error ${response.status} al actualizar el perfil`),
        data: json,
      };
    }

    return {
      ok: true,
      status: response.status,
      message: extractMessage(json, 'Perfil actualizado correctamente'),
      data: json,
    };
  } catch (error) {
    console.error('[Update Profile Error]:', error);
    return {
      ok: false,
      status: 500,
      message: 'No se pudo conectar con el servidor. Intenta nuevamente.',
    };
  }
}

export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<ActionResult> {
  if (!process.env.BACKEND_URL) {
    return {
      ok: false,
      status: 500,
      message: 'BACKEND_URL no está configurado en el entorno del servidor.',
    };
  }

  const { cookieHeader, csrfToken } = await authHeaders();
  if (!csrfToken) {
    return {
      ok: false,
      status: 403,
      message:
        'No se encontró el token CSRF (cookie "csrftoken"). Asegúrate de haber iniciado sesión.',
    };
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/change-password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        'X-CSRFToken': csrfToken,
        Referer: process.env.FRONTEND_URL!,
      },
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      cache: 'no-store',
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: extractMessage(json, `Error ${response.status} al cambiar la contraseña`),
        data: json,
      };
    }

    return {
      ok: true,
      status: response.status,
      message: extractMessage(json, 'Contraseña actualizada correctamente'),
      data: json,
    };
  } catch (error) {
    console.error('[Change Password Error]:', error);
    return {
      ok: false,
      status: 500,
      message: 'No se pudo conectar con el servidor. Intenta nuevamente.',
    };
  }
}

export async function deleteAccount(): Promise<ActionResult> {
  if (!process.env.BACKEND_URL) {
    return {
      ok: false,
      status: 500,
      message: 'BACKEND_URL no está configurado en el entorno del servidor.',
    };
  }

  const { cookieHeader, csrfToken } = await authHeaders();
  if (!csrfToken) {
    return {
      ok: false,
      status: 403,
      message:
        'No se encontró el token CSRF (cookie "csrftoken"). Asegúrate de haber iniciado sesión.',
    };
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/delete-account/`, {
      method: 'DELETE',
      headers: {
        Cookie: cookieHeader,
        'X-CSRFToken': csrfToken,
        Referer: process.env.FRONTEND_URL!,
      },
      cache: 'no-store',
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: extractMessage(json, `Error ${response.status} al eliminar la cuenta`),
        data: json,
      };
    }

    return {
      ok: true,
      status: response.status,
      message: extractMessage(json, 'Cuenta eliminada correctamente'),
      data: json,
    };
  } catch (error) {
    console.error('[Delete Account Error]:', error);
    return {
      ok: false,
      status: 500,
      message: 'No se pudo conectar con el servidor. Intenta nuevamente.',
    };
  }
}
