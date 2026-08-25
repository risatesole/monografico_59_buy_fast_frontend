// Página de Política de Privacidad — Ecónomato Universitario (UASD BuyFast)
// Enlazada desde el footer del sitio (components/Footer.tsx -> "/privacidad").
// Sigue el mismo lenguaje visual usado en app/(store)/contact/page.tsx:
// header con breadcrumb, etiquetas uppercase y componentes Card de shadcn.

import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LAST_UPDATED = '6 de agosto de 2026';

interface PolicySection {
  title: string;
  paragraphs: string[];
  list?: string[];
}

const SECTIONS: PolicySection[] = [
  {
    title: '1. Información General',
    paragraphs: [
      'El Ecónomato Universitario de la Universidad Autónoma de Santo Domingo (UASD) opera ' +
        'esta plataforma en línea (UASD BuyFast) para que estudiantes, profesores y empleados ' +
        'puedan consultar el catálogo, realizar pedidos y pagarlos en línea para su posterior ' +
        'retiro en las instalaciones del Ecónomato.',
      'Esta Política de Privacidad describe qué información personal recopilamos, cómo la ' +
        'usamos y protegemos, y qué derechos tiene usted sobre sus propios datos al utilizar ' +
        'nuestros servicios.',
    ],
  },
  {
    title: '2. Información que Recopilamos',
    paragraphs: ['Al crear una cuenta o realizar un pedido, recopilamos:'],
    list: [
      'Nombre, apellido y correo electrónico.',
      'Matrícula o cédula de identidad, para verificar su condición de estudiante, profesor o empleado.',
      'Número de teléfono, para coordinar la entrega o el retiro del pedido.',
      'Información de pago, procesada directamente por la pasarela de pago; no almacenamos ' +
        'números de tarjeta en nuestros servidores.',
      'Historial de pedidos y artículos guardados en el carrito de compras.',
    ],
  },
  {
    title: '3. ¿Para Qué Usamos su Información?',
    paragraphs: ['Utilizamos su información personal para:'],
    list: [
      'Procesar y confirmar sus pedidos y pagos.',
      'Coordinar el retiro de sus productos en el Ecónomato.',
      'Enviarle notificaciones sobre el estado de su pedido.',
      'Gestionar su cuenta y el inventario del catálogo.',
      'Cumplir con los requerimientos legales e institucionales de la UASD.',
    ],
  },
  {
    title: '4. Protección de sus Datos',
    paragraphs: [
      'Aplicamos medidas técnicas y administrativas razonables para proteger su información: ' +
        'conexiones cifradas (HTTPS), autenticación mediante sesión segura y acceso restringido ' +
        'al panel administrativo únicamente a personal autorizado del Ecónomato.',
    ],
  },
  {
    title: '5. Compartir Información con Terceros',
    paragraphs: [
      'No vendemos, alquilamos ni compartimos su información personal con fines comerciales. ' +
        'Solo la compartimos con proveedores de servicios de pago, para procesar sus ' +
        'transacciones, o cuando la ley o una autoridad competente lo requiera.',
    ],
  },
  {
    title: '6. Cookies',
    paragraphs: [
      'Usamos cookies necesarias para mantener su sesión iniciada y proteger los formularios ' +
        'del sitio. Puede aceptar o rechazar las cookies no esenciales desde el aviso que ' +
        'aparece al visitar el sitio por primera vez.',
    ],
  },
  {
    title: '7. Derechos del Usuario',
    paragraphs: [
      'De conformidad con la Ley No. 172-13 sobre Protección de Datos de Carácter Personal de ' +
        'la República Dominicana, usted tiene derecho a acceder, rectificar y solicitar la ' +
        'eliminación de sus datos personales, así como a retirar su consentimiento en cualquier ' +
        'momento. Para ejercer estos derechos, contáctenos a través de los medios indicados en ' +
        'la sección siguiente.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-[#e0e3e5] pb-6">
        <nav aria-label="breadcrumb" className="mb-2 text-xs text-[#747781]">
          <Link href="/" className="hover:text-foreground hover:underline">
            Inicio
          </Link>
          <span className="mx-2">»</span>
          <span>Política de Privacidad</span>
        </nav>

        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Política de Privacidad
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
              {section.list && (
                <ul className="list-disc space-y-1 pl-5">
                  {section.list.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">8. Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-foreground/80">
            <p>
              Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos
              sobre sus datos personales, comuníquese con nosotros:
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
                Llamando a la Secretaría del Ecónomato al{' '}
                <a
                  href="tel:+18095351097"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  (809) 535-1097
                </a>
                .
              </li>
              <li>
                A través del{' '}
                <Link
                  href="https://uasd.edu.do/contactos/"
                  target="_blank"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  portal oficial de contacto de la UASD
                </Link>
                .
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">9. Cambios a esta Política</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-foreground/80">
            <p>
              Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier
              momento. Cualquier cambio será publicado en esta misma página junto con la fecha de su
              última actualización.
            </p>
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
