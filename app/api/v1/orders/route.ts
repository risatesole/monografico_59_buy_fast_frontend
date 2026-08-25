import { NextRequest, NextResponse } from 'next/server';

type OrderStatus = 'delivered' | 'shipped' | 'processing' | 'cancelled';

type Order = {
  id: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: number;
  trackingNumber?: string;
};

type PaginatedResponse = {
  orders: Order[];
  totalPages: number;
  currentPage: number;
};

// --- Shape of the real Django response ---
type BackendOrderItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
  tax: number;
  subtotal: number;
};

type BackendOrder = {
  id: number;
  profilepicture: string | null;
  firstname: string;
  lastname: string;
  email: string;
  created_at: string;
  status: 'pending' | 'fulfilled' | 'returned';
  pickup_time: string | null;
  phone: string | null;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: BackendOrderItem[];
  total: number;
  shipping_method: string;
  payment_method: string;
  notes: string;
};

type BackendOrdersResponse = {
  count: number;
  orders: BackendOrder[];
};

const LIMIT = 5;

const BACKEND_URL = process.env.BACKEND_URL;

// Backend has no "shipped" state today; map what exists into the frontend's vocabulary.
const STATUS_MAP: Record<BackendOrder['status'], OrderStatus> = {
  pending: 'processing',
  fulfilled: 'delivered',
  returned: 'cancelled',
};

function adaptOrder(order: BackendOrder): Order {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: `${order.id}`,
    date: order.created_at,
    total: order.total,
    status: STATUS_MAP[order.status] ?? 'processing',
    items: itemCount,
    // No tracking number available from the backend yet; leave undefined.
  };
}

export async function GET(request: NextRequest) {
  try {
    if (!BACKEND_URL) {
      console.error('BACKEND_URL is not configured');
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const pageParam = searchParams.get('page');
    const page = pageParam ? parseInt(pageParam, 10) : 1;

    if (isNaN(page) || page < 1) {
      return NextResponse.json({ error: 'Invalid page parameter' }, { status: 400 });
    }

    const offset = (page - 1) * LIMIT;

    const cookieHeader = request.headers.get('cookie') ?? '';

    const backendRes = await fetch(
      `${BACKEND_URL}/api/v1/customers/orders/?offset=${offset}&limit=${LIMIT}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader ? { cookie: cookieHeader } : {}),
        },
        cache: 'no-store',
      }
    );

    if (!backendRes.ok) {
      if (backendRes.status === 401 || backendRes.status === 403) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: backendRes.status });
      }
      console.error('Backend orders request failed:', backendRes.status);
      return NextResponse.json({ error: 'Internal server error' }, { status: 502 });
    }

    const backendData: BackendOrdersResponse = await backendRes.json();

    const totalPages = Math.max(1, Math.ceil(backendData.count / LIMIT));

    const data: PaginatedResponse = {
      orders: backendData.orders.map(adaptOrder),
      totalPages,
      currentPage: page,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
