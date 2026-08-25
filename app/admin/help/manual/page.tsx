import { Download } from 'lucide-react';

const SECTIONS = [
  { id: 'informacion-general', title: '1. Información General' },
  { id: 'acceso-al-sistema', title: '2. Acceso al Sistema' },
  { id: 'modulo-plataforma', title: '3. Módulo I: Plataforma (Operaciones)' },
  { id: 'modulo-administracion', title: '4. Módulo II: Administración y Seguridad' },
  { id: 'modulo-reportes', title: '5. Módulo III: Reportes y Auditoría' },
  { id: 'soporte-tecnico', title: '6. Soporte Técnico y Asistencia' },
];

const MANUAL_PDF_URL =
  'https://zdnhvnvrngxvxedrvuon.supabase.co/storage/v1/object/public/bucket1/manual/Manual%20Operativo%20-%20Buyfast%20Economato.pdf';

export default function ManualOperativoPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-sans font-bold text-[#00193c] tracking-tight">
            Manual Operativo de Usuario
          </h1>
          <p className="text-[13px] font-sans text-[#747781] mt-1">
            BuyFast Económato (UASD) — Manual de Operaciones y Procesos, Versión 1.1
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={MANUAL_PDF_URL}
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#002d62] text-white rounded-md text-[13px] font-semibold hover:bg-[#00193c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-2 shadow-sm"
          >
            <Download className="size-4" />
            Descargar PDF
          </a>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">
        {/* Table of contents */}
        <nav className="lg:sticky lg:top-8 bg-white rounded-lg border border-[#e0e3e5] p-4">
          <p className="text-[11px] font-semibold text-[#747781] uppercase tracking-wider mb-3">
            Contenido
          </p>
          <ul className="space-y-1">
            {SECTIONS.map(section => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block px-2 py-1.5 rounded-md text-[13px] text-[#43474f] hover:bg-[#f2f4f6] hover:text-[#002d62] transition-colors"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex flex-col gap-4">
          <section
            id="informacion-general"
            className="bg-white rounded-lg border border-[#e0e3e5] p-6 scroll-mt-8"
          >
            <h2 className="text-lg font-sans font-bold text-[#00193c] mb-4">
              1. Información General
            </h2>

            <h3 className="text-sm font-semibold text-[#191c1e] mb-2">1.1. Objetivo del Manual</h3>
            <p className="text-[13px] text-[#43474f] leading-relaxed mb-4">
              Proveer una guía estandarizada, estructurada y de fácil comprensión para la correcta
              operación del sistema <strong>BUYFAST ECONOMATO</strong>. Este documento garantiza que
              los procesos de ventas, administración de inventarios y control de personal se
              ejecuten bajo los lineamientos institucionales establecidos.
            </p>

            <h3 className="text-sm font-semibold text-[#191c1e] mb-2">
              1.2. Alcance y Usuarios Destinatarios
            </h3>
            <p className="text-[13px] text-[#43474f] leading-relaxed mb-2">
              Este manual es de aplicación obligatoria para todo el personal que interactúe con el
              sistema, incluyendo:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[13px] text-[#43474f] leading-relaxed mb-4">
              <li>
                <strong>Cajeros y Representantes de Servicio:</strong> Orientados a módulos de
                Clientes, Órdenes y Catálogo.
              </li>
              <li>
                <strong>Supervisores y Administradores de Almacén:</strong> Orientados a Inventario,
                Productos y Movimientos.
              </li>
              <li>
                <strong>Gerencia y Auditoría:</strong> Orientados a Reportes, Dashboard y Registros
                de Actividad.
              </li>
            </ul>

            <h3 className="text-sm font-semibold text-[#191c1e] mb-2">1.3. Normas de Seguridad</h3>
            <div className="bg-[#fef7e0] border border-[#feefc3] rounded-md px-4 py-3 text-[13px] text-[#43474f] leading-relaxed">
              <strong className="text-[#b06000]">IMPORTANTE:</strong> Las credenciales de acceso son
              de uso estrictamente personal e intransferible. Todo movimiento en el sistema
              (creación, edición, eliminación o cobro) queda registrado bajo el perfil del usuario
              activo en el módulo de auditoría (Log).
            </div>
          </section>

          <section
            id="acceso-al-sistema"
            className="bg-white rounded-lg border border-[#e0e3e5] p-6 scroll-mt-8"
          >
            <h2 className="text-lg font-sans font-bold text-[#00193c] mb-4">
              2. Acceso al Sistema
            </h2>
            <p className="text-[13px] font-semibold text-[#191c1e] mb-2">
              Procedimiento de Autenticación:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-[13px] text-[#43474f] leading-relaxed">
              <li>
                Ingrese a través de un navegador web autorizado (se recomienda Google Chrome o
                Mozilla Firefox) a la dirección URL oficial del sistema.
              </li>
              <li>Haga clic en el ícono de usuario, en la esquina superior derecha.</li>
              <li>Seleccione &ldquo;Iniciar sesión&rdquo;.</li>
              <li>
                En la interfaz de inicio de sesión, introduzca su <strong>Nombre de Usuario</strong>{' '}
                y su <strong>Contraseña</strong> de seguridad.
              </li>
              <li>
                Presione el botón <strong>Ingresar</strong>.
              </li>
              <li>
                En caso de pérdida de credenciales, no intente acceder repetidamente. Contacte
                inmediatamente al administrador del sistema para el reseteo de clave o agote el
                proceso llamado &ldquo;Olvidé contraseña&rdquo;.
              </li>
            </ol>
          </section>

          <section
            id="modulo-plataforma"
            className="bg-white rounded-lg border border-[#e0e3e5] p-6 scroll-mt-8"
          >
            <h2 className="text-lg font-sans font-bold text-[#00193c] mb-4">
              3. Módulo I: Plataforma (Operaciones)
            </h2>
            <p className="text-[13px] text-[#43474f] leading-relaxed mb-6">
              Este módulo consolida las herramientas funcionales para el ciclo operativo diario del
              económato. Se accede a través del ícono de usuario y luego &ldquo;Panel de
              administración&rdquo;.
            </p>

            <h3 className="text-sm font-semibold text-[#191c1e] mb-2">
              3.1. Panel Principal (Dashboard Admin)
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-[13px] text-[#43474f] leading-relaxed mb-6">
              <li>
                <strong>Propósito:</strong> Proveer inteligencia de negocios (BI) en tiempo real.
              </li>
              <li>
                <strong>Funcionalidades:</strong> Despliega indicadores clave de rendimiento (KPIs)
                mediante gráficos y métricas consolidadas.
              </li>
              <li>
                <strong>Información visible:</strong> Ventas brutas diarias, número de órdenes
                procesadas, alertas de inventario crítico (bajo stock) y rendimiento general.
              </li>
            </ul>

            <h3 className="text-sm font-semibold text-[#191c1e] mb-2">3.2. Gestión de Clientes</h3>
            <p className="text-[13px] text-[#43474f] leading-relaxed mb-2">
              Módulo destinado a la administración de la base de datos de consumidores
              institucionales y particulares.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[13px] text-[#43474f] leading-relaxed mb-6">
              <li>
                <strong>Directorio:</strong>
                <ul className="list-[circle] pl-5 mt-1.5 space-y-1.5">
                  <li>
                    <strong>Nuevo usuario:</strong> Permite el registro de nuevos perfiles. Requiere
                    completar información demográfica y de contacto.
                  </li>
                  <li>
                    <strong>Info:</strong> Facilita la edición y actualización periódica de los
                    datos del cliente para asegurar una comunicación efectiva.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Órdenes:</strong>
                <ul className="list-[circle] pl-5 mt-1.5 space-y-1.5">
                  <li>Bandeja centralizada de solicitudes de compra.</li>
                  <li>
                    Permite el seguimiento del ciclo de vida del pedido dando clic en el botón
                    Detalle de cada pedido:{' '}
                    <em>Solicitado &gt; Pendiente &gt; Completado / Cancelación</em>.
                  </li>
                </ul>
              </li>
            </ul>

            <h3 className="text-sm font-semibold text-[#191c1e] mb-2">3.3. Gestión de Empleados</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-[13px] text-[#43474f] leading-relaxed mb-6">
              <li>
                Exclusivo para el departamento de Recursos Humanos o Administradores de Sucursal.
              </li>
              <li>
                Permite la creación de expedientes digitales de los colaboradores, asignación de
                turnos laborales, cargos y gestión del estado (Activo/Inactivo) del trabajador
                dentro de la plataforma.
              </li>
            </ul>

            <h3 className="text-sm font-semibold text-[#191c1e] mb-2">3.4. Gestión de Productos</h3>
            <p className="text-[13px] text-[#43474f] leading-relaxed mb-2">
              Control maestro de la mercancía comercializada por el económato.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[13px] text-[#43474f] leading-relaxed mb-6">
              <li>
                <strong>Categorías:</strong> Estructuración jerárquica del almacén. Permite agrupar
                los artículos por familias (ej.: Material Gastable, Limpieza, Tecnología) para
                optimizar los reportes y la búsqueda.
              </li>
              <li>
                <strong>Catálogo:</strong> Registro individual de artículos (SKU). Campos
                obligatorios: Nombre, Categoría, Slug del producto, Descripción, Precio de venta,
                ITBIS.
              </li>
            </ul>

            <h3 className="text-sm font-semibold text-[#191c1e] mb-2">
              3.5. Control de Inventario
            </h3>
            <p className="text-[13px] text-[#43474f] leading-relaxed mb-2">
              Módulo crítico para el aseguramiento de los activos físicos de la institución.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[13px] text-[#43474f] leading-relaxed">
              <li>
                <strong>Estado Actual:</strong> Vista tabular detallada de las existencias actuales,
                con métricas de monitoreo financiero y operativo inmediato: Cantidad total de
                productos, Stock bajo, Sin stock y el Valor total del inventario. La tabla permite
                una gestión precisa por nombre, SKU, cantidad disponible y precio, con etiquetas de
                estado por color y el botón <strong>Info</strong> para configuraciones avanzadas del
                artículo.
              </li>
              <li>
                <strong>Movimientos:</strong> Permite registrar manualmente la entrada o salida de
                productos. Incluye un buscador predictivo por nombre, SKU o referencia y filtros
                avanzados. La tabla muestra fecha, producto, tipo de movimiento (ej. Customer Sell),
                cantidad afectada, precio unitario, balance resultante del inventario y número de
                referencia, con un botón &ldquo;Detalle&rdquo; por línea para consultar la
                transacción específica.
              </li>
            </ul>
          </section>

          <section
            id="modulo-administracion"
            className="bg-white rounded-lg border border-[#e0e3e5] p-6 scroll-mt-8"
          >
            <h2 className="text-lg font-sans font-bold text-[#00193c] mb-4">
              4. Módulo II: Administración y Seguridad
            </h2>
            <h3 className="text-sm font-semibold text-[#191c1e] mb-2">4.1. Perfiles de Acceso</h3>
            <p className="text-[13px] text-[#43474f] leading-relaxed mb-2">
              Garantiza el principio de &ldquo;Menor Privilegio&rdquo;, asegurando que cada usuario
              acceda únicamente a la información que su rol requiere.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[13px] text-[#43474f] leading-relaxed">
              <li>
                <strong>Gestión de Perfiles:</strong> Permite definir matrices de roles
                (Administrador General, Auditor, Cajero, Operario de Almacén).
              </li>
              <li>
                La asignación de permisos es granular (módulo por módulo). Posteriormente, estos
                perfiles se vinculan a los usuarios en la Gestión de Personal.
              </li>
            </ul>
          </section>

          <section
            id="modulo-reportes"
            className="bg-white rounded-lg border border-[#e0e3e5] p-6 scroll-mt-8"
          >
            <h2 className="text-lg font-sans font-bold text-[#00193c] mb-4">
              5. Módulo III: Reportes y Auditoría
            </h2>
            <p className="text-[13px] text-[#43474f] leading-relaxed mb-4">
              Sección diseñada para la extracción de datos gerenciales, toma de decisiones y control
              interno. Todos los reportes permiten filtrado por rango de fechas y exportación en
              formatos estándar (PDF, Excel).
            </p>

            <h3 className="text-sm font-semibold text-[#191c1e] mb-2">
              5.1. Generación y Exportación de Datos
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-[13px] text-[#43474f] leading-relaxed mb-6">
              <li>
                <strong>Pedidos:</strong> Detalle transaccional de facturación y estatus de órdenes.
              </li>
              <li>
                <strong>Inventario (Estado):</strong> Corte de caja del inventario. Muestra la
                valoración financiera del almacén a costo actual y cantidades físicas en un momento
                determinado.
              </li>
              <li>
                <strong>Inventario (Movimientos):</strong> Kardex general. Detalla el histórico de
                fluctuaciones (entradas y salidas) por producto, esencial para cuadres mensuales y
                auditorías sorpresa.
              </li>
              <li>
                <strong>Empleados / Clientes:</strong> Generación de sábanas de datos para análisis
                de cartera, proyecciones de venta por cliente y listas de personal.
              </li>
            </ul>

            <h3 className="text-sm font-semibold text-[#191c1e] mb-2">5.2. Trazabilidad</h3>
            <p className="text-[13px] font-semibold text-[#191c1e] mb-1">
              Registro de Actividad (Log):
            </p>
            <p className="text-[13px] text-[#43474f] leading-relaxed">
              Sistema automatizado que captura eventos del sistema a nivel de usuario, fecha, hora,
              dirección IP y acción ejecutada (Creación, Lectura, Actualización, Eliminación —
              CRUD).
            </p>
          </section>

          <section
            id="soporte-tecnico"
            className="bg-white rounded-lg border border-[#e0e3e5] p-6 scroll-mt-8"
          >
            <h2 className="text-lg font-sans font-bold text-[#00193c] mb-4">
              6. Soporte Técnico y Asistencia
            </h2>
            <p className="text-[13px] text-[#43474f] leading-relaxed mb-4">
              En caso de incidentes con la plataforma, lentitud inusual, o dudas que no puedan ser
              resueltas mediante la consulta de este manual operativo:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-[13px] text-[#43474f] leading-relaxed">
              <li>
                <strong>Consulta Digital:</strong> Haga clic en la opción &ldquo;Manual
                Operativo&rdquo; al final del menú de navegación para acceder a esta guía en
                cualquier momento.
              </li>
              <li>
                <strong>Escalamiento Técnico:</strong> Para fallas del sistema o recuperación de
                cuentas, abra un ticket de servicio contactando al Departamento de Tecnologías de la
                Información (TI) / Soporte Técnico.
                <p className="italic mt-1">
                  Nota: Tenga a mano capturas de pantalla del error y una breve descripción del
                  proceso que intentaba realizar al momento del fallo.
                </p>
              </li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
