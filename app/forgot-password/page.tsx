'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ForgotPassword } from '@/services/auth/forgotPassword';

// ── Shared UASD brand classes ─────────────────────────────────
// Kept in sync with app/signin/page.tsx so the auth pages feel like the rest of the site.

const uasdClasses = {
  primaryButton:
    'w-full h-10 rounded-xl bg-[#002d62] text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-in-out hover:bg-[#115cb9] active:scale-[0.98]',
  fieldLabel: 'text-xs font-semibold tracking-widest text-[#43474f] uppercase',
  input:
    'h-10 border-[#c4c6d1] bg-[#f2f4f6] text-sm transition-colors placeholder:text-muted-foreground/60 focus-visible:border-[#115cb9] focus-visible:ring-1 focus-visible:ring-[#115cb9]',
  link: 'font-medium text-[#115cb9] underline underline-offset-2 transition-colors hover:text-[#002d62]',
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError('');

    try {
      await ForgotPassword({ email });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el correo de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f2f4f6] px-4">
      <div className="w-full max-w-sm">
        <Card className="rounded-2xl border border-[#e0e3e5] shadow-xl shadow-[#002d62]/5">
          <CardHeader className="px-8 pt-8 pb-0">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#002d62]">
                <Image
                  src="/image/logo_uasd_small.svg"
                  alt="Logo UASD"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              </div>

              <span className="text-sm font-bold tracking-widest text-[#002d62] uppercase">
                UASD | Economato <br /> Buy Fast
              </span>
            </div>

            <h1 className="text-2xl leading-tight font-semibold tracking-tight text-foreground">
              Recuperar contraseña
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
            </p>
          </CardHeader>

          <CardContent className="space-y-5 px-8 pt-7 pb-8">
            {submitted ? (
              <div className="rounded-md border border-[#115cb9]/20 bg-[#115cb9]/10 p-3">
                <p className="text-sm text-[#002d62]">
                  Si existe una cuenta asociada a ese correo, recibirás un enlace para restablecer
                  tu contraseña en unos minutos.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className={uasdClasses.fieldLabel}>
                    Correo Electrónico
                  </Label>

                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@uasd.edu.do"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    required
                    className={uasdClasses.input}
                  />
                </div>

                {error && (
                  <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3">
                    <p className="text-sm text-red-500">{error}</p>
                  </div>
                )}

                <Button type="submit" disabled={loading} className={uasdClasses.primaryButton}>
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </Button>
              </form>
            )}

            <div className="relative flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">o</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <p className="pt-1 text-center text-xs text-muted-foreground">
              ¿Recordaste tu contraseña?{' '}
              <Link href="/signin" className={uasdClasses.link}>
                Iniciar Sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
