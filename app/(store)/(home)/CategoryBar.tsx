import Link from 'next/link';
import Image from 'next/image';

interface Category {
  label: string;
  description: string;
  priority: number;
  images: {
    banner: string;
    cart: string;
    default: string;
  };
}

async function getCategories(): Promise<Record<string, Category>> {
  try {
    const response = await fetch('http://localhost:8000/api/v1/products/categories', {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    return json.data || {};
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return {};
  }
}

export default async function CategoryBar() {
  const categories = await getCategories();

  // Filter only priority 3 categories
  const filteredCategories = Object.entries(categories).filter(
    ([, category]) => category.priority === 3
  );

  if (filteredCategories.length === 0) {
    return <div className="text-gray-500 p-4">No categories available</div>;
  }

  return (
    <div className="w-full px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-base font-semibold mb-4">Shop by Category</h2>

        {/* Desktop: 6 columns, Tablet: 3 columns, Mobile: 2 columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {filteredCategories.map(([key, category]) => (
            <Link
              key={key}
              href={`/shop?category=${key}`}
              className="group flex flex-col text-center"
            >
              {/* Image Container */}
              <div
                className="relative w-full bg-gray-100 border border-gray-200 rounded overflow-hidden mb-2 group-hover:bg-gray-200 transition-colors"
                style={{ aspectRatio: '1/1' }}
              >
                <Image
                  src={category.images.default}
                  alt={category.label}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 25vw, (max-width: 1024px) 33vw, 16vw"
                />
              </div>

              {/* Category Label */}
              <p className="text-xs uppercase tracking-wide text-gray-600 group-hover:text-blue-600 transition-colors">
                {category.label}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
