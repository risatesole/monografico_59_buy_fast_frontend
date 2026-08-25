'use client';

import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getProduct,
  updateProduct,
  type ProductPatchInput,
  type VariantPatchInput,
  type ProductImageInput,
} from './actions';
import ImageUploader from '@/components/ImageUploader';
import { fetchCategories, type Category } from './get-categories';

interface LoadedVariant {
  id: number;
  name: string;
  description: string;
  variantnumber: number;
  thumbnail: string;
  sku: string;
  slug: string;
  selling_price: string;
  tax_rate: string;
  minimum_stock: string;
  images: ProductImageInput[];
}

interface LoadedProduct {
  id: number;
  name: string;
  category: string;
  slug: string;
  thumbnail: string;
  tags: string[];
  variants: LoadedVariant[];
}

const inputClass =
  'w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]';

const labelClass = 'mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase';

function roundTo(value: number, decimals: number): number {
  return Number(value.toFixed(decimals));
}

function normalize(data: LoadedProduct): LoadedProduct {
  return {
    id: data.id,
    name: data.name,
    category: data.category,
    slug: data.slug,
    thumbnail: data.thumbnail,
    tags: data.tags ?? [],
    variants: (data.variants ?? []).map(v => ({
      id: v.id,
      name: v.name,
      description: v.description,
      variantnumber: v.variantnumber,
      thumbnail: v.thumbnail ?? '',
      sku: v.sku,
      slug: v.slug,
      selling_price: String(v.selling_price),
      tax_rate: String(v.tax_rate),
      minimum_stock: String(v.minimum_stock ?? 0),
      images: v.images ?? [],
    })),
  };
}

