'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResetPassword } from '@/services/auth/resetPassword';

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

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const linkIsValid = Boolean(uid && token);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await ResetPassword({ uid: uid!, token: token!, new_password: password });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo restablecer la contraseña.');
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
              Restablecer contraseña
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Elige una nueva contraseña para tu cuenta
            </p>
          </CardHeader>

          <CardContent className="space-y-5 px-8 pt-7 pb-8">
            {!linkIsValid ? (
              <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3">
                <p className="text-sm text-red-500">
                  Este enlace de recuperación no es válido. Solicita uno nuevo.
                </p>
              </div>
            ) : success ? (
              <div className="rounded-md border border-[#115cb9]/20 bg-[#115cb9]/10 p-3">
                <p className="text-sm text-[#002d62]">
                  Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className={uasdClasses.fieldLabel}>
                    Nueva Contraseña
                  </Label>

                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu nueva contraseña"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    required
                    className={uasdClasses.input}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className={uasdClasses.fieldLabel}>
                    Confirmar Contraseña
                  </Label>

                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repite tu nueva contraseña"
                    value={confirmPassword}
                    onChange={event => setConfirmPassword(event.target.value)}
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
                  {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
                </Button>
              </form>
            )}

            <div className="relative flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">o</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <p className="pt-1 text-center text-xs text-muted-foreground">
              <Link href="/signin" className={uasdClasses.link}>
                Volver a Iniciar Sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
