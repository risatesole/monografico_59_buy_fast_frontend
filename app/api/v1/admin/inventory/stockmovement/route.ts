import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'id';

    const cookies = request.headers.get('cookie') || '';

    const backendUrl = new URL(`${process.env.BACKEND_URL}/api/v1/admin/inventory/stockmovement`);
    backendUrl.searchParams.append('limit', limit.toString());
    backendUrl.searchParams.append('offset', offset.toString());
    if (search) backendUrl.searchParams.append('search', search);
    if (sort) backendUrl.searchParams.append('sort', sort);

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch stock movements' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
