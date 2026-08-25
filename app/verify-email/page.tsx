'use client';

import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type Status = 'verifying' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');
  const hasValidParams = Boolean(uid && token);

  const [status, setStatus] = useState<Status>(hasValidParams ? 'verifying' : 'error');
  const [message, setMessage] = useState(
    hasValidParams ? '' : 'El enlace de verificación no es válido.'
  );

  useEffect(() => {
    if (!hasValidParams) return;

    let isMounted = true;

    (async () => {
      try {
        const res = await fetch('/api/v1/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid, token }),
        });
        const data = await res.json().catch(() => null);

        if (!isMounted) return;

        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('error');
          setMessage(data?.message || 'El enlace de verificación no es válido o ha expirado.');
        }
      } catch {
        if (isMounted) {
          setStatus('error');
          setMessage('Ocurrió un error al verificar su correo. Intente de nuevo.');
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [uid, token, hasValidParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border-2 border-[#002d62] rounded-2xl shadow-sm p-8 text-center">
        <Link
          href="/"
          className="mb-6 inline-flex items-center justify-center gap-4 rounded-xl bg-[#002d62] px-5 py-3 shadow-sm transition-opacity hover:opacity-90"
        >
          <Image
            src="/image/logo_uasd.svg"
            alt="UASD Logo"
            width={130}
            height={36}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {status === 'verifying' && (
          <>
            <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#002d62]" />
            <h1 className="text-xl font-bold tracking-tight text-gray-900 mb-2">
              Verificando su correo...
            </h1>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 ring-8 ring-green-50/50">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
              ¡Correo Verificado!
            </h1>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Su correo electrónico ha sido verificado exitosamente. Ya puede realizar compras en el
              Ecónomato.
            </p>
            <Link
              href="/"
              className="inline-block w-full rounded-xl bg-[#002d62] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#115cb9] transition-all"
            >
              Volver a la tienda
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
              No se pudo verificar
            </h1>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">{message}</p>
            <Link
              href="/"
              className="inline-block w-full rounded-xl bg-[#002d62] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#115cb9] transition-all"
            >
              Volver a la tienda
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
