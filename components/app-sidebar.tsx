'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback, memo } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  ChevronDown,
  Menu,
  Truck,
  FileBarChart,
  LucideIcon,
} from 'lucide-react';
import type { User } from '@/entities/user';
import { hasPermission, isSuperuser, type PermissionCode } from '@/lib/permissions';

// ─── Tipado Estricto ────────────────────────────────────────────────────────

interface NavigationSubItem {
  title: string;
  url: string;
  permission?: PermissionCode | PermissionCode[];
  superuserOnly?: boolean;
}

interface NavigationItem {
  id: string;
  title: string;
  url?: string;
  icon: LucideIcon;
  sub?: NavigationSubItem[];
  permission?: PermissionCode | PermissionCode[];
  superuserOnly?: boolean;
}

function isVisibleTo(
  user: User,
  permission?: PermissionCode | PermissionCode[],
  superuserOnly?: boolean
): boolean {
  if (superuserOnly) return isSuperuser(user);
  if (!permission) return true;
  return Array.isArray(permission)
    ? permission.every(code => hasPermission(user, code))
    : hasPermission(user, permission);
}

// ─── Estructuras de Datos Estáticas ────────────────────────────────────────

const PLATFORM_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Panel Principal',
    url: '/admin',
    icon: LayoutDashboard,
  },
  {
    id: 'customers',
    title: 'Clientes',
    url: '/admin/customer',
    icon: Users,
    sub: [
      { title: 'Directorio', url: '/admin/customers' },
      { title: 'Órdenes', url: '/admin/customers/orders' },
    ],
    permission: 'customers.view',
  },
  {
    id: 'employees',
    title: 'Empleados',
    icon: Users,
    sub: [{ title: 'Gestión de Personal', url: '/admin/employee' }],
    permission: 'employees.view',
  },
  {
    id: 'products',
    title: 'Productos',
    icon: Package,
    sub: [
      { title: 'Catálogo', url: '/admin/products' },
      { title: 'Categorías', url: '/admin/products/categories' },
    ],
    permission: 'products.view',
  },
  {
    id: 'inventory',
    title: 'Inventario',
    icon: Truck,
    sub: [
      { title: 'Estado Actual', url: '/admin/inventory' },
      { title: 'Movimientos', url: '/admin/inventory/stockmovement' },
    ],
    permission: 'inventory.view',
  },
  {
    id: 'profiles',
    title: 'Perfiles de Acceso',
    icon: Users,
    sub: [{ title: 'Gestión de Perfiles', url: '/admin/profiles' }],
    superuserOnly: true,
  },
  {
    id: 'reports',
    title: 'Reportes',
    icon: FileBarChart,
    // Each report type is gated by its own domain permission — a profile
    // only sees the report types it can actually generate. New report
    // types (inventory, employees, customers, ...) slot in here later,
    // each with their own `permission`.
    sub: [
      {
        title: 'Pedidos',
        url: '/admin/reports',
        permission: ['orders.view', 'reports.create'],
      },
      {
        title: 'Inventario: Estado Actual',
        url: '/admin/reports/inventory/stock',
        permission: ['inventory.view', 'reports.create'],
      },
      {
        title: 'Inventario: Movimientos',
        url: '/admin/reports/inventory/movements',
        permission: ['inventory.view', 'reports.create'],
      },
      {
        title: 'Empleados',
        url: '/admin/reports/employees',
        permission: ['employees.view', 'reports.create'],
      },
      {
        title: 'Clientes',
        url: '/admin/reports/customers',
        permission: ['customers.view', 'reports.create'],
      },
      {
        title: 'Registro de Actividad',
        url: '/admin/reports/logs',
        superuserOnly: true,
      },
    ],
  },
];

const HELP_ITEMS: NavigationSubItem[] = [{ title: 'Manual Operativo', url: '/admin/help/manual' }];

function getInitials(firstname: string, lastname: string): string {
  return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
}

// ─── Componentes Puros Memotizados ──────────────────────────────────────────

const BrandLogo = memo(() => (
  <Link
    href="/"
    className="flex h-full w-full items-center justify-center gap-3 bg-[#001530] px-4 transition-colors duration-200 hover:bg-[#002048] outline-none focus:ring-2 focus:ring-[#5891ff]"
    aria-label="Ir al inicio de UASD BuyFast"
  >
    <Image
      src="/image/logo_uasd.svg"
      alt="UASD Logo"
      width={140}
      height={36}
      className="h-8 w-auto object-contain shrink-0"
      priority
    />
    <div className="h-7 w-px bg-white/20 shrink-0" aria-hidden="true" />
    <div className="flex flex-col justify-center min-w-0">
      <span className="font-serif text-base font-bold tracking-widest text-white leading-tight uppercase truncate">
        BUYFAST
      </span>
      <span className="text-[9px] font-sans font-bold tracking-[0.2em] text-[#7d9ccb] leading-none uppercase mt-0.5 truncate">
        Economato
      </span>
    </div>
  </Link>
));
BrandLogo.displayName = 'BrandLogo';

// ─── Componente Principal ──────────────────────────────────────────────────

