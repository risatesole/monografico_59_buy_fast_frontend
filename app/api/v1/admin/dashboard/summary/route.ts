import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// PROXY: app/api/v1/admin/dashboard/summary/route.ts -> Django backend
// ============================================================================
// Forwards the request to the real Django dashboard-summary endpoint,
// carrying the browser's session cookie along so Django can authenticate
// the request. Same structure as app/api/v1/admin/orders/route.ts.

const DJANGO_API_BASE_URL = process.env.BACKEND_URL ?? 'http://localhost:8000';
const DJANGO_DASHBOARD_SUMMARY_ENDPOINT = `${DJANGO_API_BASE_URL}/api/v1/admin/dashboard/summary/`;

export async function GET(request: NextRequest) {
  let djangoResponse: Response;
  try {
    djangoResponse = await fetch(DJANGO_DASHBOARD_SUMMARY_ENDPOINT, {
      method: 'GET',
      headers: {
        // Forward the session cookie so Django's session auth can identify the user.
        cookie: request.headers.get('cookie') ?? '',
      },
      // Ensures Next.js doesn't cache this server-to-server call.
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Failed to reach Django backend:', error);
    return NextResponse.json({ error: 'No se pudo conectar con el servidor.' }, { status: 502 });
  }

  if (!djangoResponse.ok) {
    const rawBody = await djangoResponse.text();
    console.error(
      `Django returned ${djangoResponse.status} for ${DJANGO_DASHBOARD_SUMMARY_ENDPOINT}:`,
      rawBody
    );
    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = { error: 'Respuesta inesperada del servidor.' };
    }
    return NextResponse.json(body, { status: djangoResponse.status });
  }

  const data = await djangoResponse.json();
  return NextResponse.json(data);
}
