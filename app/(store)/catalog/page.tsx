import Link from 'next/link';
import { PackageSearch, Search as SearchIcon } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { CatalogFilters, type CategoryOption } from './CatalogFilters';
import type { Product } from '@/entities/product';

const PAGE_SIZE = 12;

interface MappedProduct {
  id: string | number;
  name: string;
  slug: string;
  category: string;
  sellingPrice: number;
  taxRate: number;
  thumbnail?: string;
}

interface PriceBounds {
  min: number;
  max: number;
}

interface ProductFilters {
  categories: string[];
  priceMin?: number;
  priceMax?: number;
}

interface PaginatedResponse {
  data: Product[];
  total: number;
  hasMoreResults: boolean;
  priceBounds: PriceBounds;
}

function buildBackendUrl(
  searchQuery: string,
  offset: number,
  limit: number,
  filters: ProductFilters
) {
  const baseUrl = process.env.BACKEND_URL ?? 'http://localhost:8000';
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });

  if (searchQuery.trim()) {
    params.set('search', searchQuery.trim());
  }

  if (filters.categories.length > 0) {
    params.set('category', filters.categories.join(','));
  }

  if (typeof filters.priceMin === 'number') {
    params.set('price_min', String(filters.priceMin));
  }

  if (typeof filters.priceMax === 'number') {
    params.set('price_max', String(filters.priceMax));
  }

  return `${baseUrl}/api/v1/products/?${params.toString()}`;
}

// Rango por defecto cuando el backend no responde: mantiene el slider visible y
// habilitado (min < max) en vez de quedar deshabilitado con {min:0, max:0}.
const FALLBACK_PRICE_BOUNDS: PriceBounds = { min: 0, max: 100000 };

function derivePriceBoundsFromProducts(products: Product[]): PriceBounds {
  const prices = products
    .map(product => product.variants?.[0]?.selling_price)
    .filter((price): price is number => typeof price === 'number');

  if (prices.length === 0) {
    return FALLBACK_PRICE_BOUNDS;
  }

  return { min: Math.min(...prices), max: Math.max(...prices) };
}

async function getProducts(
  searchQuery: string,
  offset: number,
  filters: ProductFilters
): Promise<PaginatedResponse> {
  try {
    const response = await fetch(buildBackendUrl(searchQuery, offset, PAGE_SIZE, filters), {
      next: { revalidate: 300, tags: ['products', 'catalog'] },
    });

    if (!response.ok) {
      throw new Error(`No se pudieron cargar los productos (${response.status})`);
    }

    const json = await response.json();
    const products = Array.isArray(json?.results)
      ? json.results
      : Array.isArray(json?.data)
        ? json.data
        : [];

    const total =
      typeof json?.count === 'number'
        ? json.count
        : products.length > 0
          ? offset + products.length + (products.length === PAGE_SIZE ? 1 : 0)
          : 0;

    const priceBounds: PriceBounds =
      typeof json?.meta?.price_bounds?.min === 'number' &&
      typeof json?.meta?.price_bounds?.max === 'number'
        ? { min: json.meta.price_bounds.min, max: json.meta.price_bounds.max }
        : derivePriceBoundsFromProducts(products);

    return {
      data: products,
      total,
      hasMoreResults: products.length === PAGE_SIZE,
      priceBounds,
    };
  } catch (error) {
    console.error('[Catálogo] No se pudieron cargar los productos:', error);
    return {
      data: [],
      total: 0,
      hasMoreResults: false,
      priceBounds: FALLBACK_PRICE_BOUNDS,
    };
  }
}

async function getCategories(): Promise<CategoryOption[]> {
  const baseUrl = process.env.BACKEND_URL ?? 'http://localhost:8000';

  try {
    const response = await fetch(`${baseUrl}/api/v1/products/categories/`, {
      next: { revalidate: 300, tags: ['categories'] },
    });

    if (!response.ok) {
      return [];
    }

    const json = await response.json();
    const categories = Array.isArray(json?.data) ? json.data : [];

    return categories.map((category: { slug: string; label: string }) => ({
      slug: category.slug,
      label: category.label,
    }));
  } catch {
    return [];
  }
}

function mapProductsToView(products: Product[]): MappedProduct[] {
  return products.map(product => {
    const primaryVariant = product.variants?.[0];

    return {
      id: primaryVariant?.id ?? product.id,
      name: product.name,
      slug: primaryVariant?.slug || product.slug || '',
      category: product.category,
      sellingPrice: primaryVariant?.selling_price ?? 0,
      taxRate: primaryVariant?.tax_rate ?? 0,
      thumbnail: primaryVariant?.thumbnail || product.thumbnail || '',
    };
  });
}

