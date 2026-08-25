'use client';

import { memo, useCallback, MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPriceWithTax } from '@/lib/tax';

export interface ProductCardProps {
  id: string | number;
  name: string;
  selling_price: number;
  tax_rate?: number;
  categoryName: string;
  image?: string | null;
  slug: string;
  actionLabel?: string;
  actionHref?: string;
  onAdd?: (productId: string | number, quantity: number) => void;
}

// Instancia global fuera del ciclo de renderizado para evitar regeneración
const DOP_FORMATTER = new Intl.NumberFormat('es-DO', {
  style: 'currency',
  currency: 'DOP',
});

export const ProductCard = memo(function ProductCard({
  id,
  name,
  selling_price,
  tax_rate = 0,
  categoryName,
  image,
  slug,
  actionLabel = 'Añadir al carrito',
  actionHref,
  onAdd,
}: ProductCardProps) {
  // Callback memoizado con manejo explícito del evento sintético
  const handleAddToCart = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation(); // Previene burbujeo si la tarjeta se anida en contenedores interactivos
      onAdd?.(id, 1);
    },
    [id, onAdd]
  );

  const productHref = slug ? `/${slug}` : '#';
  const finalActionHref = actionHref || productHref;

  return (
    <article className="group relative flex h-full flex-col justify-between border border-[#e2e8f0] bg-white transition-shadow duration-200 hover:shadow-md">
      {/* Zona de navegación principal aislada estructuralmente del Call to Action */}
      <Link
        href={productHref}
        prefetch={false}
        className="flex flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002d62]"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f7f9fb]">
          {image ? (
            <Image
              src={image}
              alt={`Fotografía de ${name}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-medium text-[#747781]">
              Sin imagen disponible
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-3">
          <span className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-[#747781]">
            {categoryName}
          </span>

          <h3 className="mb-1 line-clamp-2 font-serif text-sm font-semibold leading-tight text-[#002d62]">
            {name}
          </h3>

          <div className="mt-auto pt-1">
            <span className="font-serif text-base font-bold text-[#191c1e]">
              {DOP_FORMATTER.format(getPriceWithTax(selling_price, tax_rate))}
            </span>
          </div>
        </div>
      </Link>

      {/* Contenedor de acciones independiente */}
      <div className="p-3 pt-0">
        {actionHref ? (
          <Link
            href={finalActionHref}
            prefetch={false}
            className="inline-flex w-full items-center justify-center bg-[#002d62] px-3 py-2 text-xs font-semibold uppercase tracking-[0.05em] text-white transition-colors duration-200 hover:bg-[#115cb9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#115cb9] active:scale-[0.98]"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`Añadir ${name} al carrito`}
            className="w-full bg-[#002d62] px-3 py-2 text-xs font-semibold uppercase tracking-[0.05em] text-white transition-colors duration-200 hover:bg-[#115cb9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#115cb9] active:scale-[0.98]"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </article>
  );
});

ProductCard.displayName = 'ProductCard';
