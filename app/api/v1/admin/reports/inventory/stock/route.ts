import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// PROXY: app/api/v1/admin/reports/inventory/stock/route.ts -> Django backend
// ============================================================================
// Same binary-passthrough shape as app/api/v1/admin/reports/orders/route.ts.

const DJANGO_API_BASE_URL = process.env.BACKEND_URL ?? 'http://localhost:8000';
const DJANGO_REPORT_ENDPOINT = `${DJANGO_API_BASE_URL}/api/v1/admin/reports/inventory/stock/`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const djangoParams = new URLSearchParams();
  for (const key of [
    'category',
    'status',
    'search',
    'min_quantity',
    'max_quantity',
    'inventory_status',
    'ordering',
    'report_format',
  ]) {
    const value = searchParams.get(key);
    if (value) djangoParams.set(key, value);
  }

  let djangoResponse: Response;
  try {
    djangoResponse = await fetch(`${DJANGO_REPORT_ENDPOINT}?${djangoParams.toString()}`, {
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
      `Django returned ${djangoResponse.status} for ${DJANGO_REPORT_ENDPOINT}:`,
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

  const fileBuffer = await djangoResponse.arrayBuffer();
  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': djangoResponse.headers.get('content-type') ?? 'application/octet-stream',
      'Content-Disposition':
        djangoResponse.headers.get('content-disposition') ?? 'attachment; filename="reporte"',
    },
  });
}
