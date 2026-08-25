import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'csv') {
      return NextResponse.json({ error: 'El archivo debe ser de tipo CSV' }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `El archivo es demasiado grande. Tamaño máximo: ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';

    const forwardFormData = new FormData();
    const fileBuffer = await file.arrayBuffer();
    const fileBlob = new Blob([fileBuffer], { type: 'text/csv' });
    forwardFormData.append('file', fileBlob, file.name);

    const cookieHeader = request.headers.get('cookie') || '';

    const csrfToken = cookieHeader
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];

    const sessionId = cookieHeader
      .split('; ')
      .find(row => row.startsWith('sessionid='))
      ?.split('=')[1];

    const headers: Record<string, string> = {
      'X-CSRFToken': csrfToken || '',
      Referer: process.env.FRONTEND_URL!,
    };

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    console.log('Forwarding request to Django backend...');
    console.log('CSRF Token present:', !!csrfToken);
    console.log('Session ID present:', !!sessionId);
    console.log('Auth header present:', !!authHeader);

    const backendResponse = await fetch(`${backendUrl}/api/v1/products/import/csv/`, {
      method: 'POST',
      headers: headers,
      body: forwardFormData,
    });

    let data;
    const responseText = await backendResponse.text();
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { error: responseText || 'Error en el backend' };
    }

    if (backendResponse.status === 403 || backendResponse.status === 401) {
      return NextResponse.json(
        {
          error: 'Error de autenticación. Por favor inicia sesión nuevamente.',
          detail: data.detail || 'Authentication credentials were not provided.',
        },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('Error importing CSV:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
