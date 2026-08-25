'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, type ProductInput, type ProductVariantInput } from './actions';
import { fetchCategories, type Category } from './get-categories';
import ImageUploader from '@/components/ImageUploader';

interface ImageDraft {
  type: string;
  url: string;
}

interface VariantDraft {
  name: string;
  description: string;
  variantnumber: number;
  thumbnail: string;
  sku: string;
  slug: string;
  selling_price: string;
  tax_rate: string;
  initial_inventory: string;
  minimum_stock: string;
  images: ImageDraft[];
}

function emptyVariant(nextNumber: number): VariantDraft {
  return {
    name: '',
    description: '',
    variantnumber: nextNumber,
    thumbnail: '',
    sku: '',
    slug: '',
    selling_price: '',
    tax_rate: '0.1',
    initial_inventory: '0',
    minimum_stock: '0',
    images: [{ type: 'GALLERY', url: '' }],
  };
}

function roundTo(value: number, decimals: number): number {
  return Number(value.toFixed(decimals));
}

const inputClass =
  'w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]';

const labelClass = 'mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase';

export default function NewProductPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [slug, setSlug] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [variants, setVariants] = useState<VariantDraft[]>([emptyVariant(1)]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchCategories()
      .then(data => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setCategoriesError('No se pudieron cargar las categorías.');
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants(prev => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function addVariant() {
    setVariants(prev => [...prev, emptyVariant(prev.length + 1)]);
  }

  function removeVariant(index: number) {
    setVariants(prev => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  function addImage(variantIndex: number) {
    setVariants(prev =>
      prev.map((v, i) =>
        i === variantIndex ? { ...v, images: [...v.images, { type: 'GALLERY', url: '' }] } : v
      )
    );
  }

  function updateImage(variantIndex: number, imageIndex: number, patch: Partial<ImageDraft>) {
    setVariants(prev =>
      prev.map((v, i) =>
        i === variantIndex
          ? {
              ...v,
              images: v.images.map((img, j) => (j === imageIndex ? { ...img, ...patch } : img)),
            }
          : v
      )
    );
  }

  function removeImage(variantIndex: number, imageIndex: number) {
    setVariants(prev =>
      prev.map((v, i) =>
        i === variantIndex ? { ...v, images: v.images.filter((_, j) => j !== imageIndex) } : v
      )
    );
  }

  function validate(): string | null {
    if (!name.trim()) return 'El nombre del producto es requerido.';
    if (!category.trim()) return 'La categoría es requerida.';
    if (!slug.trim()) return 'El slug del producto es requerido.';
    if (!thumbnail.trim()) return 'La miniatura del producto es requerida.';

    for (const [i, v] of variants.entries()) {
      if (!v.name.trim()) return `Variante ${i + 1}: el nombre es requerido.`;
      if (!v.sku.trim()) return `Variante ${i + 1}: el SKU es requerido.`;
      if (!v.slug.trim()) return `Variante ${i + 1}: el slug es requerido.`;
      if (!v.selling_price || Number.isNaN(Number(v.selling_price)))
        return `Variante ${i + 1}: el precio de venta es inválido.`;
      if (v.tax_rate === '' || Number.isNaN(Number(v.tax_rate)))
        return `Variante ${i + 1}: la tasa de impuesto es inválida.`;
      if (v.initial_inventory === '' || Number.isNaN(Number(v.initial_inventory)))
        return `Variante ${i + 1}: el inventario inicial es inválido.`;
      if (v.minimum_stock === '' || Number.isNaN(Number(v.minimum_stock)))
        return `Variante ${i + 1}: la alerta de stock mínimo es inválida.`;
    }

    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload: ProductInput = {
      name: name.trim(),
      category: category.trim(),
      slug: slug.trim(),
      thumbnail: thumbnail.trim(),
      tags: tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
      variants: variants.map<ProductVariantInput>(v => ({
        name: v.name.trim(),
        description: v.description.trim(),
        variantnumber: v.variantnumber,
        thumbnail: v.thumbnail.trim(),
        sku: v.sku.trim(),
        slug: v.slug.trim(),
        selling_price: roundTo(Number(v.selling_price), 2),
        tax_rate: Number(v.tax_rate).toFixed(4),
        initial_inventory: Number(v.initial_inventory),
        minimum_stock: Number(v.minimum_stock),
        images: v.images
          .filter(img => img.url.trim())
          .map(img => ({ type: img.type || 'GALLERY', url: img.url.trim() })),
      })),
    };

    startTransition(async () => {
      const result = await createProduct(payload);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setSuccess(result.message);
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 900);
    });
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <p className="mb-1 text-xs font-semibold tracking-widest text-gray-500 uppercase">
          Catálogo
        </p>
        <h1 className="font-sans text-3xl font-medium text-gray-900">Nuevo producto</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        {/* ── Datos del producto ────────────────────────────── */}
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-5 text-sm font-semibold text-gray-900">Información general</h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="name">
                Nombre
              </label>
              <input
                id="name"
                className={inputClass}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. Zapatillas Runner"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="category">
                Categoría
              </label>
              <select
                id="category"
                className={`${inputClass} appearance-none`}
                value={category}
                onChange={e => setCategory(e.target.value)}
                disabled={categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? 'Cargando categorías...' : 'Selecciona una categoría'}
                </option>
                {categories.map(cat => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {categoriesError && <p className="mt-1.5 text-xs text-red-600">{categoriesError}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="slug">
                Slug del producto
              </label>
              <input
                id="slug"
                className={inputClass}
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="Ej. zapatillas-runner"
              />
            </div>

            <ImageUploader
              label="Miniatura del producto"
              value={thumbnail}
              onChange={setThumbnail}
            />

            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="tags">
                Etiquetas (separadas por coma)
              </label>
              <input
                id="tags"
                className={inputClass}
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="deportivo, nuevo, verano"
              />
            </div>
          </div>
        </section>

        {/* ── Variantes ──────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Variantes</h2>
            <button
              type="button"
              onClick={addVariant}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
            >
              + Agregar variante
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {variants.map((variant, vIndex) => (
              <div key={vIndex} className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    Variante #{variant.variantnumber}
                  </h3>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(vIndex)}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Nombre</label>
                    <input
                      className={inputClass}
                      value={variant.name}
                      onChange={e => updateVariant(vIndex, { name: e.target.value })}
                      placeholder="Ej. Talla 42 / Azul"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>SKU</label>
                    <input
                      className={inputClass}
                      value={variant.sku}
                      onChange={e => updateVariant(vIndex, { sku: e.target.value })}
                      placeholder="PROD-VAR-001"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Slug de variante</label>
                    <input
                      className={inputClass}
                      value={variant.slug}
                      onChange={e => updateVariant(vIndex, { slug: e.target.value })}
                      placeholder="talla-42-azul"
                    />
                  </div>

                  <ImageUploader
                    label="Miniatura"
                    value={variant.thumbnail}
                    onChange={url => updateVariant(vIndex, { thumbnail: url })}
                  />

                  <div>
                    <label className={labelClass}>Precio de venta</label>
                    <input
                      className={inputClass}
                      type="number"
                      step="0.01"
                      min="0"
                      value={variant.selling_price}
                      onChange={e => updateVariant(vIndex, { selling_price: e.target.value })}
                      placeholder="100.00"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Tasa de impuesto</label>
                    <input
                      className={inputClass}
                      type="number"
                      step="0.01"
                      min="0"
                      value={variant.tax_rate}
                      onChange={e => updateVariant(vIndex, { tax_rate: e.target.value })}
                      placeholder="0.1"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Inventario inicial</label>
                    <input
                      className={inputClass}
                      type="number"
                      min="0"
                      value={variant.initial_inventory}
                      onChange={e => updateVariant(vIndex, { initial_inventory: e.target.value })}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Alerta de stock mínimo</label>
                    <input
                      className={inputClass}
                      type="number"
                      min="0"
                      value={variant.minimum_stock}
                      onChange={e => updateVariant(vIndex, { minimum_stock: e.target.value })}
                      placeholder="0 = sin alerta"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Descripción</label>
                    <textarea
                      className={`${inputClass} min-h-[80px] resize-y`}
                      value={variant.description}
                      onChange={e => updateVariant(vIndex, { description: e.target.value })}
                      placeholder="Descripción de la variante..."
                    />
                  </div>
                </div>

                {/* Imágenes de la variante */}
                <div className="mt-5 border-t border-gray-100 pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className={labelClass + ' mb-0'}>Imágenes</span>
                    <button
                      type="button"
                      onClick={() => addImage(vIndex)}
                      className="text-xs font-medium text-[#002d62] hover:text-[#115cb9]"
                    >
                      + Agregar imagen
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {variant.images.map((image, iIndex) => (
                      <div key={iIndex} className="flex flex-col gap-2">
                        <ImageUploader
                          value={image.url}
                          onChange={url => updateImage(vIndex, iIndex, { url })}
                        />
                        <div className="flex items-center gap-2">
                          <select
                            className="w-full rounded-md border border-gray-200 py-1.5 px-2 text-xs text-gray-900 outline-none transition-colors focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]"
                            value={image.type}
                            onChange={e => updateImage(vIndex, iIndex, { type: e.target.value })}
                          >
                            <option value="GALLERY">GALLERY</option>
                            <option value="HERO">HERO</option>
                            <option value="THUMBNAIL">THUMB</option>
                            <option value="LIFESTYLE">LIFEST.</option>
                          </select>
                          {variant.images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeImage(vIndex, iIndex)}
                              className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700"
                            >
                              Quitar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feedback y submit ──────────────────────────────── */}
        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => router.push('/admin/products/import')}
            className="rounded-md px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Import
          </button>

          <button
            type="submit"
            disabled={isPending}
            className={`rounded-md px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 ${
              isPending
                ? 'cursor-not-allowed bg-gray-400 opacity-70'
                : 'bg-[#002d62] hover:bg-[#115cb9] active:scale-[0.98]'
            }`}
          >
            {isPending ? 'Creando producto...' : 'Crear producto'}
          </button>
        </div>
      </form>
    </main>
  );
}
