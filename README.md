# BuyFast — Frontend

Tienda en línea y panel de administración del Económato de la Universidad
Autónoma de Santo Domingo (UASD): los estudiantes exploran el catálogo,
compran en línea y retiran su pedido en persona en el Económato.

El backend es un servicio en Django/DRF que este proyecto consume a través
de sus propias Route Handlers bajo `/api/v1/`.

---

## Stack técnico

- **Next.js 16** (App Router), **React 19**, **TypeScript**, gestionado con
  **pnpm**.
- **Tailwind CSS v4**, con componentes construidos sobre primitivas de
  shadcn/radix-ui.
- Arquitectura ligera basada en `fetch` nativo y hooks de React — sin
  dependencias externas de manejo de estado o data-fetching, lo que mantiene
  el bundle liviano y el proyecto fácil de mantener.
- Dashboards administrativos con gráficos SVG propios, sin librerías de
  terceros.

## Instalación y ejecución local

```bash
pnpm install
cp .env .env.local   # o crear .env.local con las variables de abajo
pnpm dev
```

Variables de entorno:

- `NEXT_PUBLIC_API_URL` / `DJANGO_API_URL` / `BACKEND_URL` — URL del backend
  Django.
- `FRONTEND_URL` — origen de la aplicación, usado en las peticiones
  autenticadas hacia el backend.
- `NEXT_PUBLIC_COMPANY_NAME` — nombre mostrado en la interfaz.
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` — client ID de PayPal para el checkout.

## Modelo de autenticación

Autenticación segura basada en cookies de sesión de Django con protección
CSRF:

1. Django emite una cookie de sesión al iniciar sesión.
2. Las Route Handlers bajo `app/api/v1/**/route.ts` actúan como proxy hacia
   el backend, reenviando las cookies de autenticación de forma transparente
   para el usuario.
3. Las rutas de administración están protegidas por layout, verificando la
   sesión y el rol del usuario antes de renderizar contenido sensible.

## Arquitectura del proyecto

```
app/                 Rutas del App Router.
  (store)/            Tienda pública.
  admin/              Panel de administración.
  api/                Route Handlers (capa de integración con el backend).
components/          Componentes React compartidos; components/ui/ = shadcn.
entities/            Tipos de dominio compartidos (product.ts, user.ts).
features/            Módulos por funcionalidad (cart/, admin/inventory/), cada
                      uno con su propio service/ y types/.
hooks/               Hooks compartidos (useMediaQuery, useSidebar, etc.).
lib/                 Utilidades de formato y helpers de datos compartidos.
services/            Clientes de API basados en clases (auth/, checkout/,
                      products/, user/).
```

## Funcionalidades

### Tienda pública
- Home, catálogo y categorías de productos, página de producto, búsqueda.
- Carrito de compras y checkout con pago en línea vía PayPal.
- Selección de horario de retiro entre los próximos 7 días hábiles, de
  8:00 a.m. a 5:00 p.m.
- Cuenta del cliente: datos personales e historial de pedidos.
- Registro, inicio/cierre de sesión, verificación de correo y recuperación
  de contraseña.
- Páginas informativas: contacto, entrega, FAQ, políticas, privacidad,
  seguridad.

### Panel de administración
- Dashboard ejecutivo con resumen general, estadísticas y reportes.
- Gestión de productos: catálogo, categorías, creación/edición, importación
  masiva por CSV.
- Gestión de inventario en tiempo real, con historial de movimientos de
  stock.
- Gestión de pedidos de clientes.
- Gestión de usuarios, perfiles y empleados.
- Reportes exportables (clientes, empleados, inventario, actividad del
  sistema).
- Manual de ayuda integrado para el personal.

## Despliegue

Aplicación Next.js estándar, lista para desplegarse en Vercel o cualquier
plataforma compatible con Node.js.
