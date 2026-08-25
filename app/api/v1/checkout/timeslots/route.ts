import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: 'Server misconfiguration: BACKEND_API_URL not set' },
      { status: 500 }
    );
  }

  const res = await fetch(`${BACKEND_URL}/api/v1/checkout/timeslots`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      cookie: request.headers.get('cookie') ?? '',
    },
    cache: 'no-store',
  });

  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
