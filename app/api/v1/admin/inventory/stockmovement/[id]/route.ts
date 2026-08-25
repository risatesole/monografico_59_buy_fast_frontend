// app/api/admin/inventory/stockmovement/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || '-date_time';

    console.log(
      `Fetching stock movements - limit: ${limit}, offset: ${offset}, search: ${search}, sort: ${sort}`
    );

    // Construir URL del backend
    let backendUrl = `${BACKEND_URL}/api/v1/admin/inventory/stockmovement/?limit=${limit}&offset=${offset}`;
    if (search) {
      backendUrl += `&search=${encodeURIComponent(search)}`;
    }
    if (sort) {
      backendUrl += `&sort=${encodeURIComponent(sort)}`;
    }

    // Obtener cookies de la solicitud
    const cookies = request.headers.get('cookie') || '';

    // Hacer la petición al backend con las cookies
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
      credentials: 'include',
    });

    console.log(`Backend response status: ${response.status}`);

    // Si el backend responde con 401 o 403, propagar el error
    if (response.status === 401 || response.status === 403) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'No autorizado',
        },
        { status: response.status }
      );
    }

    // Si el backend responde con error, propagar el error
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        {
          status: 'error',
          message: `Error del backend: ${response.status}`,
        },
        { status: response.status }
      );
    }

    // Obtener los datos del backend
    const data = await response.json();

    // Devolver la respuesta con las cookies del backend (si las hay)
    const nextResponse = NextResponse.json(data, { status: response.status });

    // Propagar las cookies de sesión desde el backend
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      nextResponse.headers.set('set-cookie', setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error('Error en API route de stockmovement:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
