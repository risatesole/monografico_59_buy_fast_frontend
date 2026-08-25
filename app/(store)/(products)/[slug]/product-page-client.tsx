'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ImageGallery } from '@/components/ImageGallery';
import { getPriceWithTax, getTaxAmount } from '@/lib/tax';

export default function ProductPage({
  initialProduct,
  initialVariant,
}: {
  initialProduct: {
    id: number;
    name: string;
    category: string;
    slug: string;
    variants: {
      id: number;
      name: string;
      slug: string;
      description: string;
      selling_price: number;
      tax_rate: number;
      sku: string;
      variantnumber: number;
      images: { type: string; url: string }[];
    }[];
  };
  initialVariant: {
    id: number;
    name: string;
    slug: string;
    description: string;
    selling_price: number;
    tax_rate: number;
    sku: string;
    variantnumber: number;
    images: { type: string; url: string }[];
  };
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const priceWithTax = useMemo(
    () => getPriceWithTax(initialVariant.selling_price, initialVariant.tax_rate),
    [initialVariant.selling_price, initialVariant.tax_rate]
  );
  const taxAmount = useMemo(
    () => getTaxAmount(initialVariant.selling_price, initialVariant.tax_rate),
    [initialVariant.selling_price, initialVariant.tax_rate]
  );

  const imageUrls = useMemo(() => {
    const sourceImages = initialVariant.images?.length
      ? initialVariant.images
      : initialProduct.variants[0]?.images || [];

    return sourceImages
      .map((img: { type?: string; url?: string }) => img.url)
      .filter(Boolean) as string[];
  }, [initialVariant.images, initialProduct.variants]);

  const handleAddToCart = useCallback(async () => {
    setIsPending(true);
    try {
      const response = await fetch('/api/v1/cart/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productvariantid: initialVariant.id,
          quantity: 1,
        }),
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    } catch (error) {
      console.error('[Cart Mutation Error]:', error);
    } finally {
      setIsPending(false);
    }
  }, [initialVariant.id]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        <section className="w-full">
          <ImageGallery images={imageUrls} />
        </section>

        <section className="flex flex-col">
          <p className="mb-4 text-xs font-semibold tracking-widest text-gray-500 uppercase">
            {initialProduct.category}
          </p>

          <h1 className="mb-2 font-serif text-3xl font-medium text-gray-900 md:text-4xl">
            {initialProduct.name}
          </h1>

          <p className="mb-6 text-sm text-gray-500">{initialVariant.name}</p>

          <div className="mb-8 flex flex-col gap-1">
            <p className="text-2xl font-bold text-gray-900">${priceWithTax.toFixed(2)}</p>
            <p className="text-xs text-gray-500">
              Incluye impuesto ({(initialVariant.tax_rate * 100).toFixed(0)}%): $
              {taxAmount.toFixed(2)}
            </p>
          </div>

          <p className="mb-8 text-base leading-relaxed text-gray-600">
            {initialVariant.description}
          </p>

          {initialProduct.variants && initialProduct.variants.length > 1 && (
            <div className="mb-8">
              <h3 className="mb-3 text-sm font-medium text-gray-900">Opciones disponibles:</h3>
              <div className="flex flex-wrap gap-2">
                {initialProduct.variants.map(v => {
                  const isActive = initialVariant.slug === v.slug;
                  return (
                    <button
                      key={v.slug}
                      onClick={() => router.push(`/${v.slug}`)}
                      className={`
                        inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-xs font-medium transition-colors duration-200
                        ${
                          isActive
                            ? 'border-2 border-gray-900 bg-gray-50 text-gray-900'
                            : 'border border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                        }
                      `}
                    >
                      {v.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={isPending}
            aria-disabled={isPending}
            className={`
              w-full rounded-md px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200
              ${
                isPending
                  ? 'cursor-not-allowed bg-gray-400 opacity-70'
                  : 'bg-[#002d62] hover:bg-[#115cb9] active:scale-[0.98]'
              }
            `}
          >
            {isPending ? 'Añadiendo...' : 'Añadir al carrito'}
          </button>

          <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-gray-200 pt-8">
            <div>
              <dt className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                SKU
              </dt>
              <dd className="text-sm font-medium text-gray-900">{initialVariant.sku}</dd>
            </div>
            <div>
              <dt className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Variante #
              </dt>
              <dd className="text-sm font-medium text-gray-900">{initialVariant.variantnumber}</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}
