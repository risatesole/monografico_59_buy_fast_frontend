'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Info,
  Package,
  ArrowDown,
  ArrowUp,
  Plus, // Added Plus icon
  Minus,
  AlertTriangle,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

// ============================================================================
// TYPES
// ============================================================================

interface ProductImage {
  url: string;
  type: string;
  alt_text: string;
  order: number;
}

interface ProductCategory {
  slug: string;
  label: string;
  description: string;
  priority: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  category: ProductCategory;
  product_type: string;
  product_type_label: string;
  thumbnail: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface ProductVariant {
  id: number;
  name: string;
  description: string;
  variant_number: number;
  slug: string;
  sku: string;
  status: boolean;
  selling_price: number;
  tax_rate: number;
  minimum_stock: number;
  product: Product;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

interface StockMovement {
  id: number;
  date_time: string;
  product_variant: ProductVariant;
  movement_type: string;
  movement_type_label: string;
  quantity: number;
  balance: number;
  document_reference: string;
}

interface ApiResponse {
  status: string;
  data: StockMovement[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    has_next: boolean;
  };
}

// ============================================================================
// MOVEMENT TYPE UI CONFIGURATION
// ============================================================================

const MOVEMENT_TYPE_UI: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  purchase_entry: {
    icon: <ArrowDown className="size-3.5" />,
    color: 'text-[#137333]',
    bg: 'bg-[#e6f4ea] border-[#ceead6]',
  },
  customer_sell: {
    icon: <ArrowUp className="size-3.5" />,
    color: 'text-[#d93025]',
    bg: 'bg-[#fce8e6] border-[#f5c6c2]',
  },
  initial_inventory: {
    icon: <Package className="size-3.5" />,
    color: 'text-[#b06000]',
    bg: 'bg-[#fef7e0] border-[#feefc3]',
  },
  manual_decrease: {
    icon: <Minus className="size-3.5" />,
    color: 'text-[#ba1a1a]',
    bg: 'bg-[#ffdad6] border-[#ffb4ab]',
  },
};

// quantity is always stored as a positive number on the backend — the
// direction (added vs. removed) is implied by movement_type instead.
const STOCK_OUT_MOVEMENT_TYPES = new Set(['customer_sell', 'manual_decrease']);

// ============================================================================
// COMPONENTS
// ============================================================================

interface StockMovementRowProps {
  movement: StockMovement;
  onViewInfo: (id: number) => void;
}

const StockMovementRow = ({ movement, onViewInfo }: StockMovementRowProps) => {
  const movementUI =
    MOVEMENT_TYPE_UI[movement.movement_type] || MOVEMENT_TYPE_UI['initial_inventory'];
  const isStockOut = STOCK_OUT_MOVEMENT_TYPES.has(movement.movement_type);
  const minimumStock = movement.product_variant.minimum_stock;
  const isBelowMinimum = minimumStock > 0 && movement.balance <= minimumStock;
  const formattedDate = new Date(movement.date_time).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <tr className="group border-b border-[#e0e3e5] bg-white hover:bg-[#f8fafd] transition-colors duration-150 ease-in-out">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold text-[#191c1e] tracking-tight">
            #{movement.id}
          </span>
          <span className="text-[12px] text-[#747781] mt-0.5">{formattedDate}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg overflow-hidden bg-[#f2f4f6] flex-shrink-0 border border-[#e0e3e5] relative">
            {movement.product_variant.images.length > 0 ? (
              <Image
                src={movement.product_variant.images[0].url}
                alt={movement.product_variant.images[0].alt_text || movement.product_variant.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : movement.product_variant.product.thumbnail ? (
              <Image
                src={movement.product_variant.product.thumbnail}
                alt={movement.product_variant.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#e8eaed]">
                <Package className="size-5 text-[#747781]" />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-semibold text-[#191c1e] truncate">
              {movement.product_variant.product.name}
            </span>
            <span className="text-[12px] text-[#747781] truncate">
              {movement.product_variant.name} • SKU: {movement.product_variant.sku}
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${movementUI.bg}`}
        >
          {movementUI.icon}
          <span className={`text-[11px] font-bold uppercase tracking-wider ${movementUI.color}`}>
            {movement.movement_type_label}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className={`text-[14px] font-bold ${movementUI.color}`}>
            {isStockOut ? '-' : '+'}
            {movement.quantity}
          </span>
          <span className="text-[11px] text-[#747781]">Balance: {movement.balance}</span>
          {isBelowMinimum && (
            <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full border border-[#ffb4ab] bg-[#ffdad6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#93000a]">
              <AlertTriangle className="size-3" />
              Bajo mín. {minimumStock}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-[13px] font-medium text-[#43474f]">
          ${movement.product_variant.selling_price.toFixed(2)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col max-w-[150px]">
          <span className="text-[12px] text-[#43474f] truncate">
            {movement.document_reference || '—'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <button
          onClick={() => onViewInfo(movement.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-[#002d62] bg-[#e8f0fe] hover:bg-[#d2e3fc] border border-transparent hover:border-[#002d62] transition-all focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-1"
        >
          <Info className="size-3.5" />
          Detalles
        </button>
      </td>
    </tr>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StockMovementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get page from URL query parameter, default to 1
  const pageFromUrl = parseInt(searchParams.get('p') || '1', 10);
  const validPage = isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalMovements, setTotalMovements] = useState(0);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '-date_time');
  const hasLoadedRef = useRef(false);

  const ITEMS_PER_PAGE = 10;

  // Fetch stock movements from API
  const fetchMovements = useCallback(async (page: number, search?: string, sort?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      let url = `/api/v1/admin/inventory/stockmovement/?limit=${ITEMS_PER_PAGE}&offset=${offset}`;
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      if (sort) {
        url += `&sort=${encodeURIComponent(sort)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (result.status === 'ok') {
        setMovements(result.data);
        setTotalMovements(result.pagination.total);
      } else {
        throw new Error('Failed to fetch stock movements');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching stock movements';
      setError(errorMessage);
      console.error('Error fetching stock movements:', err);
      setMovements([]);
      setTotalMovements(0);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update URL with current page and other params
  const updateUrlParams = useCallback(
    (page: number, search?: string, sort?: string) => {
      const params = new URLSearchParams();
      if (page > 1) params.set('p', page.toString());
      if (search && search.trim()) params.set('search', search.trim());
      if (sort && sort !== '-date_time') params.set('sort', sort);

      const queryString = params.toString();
      const url = queryString ? `?${queryString}` : '';
      router.replace(`/admin/inventory/stockmovement${url}`, { scroll: false });
    },
    [router]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage === validPage) return;
      updateUrlParams(newPage, searchQuery, sortBy);
      fetchMovements(newPage, searchQuery, sortBy);
    },
    [validPage, searchQuery, sortBy, updateUrlParams, fetchMovements]
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (newSort: string) => {
      setSortBy(newSort);
      updateUrlParams(1, searchQuery, newSort);
      fetchMovements(1, searchQuery, newSort);
    },
    [searchQuery, updateUrlParams, fetchMovements]
  );

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get('search') || '';
      if (searchQuery !== currentSearch) {
        updateUrlParams(1, searchQuery, sortBy);
        fetchMovements(1, searchQuery, sortBy);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, sortBy, updateUrlParams, searchParams, fetchMovements]);

  // Initial data load - using a ref to track if we've loaded
  // This avoids the setState-in-effect warning
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      // Directly call fetchMovements, but since we're in an effect,
      // we need to handle this differently - we'll use a flag
      const loadData = async () => {
        await fetchMovements(validPage, searchQuery, sortBy);
      };
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once

  const totalPages = Math.max(1, Math.ceil(totalMovements / ITEMS_PER_PAGE));

  const handleViewDetails = useCallback(
    (movementId: number) => {
      router.push(`/admin/inventory/stockmovement/${movementId}`);
    },
    [router]
  );

  const handleAdvancedFilters = useCallback(() => {
    console.log('Desplegando panel de filtros avanzados');
  }, []);

  // Handler for the new "Insertar Producto" button
  const handleInsertProduct = useCallback(() => {
    router.push('/admin/inventory/stockmovement/insert');
  }, [router]);

  // Handler for the "Retirar Producto" button
  const handleDecreaseProduct = useCallback(() => {
    router.push('/admin/inventory/stockmovement/decrease');
  }, [router]);

  const paginationRange = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, validPage - 2);
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [totalPages, validPage]);

  // Show loading state
  if (isLoading && movements.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f7f9fb]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#002d62] border-t-transparent"></div>
          <p className="mt-4 text-[#747781]">Cargando movimientos...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f7f9fb]">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm border border-[#e0e3e5]">
          <p className="text-[#d93025] font-semibold">Error al cargar movimientos</p>
          <p className="text-[#747781] text-sm mt-2">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchMovements(validPage, searchQuery, sortBy);
            }}
            className="mt-4 px-4 py-2 bg-[#002d62] text-white rounded-md text-sm hover:bg-[#00193c] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb]">
      <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-[#e0e3e5]">
        <div>
          <h1 className="text-2xl font-sans font-bold text-[#00193c] tracking-tight">
            Movimientos de Inventario
          </h1>
          <p className="text-[13px] font-sans text-[#747781] mt-1">
            Historial completo de entradas y salidas de productos
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Added the "Insertar Producto" button */}
          <button
            onClick={handleInsertProduct}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#002d62] text-white rounded-md text-[13px] font-semibold hover:bg-[#00193c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-2 shadow-sm"
          >
            <Plus className="size-4" />
            Ingresar producto a inventario
          </button>

          <button
            onClick={handleDecreaseProduct}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ba1a1a] text-white rounded-md text-[13px] font-semibold hover:bg-[#93000a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#ba1a1a] focus:ring-offset-2 shadow-sm"
          >
            <Minus className="size-4" />
            Retirar producto de inventario
          </button>

          <div className="flex items-center gap-2 text-[13px] text-[#747781] bg-[#f2f4f6] px-3 py-1.5 rounded-md">
            <Package className="size-4" />
            <span className="font-semibold text-[#191c1e]">{totalMovements}</span>
            <span>movimientos totales</span>
          </div>
        </div>
      </header>

      <section className="px-8 py-4 bg-white border-b border-[#e0e3e5] flex items-center justify-between gap-4 flex-wrap">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#747781] pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por producto, SKU o referencia..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-[#f7f9fb] border border-[#c4c6d1] rounded-md text-[13px] font-medium text-[#191c1e] placeholder:text-[#747781] transition-all focus:outline-none focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={e => handleSortChange(e.target.value)}
            className="px-3 py-2.5 border border-[#c4c6d1] rounded-md text-[13px] font-medium text-[#43474f] bg-white hover:bg-[#f2f4f6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62]"
          >
            <option value="-date_time">Más reciente</option>
            <option value="date_time">Más antiguo</option>
            <option value="-quantity">Mayor cantidad</option>
            <option value="quantity">Menor cantidad</option>
            <option value="movement_type">Tipo de movimiento</option>
          </select>

          <button
            onClick={handleAdvancedFilters}
            className="inline-flex items-center gap-2 px-3 py-2.5 border border-[#c4c6d1] rounded-md text-[13px] font-semibold text-[#43474f] hover:bg-[#f2f4f6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62]"
          >
            <SlidersHorizontal className="size-4" />
            Filtros
          </button>
        </div>
      </section>

      <main className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar bg-white">
        {movements.length > 0 ? (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-[#f8fafd] sticky top-0 z-10 shadow-[0_1px_0_#e0e3e5]">
              <tr>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Referencia
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e3e5]">
              {movements.map(movement => (
                <StockMovementRow
                  key={movement.id}
                  movement={movement}
                  onViewInfo={handleViewDetails}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-[#747781]">
            <Package className="size-12 mb-4 text-[#c4c6d1]" />
            <p className="text-[14px] font-semibold text-[#191c1e]">
              No se encontraron movimientos
            </p>
            <p className="text-[13px] mt-1">
              {searchQuery
                ? 'No hay resultados para la búsqueda actual.'
                : 'No hay movimientos de inventario registrados.'}
            </p>
          </div>
        )}
      </main>

      <footer className="flex items-center justify-between px-8 py-4 bg-white border-t border-[#e0e3e5] flex-wrap gap-2">
        <div className="text-[13px] font-medium text-[#747781]">
          Mostrando <span className="font-bold text-[#191c1e]">{movements.length}</span> de{' '}
          <span className="font-bold text-[#191c1e]">{totalMovements}</span> movimientos
          {searchQuery && <span className="ml-2 text-[#002d62] font-semibold">(filtrados)</span>}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handlePageChange(validPage - 1)}
            disabled={validPage === 1}
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
                className={`inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-md text-[13px] font-semibold transition-all ${
                  validPage === page
                    ? 'bg-[#002d62] text-white border border-[#002d62] shadow-sm'
                    : 'text-[#43474f] hover:bg-[#f2f4f6] border border-transparent hover:border-[#c4c6d1]'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(validPage + 1)}
            disabled={validPage === totalPages}
            className="inline-flex items-center justify-center size-8 rounded-md border border-[#c4c6d1] text-[#43474f] hover:bg-[#f2f4f6] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Página siguiente"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