function Pagination({
  currentPage,
  hasMoreResults,
  searchQuery,
  filters,
}: {
  currentPage: number;
  hasMoreResults: boolean;
  searchQuery: string;
  filters: ProductFilters;
}) {
  const buildHref = (page: number) => {
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }

    if (filters.categories.length > 0) {
      params.set('category', filters.categories.join(','));
    }

    if (typeof filters.priceMin === 'number') {
      params.set('priceMin', String(filters.priceMin));
    }

    if (typeof filters.priceMax === 'number') {
      params.set('priceMax', String(filters.priceMax));
    }

    params.set('page', String(page));
    return `/catalog?${params.toString()}`;
  };

  const baseClasses =
    'border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-semibold text-[#43474f] transition-colors hover:bg-[#f7f9fb]';

  return (
    <nav
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
      aria-label="Paginación del catálogo"
    >
      {currentPage > 1 && (
        <Link href={buildHref(currentPage - 1)} className={baseClasses}>
          Anterior
        </Link>
      )}

      <span className="px-3 py-2 text-sm font-semibold text-[#43474f]">Página {currentPage}</span>

      {hasMoreResults && (
        <Link href={buildHref(currentPage + 1)} className={baseClasses}>
          Siguiente
        </Link>
      )}
    </nav>
  );
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: string;
    category?: string;
    priceMin?: string;
    priceMax?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams.search ?? '';
  const currentPage = Math.max(1, Number.parseInt(resolvedSearchParams.page ?? '1', 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const selectedCategories = (resolvedSearchParams.category ?? '')
    .split(',')
    .map(slug => slug.trim())
    .filter(Boolean);

  const parsedPriceMin = Number.parseFloat(resolvedSearchParams.priceMin ?? '');
  const parsedPriceMax = Number.parseFloat(resolvedSearchParams.priceMax ?? '');

  const filters: ProductFilters = {
    categories: selectedCategories,
    priceMin: Number.isFinite(parsedPriceMin) ? parsedPriceMin : undefined,
    priceMax: Number.isFinite(parsedPriceMax) ? parsedPriceMax : undefined,
  };

  const [{ data: products, total, hasMoreResults, priceBounds }, categories] = await Promise.all([
    getProducts(searchQuery, offset, filters),
    getCategories(),
  ]);
  const mappedProducts = mapProductsToView(products);

  return (
    <main className="min-h-screen bg-[#f7f9fb]">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="rounded-none border border-[#e2e8f0] bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#747781]">
            Catálogo del Económato
          </p>
          <h1 className="font-serif text-3xl font-bold tracking-[-0.02em] text-[#002d62] sm:text-4xl">
            Explora todo nuestro inventario
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#43474f] sm:text-base">
            Busca productos por nombre y navega por todas las opciones disponibles con una
            experiencia sencilla y rápida.
          </p>

          <form action="/catalog" method="get" className="mt-6 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="catalog-search" className="sr-only">
              Buscar productos
            </label>
            <div className="flex flex-1 items-center gap-3 rounded-none border border-[#e2e8f0] bg-[#f7f9fb] px-4 py-3">
              <SearchIcon className="size-5 text-[#747781]" />
              <input
                id="catalog-search"
                name="search"
                defaultValue={searchQuery}
                type="search"
                placeholder="Busca por nombre de producto"
                className="w-full border-none bg-transparent text-sm text-[#191c1e] outline-none placeholder:text-[#747781]"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-none bg-[#002d62] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#115cb9]"
            >
              Buscar
            </button>

            {selectedCategories.length > 0 && (
              <input type="hidden" name="category" value={selectedCategories.join(',')} />
            )}
            {typeof filters.priceMin === 'number' && (
              <input type="hidden" name="priceMin" value={filters.priceMin} />
            )}
            {typeof filters.priceMax === 'number' && (
              <input type="hidden" name="priceMax" value={filters.priceMax} />
            )}
          </form>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row">
          <CatalogFilters
            categories={categories}
            selectedCategories={selectedCategories}
            priceBounds={priceBounds}
            priceMin={filters.priceMin ?? priceBounds.min}
            priceMax={filters.priceMax ?? priceBounds.max}
          />

          <div className="flex min-w-0 flex-1 flex-col gap-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#43474f]">
                {total > 0
                  ? `${total} producto${total === 1 ? '' : 's'} disponibles`
                  : 'No hay productos para mostrar'}
              </p>
              {searchQuery ? (
                <p className="text-sm font-medium text-[#002d62]">
                  Mostrando resultados para “{searchQuery}”
                </p>
              ) : null}
            </div>

            {mappedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-none border border-[#e2e8f0] bg-white px-6 py-20 text-center shadow-sm">
                <PackageSearch className="mb-4 size-12 text-[#c4c6d1]" strokeWidth={1.5} />
                <h2 className="font-serif text-2xl font-semibold text-[#002d62]">
                  {currentPage > 1
                    ? 'No hay más productos en esta página'
                    : 'No encontramos productos'}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#43474f]">
                  {currentPage > 1 ? (
                    <>
                      Regresa al catálogo principal para ver más productos.{' '}
                      <Link
                        href="/catalog"
                        className="font-semibold text-[#002d62] underline-offset-2 hover:underline"
                      >
                        Click aquí
                      </Link>
                    </>
                  ) : (
                    'Prueba con otro término de búsqueda o ajusta los filtros para ver nuevas incorporaciones al catálogo.'
                  )}
                </p>
              </div>
            ) : (
              <>
                <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                  {mappedProducts.map(product => (
                    <ProductCard
                      key={`${product.id}-${product.slug}`}
                      id={product.id}
                      name={product.name}
                      selling_price={product.sellingPrice}
                      tax_rate={product.taxRate}
                      categoryName={product.category}
                      image={product.thumbnail}
                      slug={product.slug}
                      actionLabel="Ver producto"
                    />
                  ))}
                </section>

                <Pagination
                  currentPage={currentPage}
                  hasMoreResults={hasMoreResults}
                  searchQuery={searchQuery}
                  filters={filters}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
