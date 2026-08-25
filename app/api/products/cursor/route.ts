// app/api/products/cursor/route.ts
//
// Proxy route that forwards cursor-based requests to Django.
// The browser calls:  GET /api/products/cursor?url=<encoded-django-next-url>
// This keeps the Django origin out of the browser entirely.

import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGIN = process.env.BACKEND_URL ?? 'http://localhost:8000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cursorUrl = searchParams.get('url');

  // Guard: url param is required
  if (!cursorUrl) {
    return NextResponse.json({ error: 'Missing `url` parameter' }, { status: 400 });
  }

  // Guard: only proxy requests to our own Django instance
  let parsed: URL;
  try {
    parsed = new URL(cursorUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid `url` parameter' }, { status: 400 });
  }

  const allowedHost = new URL(ALLOWED_ORIGIN).host;
  if (parsed.host !== allowedHost) {
    return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
  }

  try {
    const djangoResponse = await fetch(cursorUrl, {
      headers: {
        Accept: 'application/json',
        cookie: request.headers.get('cookie') ?? '',
      },
      next: { revalidate: 30 },
    });

    if (!djangoResponse.ok) {
      return NextResponse.json(
        { error: 'Upstream error', status: djangoResponse.status },
        { status: djangoResponse.status }
      );
    }

    const data = await djangoResponse.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[cursor proxy] fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
