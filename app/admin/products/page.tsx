// app/admin/products/page.tsx
import ProductsClient from './productsClient';
import { fetchProductsFromBackend } from '@/lib/products';

const ITEMS_PER_PAGE = 10;

type ProductsPageProps = {
  searchParams: Promise<{ search?: string; page?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { search = '', page = '1' } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Server-to-server call, so there's no CORS issue going straight to the backend.
  const products = await fetchProductsFromBackend({
    search,
    limit: ITEMS_PER_PAGE,
    offset,
  });

  return (
    <ProductsClient
      initialProducts={products}
      initialSearch={search}
      initialPage={currentPage}
      itemsPerPage={ITEMS_PER_PAGE}
    />
  );
}
