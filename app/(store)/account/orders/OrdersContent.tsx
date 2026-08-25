'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SectionLabel } from '@/components/account/SectionLabel';
import { Button } from '@/components/ui/button';

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

export async function getOrders(page: number): Promise<PaginatedResponse> {
  try {
    const response = await fetch(`/api/v1/orders?page=${page}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: PaginatedResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

const statusStyles: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  delivered: { label: 'Entregado', color: '#2a5a7a', bg: '#e8f5ff' },
  shipped: { label: 'Enviado', color: '#1a67b3', bg: '#eaf4ff' },
  processing: { label: 'En proceso', color: '#7a5a2a', bg: '#fff7e8' },
  cancelled: { label: 'Cancelado', color: '#cc3b3b', bg: '#fff0f0' },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const style = statusStyles[status];
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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
  }).format(amount);
}
function useOrdersPagination() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_WINDOW = 5;

  const currentPage = parseInt(searchParams.get('p') || '1', 10);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchPage = useCallback(
    async (page: number) => {
      if (page < 1) {
        setError('This page does not exist. Please select a valid page.');
        setOrders([]);
        router.push(`?p=1`);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getOrders(page);
        if (isMounted.current) {
          setOrders(response.orders);
          setTotalPages(response.totalPages);

          if (page > response.totalPages) {
            setError('This page does not exist. Please select a valid page.');
            setOrders([]);
            router.push(`?p=1`);
            return;
          }
        }
        router.push(`?p=${page}`);
      } catch (err) {
        console.error('Error fetching orders:', err);
        if (isMounted.current) {
          setError('Failed to load orders');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [router]
  );

  const goToPage = useCallback(
    (page: number) => {
      fetchPage(page);
    },
    [fetchPage]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const retry = useCallback(() => {
    fetchPage(currentPage);
  }, [fetchPage, currentPage]);

  const getPageRange = useCallback(() => {
    const halfWindow = Math.floor(PAGE_WINDOW / 2);
    let startPage = currentPage - halfWindow;
    let endPage = currentPage + halfWindow;

    if (startPage < 1) {
      startPage = 1;
      endPage = Math.min(PAGE_WINDOW, totalPages);
    }

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, totalPages - PAGE_WINDOW + 1);
    }

    return { startPage, endPage };
  }, [currentPage, totalPages]);

  useEffect(() => {
    let isEffectActive = true;

    const loadData = async () => {
      if (isEffectActive) {
        await fetchPage(currentPage);
      }
    };

    loadData();

    return () => {
      isEffectActive = false;
    };
  }, [currentPage, fetchPage]);

  const isInvalidPage = currentPage < 1 || currentPage > totalPages;

  return {
    orders,
    loading,
    error,
    currentPage,
    totalPages,
    isInvalidPage,
    goToPage,
    nextPage,
    prevPage,
    retry,
    getPageRange,
  };
}

function BouncingDots() {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#002d62',
          animation: 'bounce 1s ease-in-out infinite',
        }}
      />
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#002d62',
          animation: 'bounce 1s ease-in-out infinite 0.2s',
        }}
      />
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#002d62',
          animation: 'bounce 1s ease-in-out infinite 0.4s',
        }}
      />
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '4rem 1rem',
        color: '#747781',
      }}
    >
      <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Aún no hay órdenes</p>
      <p style={{ fontSize: '0.875rem' }}>Cuando realices una compra, aparecerá aquí.</p>
    </div>
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      style={{
        padding: '1rem',
        border: '1px solid #cc3b3b',
        borderRadius: 4,
        background: '#fff0f0',
        marginBottom: '1rem',
      }}
    >
      <p style={{ color: '#cc3b3b', marginBottom: '0.5rem' }}>{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}

function PaginationControls({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onGoToPage,
  getPageRange,
}: {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage: (page: number) => void;
  getPageRange: () => { startPage: number; endPage: number };
}) {
  const { startPage, endPage } = getPageRange();
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div
      style={{
        marginTop: '2rem',
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Button
        onClick={() => onGoToPage(1)}
        disabled={currentPage === 1}
        variant="outline"
        size="sm"
        style={{ fontSize: '0.75rem' }}
      >
        ⏮ Primero
      </Button>

      <Button onClick={onPrevPage} disabled={currentPage === 1} variant="outline" size="sm">
        ← Anterior
      </Button>

      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {pageNumbers.map(page => (
          <button
            key={page}
            onClick={() => onGoToPage(page)}
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: 4,
              border: page === currentPage ? '2px solid #115cb9' : '1px solid #e0e3e5',
              background: page === currentPage ? '#e8f0ff' : 'transparent',
              color: page === currentPage ? '#115cb9' : '#43474f',
              fontWeight: page === currentPage ? 600 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {page}
          </button>
        ))}
      </div>

      <Button
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        variant="outline"
        size="sm"
      >
        Siguiente →
      </Button>

      <Button
        onClick={() => onGoToPage(totalPages)}
        disabled={currentPage === totalPages}
        variant="outline"
        size="sm"
        style={{ fontSize: '0.75rem' }}
      >
        Último ⏭
      </Button>
    </div>
  );
}

export default function OrdersContent() {
  const router = useRouter();
  const {
    orders,
    loading,
    error,
    currentPage,
    totalPages,
    isInvalidPage,
    goToPage,
    nextPage,
    prevPage,
    retry,
    getPageRange,
  } = useOrdersPagination();

  return (
    <div>
      <SectionLabel>Orders</SectionLabel>

      {error && <ErrorBanner message={error} onRetry={retry} />}

      {isInvalidPage ? (
        <>
          <EmptyState />
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'oklch(0.637 0.237 25.331)',
              fontSize: '0.95rem',
            }}
          >
            <p>Page {currentPage} does not exist in this range.</p>
          </div>
          <PaginationControls
            currentPage={1}
            totalPages={totalPages}
            onPrevPage={prevPage}
            onNextPage={nextPage}
            onGoToPage={goToPage}
            getPageRange={() => {
              const halfWindow = Math.floor(5 / 2);
              let startPage = 1 - halfWindow;
              let endPage = 1 + halfWindow;

              if (startPage < 1) {
                startPage = 1;
                endPage = Math.min(5, totalPages);
              }

              if (endPage > totalPages) {
                endPage = totalPages;
                startPage = Math.max(1, totalPages - 5 + 1);
              }

              return { startPage, endPage };
            }}
          />
        </>
      ) : loading ? (
        <div style={{ padding: '3rem' }}>
          <BouncingDots />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => (
              <div
                key={order.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '1.5rem',
                  padding: '1.25rem',
                  border: '1px solid oklch(0.922 0 0)',
                  borderRadius: 4,
                  alignItems: 'start',
                  transition: 'border-color 0.15s',
                  cursor: 'pointer',
                }}
                onClick={() => router.push(`/account/orders/${order.id}`)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'oklch(0.556 0 0)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'oklch(0.922 0 0)';
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
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      {order.id}
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
                    <span>{formatDate(order.date)}</span>
                    <span>
                      {order.items} {order.items === 1 ? 'item' : 'items'}
                    </span>
                    <span style={{ fontWeight: 500, color: 'oklch(0.145 0 0)' }}>
                      {formatCurrency(order.total)}
                    </span>
                    {order.trackingNumber && (
                      <span
                        style={{
                          color: 'oklch(0.556 0 0)',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                        }}
                      >
                        Track order
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'oklch(0.556 0 0)',
                    fontSize: '0.75rem',
                  }}
                >
                  <span>View details →</span>
                </div>
              </div>
            ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={prevPage}
            onNextPage={nextPage}
            onGoToPage={goToPage}
            getPageRange={getPageRange}
          />
        </>
      )}
    </div>
  );
}
