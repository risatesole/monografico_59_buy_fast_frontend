'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, CheckCircle2, Undo2, Users, UserCog, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';
import { STATUS_UI } from '@/lib/order-status';

// ============================================================================
// TYPES — mirrors the response shape of GET /api/v1/admin/dashboard/summary/
// ============================================================================

interface OrderStatusCounts {
  pending: number;
  fulfilled: number;
  returned: number;
}

interface LowStockProduct {
  variant_id: number;
  product_name: string;
  sku: string;
  quantity: number;
}

interface RecentOrder {
  id: number;
  firstname: string | null;
  lastname: string;
  email: string;
  created_at: string;
  total: number;
  status: 'pending' | 'fulfilled' | 'returned';
  pickup_time: string | null;
}

interface SalesDay {
  date: string;
  total: number;
}

interface StockMovementDay {
  date: string;
  stock_in: number;
  stock_out: number;
}

interface DashboardSummary {
  order_status_counts: OrderStatusCounts;
  employees_count: number;
  customers_count: number;
  low_stock_products: LowStockProduct[];
  recent_orders: RecentOrder[];
  sales_last_7_days: SalesDay[];
  stock_movements_last_7_days: StockMovementDay[];
}

// ============================================================================
// CHART CONSTANTS AND HELPERS
// ============================================================================

const CHART_HEIGHT = 140;
const BAR_WIDTH = 26;
const BAR_GAP = 22;

function formatShortWeekday(dateString: string): string {
  try {
    // "T00:00:00" forces the date to be read in local time instead of UTC,
    // so the weekday shown always matches the date the backend sent.
    const date = new Date(`${dateString}T00:00:00`);
    return new Intl.DateTimeFormat('es-DO', { weekday: 'short' }).format(date);
  } catch {
    return dateString;
  }
}

