'use client';

import { useState } from 'react';

export function EmailVerificationBanner() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleResend = async () => {
    setStatus('sending');
    try {
      const res = await fetch('/api/v1/resend-verification-email', { method: 'POST' });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 border-b border-[#feefc3] bg-[#fef7e0] px-4 py-2.5 text-sm text-[#b06000]">
      <span>
        Debes verificar tu correo electrónico para poder completar compras en el Ecónomato.
      </span>

      {status === 'sent' ? (
        <span className="font-semibold">Correo de verificación enviado.</span>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          disabled={status === 'sending'}
          className="font-semibold underline underline-offset-2 hover:text-[#8a4a00] disabled:opacity-60"
        >
          {status === 'sending' ? 'Enviando...' : 'Reenviar correo de verificación'}
        </button>
      )}

      {status === 'error' && (
        <span className="text-red-700">No se pudo enviar el correo. Intenta de nuevo.</span>
      )}
    </div>
  );
}
