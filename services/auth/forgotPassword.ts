export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  status: 'ok' | 'error';
  message: string;
}

export const ForgotPassword = async (
  payload: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> => {
  let response: Response;

  try {
    response = await fetch('/api/v1/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? 'No se pudo enviar el correo de recuperación.');
  }

  return data;
};
