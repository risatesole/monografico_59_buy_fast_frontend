// Página de Política de Entrega y Retiro — Ecónomato Universitario (UASD BuyFast)
// Enlazada desde el footer del sitio (components/Footer.tsx -> "/entrega").
// Sigue el mismo lenguaje visual usado en app/(store)/privacidad/page.tsx y
// app/(store)/politicas/page.tsx: header con breadcrumb y componentes Card de shadcn.

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
    title: '1. Modalidad de Entrega: Solo Retiro en el Ecónomato',
    paragraphs: [
      'UASD BuyFast no realiza envíos ni entregas a domicilio. Todos los pedidos pagados en ' +
        'línea se preparan y se entregan exclusivamente en las instalaciones del Ecónomato ' +
        'Universitario, en el horario de atención de 7:30 a.m. a 6:00 p.m., de lunes a viernes.',
    ],
  },
  {
    title: '2. Tiempo de Preparación',
    paragraphs: [
      'Su pedido se prepara en un plazo de 3 a 24 horas hábiles a partir de la confirmación del ' +
        'pago. Los pedidos realizados en fin de semana o días feriados comienzan a procesarse el ' +
        'siguiente día hábil.',
    ],
  },
  {
    title: '3. Costos',
    paragraphs: [
      'Al no existir envío físico, no se cobra ningún costo de despacho o transporte. El monto ' +
        'pagado en línea corresponde únicamente al precio de los productos.',
    ],
  },
  {
    title: '4. Seguimiento del Pedido',
    paragraphs: [
      'Puede consultar el estado de su pedido en cualquier momento desde la sección "Mis ' +
        'Pedidos" de su cuenta. Cuando el estado cambie a Completada, su pedido está listo para ' +
        'ser retirado.',
    ],
  },
  {
    title: '5. Condiciones para el Retiro',
    paragraphs: ['Al momento de retirar su pedido en el Ecónomato, debe presentar:'],
    list: [
      'Su carnet estudiantil o cédula de identidad.',
      'El número de pedido generado por la plataforma al momento de la compra.',
    ],
  },
  {
    title: '6. Plazo para el Retiro',
    paragraphs: [
      'Una vez que su pedido esté listo (estado Completada), dispone de 7 días calendario para ' +
        'retirarlo en el Ecónomato. Si el pedido no es retirado dentro de ese plazo, se cancelará ' +
        'y se procesará el reembolso correspondiente conforme a nuestra Política de Devolución, ' +
        'Cancelación y Reembolso.',
    ],
  },
];

export default function DeliveryPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-[#e0e3e5] pb-6">
        <nav aria-label="breadcrumb" className="mb-2 text-xs text-[#747781]">
          <Link href="/" className="hover:text-foreground hover:underline">
            Inicio
          </Link>
          <span className="mx-2">»</span>
          <span>Política de Entrega y Retiro</span>
        </nav>

        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Política de Entrega y Retiro
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
            <p>Si tiene dudas sobre el retiro de su pedido, comuníquese con nosotros:</p>
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
