// Página de Contacto — Economato Universitario (UASD)
// Reproduce el contenido institucional publicado en https://uasd.edu.do/economato/
// Sigue el mismo lenguaje visual usado en el resto del sitio (ver app/(store)/categories/page.tsx):
// header con breadcrumb, tipografía uppercase para etiquetas y componentes Card de shadcn.

import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ─── Datos de contenido ──────────────────────────────────────────
// Se centraliza el texto institucional en constantes para que la página
// sea fácil de leer, reutilizar y actualizar sin tocar el markup.

const HERO_IMAGE = {
  src: 'https://zdnhvnvrngxvxedrvuon.supabase.co/storage/v1/object/public/bucket1/nextjs/Economato-univ-2048x1144.jpg',
  fallback:
    'https://zdnhvnvrngxvxedrvuon.supabase.co/storage/v1/object/public/bucket1/nextjs/Economato-univ-2048x1144.jpg',
  alt: 'Fachada del Economato Universitario de la UASD',
};

const OBJETIVO_GENERAL =
  'Servir a la Universidad de instancia expedita para ésta llevar a cabo una valiosa ' +
  'contribución al desarrollo mediante la promoción de iniciativas emanadas de su capital ' +
  'humano y al servicio de los estudiantes y publico en general que los requieran.';

const SERVICIOS =
  'Somos la Tienda; Librería & Papelería de la Universidad Autónoma de Santo Domingo (UASD).';

const VISION =
  'Ser reconocido como un órgano centrado en promover aspectos medulares en el ámbito de esta ' +
  'academia, tales como la producción intelectual de su capital humano en materia de propiedad ' +
  'industrial, el emprendimiento y la transformación del conocimiento en innovación tecnológica, ' +
  'para de esta manera posibilitarle a la Universidad en lo adelante, una mayor contribución para ' +
  'con el desarrollo nacional.';

const OBJETIVOS_ESPECIFICOS: string[] = [
  'Contribuir, dentro de la extensa comunidad universitaria, a la conformación de una cultura investigadora en los distintos ámbitos de la tecnología.',
  'Hacer de la Universidad una plataforma activa en la identificación y desarrollo de nuevos negocios.',
  'Conformar una instancia que asuma todo lo que tiene que ver con la protección de los derechos de la propiedad intelectual que genera la Universidad.',
  'Hacer del aparato productivo nacional un ámbito predilecto para la materialización de valiosos aportes en lo que respecta a la adaptación y a la transferencia de tecnología.',
  'Lograr la consolidación de los lazos de cooperación entre la Universidad y las demás instituciones del sistema nacional de innovación.',
];

const NATURALEZA_ENTIDAD =
  'El Economato Universitario es una entidad de servicios, aprobada por el poder ejecutivo ' +
  '(según establece el artículo 68 de la ley de Organización de Universidades) mediante oficio ' +
  'No. 7518 d/f 25/02/49, para que se creara dentro de la Biblioteca Universitaria, con el ' +
  'propósito de ofrecer facilidades, única y exclusivamente a los Sectores de la Universidad ' +
  '(Estudiantes, Profesores y Empleados), en la adquisición de Libros, Materiales Didácticos, ' +
  'Instrumentos, Medicinas y Otros Bienes de Consumo, y como tal deberá ser administrado con ' +
  'criterio económico de autosuficiencia.';

const NATURALEZA_ENTIDAD_PARRAFO_2 =
  'Esta entidad se caracteriza por ser independiente en sus operaciones, pero sus políticas y ' +
  'normas que la rigen están enmarcadas dentro de los lineamientos generales establecidos por la UASD.';

const ESTRUCTURA_ENTIDAD: string[] = [
  'Consejo de Administración',
  'Administración — Unidad de apoyo Administrativo, Compras, Almacén',
  'Sección de Expendio — Librería, Papelería, Farmacia, Centros de Servicios',
  'Sección Financiera — Contabilidad, Tesorería',
  'Auditoría Interna',
];

const HORARIO = '7:30 AM hasta las 6:00 PM de Lunes a Viernes';

interface ContactoDepartamento {
  departamento: string;
  extension: string;
  email: string;
}

const CONTACTOS: ContactoDepartamento[] = [
  {
    departamento: 'Secretaria',
    extension: '(809) 535-1097',
    // El correo original está protegido contra spam en el sitio de la UASD
    // y no se expone en texto plano; se enlaza a la página oficial de contacto.
    email: 'Disponible en el portal oficial de la UASD',
  },
];

// ─── Sub-componentes reutilizables ───────────────────────────────

/** Etiqueta uppercase usada como encabezado de sección, siguiendo el estilo del resto del sitio. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-xs font-bold tracking-wider text-[#747781] uppercase">{children}</p>
  );
}

/** Bloque de texto con etiqueta + párrafo, para secciones simples como Objetivo General o Visión. */
function TextSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <SectionLabel>{label}</SectionLabel>
      <p className="leading-relaxed text-foreground/80">{children}</p>
    </section>
  );
}

// ─── Página principal ─────────────────────────────────────────────

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Encabezado institucional con breadcrumb */}
      <header className="mb-10 border-b border-[#e2e8f0] pb-6">
        <nav aria-label="breadcrumb" className="mb-2 text-xs text-[#747781]">
          <Link href="/" className="hover:text-foreground hover:underline">
            Inicio
          </Link>
          <span className="mx-2">»</span>
          <span>Economato Universitario</span>
        </nav>

        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Economato Universitario
        </h1>
        <p className="mt-2 text-sm text-[#747781]">Universidad Autónoma de Santo Domingo (UASD)</p>
      </header>

      {/* Imagen institucional */}
      <div className="mb-12 overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <Image
          src={HERO_IMAGE.src}
          alt={HERO_IMAGE.alt}
          width={1400}
          height={700}
          className="h-auto w-full object-cover"
          priority
        />
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Objetivo general y servicios */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <TextSection label="Objetivo General">{OBJETIVO_GENERAL}</TextSection>
          <TextSection label="Servicios">{SERVICIOS}</TextSection>
        </div>

        {/* Visión */}
        <TextSection label="Visión">{VISION}</TextSection>

        {/* Objetivos específicos */}
        <section>
          <SectionLabel>Objetivos Específicos</SectionLabel>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed text-foreground/80">
            {OBJETIVOS_ESPECIFICOS.map(objetivo => (
              <li key={objetivo}>{objetivo}</li>
            ))}
          </ul>
        </section>

        {/* Naturaleza de la entidad */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Naturaleza de la Entidad</CardTitle>
            <CardDescription>Marco legal y estructura organizativa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-foreground/80">
            <p>{NATURALEZA_ENTIDAD}</p>
            <p>{NATURALEZA_ENTIDAD_PARRAFO_2}</p>

            <div>
              <SectionLabel>
                El Economato Universitario está estructurado de la siguiente forma
              </SectionLabel>
              <ul className="list-disc space-y-1 pl-5">
                {ESTRUCTURA_ENTIDAD.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Horarios y contactos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Horarios y Contactos</CardTitle>
            <CardDescription>{HORARIO}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Extensión</TableHead>
                  <TableHead>Correo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CONTACTOS.map(contacto => (
                  <TableRow key={contacto.departamento}>
                    <TableCell className="font-medium">{contacto.departamento}</TableCell>
                    <TableCell>
                      <a
                        href={`tel:${contacto.extension.replace(/[^\d+]/g, '')}`}
                        className="hover:underline"
                      >
                        {contacto.extension}
                      </a>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <Link
                        href="https://uasd.edu.do/contactos/"
                        className="hover:underline"
                        target="_blank"
                      >
                        {contacto.email}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
