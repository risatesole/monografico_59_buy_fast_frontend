import { notFound } from 'next/navigation';
import ProductPage from './product-page-client';

interface ApiImage {
  type: string;
  url: string;
}

interface ApiVariant {
  id: number;
  name: string;
  description: string;
  variantnumber: number;
  thumbnail: string;
  selling_price: number;
  tax_rate: number;
  sku: string;
  slug: string;
  images: ApiImage[];
}

interface ApiProduct {
  id: number;
  name: string;
  category: string;
  product_type: string;
  thumbnail: string;
  slug: string;
  type: string;
  variants: ApiVariant[];
}

interface ApiResponse {
  data: ApiProduct[];
  meta?: {
    timestamp: string;
  };
}

function transformVariant(apiVariant: ApiVariant) {
  return {
    ...apiVariant,
    thumbnail: apiVariant.thumbnail || '',
    created_at: new Date(),
    updated_at: new Date(),
  };
}

function transformProduct(apiProduct: ApiProduct) {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    category: apiProduct.category?.toLowerCase() || 'other',
    thumbnail: apiProduct.thumbnail,
    slug: apiProduct.slug,
    tags: [],
    variants: apiProduct.variants.map(transformVariant),
    product_type: 'normal',
  };
}

async function fetchProductByVariantSlug(slug: string) {
  const response = await fetch(`${process.env.BACKEND_URL}/api/v1/products/?variantslug=${slug}`, {
    next: { revalidate: 3600, tags: ['product-detail', slug] },
  });

  if (!response.ok) {
    throw new Error(`Error en la respuesta de la API: ${response.statusText}`);
  }

  const json = (await response.json()) as ApiResponse;
  return json.data?.[0] || null;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let product;
  let variant;

  try {
    const apiProduct = await fetchProductByVariantSlug(slug);

    if (!apiProduct) {
      notFound();
    }

    product = transformProduct(apiProduct);
    variant = product.variants.find(v => v.slug === slug);

    if (!variant) {
      notFound();
    }
  } catch (error) {
    console.error(`[Product Detail Error]: Fallo al cargar el slug ${slug}`, error);

    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center bg-[#f7f9fb] px-4">
        <p className="rounded-none border border-[#ffdad6] bg-[#ffffff] p-6 text-sm font-medium text-[#ba1a1a] shadow-sm">
          No se pudo cargar la información del producto. Por favor, intente nuevamente más tarde.
        </p>
      </div>
    );
  }

  return <ProductPage initialProduct={product} initialVariant={variant} />;
}
