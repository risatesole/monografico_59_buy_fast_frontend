// app/(store)/categories/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getCategories, type Category } from '@/lib/categories';

// ─── Componente Principal (Server Component) ───────────────────

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Institucional */}
      <header className="mb-10 border-b border-[#e2e8f0] pb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#747781]">
          Comprar por
        </p>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-[#002d62] md:text-4xl">
          Categorías
        </h1>
      </header>

      {/* Renderizado Condicional */}
      {categories.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center border border-[#e2e8f0] bg-[#f7f9fb]">
          <p className="text-sm font-medium text-[#747781]">
            No hay categorías disponibles en este momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map(cat => (
            <CategoryCard key={cat.slug} category={cat} />
          ))}
        </div>
      )}
    </main>
  );
}

// ─── Sub-componentes ───────────────────────────────────────────

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex flex-col border border-[#e2e8f0] bg-[#ffffff] p-4 transition-colors duration-200 hover:border-[#115cb9]"
      aria-label={`Ver productos en la categoría ${category.label}`}
    >
      {/* Contenedor de Imagen */}
      <div className="relative mb-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-none bg-[#f7f9fb] transition-colors duration-200 group-hover:bg-[#f2f4f6]">
        <Image
          src={category.images.default}
          alt={category.label}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Metadatos */}
      <div className="flex flex-1 flex-col text-center sm:text-left">
        <h2 className="mb-2 font-serif text-lg font-semibold leading-tight text-[#191c1e] transition-colors group-hover:text-[#115cb9]">
          {category.label}
        </h2>

        {category.description && (
          <p className="line-clamp-2 text-sm text-[#43474f]">{category.description}</p>
        )}
      </div>
    </Link>
  );
}
