'use client';

import { useState, useCallback, useRef, memo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, Package, Plus, ChevronLeft, ChevronRight, Info, Upload } from 'lucide-react';
import { Product, getDisplayPrice } from '@/lib/products';

const SEARCH_DEBOUNCE_DELAY = 400;

const currencyFormatter = new Intl.NumberFormat('es-DO', {
  style: 'currency',
  currency: 'DOP',
});

function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

const CATEGORY_LABELS: Record<string, string> = {
  electronics: 'Electrónica',
  clothing: 'Ropa y Calzado',
  books: 'Libros y Textos',
  home: 'Hogar y Oficina',
  toys: 'Juguetería',
  food: 'Alimentos',
  other: 'Otros',
};

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

const LoadingDots = memo(() => (
  <div className="flex space-x-1.5 justify-center py-12">
    <div className="size-3 bg-[#c4c6d1] rounded-full animate-bounce" />
    <div className="size-3 bg-[#002d62] rounded-full animate-bounce [animation-delay:0.2s]" />
    <div className="size-3 bg-[#c4c6d1] rounded-full animate-bounce [animation-delay:0.4s]" />
  </div>
));
LoadingDots.displayName = 'LoadingDots';

const ProductRow = memo(({ product }: { product: Product }) => {
  const mainVariant = product.variants[0];
  const price = getDisplayPrice(product);
  const variantCount = product.variants.length;

  return (
    <tr className="border-b border-[#e0e3e5] bg-white hover:bg-[#f8fafd] transition-colors duration-150">
      <td className="px-6 py-4 font-mono text-[13px] text-[#43474f] font-semibold">
        #{product.id}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Image
            src={product.thumbnail}
            alt={product.name}
            width={40}
            height={40}
            className="rounded-md object-cover border border-[#e0e3e5] bg-[#f2f4f6]"
            loading="lazy"
            unoptimized
          />
          <div className="flex flex-col max-w-xs">
            <span className="text-[14px] font-semibold text-[#191c1e] tracking-tight truncate">
              {product.name}
            </span>
            <span className="text-[12px] text-[#747781] mt-0.5 font-mono truncate">
              {mainVariant?.sku || product.slug}
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-[13px] font-medium text-[#43474f] bg-[#f2f4f6] px-2.5 py-1 rounded-md border border-[#e0e3e5]">
          {getCategoryLabel(product.category)}
        </span>
      </td>
      <td className="px-6 py-4 text-[14px] font-bold text-[#191c1e] whitespace-nowrap">
        {formatCurrency(price)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full border bg-[#f2f4f6] text-[#43474f] border-[#e0e3e5] text-[11px] font-bold uppercase tracking-wider">
          {variantCount} {variantCount === 1 ? 'variante' : 'variantes'}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <Link
          href={`/admin/products/info/${product.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#c4c6d1] rounded-md text-[12px] font-semibold text-[#43474f] hover:bg-[#f2f4f6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62]"
        >
          <Info className="size-3.5" /> Info
        </Link>
      </td>
    </tr>
  );
});
ProductRow.displayName = 'ProductRow';

type ProductsClientProps = {
  initialProducts: Product[];
  initialSearch: string;
  initialPage: number;
  itemsPerPage: number;
};

export default function ProductsClient({
  initialProducts,
  initialSearch,
  initialPage,
  itemsPerPage,
}: ProductsClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRequestRef = useRef(0);

  // Always goes through our own /api/v1/products route — never the backend
  // directly — so the browser never hits a CORS wall.
  const fetchProducts = useCallback(
    async (search: string, page: number) => {
      const requestId = Date.now();
      latestRequestRef.current = requestId;
      setIsLoading(true);

      const offset = (page - 1) * itemsPerPage;
      const params = new URLSearchParams({
        limit: String(itemsPerPage),
        offset: String(offset),
      });
      if (search) params.set('search', search);

      try {
        const response = await fetch(`/api/v1/products?${params.toString()}`);
        const json = await response.json();

        if (latestRequestRef.current !== requestId) return; // a newer request won the race

        setProducts(json.data ?? []);

        // Keep the URL in sync so the page is shareable / refresh-safe.
        const urlParams = new URLSearchParams();
        if (search) urlParams.set('search', search);
        if (page > 1) urlParams.set('page', String(page));
        const query = urlParams.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      } finally {
        if (latestRequestRef.current === requestId) setIsLoading(false);
      }
    },
    [itemsPerPage, pathname, router]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        setCurrentPage(1);
        fetchProducts(value, 1);
      }, SEARCH_DEBOUNCE_DELAY);
    },
    [fetchProducts]
  );

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchProducts('', 1);
  }, [fetchProducts]);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchProducts(searchTerm, page);
    },
    [searchTerm, fetchProducts]
  );

  // The backend doesn't return a total count, so pagination is prev/next
  // only: if a page comes back full, we assume there might be another one.
  const hasNextPage = products.length === itemsPerPage;
  const hasPrevPage = currentPage > 1;
  const rangeStart = products.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const rangeEnd = (currentPage - 1) * itemsPerPage + products.length;

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb]">
      <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-[#e0e3e5]">
        <div>
          <h1 className="text-2xl font-sans font-bold text-[#00193c] tracking-tight">
            Catálogo de Productos
          </h1>
          <p className="text-[13px] font-sans text-[#747781] mt-1">
            Administración de inventario, variantes y asignación de precios.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/import"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#c4c6d1] rounded-md text-[13px] font-semibold text-[#43474f] hover:bg-[#f2f4f6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-2"
          >
            <Upload className="size-4" /> Importar CSV
          </Link>
          <Link
            href="/admin/products/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#002d62] rounded-md text-[13px] font-semibold text-white hover:bg-[#00193c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-2"
          >
            <Plus className="size-4" /> Nuevo Producto
          </Link>
        </div>
      </header>

      <section className="px-8 py-4 bg-white border-b border-[#e0e3e5]">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#747781] pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
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
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#747781]">
            <Package className="size-12 mb-4 text-[#c4c6d1]" />
            <p className="text-[14px] font-semibold text-[#191c1e]">
              {searchTerm
                ? 'No se encontraron productos coincidentes'
                : 'El catálogo de productos está vacío'}
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
                  Producto / Variante
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Cantidad de Variantes
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider text-right">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e3e5]">
              {products.map(product => (
                <ProductRow key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        )}
      </main>

      {!isLoading && products.length > 0 && (
        <footer className="flex items-center justify-between px-8 py-4 bg-white border-t border-[#e0e3e5]">
          <div className="text-[13px] font-medium text-[#747781]">
            Mostrando <span className="font-bold text-[#191c1e]">{rangeStart}</span> a{' '}
            <span className="font-bold text-[#191c1e]">{rangeEnd}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={!hasPrevPage}
              className="inline-flex items-center justify-center size-8 rounded-md border border-[#c4c6d1] text-[#43474f] hover:bg-[#f2f4f6] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="mx-2 text-[13px] font-semibold text-[#191c1e]">
              Página {currentPage}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!hasNextPage}
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
