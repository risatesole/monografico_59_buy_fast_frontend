'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createCategory, type CategoryInput } from '../actions';
import ImageUploader from '@/components/ImageUploader';

const inputClass =
  'w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]';

const labelClass = 'mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase';

export default function NewCategoryPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('0');
  const [imageBanner, setImageBanner] = useState('');
  const [imageCart, setImageCart] = useState('');
  const [imageDefault, setImageDefault] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function validate(): string | null {
    if (!name.trim()) return 'El nombre de la categoría es requerido.';
    if (!slug.trim()) return 'El slug de la categoría es requerido.';
    if (priority !== '' && Number.isNaN(Number(priority)))
      return 'La prioridad debe ser un número.';
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

    const payload: CategoryInput = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      priority: priority === '' ? 0 : Number(priority),
      images: {
        banner: imageBanner.trim(),
        cart: imageCart.trim(),
        default: imageDefault.trim(),
      },
    };

    startTransition(async () => {
      const result = await createCategory(payload);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setSuccess(result.message);
      setTimeout(() => {
        router.push('/admin/products/categories');
        router.refresh();
      }, 900);
    });
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <p className="mb-1 text-xs font-semibold tracking-widest text-gray-500 uppercase">
          Catálogo
        </p>
        <h1 className="font-sans text-3xl font-medium text-gray-900">Nueva categoría</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
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
                placeholder="Ej. Electrónica y Calculadoras"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="slug">
                Slug
              </label>
              <input
                id="slug"
                className={inputClass}
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="Ej. electronics"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="priority">
                Prioridad
              </label>
              <input
                id="priority"
                type="number"
                className={inputClass}
                value={priority}
                onChange={e => setPriority(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="description">
                Descripción
              </label>
              <textarea
                id="description"
                className={`${inputClass} min-h-[80px] resize-y`}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descripción de la categoría..."
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-5 text-sm font-semibold text-gray-900">Imágenes</h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <ImageUploader label="Banner" value={imageBanner} onChange={setImageBanner} />
            <ImageUploader label="Carrito" value={imageCart} onChange={setImageCart} />
            <ImageUploader label="Por defecto" value={imageDefault} onChange={setImageDefault} />
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
            {isPending ? 'Creando categoría...' : 'Crear categoría'}
          </button>
        </div>
      </form>
    </main>
  );
}
