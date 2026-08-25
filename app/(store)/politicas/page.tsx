// Página de Política de Devolución, Cancelación y Reembolso — Ecónomato Universitario (UASD BuyFast)
// Enlazada desde el footer del sitio (components/Footer.tsx -> "/politicas").
// Sigue el mismo lenguaje visual usado en app/(store)/privacidad/page.tsx y
// app/(store)/contact/page.tsx: header con breadcrumb y componentes Card de shadcn.

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
    title: '1. Política General',
    paragraphs: [
      'Esta política aplica a todos los pedidos realizados y pagados a través de UASD BuyFast ' +
        'para su retiro en las instalaciones del Ecónomato Universitario. Aceptamos cancelaciones ' +
        'y devoluciones bajo los plazos y condiciones descritos a continuación.',
    ],
  },
  {
    title: '2. Cancelaciones',
    paragraphs: [
      'Puede cancelar su pedido sin costo alguno mientras su estado en "Mis Pedidos" se muestre ' +
        'como Pendiente, es decir, mientras aún no haya sido preparado por el Ecónomato.',
      'Una vez que el pedido cambia a estado Completada (listo para retiro), ya no es posible ' +
        'cancelarlo desde la plataforma; en ese caso, contáctenos directamente para evaluar su caso.',
    ],
  },
  {
    title: '3. Devoluciones',
    paragraphs: [
      'Aceptamos devoluciones dentro de las 48 horas siguientes al retiro de su pedido en el ' +
        'Ecónomato, siempre que el producto se encuentre en su empaque original, sin abrir y sin ' +
        'señales de uso.',
    ],
    list: [
      'Los productos consumibles que hayan sido abiertos (artículos de higiene, medicamentos, ' +
        'alimentos) no son elegibles para devolución, por razones de salubridad.',
      'Los libros, cuadernos y materiales didácticos deben conservarse sin marcas, escritura ni ' +
        'daños para ser aceptados en devolución.',
    ],
  },
  {
    title: '4. Excepciones',
    paragraphs: [
      'La única excepción a los plazos anteriores son los defectos de fabricación o errores en ' +
        'la entrega (producto equivocado o dañado), sujetos a verificación del Ecónomato. Para ' +
        'estos casos:',
    ],
    list: [
      'Debe notificarnos dentro de las 24 horas siguientes al retiro del pedido.',
      'El producto debe estar sin usar y en las mismas condiciones en que fue entregado.',
      'Se requiere evidencia fotográfica o en video del defecto o del error en el pedido.',
    ],
  },
  {
    title: '5. Reembolsos',
    paragraphs: [
      'Una vez aprobada su devolución o cancelación, el reembolso se procesa a través de la ' +
        'misma pasarela de pago utilizada al momento de la compra, y se refleja en su método de ' +
        'pago original dentro de un plazo de 5 a 10 días hábiles.',
    ],
  },
  {
    title: '6. Recomendación al Cliente',
    paragraphs: [
      'Le recomendamos verificar la cantidad, edición o especificaciones del producto antes de ' +
        'confirmar su pedido. Si tiene dudas antes de comprar, puede escribirnos a través de ' +
        'nuestra página de Contacto y le ayudaremos a confirmar el producto correcto.',
    ],
  },
];

export default function ReturnsPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-[#e0e3e5] pb-6">
        <nav aria-label="breadcrumb" className="mb-2 text-xs text-[#747781]">
          <Link href="/" className="hover:text-foreground hover:underline">
            Inicio
          </Link>
          <span className="mx-2">»</span>
          <span>Política de Devolución, Cancelación y Reembolso</span>
        </nav>

        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Política de Devolución, Cancelación y Reembolso
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
            <CardTitle className="text-lg">7. Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-foreground/80">
            <p>
              Para solicitar una cancelación, devolución o reembolso, o si tiene dudas sobre esta
              política, comuníquese con nosotros:
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
                Desde la sección{' '}
                <Link
                  href="/account/orders"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Mis Pedidos
                </Link>{' '}
                de su cuenta, para consultar el estado de su pedido.
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
