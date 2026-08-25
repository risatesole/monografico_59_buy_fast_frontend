import Link from 'next/link';
import { getCategories } from '@/lib/categories';

export default async function CategoryStrip() {
  const categories = await getCategories();

  if (categories.length === 0) return null;

  return (
    <nav
      aria-label="Categorías principales"
      className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 border-b border-[#e2e8f0] px-4 py-4 sm:px-6 lg:px-8"
    >
      {categories.map(category => (
        <Link
          key={category.slug}
          href={`/categories/${category.slug}`}
          prefetch={false}
          className="text-sm font-medium text-[#115cb9] transition-colors hover:text-[#002d62] hover:underline"
        >
          {category.label}
        </Link>
      ))}
    </nav>
  );
}
