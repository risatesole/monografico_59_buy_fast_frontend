// app/admin/customers/orders/[id]/FulfillButton.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { fulfillOrder } from './fulfillOrder';

interface FulfillButtonProps {
  orderId: number;
}

export default function FulfillButton({ orderId }: FulfillButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState('');

  const handleConfirm = async () => {
    if (!code.trim()) {
      setError('Ingresa el código de retiro que te dio el cliente.');
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const result = await fulfillOrder(orderId, code.trim());

        if (!result.ok) {
          throw new Error(result.message);
        }

        // Refresh the page to show updated status
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An error occurred while fulfilling the order'
        );
      }
    });
  };

  const handleCancel = () => {
    setShowCodeInput(false);
    setCode('');
    setError(null);
  };

  if (showCodeInput) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="Código de retiro"
            maxLength={8}
            disabled={isPending}
            autoFocus
            className="w-40 rounded-lg border border-[#c4c6d1] px-3 py-2 text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Verificando...' : 'Confirmar entrega'}
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
        onClick={() => setShowCodeInput(true)}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
      >
        Completar orden
      </button>
    </div>
  );
}
