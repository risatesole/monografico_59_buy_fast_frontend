import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// PROXY: app/api/v1/products/categories/route.ts -> Django backend
// ============================================================================
// Public category list (GET /api/v1/products/categories/ is AllowAny on the
// backend), used by client components that need a category picker (e.g. the
// inventory stock report filters).

const DJANGO_API_BASE_URL = process.env.BACKEND_URL ?? 'http://localhost:8000';
const DJANGO_CATEGORIES_ENDPOINT = `${DJANGO_API_BASE_URL}/api/v1/products/categories/`;

export async function GET(request: NextRequest) {
  let djangoResponse: Response;
  try {
    djangoResponse = await fetch(DJANGO_CATEGORIES_ENDPOINT, {
      method: 'GET',
      headers: {
        cookie: request.headers.get('cookie') ?? '',
      },
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Failed to reach Django backend:', error);
    return NextResponse.json({ error: 'No se pudo conectar con el servidor.' }, { status: 502 });
  }

  if (!djangoResponse.ok) {
    const rawBody = await djangoResponse.text();
    console.error(
      `Django returned ${djangoResponse.status} for ${DJANGO_CATEGORIES_ENDPOINT}:`,
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
