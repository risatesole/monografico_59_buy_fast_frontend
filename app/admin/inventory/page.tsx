'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Package,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Eye,
  Plus,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

// ============================================================================
// TYPES
// ============================================================================

interface ProductImage {
  id: number;
  image: string;
  image_type: string;
  alt_text: string;
  order: number;
}

interface ProductInventoryItem {
  variant_id: number;
  product_id: number;
  product_name: string;
  product_description: string;
  thumbnail: string | null;
  quantity: number;
  inventory_status: 'in_stock' | 'medium_stock' | 'low_stock' | 'out_of_stock';
  minimum_stock: number;
  below_minimum_stock: boolean;
  images: ProductImage[];
  sku: string;
  variantnumber: number;
  status: boolean;
  selling_price: number;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductInventoryItem[];
}

interface InventorySummaryResponse {
  total_variants: number;
  total_products: number;
  total_items_in_stock: number;
  total_inventory_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

// ============================================================================
// INVENTORY STATUS UI CONFIGURATION
// ============================================================================

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  in_stock: {
    label: 'En Stock',
    icon: <CheckCircle className="size-3.5" />,
    color: 'text-[#137333]',
    bg: 'bg-[#e6f4ea] border-[#ceead6]',
  },
  medium_stock: {
    label: 'Stock Medio',
    icon: <Package className="size-3.5" />,
    color: 'text-[#b06000]',
    bg: 'bg-[#fef7e0] border-[#feefc3]',
  },
  low_stock: {
    label: 'Stock Bajo',
    icon: <AlertTriangle className="size-3.5" />,
    color: 'text-[#d93025]',
    bg: 'bg-[#fce8e6] border-[#f5c6c2]',
  },
  out_of_stock: {
    label: 'Sin Stock',
    icon: <AlertCircle className="size-3.5" />,
    color: 'text-[#d93025]',
    bg: 'bg-[#fce8e6] border-[#f5c6c2]',
  },
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface InventoryRowProps {
  item: ProductInventoryItem;
  onView: (variantId: number) => void;
}

const InventoryRow = ({ item, onView }: InventoryRowProps) => {
  const statusConfig = STATUS_CONFIG[item.inventory_status] || STATUS_CONFIG['out_of_stock'];

  // Low stock is defined per-variant by its own minimum_stock alert
  // threshold (0 = alert disabled for that variant), not a fixed number.
  const isLowStock = item.below_minimum_stock;
  const quantityColor = isLowStock ? 'text-[#d93025]' : 'text-[#191c1e]';

  return (
    <tr className="group border-b border-[#e0e3e5] bg-white hover:bg-[#f8fafd] transition-colors duration-150 ease-in-out">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-lg overflow-hidden bg-[#f2f4f6] flex-shrink-0 border border-[#e0e3e5] relative">
            {item.thumbnail ? (
              <Image
                src={item.thumbnail}
                alt={item.product_name}
                width={48}
                height={48}
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
              {item.product_name}
            </span>
            <span className="text-[12px] text-[#747781] truncate">
              Variante: {item.variantnumber} • SKU: {item.sku}
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-[13px] text-[#43474f]">{item.product_description || '—'}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className={`text-[16px] font-bold ${quantityColor}`}>{item.quantity}</span>
          {isLowStock && item.quantity > 0 && (
            <span className="text-[10px] text-[#d93025] font-medium uppercase tracking-wider">
              ¡Stock Bajo! (mín. {item.minimum_stock})
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusConfig.bg}`}
        >
          {statusConfig.icon}
          <span className={`text-[11px] font-bold uppercase tracking-wider ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-[13px] font-semibold text-[#191c1e]">
          ${item.selling_price.toFixed(2)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`text-[12px] font-medium ${item.status ? 'text-[#137333]' : 'text-[#747781]'}`}
        >
          {item.status ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onView(item.product_id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[13px] font-medium text-[#002d62] bg-[#e8f0fe] hover:bg-[#d2e3fc] border border-transparent hover:border-[#002d62] transition-all focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-1"
          >
            <Eye className="size-3.5" />
            Info
          </button>
        </div>
      </td>
    </tr>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InventoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get page from URL query parameter, default to 1
  const pageFromUrl = parseInt(searchParams.get('p') || '1', 10);
  const validPage = isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [inventoryItems, setInventoryItems] = useState<ProductInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '-variant_id');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [summaryStats, setSummaryStats] = useState<InventorySummaryResponse | null>(null);
  const hasLoadedRef = useRef(false);

  const ITEMS_PER_PAGE = 10;

  // Fetch inventory items from API
  const fetchInventory = useCallback(
    async (page: number, search?: string, sort?: string, status?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const offset = (page - 1) * ITEMS_PER_PAGE;
        let url = `/api/v1/admin/inventory/products/?limit=${ITEMS_PER_PAGE}&offset=${offset}`;

        if (search && search.trim()) {
          url += `&search=${encodeURIComponent(search.trim())}`;
        }
        if (sort) {
          url += `&ordering=${encodeURIComponent(sort)}`;
        }
        if (status) {
          url += `&status=${encodeURIComponent(status)}`;
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

        setInventoryItems(result.results || []);
        setTotalItems(result.count || 0);

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error fetching inventory';
        setError(errorMessage);
        console.error('Error fetching inventory:', err);
        setInventoryItems([]);
        setTotalItems(0);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fetch database-wide inventory summary stats (independent of pagination),
  // so the summary cards reflect every variant, not just the current page.
  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/admin/inventory/summary/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: InventorySummaryResponse = await response.json();
      setSummaryStats(result);
    } catch (err) {
      console.error('Error fetching inventory summary:', err);
    }
  }, []);

  // Update URL with current page and other params
  const updateUrlParams = useCallback(
    (page: number, search?: string, sort?: string, status?: string) => {
      const params = new URLSearchParams();
      if (page > 1) params.set('p', page.toString());
      if (search && search.trim()) params.set('search', search.trim());
      if (sort && sort !== '-variant_id') params.set('sort', sort);
      if (status) params.set('status', status);

      const queryString = params.toString();
      const url = queryString ? `?${queryString}` : '';
      router.replace(`/admin/inventory${url}`, { scroll: false });
    },
    [router]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage === validPage) return;
      updateUrlParams(newPage, searchQuery, sortBy, statusFilter);
      fetchInventory(newPage, searchQuery, sortBy, statusFilter);
    },
    [validPage, searchQuery, sortBy, statusFilter, updateUrlParams, fetchInventory]
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (newSort: string) => {
      setSortBy(newSort);
      updateUrlParams(1, searchQuery, newSort, statusFilter);
      fetchInventory(1, searchQuery, newSort, statusFilter);
    },
    [searchQuery, statusFilter, updateUrlParams, fetchInventory]
  );

  // Handle status filter change
  const handleStatusFilterChange = useCallback(
    (newStatus: string) => {
      setStatusFilter(newStatus);
      updateUrlParams(1, searchQuery, sortBy, newStatus);
      fetchInventory(1, searchQuery, sortBy, newStatus);
    },
    [searchQuery, sortBy, updateUrlParams, fetchInventory]
  );

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get('search') || '';
      if (searchQuery !== currentSearch) {
        updateUrlParams(1, searchQuery, sortBy, statusFilter);
        fetchInventory(1, searchQuery, sortBy, statusFilter);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, sortBy, statusFilter, updateUrlParams, searchParams, fetchInventory]);

  // Initial data load
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      const loadData = async () => {
        await Promise.all([
          fetchInventory(validPage, searchQuery, sortBy, statusFilter),
          fetchSummary(),
        ]);
      };
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const handleViewDetails = useCallback(
    (productId: number) => {
      router.push(`/admin/products/info/${productId}`);
    },
    [router]
  );

  const handleAdvancedFilters = useCallback(() => {
    console.log('Desplegando panel de filtros avanzados');
  }, []);

  const handleAddProduct = useCallback(() => {
    router.push('/admin/inventory/add');
  }, [router]);

  // Summary statistics come from the database-wide /admin/inventory/summary/
  // endpoint (fetchSummary), not from the current page's items.
  const summary = {
    // "Cantidad Total de Productos" is the count of product variants/SKUs
    // (each row in the table below is one variant), not the sum of stock
    // quantities (that's total_items_in_stock, unused here).
    totalItems: summaryStats?.total_variants ?? 0,
    lowStockCount: summaryStats?.low_stock_count ?? 0,
    outOfStockCount: summaryStats?.out_of_stock_count ?? 0,
    totalValue: summaryStats?.total_inventory_value ?? 0,
    itemCount: inventoryItems.length,
  };

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
  if (isLoading && inventoryItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f7f9fb]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#002d62] border-t-transparent"></div>
          <p className="mt-4 text-[#747781]">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f7f9fb]">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm border border-[#e0e3e5]">
          <p className="text-[#d93025] font-semibold">Error al cargar inventario</p>
          <p className="text-[#747781] text-sm mt-2">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchInventory(validPage, searchQuery, sortBy, statusFilter);
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
            Inventario de Productos
          </h1>
          <p className="text-[13px] font-sans text-[#747781] mt-1">
            Gestión de existencias y stock de productos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddProduct}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#002d62] text-white rounded-md text-[13px] font-semibold hover:bg-[#00193c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-2 shadow-sm"
          >
            <Plus className="size-4" />
            Agregar Producto
          </button>

          <div className="flex items-center gap-2 text-[13px] text-[#747781] bg-[#f2f4f6] px-3 py-1.5 rounded-md">
            <Package className="size-4" />
            <span className="font-semibold text-[#191c1e]">{summary.itemCount}</span>
            <span>productos</span>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 px-8 py-4 bg-white border-b border-[#e0e3e5]">
        <div className="bg-[#f8fafd] rounded-lg p-4 border border-[#e0e3e5]">
          <p className="text-[11px] font-semibold text-[#747781] uppercase tracking-wider">
            Cantidad Total de Productos
          </p>
          <p className="text-2xl font-bold text-[#00193c] mt-1">{summary.totalItems}</p>
        </div>
        <div className="bg-[#f8fafd] rounded-lg p-4 border border-[#e0e3e5]">
          <p className="text-[11px] font-semibold text-[#747781] uppercase tracking-wider">
            Stock Bajo
          </p>
          <p className="text-2xl font-bold text-[#d93025] mt-1">{summary.lowStockCount}</p>
        </div>
        <div className="bg-[#f8fafd] rounded-lg p-4 border border-[#e0e3e5]">
          <p className="text-[11px] font-semibold text-[#747781] uppercase tracking-wider">
            Sin Stock
          </p>
          <p className="text-2xl font-bold text-[#747781] mt-1">{summary.outOfStockCount}</p>
        </div>
        <div className="bg-[#f8fafd] rounded-lg p-4 border border-[#e0e3e5]">
          <p className="text-[11px] font-semibold text-[#747781] uppercase tracking-wider">
            Valor Total
          </p>
          <p className="text-2xl font-bold text-[#137333] mt-1">${summary.totalValue.toFixed(2)}</p>
        </div>
      </div>

      <section className="px-8 py-4 bg-white border-b border-[#e0e3e5] flex items-center justify-between gap-4 flex-wrap">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#747781] pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por producto, SKU o variante..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#f7f9fb] border border-[#c4c6d1] rounded-md text-[13px] font-medium text-[#191c1e] placeholder:text-[#747781] transition-all focus:outline-none focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={e => handleStatusFilterChange(e.target.value)}
            className="px-3 py-2.5 border border-[#c4c6d1] rounded-md text-[13px] font-medium text-[#43474f] bg-white hover:bg-[#f2f4f6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62]"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>

          <select
            value={sortBy}
            onChange={e => handleSortChange(e.target.value)}
            className="px-3 py-2.5 border border-[#c4c6d1] rounded-md text-[13px] font-medium text-[#43474f] bg-white hover:bg-[#f2f4f6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62]"
          >
            <option value="-variant_id">Más reciente</option>
            <option value="variant_id">Más antiguo</option>
            <option value="product__name">Nombre</option>
            <option value="sku">SKU</option>
            <option value="-selling_price">Precio mayor</option>
            <option value="selling_price">Precio menor</option>
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
        {inventoryItems.length > 0 ? (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-[#f8fafd] sticky top-0 z-10 shadow-[0_1px_0_#e0e3e5]">
              <tr>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Activo
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e3e5]">
              {inventoryItems.map(item => (
                <InventoryRow key={item.variant_id} item={item} onView={handleViewDetails} />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-[#747781]">
            <Package className="size-12 mb-4 text-[#c4c6d1]" />
            <p className="text-[14px] font-semibold text-[#191c1e]">No se encontraron productos</p>
            <p className="text-[13px] mt-1">
              {searchQuery
                ? 'No hay resultados para la búsqueda actual.'
                : 'No hay productos en el inventario.'}
            </p>
          </div>
        )}
      </main>

      <footer className="flex items-center justify-between px-8 py-4 bg-white border-t border-[#e0e3e5] flex-wrap gap-2">
        <div className="text-[13px] font-medium text-[#747781]">
          Mostrando <span className="font-bold text-[#191c1e]">{inventoryItems.length}</span> de{' '}
          <span className="font-bold text-[#191c1e]">{totalItems}</span> productos
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
