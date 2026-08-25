'use client';

import { useCallback, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Slider } from '@/components/ui/slider';

export interface CategoryOption {
  slug: string;
  label: string;
}

interface CatalogFiltersProps {
  categories: CategoryOption[];
  selectedCategories: string[];
  priceBounds: { min: number; max: number };
  priceMin: number;
  priceMax: number;
}

const DOP_FORMATTER = new Intl.NumberFormat('es-DO', {
  style: 'currency',
  currency: 'DOP',
  maximumFractionDigits: 0,
});

export function CatalogFilters({
  categories,
  selectedCategories,
  priceBounds,
  priceMin,
  priceMax,
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [sliderValue, setSliderValue] = useState<number[]>([priceMin, priceMax]);

  const updateParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.set('page', '1');
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const toggleCategory = (slug: string) => {
    const isSelected = selectedCategories.includes(slug);
    const next = isSelected
      ? selectedCategories.filter(s => s !== slug)
      : [...selectedCategories, slug];

    updateParams(params => {
      if (next.length > 0) {
        params.set('category', next.join(','));
      } else {
        params.delete('category');
      }
    });
  };

  const commitPriceRange = (nextValue: number[]) => {
    const [min, max] = nextValue;

    updateParams(params => {
      if (min <= priceBounds.min) {
        params.delete('priceMin');
      } else {
        params.set('priceMin', String(Math.round(min)));
      }

      if (max >= priceBounds.max) {
        params.delete('priceMax');
      } else {
        params.set('priceMax', String(Math.round(max)));
      }
    });
  };

  const hasActiveFilters =
    selectedCategories.length > 0 || priceMin > priceBounds.min || priceMax < priceBounds.max;

  const clearFilters = () => {
    setSliderValue([priceBounds.min, priceBounds.max]);
    updateParams(params => {
      params.delete('category');
      params.delete('priceMin');
      params.delete('priceMax');
    });
  };

  return (
    <aside className="w-full shrink-0 self-start border border-[#e2e8f0] bg-white p-6 shadow-sm lg:w-72">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold text-[#002d62]">Filtros</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-[#747781] underline-offset-2 hover:text-[#002d62] hover:underline"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#747781]">
          Rango de precio
        </h3>

        <div className="mt-5 px-1">
          <Slider
            min={priceBounds.min}
            max={priceBounds.max}
            step={1}
            value={sliderValue}
            onValueChange={value => setSliderValue(value)}
            onValueCommit={value => commitPriceRange(value)}
            disabled={priceBounds.min >= priceBounds.max}
            className="[&_[data-slot=slider-range]]:bg-[#002d62] [&_[data-slot=slider-thumb]]:border-[#002d62] [&_[data-slot=slider-thumb]]:focus-visible:ring-[#002d62]/30 [&_[data-slot=slider-track]]:bg-[#e2e8f0]"
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-sm font-medium text-[#43474f]">
          <span>{DOP_FORMATTER.format(sliderValue[0] ?? priceBounds.min)}</span>
          <span>{DOP_FORMATTER.format(sliderValue[1] ?? priceBounds.max)}</span>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#747781]">
            Categorías
          </h3>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map(category => {
              const isActive = selectedCategories.includes(category.slug);

              return (
                <button
                  key={category.slug}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => toggleCategory(category.slug)}
                  className={`border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.05em] transition-colors ${
                    isActive
                      ? 'border-[#002d62] bg-[#002d62] text-white'
                      : 'border-[#e2e8f0] bg-white text-[#43474f] hover:border-[#002d62] hover:text-[#002d62]'
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
