import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handleRequest(request, id, 'GET');
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handleRequest(request, id, 'POST');
}

async function handleRequest(request: NextRequest, id: string, method: 'GET' | 'POST') {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieString = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

    // Get CSRF token from cookies
    const csrfToken = allCookies.find(
      c => c.name === 'csrftoken' || c.name === 'csrf_token' || c.name === 'XSRF-TOKEN'
    )?.value;

    const apiUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const url = `${apiUrl}/api/v1/admin/orders/${id}/`;

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (cookieString) {
      headers['Cookie'] = cookieString;
    }

    // Add CSRF token for POST requests
    if (method === 'POST' && csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      credentials: 'include',
      cache: 'no-store',
    };

    // Add body for POST if needed
    if (method === 'POST') {
      // If you need to send data, uncomment:
      // fetchOptions.body = JSON.stringify(await request.json());
      // Or send empty body
      fetchOptions.body = JSON.stringify({});
    }

    const djangoResponse = await fetch(url, fetchOptions);

    const rawText = await djangoResponse.text();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = null;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      console.error('Non-JSON response from Django:', djangoResponse.status, rawText.slice(0, 500));
      return NextResponse.json(
        {
          error: `Backend returned an unexpected response (status ${djangoResponse.status}): ${rawText.slice(0, 200)}`,
        },
        { status: 502 }
      );
    }

    if (!djangoResponse.ok) {
      return NextResponse.json(
        {
          error:
            data?.message ||
            data?.error ||
            data?.detail ||
            `Failed to ${method === 'GET' ? 'fetch' : 'fulfill'} order`,
        },
        { status: djangoResponse.status }
      );
    }

    // Return exactly what the backend returns
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in order route:', error);
    return NextResponse.json({ error: 'Could not reach the backend server' }, { status: 500 });
  }
}
