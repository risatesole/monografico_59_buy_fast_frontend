'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Package,
  Calendar,
  Hash,
  Tag,
  DollarSign,
  FileText,
  ArrowUp,
  ArrowDown,
  Box,
  ShoppingBag,
  Minus,
  AlertTriangle,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ProductImage {
  url: string;
  type: string;
  alt_text: string;
  order: number;
}

interface ProductCategory {
  slug: string;
  label: string;
  description: string;
  priority: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  category: ProductCategory;
  product_type: string;
  product_type_label: string;
  thumbnail: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface ProductVariant {
  id: number;
  name: string;
  description: string;
  variant_number: number;
  slug: string;
  sku: string;
  status: boolean;
  selling_price: number;
  tax_rate: number;
  minimum_stock: number;
  product: Product;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

interface StockMovement {
  id: number;
  date_time: string;
  product_variant: ProductVariant;
  movement_type: string;
  movement_type_label: string;
  quantity: number;
  balance: number;
  document_reference: string;
}

// ============================================================================
// MOVEMENT TYPE UI CONFIGURATION
// ============================================================================

const MOVEMENT_TYPE_UI: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string; label: string }
> = {
  purchase_entry: {
    icon: <ArrowDown className="size-4" />,
    color: 'text-[#137333]',
    bg: 'bg-[#e6f4ea] border-[#ceead6]',
    label: 'Entrada por Compra',
  },
  customer_sell: {
    icon: <ArrowUp className="size-4" />,
    color: 'text-[#d93025]',
    bg: 'bg-[#fce8e6] border-[#f5c6c2]',
    label: 'Salida por Venta',
  },
  initial_inventory: {
    icon: <Package className="size-4" />,
    color: 'text-[#b06000]',
    bg: 'bg-[#fef7e0] border-[#feefc3]',
    label: 'Inventario Inicial',
  },
  manual_decrease: {
    icon: <Minus className="size-4" />,
    color: 'text-[#ba1a1a]',
    bg: 'bg-[#ffdad6] border-[#ffb4ab]',
    label: 'Salida Manual',
  },
};

// ============================================================================
// DATE FORMATTER
// ============================================================================

const dateFormatter = new Intl.DateTimeFormat('es-DO', {
  dateStyle: 'full',
  timeStyle: 'long',
});

function formatDate(value: string): string {
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return 'Fecha no disponible';
  }
}

// ============================================================================
// MAIN CLIENT COMPONENT
// ============================================================================

type StockMovementDetailsClientProps = {
  initialMovement: StockMovement;
};

