import { ProductCard } from '@/components/ProductCard';

export default function ProductList({
  products,
}: {
  products: {
    id: string | number;
    name: string;
    thumbnail: string;
    slug: string;
    selling_price: number;
    tax_rate?: number;
    categoryName: string;
  }[];
}) {
  if (!products?.length) return null;

  return (
    <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {products.map(product => (
        <ProductCard
          key={`product-${product.id}`}
          id={product.id}
          slug={product.slug}
          name={product.name}
          selling_price={product.selling_price}
          tax_rate={product.tax_rate}
          categoryName={product.categoryName}
          image={product.thumbnail}
          actionLabel="VER PRODUCTO"
          actionHref={`/${product.slug}`}
        />
      ))}
    </div>
  );
}
