export interface ResetPasswordRequest {
  uid: string;
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  status: 'ok' | 'error';
  message: string;
}

export const ResetPassword = async (
  payload: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  let response: Response;

  try {
    response = await fetch('/api/v1/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? 'No se pudo restablecer la contraseña.');
  }

  return data;
};
