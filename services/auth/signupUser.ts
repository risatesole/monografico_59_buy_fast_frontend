export interface SignupRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  matricula?: string;
  terms: boolean;
}

interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  matricula?: string;
  created_at: string;
  updated_at: string;
}

interface Session {
  id: string;
  created_at: string;
  updated_at: string;
}

interface Tokens {
  access_token: {
    token: string;
    expires_in: number;
    updated_at: string;
  };
  refresh_token: {
    token: string;
    expires_in: number;
    created_at: string;
  };
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    session: Session;
    tokens: Tokens;
    terms: boolean;
  };
}

export const SignupUser = async (payload: SignupRequest): Promise<SignupResponse> => {
  let response: Response;

  try {
    response = await fetch('/api/v1/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Internal Server Error');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.message ?? 'Failed to create account. If the problem persists, contact support.'
    );
  }

  return response.json();
};