export default function PatchProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const [isLoading, startLoad] = useTransition();
  const [isPending, startTransition] = useTransition();

  const [original, setOriginal] = useState<LoadedProduct | null>(null);
  const [draft, setDraft] = useState<LoadedProduct | null>(null);
  const [tagsInput, setTagsInput] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    startLoad(async () => {
      setLoadError(null);
      const result = await getProduct(productId);

      if (!result.ok) {
        setLoadError(result.message);
        setOriginal(null);
        setDraft(null);
        return;
      }

      const normalized = normalize(result.data as LoadedProduct);
      setOriginal(normalized);
      setDraft(structuredClone(normalized));
      setTagsInput(normalized.tags.join(', '));
    });
  }, [productId]);

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

  function updateProductField(patch: Partial<LoadedProduct>) {
    setDraft(prev => (prev ? { ...prev, ...patch } : prev));
  }

  function updateVariant(index: number, patch: Partial<LoadedVariant>) {
    setDraft(prev =>
      prev
        ? { ...prev, variants: prev.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)) }
        : prev
    );
  }

  function addImage(variantIndex: number) {
    setDraft(prev =>
      prev
        ? {
            ...prev,
            variants: prev.variants.map((v, i) =>
              i === variantIndex ? { ...v, images: [...v.images, { type: 'GALLERY', url: '' }] } : v
            ),
          }
        : prev
    );
  }

  function updateImage(
    variantIndex: number,
    imageIndex: number,
    patch: Partial<ProductImageInput>
  ) {
    setDraft(prev =>
      prev
        ? {
            ...prev,
            variants: prev.variants.map((v, i) => {
              if (i !== variantIndex) return v;

              let images = v.images.map((img, j) =>
                j === imageIndex ? { ...img, ...patch } : img
              );

              // Ensure only one THUMBNAIL per variant
              if (patch.type === 'THUMBNAIL') {
                images = images.map((img, j) =>
                  j !== imageIndex && img.type === 'THUMBNAIL' ? { ...img, type: 'GALLERY' } : img
                );
              }

              return { ...v, images };
            }),
          }
        : prev
    );
  }

  function removeImage(variantIndex: number, imageIndex: number) {
    setDraft(prev =>
      prev
        ? {
            ...prev,
            variants: prev.variants.map((v, i) =>
              i === variantIndex ? { ...v, images: v.images.filter((_, j) => j !== imageIndex) } : v
            ),
          }
        : prev
    );
  }

  function buildPatch(): ProductPatchInput | null {
    if (!original || !draft) return null;

    const patch: ProductPatchInput = {};

    if (draft.name !== original.name) patch.name = draft.name;
    if (draft.category !== original.category) patch.category = draft.category;
    if (draft.slug !== original.slug) patch.slug = draft.slug;
    if (draft.thumbnail !== original.thumbnail) patch.thumbnail = draft.thumbnail;

    const nextTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    if (JSON.stringify(nextTags) !== JSON.stringify(original.tags)) {
      patch.tags = nextTags;
    }

    const variantPatches: VariantPatchInput[] = [];

    for (let i = 0; i < draft.variants.length; i++) {
      const dv = draft.variants[i];
      const ov = original.variants[i];
      const vPatch: VariantPatchInput = { id: dv.id };
      let changed = false;

      if (dv.name !== ov.name) {
        vPatch.name = dv.name;
        changed = true;
      }
      if (dv.description !== ov.description) {
        vPatch.description = dv.description;
        changed = true;
      }
      if (dv.variantnumber !== ov.variantnumber) {
        vPatch.variantnumber = dv.variantnumber;
        changed = true;
      }
      if (dv.thumbnail !== ov.thumbnail) {
        vPatch.thumbnail = dv.thumbnail;
        changed = true;
      }
      if (dv.sku !== ov.sku) {
        vPatch.sku = dv.sku;
        changed = true;
      }
      if (dv.slug !== ov.slug) {
        vPatch.slug = dv.slug;
        changed = true;
      }
      if (dv.selling_price !== ov.selling_price) {
        vPatch.selling_price = roundTo(Number(dv.selling_price), 2);
        changed = true;
      }
      if (dv.tax_rate !== ov.tax_rate) {
        vPatch.tax_rate = Number(dv.tax_rate).toFixed(4);
        changed = true;
      }
      if (dv.minimum_stock !== ov.minimum_stock) {
        vPatch.minimum_stock = Number(dv.minimum_stock);
        changed = true;
      }
      if (JSON.stringify(dv.images) !== JSON.stringify(ov.images)) {
        vPatch.images = dv.images.filter(img => img.url.trim());
        changed = true;
      }

      if (changed) variantPatches.push(vPatch);
    }

    if (variantPatches.length > 0) patch.variants = variantPatches;

    return patch;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!original) {
      setError('El producto aún no ha cargado.');
      return;
    }

    const patch = buildPatch();

    if (!patch || Object.keys(patch).length === 0) {
      setError('No hay cambios para guardar.');
      return;
    }

    startTransition(async () => {
      const result = await updateProduct(String(original.id), patch);

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
        <h1 className="font-sans text-3xl font-medium text-gray-900">
          Editar producto {productId ? `#${productId}` : ''}
        </h1>
      </header>

      {isLoading && (
        <p className="mb-6 rounded-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          Cargando producto...
        </p>
      )}

      {loadError && (
        <p className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </p>
      )}

      {draft && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          {/* ── Datos del producto ──────────────────────────── */}
          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-sm font-semibold text-gray-900">Información general</h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Nombre</label>
                <input
                  className={inputClass}
                  value={draft.name}
                  onChange={e => updateProductField({ name: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClass}>Categoría</label>
                <select
                  className={`${inputClass} appearance-none`}
                  value={draft.category}
                  onChange={e => updateProductField({ category: e.target.value })}
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? 'Cargando categorías...' : 'Selecciona una categoría'}
                  </option>
                  {/* Guarantees the product's current category still shows up even if it
                      hasn't loaded into `categories` yet or was removed from the backend list. */}
                  {draft.category && !categories.some(cat => cat.slug === draft.category) && (
                    <option value={draft.category}>{draft.category}</option>
                  )}
                  {categories.map(cat => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {categoriesError && (
                  <p className="mt-1.5 text-xs text-red-600">{categoriesError}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Slug del producto</label>
                <input
                  className={inputClass}
                  value={draft.slug}
                  onChange={e => updateProductField({ slug: e.target.value })}
                />
              </div>

              <ImageUploader
                label="Miniatura del producto"
                value={draft.thumbnail}
                onChange={url => updateProductField({ thumbnail: url })}
              />

              <div className="sm:col-span-2">
                <label className={labelClass}>Etiquetas (separadas por coma)</label>
                <input
                  className={inputClass}
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* ── Variantes ────────────────────────────────────── */}
          <section>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Variantes</h2>
            <p className="mb-4 text-xs text-gray-500">
              El PATCH solo edita variantes existentes; no puede agregar ni eliminar variantes desde
              aquí.
            </p>

            <div className="flex flex-col gap-6">
              {draft.variants.map((variant, vIndex) => (
                <div key={variant.id} className="rounded-lg border border-gray-200 bg-white p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      Variante #{variant.variantnumber} (ID {variant.id})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Nombre</label>
                      <input
                        className={inputClass}
                        value={variant.name}
                        onChange={e => updateVariant(vIndex, { name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>SKU</label>
                      <input
                        className={inputClass}
                        value={variant.sku}
                        onChange={e => updateVariant(vIndex, { sku: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Slug de variante</label>
                      <input
                        className={inputClass}
                        value={variant.slug}
                        onChange={e => updateVariant(vIndex, { slug: e.target.value })}
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
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Alerta de stock mínimo</label>
                      <input
                        className={inputClass}
                        type="number"
                        step="1"
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
                      />
                    </div>
                  </div>

                  {/* Imágenes */}
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
                            <button
                              type="button"
                              onClick={() => removeImage(vIndex, iIndex)}
                              className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700"
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

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
              type="submit"
              disabled={isPending}
              className={`rounded-md px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 ${
                isPending
                  ? 'cursor-not-allowed bg-gray-400 opacity-70'
                  : 'bg-[#002d62] hover:bg-[#115cb9] active:scale-[0.98]'
              }`}
            >
              {isPending ? 'Guardando cambios...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
