// app/admin/customers/orders/[id]/page.tsx
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ImageOff, PackageCheck } from 'lucide-react';
import FulfillButton from './FulfillButton';
import MarkReadyButton from './MarkReadyButton';
import { Avatar } from '@/components/admin/avatar';
import { formatCurrency, formatDate } from '@/lib/format';
import { STATUS_UI, type OrderStatus } from '@/lib/order-status';

interface ProductImage {
  id: number;
  url: string;
  type: string;
  alt_text: string;
  order: number;
}

interface Product {
  id: number;
  name: string;
  variant_id: number;
  variant_name: string;
  sku: string;
  selling_price: number;
  tax_rate: number;
  images: ProductImage[];
}

interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price_per_item: number;
  tax_amount: number;
  subtotal: number;
}

interface OrderData {
  id: number;
  customer_email: string;
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_profile_picture: string | null;
  status: OrderStatus;
  pickup_time: string;
  pickup_code: string;
  ready_for_pickup: boolean;
  created_at: string;
  items: OrderItem[];
  total_items: number;
}

interface OrderResponse {
  status: string;
  data: OrderData;
}

function hasImageUrl(image: ProductImage | undefined): image is ProductImage {
  return Boolean(image?.url);
}

async function getOrderDetails(orderId: string): Promise<OrderData | null> {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    const cookieString = allCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

    const apiUrl = process.env.BACKEND_URL || 'http://localhost:8000';

    const response = await fetch(`${apiUrl}/api/v1/admin/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieString && { Cookie: cookieString }),
      },
      cache: 'no-store',
      next: {
        tags: [`order-${orderId}`],
      },
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

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await getOrderDetails(id);

  if (!order) {
    notFound();
  }

  const totalOrderAmount = order.items.reduce((sum, item) => sum + item.subtotal, 0);
  const statusConfig = STATUS_UI[order.status];
  const StatusIcon = statusConfig.icon;
  const customerFullName =
    `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim() ||
    order.customer_email;

  return (
    <div className="min-h-screen bg-[#f7f9fb] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#191c1e]">Detalles de orden</h1>
            <p className="text-[#747781] mt-1">Orden #{order.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${statusConfig.badge}`}
            >
              <StatusIcon className="size-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {statusConfig.label}
              </span>
            </div>
            {order.ready_for_pickup && order.status !== 'fulfilled' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-[#e8f0fe] text-[#1967d2] border-[#d2e3fc]">
                <PackageCheck className="size-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Lista para retirar
                </span>
              </div>
            )}
            {order.status !== 'fulfilled' && (
              <MarkReadyButton orderId={order.id} readyForPickup={order.ready_for_pickup} />
            )}
            {order.status !== 'fulfilled' && order.ready_for_pickup && (
              <FulfillButton orderId={order.id} />
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-[#e0e3e5] p-6">
            <h3 className="text-xs font-bold tracking-wider text-[#747781] uppercase mb-3">
              Cliente
            </h3>
            <div className="flex items-center gap-3">
              <Avatar
                src={order.customer_profile_picture}
                firstName={order.customer_first_name}
                lastName={order.customer_last_name || ''}
                size={48}
              />
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-[#191c1e] truncate">
                  {customerFullName}
                </p>
                <p className="text-sm text-[#747781] truncate">{order.customer_email}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-[#e0e3e5] p-6">
            <h3 className="text-xs font-bold tracking-wider text-[#747781] uppercase mb-1">
              Fecha de Orden
            </h3>
            <p className="text-lg font-semibold text-[#191c1e]">{formatDate(order.created_at)}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#e0e3e5] p-6">
            <h3 className="text-xs font-bold tracking-wider text-[#747781] uppercase mb-1">
              Fecha y hora de recoger
            </h3>
            <p className="text-lg font-semibold text-[#191c1e]">
              {order.pickup_time ? formatDate(order.pickup_time) : 'Sin asignar'}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-[#e0e3e5] p-6">
            <h3 className="text-xs font-bold tracking-wider text-[#747781] uppercase mb-1">
              Código de retiro
            </h3>
            <p className="font-mono text-lg font-bold tracking-[0.2em] text-[#002d62]">
              {order.pickup_code}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg border border-[#e0e3e5] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e0e3e5]">
            <h2 className="text-lg font-semibold text-[#191c1e]">
              Artículos de la orden ({order.total_items})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8fafd]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#747781] uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#747781] uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#747781] uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#747781] uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#747781] uppercase tracking-wider">
                    Impuesto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#747781] uppercase tracking-wider">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e3e5]">
                {order.items.map(item => (
                  <tr key={item.id} className="hover:bg-[#f8fafd] transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative size-16 flex-shrink-0 rounded-lg border border-[#e0e3e5] bg-[#f2f4f6] overflow-hidden">
                          {hasImageUrl(item.product.images?.[0]) ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.images[0].alt_text || item.product.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#c4c6d1]">
                              <ImageOff className="size-6" aria-label="Sin imagen" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[#191c1e]">{item.product.name}</p>
                          <p className="text-sm text-[#747781]">{item.product.variant_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#747781]">{item.product.sku}</td>
                    <td className="px-6 py-4 text-sm text-[#191c1e]">
                      {formatCurrency(item.price_per_item)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#191c1e]">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-[#191c1e]">
                      {formatCurrency(item.tax_amount)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#191c1e]">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#f8fafd]">
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-right font-medium text-[#191c1e]">
                    Total
                  </td>
                  <td className="px-6 py-4 text-lg font-bold text-[#191c1e]">
                    {formatCurrency(totalOrderAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Product Images Gallery - Grouped by Product */}
        {order.items.some(item => item.product.images?.some(hasImageUrl)) && (
          <div className="mt-6 bg-white rounded-lg border border-[#e0e3e5] p-6">
            <h3 className="text-lg font-semibold text-[#191c1e] mb-4">Imágenes de productos</h3>
            <div className="space-y-6">
              {order.items.map(item => {
                const validImages = item.product.images?.filter(hasImageUrl) ?? [];
                if (validImages.length === 0) {
                  return null;
                }
                return (
                  <div
                    key={item.id}
                    className="border-b border-[#e0e3e5] last:border-0 pb-6 last:pb-0"
                  >
                    <h4 className="font-medium text-[#191c1e] mb-3 flex items-center gap-2">
                      <span>{item.product.name}</span>
                      <span className="text-sm font-normal text-[#747781]">
                        ({item.product.variant_name})
                      </span>
                      <span className="text-sm font-normal text-[#c4c6d1]">× {item.quantity}</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {validImages.map(image => (
                        <div
                          key={image.id}
                          className="relative aspect-square rounded-lg border border-[#e0e3e5] overflow-hidden bg-[#f2f4f6]"
                        >
                          <Image
                            src={image.url}
                            alt={image.alt_text || item.product.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-200"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          />
                          {image.type && (
                            <div className="absolute bottom-1.5 right-1.5 bg-[#002d62]/90 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                              {image.type.toLowerCase()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
