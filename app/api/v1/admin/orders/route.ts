import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// PROXY: app/api/v1/admin/orders/route.ts -> Django backend
// ============================================================================
// This route no longer generates mock data. It forwards the request to the
// real Django endpoint and translates the pagination params, since the
// frontend speaks page/limit but the Django view speaks offset/limit.

const DJANGO_API_BASE_URL = process.env.BACKEND_URL ?? 'http://localhost:8000';
const DJANGO_ORDERS_ENDPOINT = `${DJANGO_API_BASE_URL}/api/v1/admin/orders/`;

const DEFAULT_LIMIT = 5;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get('search') ?? '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.max(1, Number(searchParams.get('limit')) || DEFAULT_LIMIT);
  const offset = (page - 1) * limit;

  const djangoParams = new URLSearchParams({
    search,
    limit: String(limit),
    offset: String(offset),
  });

  // Forward extra filters if the frontend ever sends them (status, dates, sort, etc.)
  for (const key of ['status', 'min_total', 'max_total', 'date_from', 'date_to', 'sort']) {
    const value = searchParams.get(key);
    if (value) djangoParams.set(key, value);
  }

  let djangoResponse: Response;
  try {
    djangoResponse = await fetch(`${DJANGO_ORDERS_ENDPOINT}?${djangoParams.toString()}`, {
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
      `Django returned ${djangoResponse.status} for ${DJANGO_ORDERS_ENDPOINT}:`,
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
