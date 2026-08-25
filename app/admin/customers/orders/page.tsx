'use client';

import { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import Link from 'next/link';
import { Search, X, Eye, FileText, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';
import { STATUS_UI, type OrderStatus } from '@/lib/order-status';
import { Avatar } from '@/components/admin/avatar';

// ============================================================================
// CAPA DE DOMINIO Y TIPOS ESTRICTOS
// ============================================================================

type Order = {
  id: number;
  profilepicture: string | null;
  firstname: string | null;
  lastname: string;
  email: string;
  created_at: string;
  total: number;
  status: OrderStatus;
  pickup_time: string | null;
};

// ============================================================================
// CONSTANTES Y UTILIDADES GLOBALES O(1)
// ============================================================================

const ITEMS_PER_PAGE = 5;
const SEARCH_DEBOUNCE_DELAY = 400;
const ORDERS_ENDPOINT = '/api/v1/admin/orders';

// ============================================================================
// CAPA DE ACCESO A DATOS (API REST)
// ============================================================================

type PaginatedResponse = {
  data: Order[];
  total: number;
};

async function fetchOrdersFromApi(
  search: string,
  page: number,
  limit: number,
  signal?: AbortSignal
): Promise<PaginatedResponse> {
  const params = new URLSearchParams({
    search,
    page: String(page),
    limit: String(limit),
  });

  const response = await fetch(`${ORDERS_ENDPOINT}?${params.toString()}`, { signal });

  if (!response.ok) {
    throw new Error(`Error al obtener órdenes: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// CUSTOM HOOK: Lógica de Estado y Paginación Discreta
// ============================================================================

function useOrdersPagination() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const fetchOrders = useCallback(async (search: string, page: number) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);

    try {
      const { data, total } = await fetchOrdersFromApi(
        search.trim(),
        page,
        ITEMS_PER_PAGE,
        controller.signal
      );

      if (controller.signal.aborted || !isMountedRef.current) return;

      setOrders(data);
      setTotalItems(total);
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      console.error(error);
    } finally {
      if (!controller.signal.aborted && isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      searchTimeoutRef.current = setTimeout(() => {
        setCurrentPage(1);
        fetchOrders(value, 1);
      }, SEARCH_DEBOUNCE_DELAY);
    },
    [fetchOrders]
  );

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchOrders('', 1);
  }, [fetchOrders]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      fetchOrders(searchTerm, newPage);
    },
    [searchTerm, fetchOrders]
  );

  // Montaje inicial
  useEffect(() => {
    isMountedRef.current = true;

    // Load initial data
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders('', 1);

    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      abortControllerRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  return {
    orders,
    isLoading,
    searchTerm,
    handleSearch,
    clearSearch,
    currentPage,
    totalPages,
    totalItems,
    handlePageChange,
  };
}

// ============================================================================
// COMPONENTES DE PRESENTACIÓN (Memoizados)
// ============================================================================

const LoadingDots = memo(() => (
  <div className="flex space-x-1.5 justify-center py-10">
    <div className="size-3 bg-[#c4c6d1] rounded-full animate-bounce" />
    <div className="size-3 bg-[#002d62] rounded-full animate-bounce [animation-delay:0.2s]" />
    <div className="size-3 bg-[#c4c6d1] rounded-full animate-bounce [animation-delay:0.4s]" />
  </div>
));
LoadingDots.displayName = 'LoadingDots';

const OrderRow = memo(({ order }: { order: Order }) => {
  const statusConfig = STATUS_UI[order.status];
  const StatusIcon = statusConfig.icon;

  return (
    <tr className="border-b border-[#e0e3e5] bg-white hover:bg-[#f8fafd] transition-colors duration-150">
      <td className="px-6 py-4 font-mono text-[13px] text-[#43474f] font-semibold">{order.id}</td>
      <td className="px-6 py-4">
        <Avatar
          src={order.profilepicture}
          firstName={order.firstname}
          lastName={order.lastname}
          size={40}
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold text-[#191c1e] tracking-tight">
            {order.firstname} {order.lastname}
          </span>
          <span className="text-[12px] text-[#747781] mt-0.5">{order.email}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-[13px] text-[#43474f] whitespace-nowrap">
        {formatDate(order.created_at)}
      </td>
      <td className="px-6 py-4 text-[14px] font-bold text-[#191c1e]">
        {formatCurrency(order.total)}
      </td>
      <td className="px-6 py-4">
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusConfig.badge}`}
        >
          <StatusIcon className="size-3.5" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {statusConfig.label}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-[13px] text-[#43474f] whitespace-nowrap">
        {order.pickup_time ? formatDate(order.pickup_time) : 'Sin asignar'}
      </td>
      <td className="px-6 py-4 text-right">
        <Link
          href={`/admin/customers/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#c4c6d1] rounded-md text-[12px] font-semibold text-[#43474f] hover:bg-[#f2f4f6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62]"
        >
          <Eye className="size-3.5" /> Detalle
        </Link>
      </td>
    </tr>
  );
});
OrderRow.displayName = 'OrderRow';

// ============================================================================
// COMPONENTE PRINCIPAL (PAGE)
// ============================================================================

export default function OrdersPage() {
  const {
    orders,
    isLoading,
    searchTerm,
    handleSearch,
    clearSearch,
    currentPage,
    totalPages,
    totalItems,
    handlePageChange,
  } = useOrdersPagination();

  const paginationRange = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb]">
      <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-[#e0e3e5]">
        <div>
          <h1 className="text-2xl font-sans font-bold text-[#00193c] tracking-tight">
            Directorio de Órdenes
          </h1>
          <p className="text-[13px] font-sans text-[#747781] mt-1">
            Supervisión y trazabilidad del histórico de transacciones operativas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#002d62] rounded-md text-[13px] font-semibold text-white hover:bg-[#00193c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-2">
            <Plus className="size-4" /> Nueva Orden
          </button>
        </div>
      </header>

      <section className="px-8 py-4 bg-white border-b border-[#e0e3e5]">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#747781] pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por ID, nombre o apellido..."
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-[#f7f9fb] border border-[#c4c6d1] rounded-md text-[13px] font-medium text-[#191c1e] placeholder:text-[#747781] transition-all focus:outline-none focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62] focus:bg-white"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c4c6d1] hover:text-[#747781] transition-colors focus:outline-none"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </section>

      <main className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar bg-white">
        {isLoading ? (
          <LoadingDots />
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#747781]">
            <FileText className="size-12 mb-4 text-[#c4c6d1]" />
            <p className="text-[14px] font-semibold text-[#191c1e]">
              {searchTerm
                ? 'No se encontraron registros coincidentes'
                : 'El registro de órdenes está vacío'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-[#f8fafd] sticky top-0 z-10 shadow-[0_1px_0_#e0e3e5]">
              <tr>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Perfil
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Identidad Sujeto
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Emisión
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Facturación
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Logística
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider text-right">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e3e5]">
              {orders.map(order => (
                <OrderRow key={order.id} order={order} />
              ))}
            </tbody>
          </table>
        )}
      </main>

      {!isLoading && orders.length > 0 && (
        <footer className="flex items-center justify-between px-8 py-4 bg-white border-t border-[#e0e3e5]">
          <div className="text-[13px] font-medium text-[#747781]">
            Mostrando{' '}
            <span className="font-bold text-[#191c1e]">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{' '}
            a{' '}
            <span className="font-bold text-[#191c1e]">
              {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
            </span>{' '}
            de <span className="font-bold text-[#191c1e]">{totalItems}</span> registros
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center size-8 rounded-md border border-[#c4c6d1] text-[#43474f] hover:bg-[#f2f4f6] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" />
            </button>

            <div className="flex items-center gap-1 mx-2">
              {paginationRange.map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`inline-flex items-center justify-center size-8 rounded-md text-[13px] font-semibold transition-all ${
                    currentPage === page
                      ? 'bg-[#002d62] text-white border border-[#002d62] shadow-sm'
                      : 'text-[#43474f] hover:bg-[#f2f4f6] border border-transparent hover:border-[#c4c6d1]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center size-8 rounded-md border border-[#c4c6d1] text-[#43474f] hover:bg-[#f2f4f6] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Página siguiente"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
