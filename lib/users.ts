export type User = {
  id: number;
  matricula: string; // ← AÑADIDO
  profilepicture: string | null;
  firstname: string;
  lastname: string;
  email: string;
  lastLoggedIn: string | null;
  status: boolean;
  is_active: boolean;
  institutionMember: boolean;
  role: string;
  permissions: string[];
  is_superuser: boolean;
  profile: { id: number; name: string; permissions: string[] } | null;
};

type FetchUserResponse = {
  success: boolean;
  data: User;
};

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * Server-to-server fetch of a single user. The Django view requires an
 * authenticated "employee" session, so we forward the incoming request's
 * cookie header along so the backend recognizes the session.
 */
export async function fetchUserFromBackend(
  id: string,
  cookieHeader?: string
): Promise<User | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/users/${id}/`, {
      headers: cookieHeader ? { Cookie: cookieHeader } : {},
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const json: FetchUserResponse = await response.json();
    return json.data;
  } catch (err) {
    console.error('Failed to fetch user from backend', err);
    return null;
  }
}

export const ROLE_LABELS: Record<string, string> = {
  employee: 'Empleado',
  customer: 'Cliente',
};

export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

export function getFullName(user: User): string {
  const first = user.firstname?.trim();
  const last = user.lastname?.trim();
  return [first, last].filter(Boolean).join(' ') || user.email;
}

export function getInitials(user: User): string {
  const first = user.firstname?.[0] ?? '';
  const last = user.lastname?.[0] ?? '';
  const initials = (first + last).toUpperCase();
  return initials || user.email[0]?.toUpperCase() || '?';
}

const APP_LABELS: Record<string, string> = {
  accounts: 'Cuentas y Usuarios',
  admin: 'Administración',
  auth: 'Autenticación',
  authtoken: 'Tokens de Acceso',
  cart: 'Carrito de Compras',
  contenttypes: 'Tipos de Contenido',
  inventory: 'Inventario',
  orders: 'Órdenes',
  payment: 'Pagos',
  products: 'Productos',
  sessions: 'Sesiones',
  taggit: 'Etiquetas',
};

export function getAppLabel(app: string): string {
  return APP_LABELS[app] ?? app;
}

/** Groups the flat Django permission codenames ("app.action_model") by app. */
export function groupPermissionsByApp(permissions: string[]): Record<string, string[]> {
  return permissions.reduce<Record<string, string[]>>((groups, permission) => {
    const [app] = permission.split('.');
    if (!groups[app]) groups[app] = [];
    groups[app].push(permission);
    return groups;
  }, {});
}