export default function StockMovementDetailsClient({
  initialMovement,
}: StockMovementDetailsClientProps) {
  const movement = initialMovement;
  const movementUI =
    MOVEMENT_TYPE_UI[movement.movement_type] || MOVEMENT_TYPE_UI['initial_inventory'];
  const formattedDate = formatDate(movement.date_time);
  const variant = movement.product_variant;
  const product = variant.product;
  const isBelowMinimum = variant.minimum_stock > 0 && movement.balance <= variant.minimum_stock;

  // Get the best image to display
  const mainImage =
    variant.images.find(img => img.type === 'THUMBNAIL' || img.type === 'HERO') ||
    variant.images[0];

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb]">
      <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-[#e0e3e5]">
        <div>
          <Link
            href="/admin/inventory/stockmovement"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#747781] hover:text-[#002d62] transition-colors mb-2"
          >
            <ArrowLeft className="size-3.5" /> Volver a Movimientos
          </Link>
          <h1 className="text-2xl font-sans font-bold text-[#00193c] tracking-tight">
            Movimiento #{movement.id}
          </h1>
          <p className="text-[13px] font-sans text-[#747781] mt-1">
            Detalles completos del movimiento de inventario.
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border ${movementUI.bg}`}
        >
          {movementUI.icon}
          <span className={`text-[12px] font-bold uppercase tracking-wider ${movementUI.color}`}>
            {movementUI.label}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main product card */}
          <section className="lg:col-span-2 space-y-6">
            {/* Product Information Card */}
            <div className="bg-white border border-[#e0e3e5] rounded-lg overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-6 p-6">
                {/* Product Image */}
                <div className="sm:w-48 sm:h-48 rounded-lg overflow-hidden bg-[#f2f4f6] border border-[#e0e3e5] flex-shrink-0 relative">
                  {mainImage ? (
                    <Image
                      src={mainImage.url}
                      alt={mainImage.alt_text || variant.name}
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  ) : product.thumbnail ? (
                    <Image
                      src={product.thumbnail}
                      alt={product.name}
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#e8eaed]">
                      <Package className="size-12 text-[#747781]" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/admin/products/info/${product.id}`}>
                        <h2 className="text-[18px] font-bold text-[#191c1e]">{product.name}</h2>
                      </Link>
                      <p className="text-[14px] text-[#43474f] mt-0.5">{variant.name}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e8f0fe] text-[#002d62] text-[11px] font-bold">
                      <Hash className="size-3" />
                      Var. #{variant.variant_number}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-[13px] text-[#43474f]">
                      <Tag className="size-4 text-[#747781]" />
                      <span className="font-mono">{variant.sku}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-[#43474f]">
                      <Box className="size-4 text-[#747781]" />
                      <span>{product.product_type_label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-[#43474f]">
                      <ShoppingBag className="size-4 text-[#747781]" />
                      <span>{product.category.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-[#43474f]">
                      <DollarSign className="size-4 text-[#747781]" />
                      <span className="font-semibold">${variant.selling_price.toFixed(2)}</span>
                      <span className="text-[#747781]">(IVA {variant.tax_rate * 100}%)</span>
                    </div>
                  </div>

                  {variant.description && (
                    <p className="mt-3 text-[13px] text-[#43474f] border-t border-[#e0e3e5] pt-3">
                      {variant.description}
                    </p>
                  )}

                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {product.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono font-medium text-[#747781] bg-[#f2f4f6] px-2 py-0.5 rounded border border-[#e0e3e5]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Movement Details Card */}
            <div className="bg-white border border-[#e0e3e5] rounded-lg p-6">
              <h3 className="text-[14px] font-bold text-[#191c1e] mb-4">Detalles del Movimiento</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-[#e8f0fe] flex items-center justify-center">
                      <Calendar className="size-4 text-[#002d62]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[#747781] uppercase tracking-wider">
                        Fecha y Hora
                      </p>
                      <p className="text-[13px] font-medium text-[#191c1e]">{formattedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-[#e8f0fe] flex items-center justify-center">
                      <Hash className="size-4 text-[#002d62]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[#747781] uppercase tracking-wider">
                        ID del Movimiento
                      </p>
                      <p className="text-[13px] font-mono font-medium text-[#191c1e]">
                        #{movement.id}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-8 rounded-full flex items-center justify-center ${movementUI.bg}`}
                    >
                      {movementUI.icon}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[#747781] uppercase tracking-wider">
                        Tipo de Movimiento
                      </p>
                      <p className="text-[13px] font-medium text-[#191c1e]">{movementUI.label}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-[#e8f0fe] flex items-center justify-center">
                      <FileText className="size-4 text-[#002d62]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[#747781] uppercase tracking-wider">
                        Motivo
                      </p>
                      <p className="text-[13px] font-mono font-medium text-[#191c1e]">
                        {movement.document_reference || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Sidebar - Quantity and Balance */}
          <section className="lg:col-span-1 space-y-6">
            {/* Quantity Card */}
            <div className="bg-white border border-[#e0e3e5] rounded-lg p-6">
              <h3 className="text-[14px] font-bold text-[#191c1e] mb-4">Cantidades</h3>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[#f8fafd] border border-[#e0e3e5]">
                  <p className="text-[11px] font-semibold text-[#747781] uppercase tracking-wider">
                    Movimiento
                  </p>
                  <p
                    className={`text-[24px] font-bold ${
                      movement.quantity > 0 ? 'text-[#137333]' : 'text-[#d93025]'
                    }`}
                  >
                    {movement.quantity > 0 ? '+' : ''}
                    {movement.quantity}
                  </p>
                  <p className="text-[12px] text-[#747781] mt-0.5">unidades en este movimiento</p>
                </div>

                <div
                  className={`p-4 rounded-lg border ${
                    isBelowMinimum
                      ? 'bg-[#ffdad6] border-[#ffb4ab]'
                      : 'bg-[#e8f0fe] border-[#c4c6d1]'
                  }`}
                >
                  <p className="text-[11px] font-semibold text-[#747781] uppercase tracking-wider">
                    Balance Actual
                  </p>
                  <p
                    className={`text-[24px] font-bold ${
                      isBelowMinimum ? 'text-[#93000a]' : 'text-[#002d62]'
                    }`}
                  >
                    {movement.balance}
                  </p>
                  <p className="text-[12px] text-[#747781] mt-0.5">unidades en inventario</p>
                  {isBelowMinimum && (
                    <div className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#93000a]">
                      <AlertTriangle className="size-3.5 flex-shrink-0" />
                      Stock bajo el mínimo configurado ({variant.minimum_stock} unidades)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Variant Info */}
            <div className="bg-white border border-[#e0e3e5] rounded-lg p-6">
              <h3 className="text-[14px] font-bold text-[#191c1e] mb-4">Variante</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#747781]">Nombre</span>
                  <span className="font-medium text-[#191c1e]">{variant.name}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#747781]">SKU</span>
                  <span className="font-mono text-[#191c1e]">{variant.sku}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#747781]">Estado</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      variant.status ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#ffdad6] text-[#93000a]'
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        variant.status ? 'bg-[#1e8e3e]' : 'bg-[#ba1a1a]'
                      }`}
                      aria-hidden="true"
                    />
                    {variant.status ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="flex justify-between text-[13px] border-t border-[#e0e3e5] pt-2.5">
                  <span className="text-[#747781]">Precio</span>
                  <span className="font-bold text-[#191c1e]">
                    ${variant.selling_price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#747781]">Alerta de stock mínimo</span>
                  <span
                    className={`font-medium ${
                      variant.minimum_stock > 0 ? 'text-[#191c1e]' : 'text-[#747781]'
                    }`}
                  >
                    {variant.minimum_stock > 0 ? `${variant.minimum_stock} unidades` : 'Sin alerta'}
                  </span>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            {variant.images.length > 1 && (
              <div className="bg-white border border-[#e0e3e5] rounded-lg p-6">
                <h3 className="text-[14px] font-bold text-[#191c1e] mb-3">Galería de Imágenes</h3>
                <div className="grid grid-cols-3 gap-2">
                  {variant.images.slice(0, 6).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-md overflow-hidden bg-[#f2f4f6] border border-[#e0e3e5] relative"
                    >
                      <Image
                        src={image.url}
                        alt={image.alt_text || `Imagen ${index + 1}`}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                {variant.images.length > 6 && (
                  <p className="text-[11px] text-[#747781] mt-2 text-center">
                    +{variant.images.length - 6} imágenes más
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
