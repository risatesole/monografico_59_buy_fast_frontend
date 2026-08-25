import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const cookies = request.headers.get('cookie') || '';

  const searchParams = request.nextUrl.searchParams;

  const response = await fetch(
    `${process.env.BACKEND_URL}${request.nextUrl.pathname}?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.text();

  const nextResponse = new NextResponse(data, {
    status: response.status,
  });

  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    nextResponse.headers.set('Set-Cookie', setCookie);
  }
  return nextResponse;
}
