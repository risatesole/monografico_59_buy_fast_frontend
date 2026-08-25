'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ── Shared UASD brand classes ─────────────────────────────────
// Kept in sync with the primary/secondary button colors used in
// components/navbar.tsx so the auth pages feel like the rest of the site.

const uasdClasses = {
  primaryButton:
    'w-full h-10 rounded-xl bg-[#002d62] text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-in-out hover:bg-[#115cb9] active:scale-[0.98]',
  secondaryButton:
    'w-full h-10 rounded-xl border border-[#c4c6d1] bg-white text-sm font-medium text-[#43474f] shadow-sm transition-all duration-200 ease-in-out hover:border-[#115cb9] hover:text-[#115cb9] active:scale-[0.98]',
  fieldLabel: 'text-xs font-semibold tracking-widest text-[#43474f] uppercase',
  input:
    'h-10 border-[#c4c6d1] bg-[#f2f4f6] text-sm transition-colors placeholder:text-muted-foreground/60 focus-visible:border-[#115cb9] focus-visible:ring-1 focus-visible:ring-[#115cb9]',
  link: 'font-medium text-[#115cb9] underline underline-offset-2 transition-colors hover:text-[#002d62]',
};

interface SignInFormState {
  email: string;
  password: string;
}

export default function SignInPage() {
  const [formData, setFormData] = useState<SignInFormState>({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [event.target.id]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? 'No se pudo iniciar sesión. Intenta nuevamente.');
        return;
      }

      window.location.href = '/';
    } catch (error) {
      console.error(error);
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f2f4f6] px-4">
      <div className="w-full max-w-sm">
        <Card className="rounded-2xl border border-[#e0e3e5] shadow-xl shadow-[#002d62]/5">
          <CardHeader className="px-8 pt-8 pb-0">
            {/* UASD brand badge, matching components/navbar.tsx BrandLogo */}
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

            <span className="text-sm font-bold tracking-widest text-[#002d62] uppercase"></span>

            <h1 className="text-2xl leading-tight font-semibold tracking-tight text-foreground">
              Iniciar Sesión
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Accede a tu cuenta de UASD BUYFAST
            </p>
          </CardHeader>

          <CardContent className="space-y-5 px-8 pt-7 pb-8">
            <div className="space-y-1.5">
              <Label htmlFor="email" className={uasdClasses.fieldLabel}>
                Correo Electrónico
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="jane@uasd.edu.do"
                value={formData.email}
                onChange={handleChange}
                className={uasdClasses.input}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className={uasdClasses.fieldLabel}>
                  Contraseña
                </Label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#115cb9] hover:text-[#002d62]"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={formData.password}
                onChange={handleChange}
                className={uasdClasses.input}
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <Button onClick={handleSubmit} disabled={loading} className={uasdClasses.primaryButton}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>

            <div className="relative flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">o</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <p className="pt-1 text-center text-xs text-muted-foreground">
              ¿No tienes una cuenta?{' '}
              <Link href="/signup" className={uasdClasses.link}>
                Regístrate
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="mt-5 px-4 text-center text-[11px] leading-relaxed text-muted-foreground/70">
          Al iniciar sesión, aceptas nuestros{' '}
          <a href="#" className="underline underline-offset-2 hover:text-muted-foreground">
            Términos
          </a>{' '}
          y nuestra{' '}
          <a href="#" className="underline underline-offset-2 hover:text-muted-foreground">
            Política de Privacidad
          </a>
          .
        </p>
      </div>
    </main>
  );
}