type AppSidebarProps = {
  user: User;
};

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [manuallyOpenAccordions, setManuallyOpenAccordions] = useState<Record<string, boolean>>({});

  const isPathActive = useCallback((url?: string) => !!url && pathname === url, [pathname]);
  const isSubPathActive = useCallback(
    (subItems?: NavigationSubItem[]) => subItems?.some(sub => pathname === sub.url) ?? false,
    [pathname]
  );

  useEffect(() => {}, [pathname]);

  const computeActiveAccordions = useCallback((): Record<string, boolean> => {
    const activeAccordions: Record<string, boolean> = {};
    PLATFORM_ITEMS.forEach(item => {
      if (item.sub && (isPathActive(item.url) || isSubPathActive(item.sub))) {
        activeAccordions[item.id] = true;
      }
    });
    return activeAccordions;
  }, [isPathActive, isSubPathActive]);

  const openAccordions: Record<string, boolean> = {
    ...computeActiveAccordions(),
    ...manuallyOpenAccordions,
  };

  const toggleAccordion = useCallback((id: string) => {
    setManuallyOpenAccordions(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const visibleItems = PLATFORM_ITEMS.map(item => {
    if (!item.sub) return item;
    const visibleSub = item.sub.filter(sub => isVisibleTo(user, sub.permission, sub.superuserOnly));
    return { ...item, sub: visibleSub };
  }).filter(item => {
    if (item.sub)
      return item.sub.length > 0 && isVisibleTo(user, item.permission, item.superuserOnly);
    return isVisibleTo(user, item.permission, item.superuserOnly);
  });

  return (
    <>
      {/* Backdrop Móvil */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#000d20]/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#001530] text-white
          border-r border-[#002554]
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
        aria-label="Barra lateral principal"
      >
        {/* Header Institucional */}
        <div className="h-20 border-b border-[#002554] w-full">
          <BrandLogo />
        </div>

        {/* Navegación Principal */}
        <nav className="flex flex-col gap-y-6 px-3 py-6 h-[calc(100%-5rem)] overflow-y-auto custom-scrollbar">
          {/* Sección: Plataforma */}
          <div>
            <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-[#7d9ccb]">
              Plataforma
            </p>
            <ul className="space-y-1.5">
              {visibleItems.map(item => {
                const Icon = item.icon;
                const hasSub = !!item.sub;
                const isOpen = openAccordions[item.id] || false;
                const isActiveModule = isPathActive(item.url) || isSubPathActive(item.sub);

                const baseClasses =
                  'w-full flex items-center gap-x-3 px-3.5 py-2.5 rounded-lg border-l-2 border-transparent text-sm font-medium transition-colors duration-150 outline-none';
                const activeClasses = isActiveModule
                  ? 'bg-[#5891ff]/12 border-[#5891ff] text-white'
                  : 'text-[#c7d6f0] hover:bg-white/5 hover:text-white';

                if (!hasSub) {
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.url ?? '#'}
                        className={`${baseClasses} ${activeClasses}`}
                        onClick={handleCloseMobileMenu}
                      >
                        <Icon
                          className={`size-5 shrink-0 ${isActiveModule ? 'text-[#5891ff]' : 'text-[#7d9ccb]'}`}
                        />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => toggleAccordion(item.id)}
                      className={`${baseClasses} ${activeClasses}`}
                      aria-expanded={isOpen}
                    >
                      <Icon
                        className={`size-5 shrink-0 ${isActiveModule ? 'text-[#5891ff]' : 'text-[#7d9ccb]'}`}
                      />
                      <span className="flex-1 text-left truncate">{item.title}</span>
                      <ChevronDown
                        className={`size-4 shrink-0 transition-transform duration-200 ${isOpen ? '-rotate-180' : ''} ${
                          isActiveModule ? 'text-[#5891ff]' : 'text-[#7d9ccb]'
                        }`}
                      />
                    </button>

                    {/* Sub-menú colapsable */}
                    {isOpen && (
                      <ul className="mt-1 space-y-0.5 pl-11 pr-2 animate-in fade-in duration-200">
                        {item.sub!.map(sub => {
                          const isSubActiveItem = isPathActive(sub.url);
                          return (
                            <li key={sub.url}>
                              <Link
                                href={sub.url}
                                onClick={handleCloseMobileMenu}
                                className={`
                                  block py-2 px-3 rounded-lg text-sm transition-colors truncate
                                  ${
                                    isSubActiveItem
                                      ? 'text-[#5891ff] font-semibold bg-white/5'
                                      : 'text-white hover:bg-white/5'
                                  }
                                `}
                              >
                                {sub.title}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Sección: Soporte */}
          <div>
            <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-[#7d9ccb]">
              Soporte
            </p>
            <ul className="space-y-1.5">
              {HELP_ITEMS.map(item => {
                const isActive = isPathActive(item.url);
                return (
                  <li key={item.url}>
                    <Link
                      href={item.url}
                      onClick={handleCloseMobileMenu}
                      className={`
                        block px-3.5 py-2.5 rounded-lg border-l-2 text-sm font-medium transition-colors duration-150 truncate
                        ${
                          isActive
                            ? 'border-[#5891ff] bg-[#5891ff]/12 text-white'
                            : 'border-transparent text-[#c7d6f0] hover:bg-white/5 hover:text-white'
                        }
                      `}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Sección Footer / Perfil de Usuario */}
          <div className="mt-auto pt-4 border-t border-[#002554]">
            <div className="px-2 py-2 flex items-center gap-x-3">
              <div className="size-10 rounded-lg bg-[#5891ff]/12 text-[#5891ff] text-sm font-semibold flex items-center justify-center shrink-0">
                {getInitials(user.firstname, user.lastname)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate leading-snug">
                  {user.firstname} {user.lastname}
                </p>
                <p className="text-xs text-[#7d9ccb] truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Botón Flotante Móvil */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-30 p-3.5 rounded-xl bg-[#5891ff] text-[#001530] shadow-xl hover:bg-[#437ff5] transition-colors outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5891ff]"
        aria-label="Abrir menú"
      >
        <Menu className="size-5" />
      </button>
    </>
  );
}
