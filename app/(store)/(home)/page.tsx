import Link from 'next/link';
import Carousel from './ProductCarousel';
import CategoryStrip from './CategoryStrip';
import ProductList from './productList';

const IMAGE_PRIORITIES: { [key: string]: number } = {
  THUMBNAIL: 100,
  HERO: 90,
  DETAIL: 80,
  GALLERY: 70,
  LIFESTYLE: 60,
  PACKAGING: 50,
  COLOR: 40,
  SIZE: 30,
  OTHER: 20,
};

async function getCarouselSlides() {
  const baseUrl = process.env.BACKEND_URL;

  if (!baseUrl) {
    console.error('[Config Error] process.env.BACKEND_URL no está definida.');
    return [];
  }

  try {
    const url = new URL('/api/v1/ui/carrousel', baseUrl).toString();
    const response = await fetch(url, {
      next: { revalidate: 30 }, // Revalidate every 30 seconds
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.error(`[API Error] Failed to fetch carousel: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[Network Error] Fallo en la conexión DRF para carousel:', error);
    return [];
  }
}

async function getProducts() {
  const baseUrl = process.env.BACKEND_URL;

  if (!baseUrl) {
    console.error('[Config Error] process.env.BACKEND_URL no está definida.');
    return [];
  }

  try {
    const url = new URL('/api/v1/products/?ordering=-created_at&limit=6', baseUrl).toString();
    const response = await fetch(url, {
      next: { revalidate: 0 },
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    });

    if (!response.ok) return [];

    const json = await response.json();
    return json.data || json.results || [];
  } catch (error) {
    console.error('[Network Error] Fallo en la conexión DRF:', error);
    return [];
  }
}

function toAbsoluteUrl(rawUrl: string, baseUrl: string) {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('/')) {
    return `${baseUrl.replace(/\/$/, '')}${rawUrl}`;
  }
  return rawUrl;
}

function extractBestImageUrl(
  entity:
    | {
        images?: {
          image_type?: string;
          type?: string;
          image?: string;
          original?: string;
          url?: string;
          src?: string;
        }[];
        image?: string;
        thumbnail?: string;
        image_thumbnail?: string;
        url?: string;
        name?: string;
        slug?: string;
        selling_price?: number;
      }
    | string
    | null,
  baseUrl: string
) {
  if (!entity) return '';

  let rawUrl = '';

  // Handle arrays of images (Product.images)
  if (
    typeof entity === 'object' &&
    entity !== null &&
    Array.isArray(entity.images) &&
    entity.images.length > 0
  ) {
    const sortedImages = [...entity.images].sort((a, b) => {
      const typeA = String(a?.image_type || a?.type || '').toUpperCase();
      const typeB = String(b?.image_type || b?.type || '').toUpperCase();

      const weightA = IMAGE_PRIORITIES[typeA] || 0;
      const weightB = IMAGE_PRIORITIES[typeB] || 0;

      return weightB - weightA;
    });

    const target = sortedImages[0];
    rawUrl =
      typeof target === 'string'
        ? target
        : target?.image || target?.original || target?.url || target?.src || '';
  }
  // Handle flat objects (thumbnails, direct URLs)
  else if (typeof entity === 'object' && entity !== null) {
    rawUrl = entity.image || entity.thumbnail || entity.image_thumbnail || entity.url || '';
  }
  // Handle direct strings
  else if (typeof entity === 'string') {
    rawUrl = entity;
  }

  if (!rawUrl || typeof rawUrl !== 'string') return '';

  return toAbsoluteUrl(rawUrl, baseUrl);
}

export default async function Page() {
  // Fetch both carousel slides and products in parallel
  const [carouselSlides, products] = await Promise.all([getCarouselSlides(), getProducts()]);

  const baseUrl = process.env.BACKEND_URL || '';

  const mappedProducts = products.map(
    (product: {
      id: string | number;
      name: string;
      category: string | { name: string };
      slug: string;
      thumbnail?: string;
      variants: {
        name: string;
        slug: string;
        selling_price: number;
        tax_rate?: number;
        thumbnail?: string;
        image_thumbnail?: string;
      }[];
    }) => {
      const firstVariant = product.variants?.[0];
      // Misma prioridad que catalog/search/categories: el campo "thumbnail" plano
      // gana sobre el ordenamiento por tipo de imagen, para que la imagen coincida
      // con la que se ve en el resto del sitio.
      const directThumbnail =
        firstVariant?.thumbnail || firstVariant?.image_thumbnail || product.thumbnail || '';
      const variantImage = directThumbnail
        ? toAbsoluteUrl(directThumbnail, baseUrl)
        : extractBestImageUrl(firstVariant, baseUrl) || extractBestImageUrl(product, baseUrl);

      return {
        id: product.id,
        name: product.name || firstVariant?.name,
        slug: firstVariant?.slug || product.slug || '',
        categoryName:
          typeof product.category === 'string'
            ? product.category
            : product.category?.name || 'Sin categoría',
        selling_price: firstVariant?.selling_price ?? 0,
        tax_rate: firstVariant?.tax_rate ?? 0,
        image: variantImage,
        thumbnail: variantImage,
      };
    }
  );

  const latestProducts = mappedProducts.slice(0, 6);

  return (
    <main className="min-h-screen bg-white">
      <Carousel slides={carouselSlides} />

      <CategoryStrip />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-center justify-center">
          <div className="h-px w-full bg-[#e2e8f0]" aria-hidden="true" />
          <h2 className="shrink-0 px-6 font-serif text-2xl font-bold uppercase tracking-widest text-[#002d62]">
            NUEVOS PRODUCTOS
          </h2>
          <div className="h-px w-full bg-[#e2e8f0]" aria-hidden="true" />
        </div>

        {latestProducts.length > 0 ? (
          <>
            <ProductList products={latestProducts} />
            <div className="mt-14 flex justify-center">
              <Link
                href="/categories"
                prefetch={false}
                className="inline-flex items-center justify-center rounded-xl bg-[#002d62] px-8 py-3.5 text-sm font-bold tracking-wide text-white shadow-sm transition-all duration-200 hover:bg-[#115cb9] hover:shadow-md active:scale-95"
              >
                VER TODAS LAS CATEGORÍAS
                <svg
                  className="ml-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </>
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-xl border border-dashed border-[#e2e8f0] bg-[#f7f9fb]">
            <p className="font-medium text-[#747781]">Productos no disponible temporalmente.</p>
          </div>
        )}
      </section>

      <p className="mx-auto max-w-7xl border-t border-[#e2e8f0] px-4 py-6 text-center text-xs text-[#747781] sm:px-6 lg:px-8">
        Aviso: UASD BuyFast es un prototipo funcional desarrollado con fines de demostración (MVP) y
        no constituye una tienda en línea real operada oficialmente por el Ecónomato Universitario
        de la UASD.
      </p>
    </main>
  );
}
