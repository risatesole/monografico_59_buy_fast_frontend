// lib/products.ts

export type ImageContent = {
  type: string;
  url: string;
};

export type ProductVariant = {
  id: number;
  name: string;
  description: string;
  variantnumber: number;
  thumbnail: string;
  selling_price: number;
  tax_rate: number;
  sku: string;
  slug: string;
  images: ImageContent[];
  status: boolean; // whether this specific variant is active/in stock
};

export type Product = {
  id: number;
  name: string;
  category: string;
  product_type: string;
  thumbnail: string;
  slug: string;
  type: string;
  variants: ProductVariant[];
};

export type ProductsApiResponse = {
  data: Product[];
  meta: { timestamp: string };
};

// A product is "disponible" only if every one of its variants is active.
export function isProductAvailable(product: Product): boolean {
  return product.variants.every(variant => variant.status === true);
}

// Price shown in the table is always the first variant's total price
// (selling price plus its tax amount), matching what the storefront charges.
export function getDisplayPrice(product: Product): number {
  const variant = product.variants[0];
  if (!variant) return 0;
  return variant.selling_price * (1 + variant.tax_rate);
}

type FetchProductsParams = {
  search?: string;
  limit: number;
  offset: number;
};

// Talks directly to the backend. Safe to call from server components / route
// handlers only — never from the browser (that's what /api/v1/products is for).
export async function fetchProductsFromBackend({
  search,
  limit,
  offset,
}: FetchProductsParams): Promise<Product[]> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    throw new Error('BACKEND_URL is not set');
  }

  const url = new URL(`${backendUrl}/api/v1/products/`);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));
  if (search) url.searchParams.set('search', search);

  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Backend responded with ${response.status}`);
  }

  const json: ProductsApiResponse = await response.json();
  return json.data;
}
