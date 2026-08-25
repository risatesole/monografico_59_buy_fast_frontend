import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * Safely parses a backend response as JSON. If the backend (or something
 * in front of it, like a proxy or a Django debug error page) returned
 * HTML instead, we surface that as a readable JSON error rather than
 * letting `response.json()` throw and having Next.js mask it with its
 * own generic HTML error page.
 */
async function parseBackendResponse(response: Response) {
  const text = await response.text();

  try {
    return { json: JSON.parse(text), status: response.status };
  } catch {
    console.error(
      `Backend returned non-JSON (status ${response.status}) for ${response.url}:`,
      text.slice(0, 500)
    );
    return {
      json: {
        success: false,
        message: `Backend returned a non-JSON response (status ${response.status}). Check server logs.`,
      },
      status: 502,
    };
  }
}

export async function GET() {
  const cookieStore = await cookies();

  const response = await fetch(`${BACKEND_URL}/api/v1/admin/profiles/`, {
    headers: { Cookie: cookieStore.toString() },
    cache: 'no-store',
  });

  const { json, status } = await parseBackendResponse(response);
  return NextResponse.json(json, { status });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const body = await request.json();

  const response = await fetch(`${BACKEND_URL}/api/v1/admin/profiles/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieStore.toString(),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const { json, status } = await parseBackendResponse(response);
  return NextResponse.json(json, { status });
}