// Simple bar chart for daily sales totals. Plain SVG, no charting library.
function SalesBarChart({ data }: { data: SalesDay[] }) {
  const maxTotal = Math.max(1, ...data.map(day => day.total));
  const chartWidth = data.length * (BAR_WIDTH + BAR_GAP);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT + 30}`}
      className="overflow-visible"
    >
      {data.map((day, index) => {
        const barHeight = (day.total / maxTotal) * CHART_HEIGHT;
        const x = index * (BAR_WIDTH + BAR_GAP) + BAR_GAP / 2;

        return (
          <g key={day.date}>
            <rect
              x={x}
              y={CHART_HEIGHT - barHeight}
              width={BAR_WIDTH}
              height={Math.max(barHeight, 2)}
              rx={4}
              className="fill-[#002d62]"
            >
              <title>{formatCurrency(day.total)}</title>
            </rect>
            <text
              x={x + BAR_WIDTH / 2}
              y={CHART_HEIGHT + 18}
              textAnchor="middle"
              className="fill-[#747781] text-[10px] uppercase"
            >
              {formatShortWeekday(day.date)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Simple grouped bar chart for stock entradas (in) vs. salidas (out) per day.
function StockMovementChart({ data }: { data: StockMovementDay[] }) {
  const maxValue = Math.max(1, ...data.flatMap(day => [day.stock_in, day.stock_out]));
  const groupWidth = BAR_WIDTH * 2 + 6;
  const chartWidth = data.length * (groupWidth + BAR_GAP);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT + 30}`}
      className="overflow-visible"
    >
      {data.map((day, index) => {
        const groupX = index * (groupWidth + BAR_GAP) + BAR_GAP / 2;
        const inHeight = (day.stock_in / maxValue) * CHART_HEIGHT;
        const outHeight = (day.stock_out / maxValue) * CHART_HEIGHT;

        return (
          <g key={day.date}>
            <rect
              x={groupX}
              y={CHART_HEIGHT - inHeight}
              width={BAR_WIDTH}
              height={Math.max(inHeight, 2)}
              rx={3}
              className="fill-[#1e8e3e]"
            >
              <title>{`Entradas: ${day.stock_in}`}</title>
            </rect>
            <rect
              x={groupX + BAR_WIDTH + 6}
              y={CHART_HEIGHT - outHeight}
              width={BAR_WIDTH}
              height={Math.max(outHeight, 2)}
              rx={3}
              className="fill-[#d93025]"
            >
              <title>{`Salidas: ${day.stock_out}`}</title>
            </rect>
            <text
              x={groupX + BAR_WIDTH + 3}
              y={CHART_HEIGHT + 18}
              textAnchor="middle"
              className="fill-[#747781] text-[10px] uppercase"
            >
              {formatShortWeekday(day.date)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================================
// SMALL PRESENTATION COMPONENTS
// ============================================================================

function StatCard({
  label,
  value,
  valueColor,
  icon,
}: {
  label: string;
  value: number;
  valueColor: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-[#f8fafd] rounded-lg p-4 border border-[#e0e3e5] flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold text-[#747781] uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
      </div>
      <div className="text-[#c4c6d1]">{icon}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-[#e0e3e5] p-6">
      <h2 className="text-[15px] font-bold text-[#00193c] mb-4">{title}</h2>
      {children}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/v1/admin/dashboard/summary/', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (isMounted) {
          setSummary(result.data as DashboardSummary);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error al cargar el panel de control');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f7f9fb]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#002d62] border-t-transparent"></div>
          <p className="mt-4 text-[#747781]">Cargando panel de control...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f7f9fb]">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm border border-[#e0e3e5]">
          <p className="text-[#d93025] font-semibold">Error al cargar el panel de control</p>
          <p className="text-[#747781] text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="border-b border-[#e0e3e5] pb-4">
        <h1 className="text-2xl font-sans font-bold text-[#00193c] tracking-tight">
          Panel de Control
        </h1>
        <p className="text-[13px] text-[#747781] mt-1">Resumen operativo del Económato UASD.</p>
      </header>

      {/* KPI cards */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="Pedidos Pendientes"
          value={summary.order_status_counts.pending}
          valueColor="text-[#b06000]"
          icon={<ClipboardList className="size-6" />}
        />
        <StatCard
          label="Pedidos Completados"
          value={summary.order_status_counts.fulfilled}
          valueColor="text-[#137333]"
          icon={<CheckCircle2 className="size-6" />}
        />
        <StatCard
          label="Pedidos Devueltos"
          value={summary.order_status_counts.returned}
          valueColor="text-[#5f6368]"
          icon={<Undo2 className="size-6" />}
        />
        <StatCard
          label="Empleados"
          value={summary.employees_count}
          valueColor="text-[#00193c]"
          icon={<UserCog className="size-6" />}
        />
        <StatCard
          label="Clientes"
          value={summary.customers_count}
          valueColor="text-[#00193c]"
          icon={<Users className="size-6" />}
        />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Ventas de los Últimos 7 Días">
          <SalesBarChart data={summary.sales_last_7_days} />
        </ChartCard>

        <ChartCard title="Movimientos de Inventario">
          <div className="flex items-center gap-4 mb-2 text-[11px] text-[#747781]">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#1e8e3e]" /> Entradas
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#d93025]" /> Salidas
            </span>
          </div>
          <StockMovementChart data={summary.stock_movements_last_7_days} />
        </ChartCard>
      </section>

      {/* Low stock + recent orders */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-[#e0e3e5] p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-4 text-[#d93025]" />
            <h2 className="text-[15px] font-bold text-[#00193c]">
              Stock Bajo (menos de 5 unidades)
            </h2>
          </div>

          {summary.low_stock_products.length === 0 ? (
            <p className="text-[13px] text-[#747781]">
              Ningún producto activo tiene menos de 5 unidades en existencia.
            </p>
          ) : (
            <ul className="divide-y divide-[#e0e3e5]">
              {summary.low_stock_products.map(product => (
                <li
                  key={product.variant_id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#191c1e] truncate">
                      {product.product_name}
                    </p>
                    <p className="text-[12px] text-[#747781]">SKU: {product.sku}</p>
                  </div>
                  <span
                    className={`shrink-0 text-[13px] font-bold ${
                      product.quantity === 0 ? 'text-[#d93025]' : 'text-[#b06000]'
                    }`}
                  >
                    {product.quantity} und.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg border border-[#e0e3e5] p-6">
          <h2 className="text-[15px] font-bold text-[#00193c] mb-4">Órdenes Recientes</h2>

          {summary.recent_orders.length === 0 ? (
            <p className="text-[13px] text-[#747781]">Aún no hay órdenes registradas.</p>
          ) : (
            <ul className="divide-y divide-[#e0e3e5]">
              {summary.recent_orders.map(order => {
                const statusConfig = STATUS_UI[order.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <li key={order.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#191c1e] truncate">
                        {order.firstname} {order.lastname}
                      </p>
                      <p className="text-[12px] text-[#747781]">{formatDate(order.created_at)}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      <span className="text-[13px] font-bold text-[#191c1e]">
                        {formatCurrency(order.total)}
                      </span>
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusConfig.badge}`}
                      >
                        <StatusIcon className="size-3.5" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-4 pt-4 border-t border-[#e0e3e5] text-right">
            <Link
              href="/admin/customers/orders"
              className="text-[13px] font-semibold text-[#002d62] hover:underline"
            >
              Ver todas las órdenes →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
