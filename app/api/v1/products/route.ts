import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const cursorUrl = searchParams.get('cursor_url');

    let djangoUrl: string;

    if (cursorUrl) {
      // ── Mode 1: cursor forwarding ──────────────────────────────────────────
      // Validate it's pointing at our own Django instance
      let parsed: URL;
      try {
        parsed = new URL(cursorUrl);
      } catch {
        return NextResponse.json({ error: 'Invalid cursor_url' }, { status: 400 });
      }

      const allowedHost = new URL(BACKEND_URL).host;
      if (parsed.host !== allowedHost) {
        return NextResponse.json({ error: 'Forbidden cursor origin' }, { status: 403 });
      }

      djangoUrl = cursorUrl;
    } else {
      // ── Mode 2: normal param forwarding ───────────────────────────────────
      const params = searchParams.toString();
      djangoUrl = `${BACKEND_URL}/api/v1/products/${params ? `?${params}` : ''}`;
    }

    const res = await fetch(djangoUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.get('cookie') ? { cookie: req.headers.get('cookie')! } : {}),
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[products proxy] Django returned ${res.status}:`, body);
      return NextResponse.json(
        { error: 'Failed to fetch products', detail: body },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[products proxy] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
