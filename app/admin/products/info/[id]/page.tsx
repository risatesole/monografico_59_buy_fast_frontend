'use client';

import { useState, useEffect, use } from 'react';
// import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Edit,
  Info,
  Package,
  DollarSign,
  Grid,
  Box,
  CheckCircle,
  XCircle,
  AlertCircle,
  LucideIcon,
  ShoppingCart,
} from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('es-DO', {
  style: 'currency',
  currency: 'DOP',
});

function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  active: {
    label: 'Activo',
    color: 'text-[#137333] bg-[#e6f4ea] border-[#ceead6]',
    icon: CheckCircle,
  },
  inactive: {
    label: 'Inactivo',
    color: 'text-[#747781] bg-[#f2f4f6] border-[#e0e3e5]',
    icon: XCircle,
  },
  draft: {
    label: 'Borrador',
    color: 'text-[#b76e00] bg-[#fff4e5] border-[#ffe4b5]',
    icon: AlertCircle,
  },
};

// Define types locally
type Variant = {
  id: number;
  name: string;
  description: string | null;
  thumbnail: string | null;
  variantnumber: number;
  sku: string;
  slug: string;
  selling_price: number;
  tax_rate: number;
  image_hero: string | null;
  image_thumbnail: string | null;
  image_gallery: string | null;
  status: boolean;
  images: string[];
  created_at: string;
  updated_at: string;
};

type Product = {
  id: number;
  name: string;
  category: string;
  product_type: string;
  thumbnail: string;
  slug: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  variants: Variant[];
  status?: string;
};

type InventoryData = {
  variant_id: number;
  product_id: number;
  product_name: string;
  thumbnail: string | null;
  quantity: number;
  inventory_status: string;
  images: string[];
  sku: string;
  variantnumber: number;
  status: boolean;
  selling_price: string;
};

type VariantWithStock = Variant & {
  stock: number | null;
  inventoryStatus: string | null;
};

function isProductAvailable(product: Product): boolean {
  return product.variants.some(variant => variant.status !== false);
}

function getDisplayPrice(product: Product): number {
  const mainVariant = product.variants[0];
  return mainVariant?.selling_price || 0;
}

function getStockStatusClass(stock: number | null): string {
  if (stock === null) return 'text-[#747781]';
  if (stock <= 0) return 'text-[#ba1a1a]';
  if (stock <= 5) return 'text-[#b76e00]';
  return 'text-[#137333]';
}

function getStockStatusLabel(stock: number | null): string {
  if (stock === null) return 'Sin inventario';
  if (stock <= 0) return 'Agotado';
  if (stock <= 5) return 'Bajo stock';
  return 'En stock';
}

type ProductInfoPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function ProductInfoPage({ params }: ProductInfoPageProps) {
  // Unwrap the params Promise using React.use()
  const { id } = use(params);
  //   const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [variantsWithStock, setVariantsWithStock] = useState<VariantWithStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockErrors, setStockErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchProductAndStock = async () => {
      try {
        // Fetch product details
        const productResponse = await fetch(`/api/v1/products/${id}`);
        if (!productResponse.ok) {
          throw new Error('Producto no encontrado');
        }
        const productData = await productResponse.json();
        setProduct(productData);

        // Fetch stock for each variant using the new API route
        const stockPromises = productData.variants.map(async (variant: Variant) => {
          try {
            const stockResponse = await fetch(`/api/admin/inventory/products/${variant.id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include', // This ensures cookies are sent
            });

            if (!stockResponse.ok) {
              const errorData = await stockResponse.json().catch(() => ({}));
              throw new Error(errorData.error || `Failed to fetch stock for variant ${variant.id}`);
            }

            const stockData: InventoryData = await stockResponse.json();
            return {
              ...variant,
              stock: stockData.quantity,
              inventoryStatus: stockData.inventory_status,
            };
          } catch (stockError) {
            const errorMessage = stockError instanceof Error ? stockError.message : 'Unknown error';
            console.error(`Error fetching stock for variant ${variant.id}:`, errorMessage);
            setStockErrors(prev => ({
              ...prev,
              [variant.id]: errorMessage,
            }));
            return {
              ...variant,
              stock: null,
              inventoryStatus: null,
            };
          }
        });

        const stockResults = await Promise.all(stockPromises);
        setVariantsWithStock(stockResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el producto');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductAndStock();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-[#f7f9fb]">
        <div className="flex items-center px-8 py-6 bg-white border-b border-[#e0e3e5]">
          <div className="w-10 h-10 bg-[#f2f4f6] rounded-md animate-pulse" />
          <div className="ml-4">
            <div className="h-6 w-48 bg-[#f2f4f6] rounded animate-pulse" />
            <div className="h-4 w-32 bg-[#f2f4f6] rounded mt-1 animate-pulse" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex space-x-1.5">
            <div className="size-3 bg-[#c4c6d1] rounded-full animate-bounce" />
            <div className="size-3 bg-[#002d62] rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="size-3 bg-[#c4c6d1] rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col h-full bg-[#f7f9fb]">
        <div className="flex items-center px-8 py-6 bg-white border-b border-[#e0e3e5]">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-[#43474f] hover:text-[#002d62] transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span className="text-[13px] font-semibold">Volver al catálogo</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Package className="size-16 text-[#c4c6d1] mx-auto mb-4" />
            <p className="text-[16px] font-semibold text-[#191c1e]">
              {error || 'Producto no encontrado'}
            </p>
            <p className="text-[13px] text-[#747781] mt-1">
              El producto que buscas no existe o fue eliminado
            </p>
          </div>
        </div>
      </div>
    );
  }

  const mainVariant = product.variants[0];
  const price = getDisplayPrice(product);
  const isAvailable = isProductAvailable(product);
  const statusInfo = STATUS_LABELS[product.status || 'active'] || STATUS_LABELS.active;
  const StatusIcon = statusInfo.icon;

  // Calculate total stock
  const totalStock = variantsWithStock.reduce((sum, variant) => sum + (variant.stock || 0), 0);
  const variantsWithStockCount = variantsWithStock.filter(v => (v.stock || 0) > 0).length;
  const hasStockErrors = Object.keys(stockErrors).length > 0;

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb]">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-[#e0e3e5]">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-[#43474f] hover:text-[#002d62] transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span className="text-[13px] font-semibold">Volver</span>
          </Link>
          <div className="h-6 w-px bg-[#e0e3e5]" />
          <div>
            <h1 className="text-2xl font-sans font-bold text-[#00193c] tracking-tight">
              {product.name}
            </h1>
            <p className="text-[13px] font-sans text-[#747781] mt-0.5">
              ID: #{product.id} • SKU: {mainVariant?.sku || product.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/products/edit/${product.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#c4c6d1] rounded-md text-[13px] font-semibold text-[#43474f] hover:bg-[#f2f4f6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62]"
          >
            <Edit className="size-4" /> Editar Producto
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Error Alert for Stock Issues */}
          {hasStockErrors && (
            <div className="bg-[#ffdad6] border border-[#ffb4ab] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-[#93000a] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[13px] font-bold text-[#93000a]">
                    Problemas al cargar el inventario
                  </h4>
                  <p className="text-[12px] text-[#93000a] mt-1">
                    No se pudo obtener el stock para algunas variantes. Los datos pueden estar
                    incompletos.
                  </p>
                  <div className="mt-2 text-[11px] text-[#93000a]">
                    {Object.entries(stockErrors).map(([variantId, error]) => (
                      <div key={variantId} className="mt-1">
                        Variante #{variantId}: {error}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Overview Card */}
          <div className="bg-white rounded-lg border border-[#e0e3e5] overflow-hidden">
            <div className="p-6 border-b border-[#e0e3e5] bg-[#f8fafd]">
              <h2 className="text-[15px] font-bold text-[#191c1e]">Información General</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <Image
                    src={product.thumbnail}
                    alt={product.name}
                    width={120}
                    height={120}
                    className="rounded-lg object-cover border border-[#e0e3e5] bg-[#f2f4f6]"
                    unoptimized
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-[18px] font-bold text-[#191c1e]">{product.name}</h3>
                    <p className="text-[13px] text-[#747781] mt-1">
                      {mainVariant?.description || 'Sin descripción'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="text-[13px] font-medium text-[#43474f]">
                      Categoría: {product.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border ${statusInfo.color}`}
                    >
                      <StatusIcon className="size-3.5" />
                      <span className="text-[12px] font-bold uppercase tracking-wider">
                        {statusInfo.label}
                      </span>
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                        isAvailable
                          ? 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]'
                          : 'bg-[#ffdad6] text-[#93000a] border-[#ffb4ab]'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${isAvailable ? 'bg-[#1e8e3e]' : 'bg-[#ba1a1a]'}`}
                      />
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        {isAvailable ? 'Disponible' : 'Agotado'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pricing Card */}
            <div className="bg-white rounded-lg border border-[#e0e3e5] overflow-hidden">
              <div className="p-4 border-b border-[#e0e3e5] bg-[#f8fafd]">
                <h3 className="text-[13px] font-bold text-[#191c1e] flex items-center gap-2">
                  <DollarSign className="size-4" /> Precios
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#747781]">Precio actual</span>
                  <span className="text-[18px] font-bold text-[#00193c]">
                    {formatCurrency(price)}
                  </span>
                </div>
                {mainVariant?.selling_price && (
                  <div className="flex justify-between items-center pt-3 border-t border-[#e0e3e5]">
                    <span className="text-[13px] text-[#747781]">Precio de venta</span>
                    <span className="text-[14px] font-semibold text-[#191c1e]">
                      {formatCurrency(mainVariant.selling_price)}
                    </span>
                  </div>
                )}
                {mainVariant?.tax_rate !== undefined && mainVariant.tax_rate > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-[#747781]">Tasa de impuesto</span>
                    <span className="text-[13px] font-medium text-[#43474f]">
                      {mainVariant.tax_rate * 100}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Stock Card */}
            <div className="bg-white rounded-lg border border-[#e0e3e5] overflow-hidden">
              <div className="p-4 border-b border-[#e0e3e5] bg-[#f8fafd]">
                <h3 className="text-[13px] font-bold text-[#191c1e] flex items-center gap-2">
                  <ShoppingCart className="size-4" /> Inventario
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#747781]">Stock total</span>
                  <span className={`text-[18px] font-bold ${getStockStatusClass(totalStock)}`}>
                    {totalStock}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[#e0e3e5]">
                  <span className="text-[13px] text-[#747781]">Estado del inventario</span>
                  <span className={`text-[13px] font-semibold ${getStockStatusClass(totalStock)}`}>
                    {getStockStatusLabel(totalStock)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#747781]">Variantes con stock</span>
                  <span className="text-[13px] font-medium text-[#43474f]">
                    {variantsWithStockCount} / {variantsWithStock.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white rounded-lg border border-[#e0e3e5] overflow-hidden">
              <div className="p-4 border-b border-[#e0e3e5] bg-[#f8fafd]">
                <h3 className="text-[13px] font-bold text-[#191c1e] flex items-center gap-2">
                  <Box className="size-4" /> Estado del Producto
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#747781]">Tipo de producto</span>
                  <span className="text-[13px] font-medium text-[#43474f] capitalize">
                    {product.product_type || 'Normal'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[#e0e3e5]">
                  <span className="text-[13px] text-[#747781]">Variantes</span>
                  <span className="text-[13px] font-medium text-[#43474f]">
                    {product.variants.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#747781]">Tags</span>
                  <span className="text-[13px] font-medium text-[#43474f]">
                    {product.tags?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Variants Card with Stock */}
          {product.variants.length > 0 && (
            <div className="bg-white rounded-lg border border-[#e0e3e5] overflow-hidden">
              <div className="p-4 border-b border-[#e0e3e5] bg-[#f8fafd] flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-[#191c1e] flex items-center gap-2">
                  <Grid className="size-4" /> Variantes
                </h3>
                <span className="text-[11px] font-medium text-[#747781] bg-white px-2 py-1 rounded border border-[#e0e3e5]">
                  {product.variants.length} variante{product.variants.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#f8fafd] border-b border-[#e0e3e5]">
                    <tr>
                      <th className="px-4 py-3 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold text-[#747781] uppercase tracking-wider text-right">
                        Precio
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold text-[#747781] uppercase tracking-wider text-right">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold text-[#747781] uppercase tracking-wider text-right">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {variantsWithStock.map((variant, index) => {
                      const stockStatusClass = getStockStatusClass(variant.stock);
                      const stockStatusLabel = getStockStatusLabel(variant.stock);
                      const hasError = stockErrors[variant.id];

                      return (
                        <tr
                          key={variant.id || index}
                          className="border-b border-[#e0e3e5] last:border-0 hover:bg-[#f8fafd] transition-colors"
                        >
                          <td className="px-4 py-3 text-[13px] font-mono text-[#43474f]">
                            {variant.sku}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#191c1e]">
                            {variant.name || `Variante ${variant.variantnumber || index + 1}`}
                          </td>
                          <td className="px-4 py-3 text-[13px] font-semibold text-[#191c1e] text-right">
                            {variant.selling_price
                              ? formatCurrency(variant.selling_price)
                              : formatCurrency(price)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {hasError ? (
                              <span className="text-[11px] text-[#ba1a1a] font-medium">Error</span>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <span className={`text-[13px] font-semibold ${stockStatusClass}`}>
                                  {variant.stock !== null ? variant.stock : 'N/A'}
                                </span>
                                {variant.stock !== null && (
                                  <span className={`text-[10px] font-medium ${stockStatusClass}`}>
                                    ({stockStatusLabel})
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                                variant.status !== false
                                  ? 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]'
                                  : 'bg-[#ffdad6] text-[#93000a] border-[#ffb4ab]'
                              }`}
                            >
                              <span
                                className={`size-1.5 rounded-full ${variant.status !== false ? 'bg-[#1e8e3e]' : 'bg-[#ba1a1a]'}`}
                              />
                              <span className="text-[11px] font-bold">
                                {variant.status !== false ? 'Activo' : 'Inactivo'}
                              </span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Metadata Card */}
          <div className="bg-white rounded-lg border border-[#e0e3e5] overflow-hidden">
            <div className="p-4 border-b border-[#e0e3e5] bg-[#f8fafd]">
              <h3 className="text-[13px] font-bold text-[#191c1e] flex items-center gap-2">
                <Info className="size-4" /> Metadatos
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-3">
              <div>
                <span className="text-[12px] text-[#747781] block">ID del producto</span>
                <span className="text-[13px] font-mono text-[#191c1e] font-semibold">
                  #{product.id}
                </span>
              </div>
              <div>
                <span className="text-[12px] text-[#747781] block">Slug</span>
                <span className="text-[13px] font-mono text-[#43474f]">{product.slug}</span>
              </div>
              <div>
                <span className="text-[12px] text-[#747781] block">Fecha de creación</span>
                <span className="text-[13px] text-[#191c1e]">
                  {product.created_at
                    ? new Date(product.created_at).toLocaleDateString('es-DO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'No disponible'}
                </span>
              </div>
              <div>
                <span className="text-[12px] text-[#747781] block">Última actualización</span>
                <span className="text-[13px] text-[#191c1e]">
                  {product.updated_at
                    ? new Date(product.updated_at).toLocaleDateString('es-DO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'No disponible'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
