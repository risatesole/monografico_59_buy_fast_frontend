import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { SectionLabel } from '@/components/account/SectionLabel';
import Image from 'next/image';
import { DownloadVoucherButton } from '@/components/orders/DownloadVoucherButton';

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  tax: number;
  subtotal: number;
}

interface OrderData {
  id: number;
  profilepicture: string | null;
  firstname: string;
  lastname: string;
  email: string;
  created_at: string;
  status: string;
  pickup_time: string;
  pickup_code: string;
  ready_for_pickup: boolean;
  phone: string | null;
  address: Address;
  items: OrderItem[];
  total: number;
  shipping_method: string;
  payment_method: string;
  notes: string;
}

interface OrderResponse {
  data: OrderData;
}

async function getOrderDetails(orderId: string): Promise<OrderData | null> {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    const cookieString = allCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const response = await fetch(`${apiUrl}/api/v1/customers/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieString && { Cookie: cookieString }),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Failed to fetch order: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: OrderResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    return null;
  }
}

function getStatusStyle(status: string): { label: string; color: string; bg: string } {
  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pendiente', color: '#7a5a2a', bg: '#fff7e8' },
    processing: { label: 'En proceso', color: '#7a5a2a', bg: '#fff7e8' },
    shipped: { label: 'Enviado', color: '#1a67b3', bg: '#eaf4ff' },
    delivered: { label: 'Entregado', color: '#2a5a7a', bg: '#e8f5ff' },
    fulfilled: { label: 'Entregado', color: '#2a5a7a', bg: '#e8f5ff' },
    cancelled: { label: 'Cancelado', color: '#cc3b3b', bg: '#fff0f0' },
    returned: { label: 'Devuelto', color: '#cc3b3b', bg: '#fff0f0' },
  };
  return statusMap[status.toLowerCase()] || statusMap.pending;
}

function StatusBadge({ status }: { status: string }) {
  const style = getStatusStyle(status);
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.2rem 0.6rem',
        fontSize: '0.65rem',
        fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        borderRadius: 4,
        color: style.color,
        background: style.bg,
      }}
    >
      {style.label}
    </span>
  );
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
  }).format(amount);
}

function formatShippingMethod(method: string) {
  return method
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatPaymentMethod(method: string) {
  return method
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function ClientOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await getOrderDetails(id);

  if (!order) {
    notFound();
  }

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <SectionLabel>Detalles de la orden</SectionLabel>
      </div>

      {/* Order Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1.25rem',
          border: '1px solid oklch(0.922 0 0)',
          borderRadius: 4,
          background: 'oklch(0.985 0 0)',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: '1.1rem',
                fontWeight: 500,
              }}
            >
              Order #{order.id}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              fontSize: '0.75rem',
              color: 'oklch(0.708 0 0)',
              flexWrap: 'wrap',
            }}
          >
            <span>Placed on {formatDateTime(order.created_at)}</span>
            <span>
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
            }}
          >
            {formatCurrency(order.total)}
          </div>
          <DownloadVoucherButton orderId={order.id} />
        </div>
      </div>

      {/* Ready for pickup notice */}
      {order.ready_for_pickup && order.status !== 'fulfilled' && (
        <div
          style={{
            marginBottom: '2rem',
            padding: '1rem 1.25rem',
            border: '1px solid #137333',
            borderRadius: 4,
            background: '#e6f4ea',
          }}
        >
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#137333' }}>
            Tu pedido está listo para retirar
          </div>
          {order.pickup_time && (
            <div style={{ fontSize: '0.8rem', color: '#191c1e', marginTop: '0.35rem' }}>
              Puedes pasar a recogerlo el {formatDateTime(order.pickup_time)}.
            </div>
          )}
        </div>
      )}

      {/* Pickup Code */}
      {order.pickup_code && (
        <div
          style={{
            marginBottom: '2rem',
            padding: '1rem 1.25rem',
            border: '1px solid #002d62',
            borderRadius: 4,
            background: '#f0f5fb',
          }}
        >
          <div
            style={{
              fontSize: '0.65rem',
              color: '#747781',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.35rem',
            }}
          >
            Código de retiro
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '0.25em',
              color: '#002d62',
            }}
          >
            {order.pickup_code}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#43474f', marginTop: '0.35rem' }}>
            Preséntalo al personal del Económato al recoger tu pedido.
          </div>
        </div>
      )}

      {/* Order Items */}
      <div
        style={{
          marginBottom: '2rem',
          border: '1px solid oklch(0.922 0 0)',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '0.75rem 1.25rem',
            background: '#f2f4f6',
            borderBottom: '1px solid #e0e3e5',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          Artículos de la orden
        </div>
        <div style={{ padding: '0.5rem 0' }}>
          {order.items.map((item, index) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1.25rem',
                borderBottom: index < order.items.length - 1 ? '1px solid oklch(0.96 0 0)' : 'none',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#747781',
                  }}
                >
                  Cantidad: {item.quantity} × {formatCurrency(item.price)}
                </div>
              </div>
              <div
                style={{
                  textAlign: 'right',
                }}
              >
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  {formatCurrency(item.subtotal)}
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: '#747781',
                  }}
                >
                  Impuesto: {formatCurrency(item.tax)}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Order Summary Footer */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            background: '#f2f4f6',
            borderTop: '1px solid #e0e3e5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#747781' }}>
            Subtotal ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{formatCurrency(subtotal)}</div>
        </div>
        <div
          style={{
            padding: '0.75rem 1.25rem',
            background: '#f2f4f6',
            borderTop: '1px solid #e0e3e5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Total</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatCurrency(order.total)}</div>
        </div>
      </div>

      {/* Order Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Customer Information */}
        <div
          style={{
            border: '1px solid #e0e3e5',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '0.75rem 1.25rem',
              background: '#f2f4f6',
              borderBottom: '1px solid #e0e3e5',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Información del cliente
          </div>
          <div style={{ padding: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.75rem',
              }}
            >
              {order.profilepicture ? (
                <Image
                  src={order.profilepicture}
                  alt={`${order.firstname} ${order.lastname}`}
                  width={40}
                  height={40}
                  style={{
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                  unoptimized
                />
              ) : (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'oklch(0.922 0 0)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: 'oklch(0.556 0 0)',
                  }}
                >
                  {order.firstname.charAt(0)}
                  {order.lastname.charAt(0)}
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {order.firstname} {order.lastname}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'oklch(0.708 0 0)' }}>{order.email}</div>
              </div>
            </div>
            {order.phone && (
              <div style={{ fontSize: '0.75rem', color: '#43474f' }}>Teléfono: {order.phone}</div>
            )}
          </div>
        </div>

        {/* Shipping & Payment */}
        <div
          style={{
            border: '1px solid #e0e3e5',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '0.75rem 1.25rem',
              background: '#f2f4f6',
              borderBottom: '1px solid #e0e3e5',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Envío y Pago
          </div>
          <div style={{ padding: '1.25rem' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <div
                style={{
                  fontSize: '0.65rem',
                  color: '#747781',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Método de envío
              </div>
              <div style={{ fontSize: '0.875rem' }}>
                {formatShippingMethod(order.shipping_method)}
              </div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <div
                style={{
                  fontSize: '0.65rem',
                  color: '#747781',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Método de pago
              </div>
              <div style={{ fontSize: '0.875rem' }}>
                {formatPaymentMethod(order.payment_method)}
              </div>
            </div>
            {order.pickup_time && (
              <div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: '#747781',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Hora de recogida
                </div>
                <div style={{ fontSize: '0.875rem' }}>{formatDateTime(order.pickup_time)}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div
        style={{
          border: '1px solid oklch(0.922 0 0)',
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            padding: '0.75rem 1.25rem',
            background: 'oklch(0.97 0 0)',
            borderBottom: '1px solid oklch(0.922 0 0)',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          Shipping Address
        </div>
        <div style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.875rem' }}>
            <div>{order.address.street}</div>
            <div>
              {order.address.city}, {order.address.state} {order.address.zipCode}
            </div>
            <div>{order.address.country}</div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div
          style={{
            border: '1px solid oklch(0.922 0 0)',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '0.75rem 1.25rem',
              background: 'oklch(0.97 0 0)',
              borderBottom: '1px solid oklch(0.922 0 0)',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Order Notes
          </div>
          <div style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'oklch(0.556 0 0)' }}>{order.notes}</div>
          </div>
        </div>
      )}
    </div>
  );
}
