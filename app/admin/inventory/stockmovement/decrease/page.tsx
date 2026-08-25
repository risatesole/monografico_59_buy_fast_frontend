'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createStockDecrease } from './actions';

const inputClass =
  'w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a]';

const labelClass = 'mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase';

// Variant shape returned by the inventory API
type VariantInfo = {
  variant_id: number;
  product_name: string;
  thumbnail: string | null;
  quantity: number;
  inventory_status: string;
  minimum_stock: number;
  below_minimum_stock: boolean;
  sku: string;
  selling_price: number;
};

export default function NewStockDecreasePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [sku, setSku] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkedVariant, setCheckedVariant] = useState<VariantInfo | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [candidateVariant, setCandidateVariant] = useState<VariantInfo | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function validate(): string | null {
    if (!sku.trim()) return 'El SKU es requerido.';
    if (!checkedVariant)
      return 'Por favor, presiona "Chequear" para verificar el SKU antes de registrar.';
    if (checkedVariant && checkedVariant.sku !== sku.trim())
      return 'El SKU ingresado no coincide con el producto checado.';
    if (!quantity || Number.isNaN(Number(quantity))) return 'La cantidad es inválida.';
    if (Number(quantity) <= 0) return 'La cantidad debe ser mayor a cero.';
    if (checkedVariant && Number(quantity) > checkedVariant.quantity)
      return `No hay suficiente stock. Balance actual: ${checkedVariant.quantity}.`;
    if (!reason.trim()) return 'El motivo es requerido.';
    return null;
  }

  async function checkSku() {
    const value = sku.trim();
    setCheckError(null);
    setCheckedVariant(null);
    if (!value) {
      setCheckError('Ingresa un SKU para chequear.');
      return;
    }

    setIsChecking(true);
    try {
      const resp = await fetch(
        `/api/v1/admin/inventory/products?search=${encodeURIComponent(value)}`
      );
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        setCheckError(err?.error || 'Error al consultar el producto');
        return;
      }

      const data = await resp.json();
      const first = Array.isArray(data.results) && data.results.length > 0 ? data.results[0] : null;
      if (!first) {
        setCheckError('No se encontró ningún producto con ese SKU.');
        return;
      }

      // Ask the user to confirm via modal before accepting the match
      setCandidateVariant(first as VariantInfo);
      setShowConfirmModal(true);
      setCheckError(null);
    } catch (e) {
      console.error('[Check SKU Error]', e);
      setCheckError('No se pudo conectar al servidor para chequear el SKU.');
    } finally {
      setIsChecking(false);
    }
  }

  function handleSubmit(e: React.FormEvent, keepCreating: boolean) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      const result = await createStockDecrease({
        sku: sku.trim(),
        quantity: Number(quantity),
        reason: reason.trim(),
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setSuccess(result.message);
      setSku('');
      setQuantity('');
      setReason('');
      setCheckedVariant(null);

      if (keepCreating) {
        router.refresh();
        return;
      }

      setTimeout(() => {
        router.push('/admin/inventory/stockmovement');
        router.refresh();
      }, 900);
    });
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <p className="mb-1 text-xs font-semibold tracking-widest text-gray-500 uppercase">
          Inventario
        </p>
        <h1 className="font-sans text-3xl font-medium text-gray-900">Salida de inventario</h1>
        <p className="mt-1 text-sm text-gray-500">
          Retira manualmente unidades del inventario (pérdida, daño, corrección, etc).
        </p>
      </header>

      <form onSubmit={e => handleSubmit(e, false)} className="flex flex-col gap-6">
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex flex-col gap-5">
            <div>
              <label className={labelClass} htmlFor="sku">
                SKU
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="sku"
                  className={inputClass}
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                  placeholder="Ej. SHOES"
                />
                <button
                  type="button"
                  onClick={checkSku}
                  disabled={isChecking}
                  className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold border ${
                    isChecking
                      ? 'border-gray-200 text-gray-400 bg-gray-50'
                      : 'border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ba1a1a]/5'
                  }`}
                >
                  {isChecking ? 'Checando...' : 'Chequear'}
                </button>
              </div>

              {checkError && <p className="mt-2 text-sm text-[#ba1a1a]">{checkError}</p>}
              {checkedVariant && (
                <div className="mt-3 rounded-md border border-gray-100 bg-[#fdf8f8] p-3 text-sm">
                  <div className="flex items-start gap-3">
                    {checkedVariant.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={checkedVariant.thumbnail}
                        alt={checkedVariant.product_name}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-[#f2f4f6]" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-[#191c1e]">
                        {checkedVariant.product_name}
                      </div>
                      <div className="text-[13px] text-[#43474f]">
                        SKU: <span className="font-mono">{checkedVariant.sku}</span>
                      </div>
                      <div className="text-[13px] text-[#43474f]">
                        Stock: <span className="font-semibold">{checkedVariant.quantity}</span>
                      </div>
                      <div className="text-[13px] text-[#43474f]">
                        Precio:{' '}
                        <span className="font-semibold">
                          {checkedVariant.selling_price
                            ? new Intl.NumberFormat('es-DO', {
                                style: 'currency',
                                currency: 'DOP',
                              }).format(checkedVariant.selling_price)
                            : '-'}
                        </span>
                      </div>
                      {checkedVariant.below_minimum_stock && (
                        <div className="mt-2 rounded-md border border-[#ffb4ab] bg-[#ffdad6] px-2.5 py-1.5 text-[12px] font-semibold text-[#93000a]">
                          ⚠ Este producto ya está en o bajo su mínimo configurado (
                          {checkedVariant.minimum_stock} unidades). Retirar más stock lo dejará más
                          bajo.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmation modal */}
              {showConfirmModal && candidateVariant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div
                    className="absolute inset-0 bg-black/40"
                    onClick={() => {
                      setShowConfirmModal(false);
                      setCandidateVariant(null);
                    }}
                  />
                  <div
                    role="dialog"
                    aria-modal="true"
                    className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
                  >
                    <h3 className="text-lg font-semibold text-[#191c1e]">¿Es este tu producto?</h3>
                    <p className="text-sm text-[#43474f] mt-2">
                      Confirma que el nombre y la imagen corresponden al SKU ingresado.
                    </p>
                    <div className="mt-4 flex items-start gap-4">
                      {candidateVariant.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={candidateVariant.thumbnail}
                          alt={candidateVariant.product_name}
                          className="w-20 h-20 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-md bg-[#f2f4f6]" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-[#191c1e]">
                          {candidateVariant.product_name}
                        </div>
                        <div className="text-[13px] text-[#43474f] mt-1">
                          SKU: <span className="font-mono">{candidateVariant.sku}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex justify-end gap-3">
                      <button
                        type="button"
                        className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50"
                        onClick={() => {
                          setShowConfirmModal(false);
                          setCandidateVariant(null);
                          setCheckError('Chequeo cancelado.');
                        }}
                      >
                        No, cancelar
                      </button>
                      <button
                        type="button"
                        className="rounded-md px-4 py-2 text-sm font-semibold text-white bg-[#ba1a1a] hover:bg-[#93000a]"
                        onClick={() => {
                          setCheckedVariant(candidateVariant);
                          setShowConfirmModal(false);
                          setCandidateVariant(null);
                          setCheckError(null);
                        }}
                      >
                        Sí, es este producto
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className={labelClass} htmlFor="quantity">
                Cantidad
              </label>
              <input
                id="quantity"
                className={inputClass}
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="Ej. 5"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="reason">
                Motivo
              </label>
              <input
                id="reason"
                className={inputClass}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Ej. Producto dañado"
              />
            </div>
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
            type="button"
            disabled={isPending}
            onClick={e => handleSubmit(e, true)}
            className={`rounded-md border px-6 py-3 text-sm font-semibold shadow-sm transition-all duration-200 ${
              isPending
                ? 'cursor-not-allowed border-gray-200 text-gray-400 opacity-70'
                : 'border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ba1a1a]/5 active:scale-[0.98]'
            }`}
          >
            {isPending ? 'Registrando...' : 'Registrar y crear más salidas'}
          </button>

          <button
            type="submit"
            disabled={isPending}
            className={`rounded-md px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 ${
              isPending
                ? 'cursor-not-allowed bg-gray-400 opacity-70'
                : 'bg-[#ba1a1a] hover:bg-[#93000a] active:scale-[0.98]'
            }`}
          >
            {isPending ? 'Registrando...' : 'Registrar salida'}
          </button>
        </div>
      </form>
    </main>
  );
}
