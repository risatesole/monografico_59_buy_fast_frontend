// Página de Políticas de Seguridad — Ecónomato Universitario (UASD BuyFast)
// Enlazada desde el footer del sitio (components/Footer.tsx -> "/seguridad").
// Sigue el mismo lenguaje visual usado en app/(store)/privacidad/page.tsx,
// app/(store)/politicas/page.tsx y app/(store)/entrega/page.tsx: header con
// breadcrumb y componentes Card de shadcn.

import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LAST_UPDATED = '6 de agosto de 2026';

interface PolicySection {
  title: string;
  paragraphs: string[];
}

const SECTIONS: PolicySection[] = [
  {
    title: '1. En Nuestro Sitio Web',
    paragraphs: [
      'Toda la comunicación entre su navegador y nuestros servidores viaja cifrada mediante ' +
        'HTTPS. El inicio de sesión se gestiona mediante una sesión segura del lado del servidor, ' +
        'y cada acción que modifica sus datos (como confirmar un pedido) requiere un token de ' +
        'protección contra falsificación de solicitudes (CSRF).',
      'El acceso al panel administrativo del Ecónomato está restringido únicamente al personal ' +
        'autorizado, mediante cuentas independientes de las de los estudiantes.',
    ],
  },
  {
    title: '2. Pagos',
    paragraphs: [
      'El procesamiento de pagos se realiza a través de nuestra pasarela de pago, que cumple ' +
        'con sus propios estándares de seguridad y cifrado para transacciones con tarjeta. UASD ' +
        'BuyFast no almacena números de tarjeta de crédito o débito en sus servidores; esta ' +
        'información es manejada directamente por el proveedor de pagos.',
    ],
  },
  {
    title: '3. Su Cuenta',
    paragraphs: [
      'Recomendamos utilizar una contraseña única para su cuenta, no compartirla con terceros, y ' +
        'cerrar sesión al utilizar computadoras compartidas o de uso público, como las del ' +
        'Ecónomato o la Biblioteca Pedro Mir.',
    ],
  },
];

export default function SecurityPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-[#e0e3e5] pb-6">
        <nav aria-label="breadcrumb" className="mb-2 text-xs text-[#747781]">
          <Link href="/" className="hover:text-foreground hover:underline">
            Inicio
          </Link>
          <span className="mx-2">»</span>
          <span>Políticas de Seguridad</span>
        </nav>

        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Políticas de Seguridad
        </h1>
        <p className="mt-2 text-sm text-[#747781]">
          Ecónomato Universitario — Universidad Autónoma de Santo Domingo (UASD)
        </p>
        <p className="mt-1 text-xs text-[#747781]">Última actualización: {LAST_UPDATED}</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {SECTIONS.map(section => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-foreground/80">
              {section.paragraphs.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">4. Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-foreground/80">
            <p>
              Si detecta un problema de seguridad o tiene dudas sobre el manejo de su información,
              comuníquese con nosotros:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                A través de nuestra página de{' '}
                <Link
                  href="/contact"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Contacto
                </Link>
                .
              </li>
              <li>
                Consulte también nuestra{' '}
                <Link
                  href="/privacidad"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Política de Privacidad
                </Link>
                .
              </li>
              <li>
                Llamando a la Secretaría del Ecónomato al{' '}
                <a
                  href="tel:+18095351097"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  (809) 535-1097
                </a>
                .
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <p className="mt-12 border-t border-[#e0e3e5] pt-6 text-center text-xs text-[#747781]">
        Aviso: UASD BuyFast es un prototipo funcional desarrollado con fines de demostración (MVP) y
        no constituye una tienda en línea real operada oficialmente por el Ecónomato Universitario
        de la UASD.
      </p>
    </main>
  );
}
