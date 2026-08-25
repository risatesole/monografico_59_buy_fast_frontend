// app/admin/customers/orders/[id]/MarkReadyButton.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { markOrderReady } from './markReady';

interface MarkReadyButtonProps {
  orderId: number;
  readyForPickup: boolean;
}

export default function MarkReadyButton({ orderId, readyForPickup }: MarkReadyButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const targetReady = !readyForPickup;

  const handleConfirm = () => {
    setError(null);

    startTransition(async () => {
      const result = await markOrderReady(orderId, targetReady);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setConfirming(false);
      router.refresh();
    });
  };

  const handleCancel = () => {
    setConfirming(false);
    setError(null);
  };

  if (confirming) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#191c1e]">
            {targetReady
              ? '¿Confirmar que la orden está lista para retirar?'
              : '¿Desmarcar la orden como lista para retirar?'}
          </span>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="px-4 py-2 bg-[#002d62] text-white rounded-lg hover:bg-[#00224a] focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Guardando...' : 'Confirmar'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="px-3 py-2 text-sm text-[#747781] hover:text-[#191c1e] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() => setConfirming(true)}
        className={
          targetReady
            ? 'px-4 py-2 bg-[#002d62] text-white rounded-lg hover:bg-[#00224a] focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-2 transition-colors'
            : 'px-4 py-2 border border-[#c4c6d1] text-[#191c1e] rounded-lg hover:bg-[#f2f4f6] focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-2 transition-colors'
        }
      >
        {targetReady ? 'Marcar como lista para retirar' : 'Desmarcar como lista'}
      </button>
    </div>
  );
}
