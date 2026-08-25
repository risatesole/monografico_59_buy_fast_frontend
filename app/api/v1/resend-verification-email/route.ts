import { NextRequest, NextResponse } from 'next/server';

// Server-only env var — never exposed to the client bundle (no NEXT_PUBLIC_ prefix)
const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(request: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: 'Server misconfiguration: BACKEND_API_URL not set' },
      { status: 500 }
    );
  }

  const cookieHeader = request.headers.get('cookie') ?? '';
  const csrfToken = cookieHeader
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];

  const res = await fetch(`${BACKEND_URL}/api/v1/resend-verification-email/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: cookieHeader,
      ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
      Referer: process.env.FRONTEND_URL!,
    },
  });

  const contentType = res.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : { error: await res.text().catch(() => 'Unknown error') };

  const response = NextResponse.json(data, { status: res.status });

  for (const cookie of res.headers.getSetCookie()) {
    response.headers.append('set-cookie', cookie);
  }

  return response;
}
