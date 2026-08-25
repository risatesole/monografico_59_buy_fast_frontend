import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSection {
  title: string;
  items: FaqItem[];
}

const SECTIONS: FaqSection[] = [
  {
    title: 'Pedidos y Pagos',
    items: [
      {
        question: '¿Cómo realizo un pedido?',
        answer:
          'Explore el catálogo, agregue los productos deseados al carrito y complete el pago desde ' +
          'la sección de Checkout. Recibirá un código de retiro que deberá presentar en el Ecónomato.',
      },
      {
        question: '¿Qué métodos de pago aceptan?',
        answer:
          'Los pagos se procesan de forma segura a través de nuestra pasarela de pago en línea. ' +
          'No se realizan pagos en efectivo a través de la plataforma.',
      },
      {
        question: '¿Puedo cancelar mi pedido?',
        answer:
          'Sí, mientras su pedido esté en estado Pendiente puede cancelarlo sin costo desde ' +
          '"Mis Pedidos". Una vez preparado, contáctenos directamente.',
      },
    ],
  },
  {
    title: 'Retiro en el Ecónomato',
    items: [
      {
        question: '¿Dónde y cuándo retiro mi pedido?',
        answer:
          'El retiro se realiza en las instalaciones del Ecónomato Universitario, presentando su ' +
          'código de pedido. Consulte los horarios y detalles en la sección de Entrega y Retiro.',
      },
      {
        question: '¿Alguien más puede retirar mi pedido por mí?',
        answer: 'Sí, siempre que presente el código de retiro correspondiente a su pedido.',
      },
    ],
  },
  {
    title: 'Devoluciones y Reembolsos',
    items: [
      {
        question: '¿Puedo devolver un producto?',
        answer:
          'Sí, dentro de las 48 horas siguientes al retiro, siempre que el producto esté sin abrir ' +
          'y en su empaque original. Consulte todos los detalles en nuestra Política de Devolución.',
      },
      {
        question: '¿Cuánto tarda un reembolso?',
        answer:
          'Una vez aprobada la devolución, el reembolso se refleja en su método de pago original ' +
          'en un plazo de 5 a 10 días hábiles.',
      },
    ],
  },
  {
    title: 'Cuenta y Seguridad',
    items: [
      {
        question: '¿Necesito una cuenta para comprar?',
        answer: 'Sí, debe iniciar sesión con su cuenta de estudiante para realizar un pedido.',
      },
      {
        question: '¿Mis datos están protegidos?',
        answer:
          'Sí, seguimos buenas prácticas de seguridad para proteger su información. Puede leer más ' +
          'en nuestras páginas de Seguridad y Privacidad.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-[#e0e3e5] pb-6">
        <nav aria-label="breadcrumb" className="mb-2 text-xs text-[#747781]">
          <Link href="/" className="hover:text-foreground hover:underline">
            Inicio
          </Link>
          <span className="mx-2">»</span>
          <span>Preguntas Frecuentes</span>
        </nav>

        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Preguntas Frecuentes
        </h1>
        <p className="mt-2 text-sm text-[#747781]">
          Ecónomato Universitario — Universidad Autónoma de Santo Domingo (UASD)
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {SECTIONS.map(section => (
          <Card key={section.title}>
            <CardContent className="divide-y divide-[#e0e3e5]">
              <h2 className="pb-3 text-lg font-semibold text-foreground">{section.title}</h2>
              {section.items.map(item => (
                <details key={item.question} className="group py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-foreground">
                    {item.question}
                    <span className="shrink-0 text-[#747781] transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/80">{item.answer}</p>
                </details>
              ))}
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="space-y-3 text-sm leading-relaxed text-foreground/80">
            <p>¿No encontró la respuesta que buscaba?</p>
            <p>
              Visite nuestra página de{' '}
              <Link href="/contact" className="underline underline-offset-2 hover:text-foreground">
                Contacto
              </Link>{' '}
              o llame a la Secretaría del Ecónomato al{' '}
              <a
                href="tel:+18095351097"
                className="underline underline-offset-2 hover:text-foreground"
              >
                (809) 535-1097
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
