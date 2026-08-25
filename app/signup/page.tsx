'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { SignupUser } from '@/services/auth/signupUser';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

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

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    phone: '',
    matricula: '',
    terms: false,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');

      await SignupUser(form);

      window.location.href = '/';
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : 'Failed to create account');
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

            <h1 className="text-2xl leading-tight font-semibold tracking-tight text-foreground">
              Crear Cuenta
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Regístrate para comenzar en UASD BUYFAST
            </p>
          </CardHeader>

          <CardContent className="space-y-5 px-8 pt-7 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstname" className={uasdClasses.fieldLabel}>
                    Nombre
                  </Label>
                  <Input
                    id="firstname"
                    placeholder="John"
                    value={form.firstname}
                    onChange={event => setForm({ ...form, firstname: event.target.value })}
                    required
                    className={uasdClasses.input}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lastname" className={uasdClasses.fieldLabel}>
                    Apellido
                  </Label>
                  <Input
                    id="lastname"
                    placeholder="Doe"
                    value={form.lastname}
                    onChange={event => setForm({ ...form, lastname: event.target.value })}
                    required
                    className={uasdClasses.input}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className={uasdClasses.fieldLabel}>
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@uasd.edu.do"
                  value={form.email}
                  onChange={event => setForm({ ...form, email: event.target.value })}
                  required
                  className={uasdClasses.input}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className={uasdClasses.fieldLabel}>
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  placeholder="8095551234"
                  value={form.phone}
                  onChange={event => setForm({ ...form, phone: event.target.value })}
                  required
                  className={uasdClasses.input}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="matricula" className={uasdClasses.fieldLabel}>
                  Matrícula <span className="normal-case font-normal">(opcional)</span>
                </Label>
                <Input
                  id="matricula"
                  placeholder="123456789"
                  value={form.matricula}
                  onChange={event => setForm({ ...form, matricula: event.target.value })}
                  className={uasdClasses.input}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className={uasdClasses.fieldLabel}>
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={form.password}
                  onChange={event => setForm({ ...form, password: event.target.value })}
                  required
                  className={uasdClasses.input}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="terms"
                  checked={form.terms}
                  onCheckedChange={checked => setForm({ ...form, terms: checked === true })}
                />
                <Label htmlFor="terms" className="cursor-pointer text-xs text-muted-foreground">
                  Acepto los términos y condiciones
                </Label>
              </div>

              {error && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className={uasdClasses.primaryButton}
                disabled={loading || !form.terms}
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>

              <div className="relative flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">o</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <p className="pt-1 text-center text-xs text-muted-foreground">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/signin" className={uasdClasses.link}>
                  Inicia Sesión
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="mt-5 px-4 text-center text-[11px] leading-relaxed text-muted-foreground/70">
          Al registrarte, aceptas nuestros{' '}
          <a href="#" className="underline underline-offset-2 hover:text-muted-foreground">
            Términos
          </a>{' '}
          y nuestra{' '}
          <Link
            href="/privacidad"
            className="underline underline-offset-2 hover:text-muted-foreground"
          >
            Política de Privacidad
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
