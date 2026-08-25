import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8000';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const cookieHeader = req.headers.get('cookie') ?? '';

    const res = await fetch(`${BACKEND_URL}/api/v1/customers/orders/${id}/voucher/`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Voucher not found' }, { status: res.status });
    }

    const pdfBuffer = await res.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'application/pdf',
        'Content-Disposition':
          res.headers.get('content-disposition') ??
          `inline; filename="comprobante-pedido-${id}.pdf"`,
      },
    });
  } catch (err) {
    console.error(`[/api/v1/customers/orders/${id}/voucher] proxy error:`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
