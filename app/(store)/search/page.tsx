import { Suspense } from 'react';
import { SearchContent } from './SearchContent';

type ApiVariant = {
  id?: number;
  name: string;
  description: string;
  variantnumber: number;
  thumbnail: string | null;
  selling_price: number;
  tax_rate: number;
  sku: string;
  slug: string;
  image_hero: string | null;
  image_thumbnail: string | null;
  image_gallery: string | null;
  image_lifestyle: string | null;
};

type ApiProduct = {
  id: number;
  name: string;
  category: string;
  product_type: string;
  thumbnail: string | null;
  slug: string;
  type: string;
  variants: ApiVariant[];
};

async function searchProducts(query: string): Promise<ApiProduct[]> {
  if (!query) {
    return [];
  }

  const response = await fetch(
    `${process.env.BACKEND_URL}/api/v1/products/?search=${encodeURIComponent(query)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 5 },
    }
  );

  if (!response.ok) {
    throw new Error(`Search failed: HTTP ${response.status}`);
  }

  const json = await response.json();
  return json.data || [];
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams;

  const products = await searchProducts(q);

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f7f9fb] px-4 py-12 md:px-16">
          <div className="mx-auto max-w-7xl border border-[#e2e8f0] bg-white px-6 py-5">
            <p className="text-sm text-[#43474f]">Cargando búsqueda…</p>
          </div>
        </main>
      }
    >
      <SearchContent query={q} products={products} />
    </Suspense>
  );
}
