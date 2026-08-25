'use client';

import { useMemo } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { addProductToCart } from '@/features/cart/service';

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

type SearchProduct = {
  id: number;
  variantId: number | null;
  name: string;
  selling_price: number;
  tax_rate: number;
  categoryName: string;
  image: string;
  slug: string;
};

function normalizeProduct(product: ApiProduct): SearchProduct {
  const firstVariant = product.variants?.[0];

  return {
    id: product.id,
    variantId: firstVariant?.id ?? firstVariant?.variantnumber ?? null,
    name: product.name,
    selling_price: firstVariant?.selling_price ?? 0,
    tax_rate: firstVariant?.tax_rate ?? 0,
    categoryName: product.category,
    image: firstVariant?.thumbnail || firstVariant?.image_thumbnail || product.thumbnail || '',
    slug: firstVariant?.slug || product.slug || '',
  };
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-24 text-center">
      <p className="font-serif text-2xl font-semibold text-[#002d62]">
        No encontramos resultados para &quot;{query}&quot;
      </p>

      <p className="max-w-md text-sm leading-6 text-[#43474f]">
        Intenta con otro término de búsqueda o explora el catálogo del Economato.
      </p>
    </div>
  );
}

interface SearchContentProps {
  query: string;
  products: ApiProduct[];
}

export function SearchContent({ query, products }: SearchContentProps) {
  async function handleAddToCart(variantId: string | number, quantity: number) {
    try {
      await addProductToCart(variantId, quantity);
    } catch (err) {
      console.error('Failed to add product to cart:', err);
    }
  }

  const normalizedProducts = useMemo(() => products.map(normalizeProduct), [products]);

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-16 md:py-16">
        <header className="mb-12 border-b border-[#e2e8f0] pb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#747781]">
            Resultados de búsqueda
          </p>

          <h1 className="font-serif text-3xl font-bold tracking-[-0.02em] text-[#002d62] md:text-4xl">
            &quot;{query}&quot;
          </h1>
        </header>

        {normalizedProducts.length === 0 && query ? (
          <EmptyState query={query} />
        ) : (
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {normalizedProducts.map(product => {
              if (!product.variantId) {
                console.warn('Producto sin variante válida:', product);
                return null;
              }

              return (
                <ProductCard
                  key={`${product.id}-${product.variantId}`}
                  id={product.variantId}
                  name={product.name}
                  selling_price={product.selling_price}
                  tax_rate={product.tax_rate}
                  categoryName={product.categoryName}
                  image={product.image}
                  slug={product.slug}
                  onAdd={handleAddToCart}
                />
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
