'use client';

import { useState, useMemo, useCallback, useDeferredValue, memo, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ============================================================================
// CAPA DE DOMINIO Y TIPOS
// ============================================================================

interface ApiUser {
  id: number;
  profilepicture: string | null;
  firstname: string;
  lastname: string;
  email: string;
  lastLoggedIn: string;
  matricula: string; // ← AÑADIDO
  status: boolean;
  role: string;
  employee_profile: Record<string, unknown> | null;
}

interface ApiResponse {
  success: boolean;
  total: number;
  limit: number;
  offset: number;
  data: ApiUser[];
}

interface User {
  id: string;
  matricula: string; // ← AÑADIDO
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  lastActive: string;
  role: 'admin' | 'user' | 'moderator' | 'customer';
}

const USERS_PER_PAGE = 5;

// Diccionario de estilos con acceso O(1) para evitar recálculos en el render cycle
const STATUS_UI: Record<User['status'], { badge: string; dot: string; label: string }> = {
  active: {
    badge: 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]',
    dot: 'bg-[#1e8e3e]',
    label: 'Activo',
  },
  inactive: {
    badge: 'bg-[#f1f3f4] text-[#5f6368] border-[#e8eaed]',
    dot: 'bg-[#9aa0a6]',
    label: 'Inactivo',
  },
  pending: {
    badge: 'bg-[#fef7e0] text-[#b06000] border-[#feefc3]',
    dot: 'bg-[#f9ab00]',
    label: 'Pendiente',
  },
};

// ============================================================================
// COMPONENTES Puros (Memoizados)
// ============================================================================

interface UserTableRowProps {
  user: User;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onViewInfo: (id: string) => void;
}

const UserTableRow = memo(({ user, isSelected, onToggleSelect, onViewInfo }: UserTableRowProps) => {
  const statusConfig = STATUS_UI[user.status];

  return (
    <tr className="group border-b border-[#e0e3e5] bg-white hover:bg-[#f8fafd] transition-colors duration-150 ease-in-out">
      <td className="px-6 py-4 w-12">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(user.id)}
          className="size-4 cursor-pointer text-[#002d62] rounded-sm border-[#c4c6d1] focus:ring-[#002d62] transition-all"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold text-[#191c1e] tracking-tight">
            {user.name}
          </span>
          <span className="text-[12px] text-[#747781] mt-0.5">{user.email}</span>
          {/* ← AÑADIDO: Mostrar matrícula */}
          <span className="text-[11px] text-[#002d62] font-mono mt-0.5 bg-[#e8f0fe] px-2 py-0.5 rounded">
            Matrícula: {user.matricula || 'Sin asignar'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusConfig.badge}`}
        >
          <span className={`size-1.5 rounded-full ${statusConfig.dot}`} aria-hidden="true" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {statusConfig.label}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-[13px] font-medium text-[#43474f] bg-[#f2f4f6] px-2.5 py-1 rounded-md border border-[#e0e3e5] capitalize">
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#747781] font-medium">
        {user.lastActive}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <button
          onClick={() => onViewInfo(user.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-[#002d62] bg-[#e8f0fe] hover:bg-[#d2e3fc] border border-transparent hover:border-[#002d62] transition-all focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-1"
        >
          <Info className="size-3.5" />
          Info
        </button>
      </td>
    </tr>
  );
});
UserTableRow.displayName = 'UserTableRow';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function UserListPage() {
  const router = useRouter();
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [searchQueryString, setSearchQueryString] = useState('');
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);

  // Helper function to convert API user to UI user
  const convertApiUserToUIUser = (apiUser: ApiUser): User => {
    return {
      id: apiUser.id.toString(),
      matricula: apiUser.matricula, // ← AÑADIDO
      name: `${apiUser.firstname} ${apiUser.lastname}`,
      email: apiUser.email,
      status: apiUser.status ? 'active' : 'inactive',
      lastActive: apiUser.lastLoggedIn ? new Date(apiUser.lastLoggedIn).toLocaleString() : 'Never',
      role: apiUser.role as 'admin' | 'user' | 'moderator' | 'customer',
    };
  };

  // Fetch users from API with pagination
  const fetchUsers = useCallback(async (limit: number, offset: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/users?role=employee&limit=${limit}&offset=${offset}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      console.log('Users fetched:', result);

      // Convert API users to UI users
      const convertedUsers = result.data.map(convertApiUserToUIUser);
      setUsers(convertedUsers);
      setTotalUsers(result.total);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching users';
      setError(errorMessage);
      console.error('Error fetching users:', err);
      setUsers([]);
      setTotalUsers(0);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data function
  const loadUsers = useCallback(() => {
    const offset = (currentPageNumber - 1) * USERS_PER_PAGE;
    fetchUsers(USERS_PER_PAGE, offset);
  }, [currentPageNumber, fetchUsers]);

  // Fetch users on mount and when page changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, [loadUsers]);

  // Optimización de concurrencia: Evita bloqueos en el main thread al teclear
  const deferredSearchQuery = useDeferredValue(searchQueryString);

  const searchMatchingUsers = useMemo(() => {
    if (!deferredSearchQuery.trim()) return users;
    const lowerQuery = deferredSearchQuery.toLowerCase();

    return users.filter(
      user =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery) ||
        user.id.toLowerCase().includes(lowerQuery)
    );
  }, [deferredSearchQuery, users]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PER_PAGE));

  const usersDisplayedOnCurrentPage = useMemo(() => {
    // Since we're using server-side pagination, we just show what the API returned
    return searchMatchingUsers;
  }, [searchMatchingUsers]);

  const toggleSelectSpecificUser = useCallback((userId: string) => {
    setSelectedUserIds(prev => {
      const updated = new Set(prev);
      if (updated.has(userId)) {
        updated.delete(userId);
      } else {
        updated.add(userId);
      }
      return updated;
    });
  }, []);

  const isCurrentPageAllSelected = useMemo(() => {
    return (
      usersDisplayedOnCurrentPage.length > 0 &&
      usersDisplayedOnCurrentPage.every(user => selectedUserIds.has(user.id))
    );
  }, [usersDisplayedOnCurrentPage, selectedUserIds]);

  const toggleSelectAllDisplayedUsers = useCallback(() => {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (isCurrentPageAllSelected) {
        usersDisplayedOnCurrentPage.forEach(user => next.delete(user.id));
      } else {
        usersDisplayedOnCurrentPage.forEach(user => next.add(user.id));
      }
      return next;
    });
  }, [isCurrentPageAllSelected, usersDisplayedOnCurrentPage]);

  const handleViewInfo = useCallback(
    (id: string) => {
      router.push(`/admin/users/${id}`);
    },
    [router]
  );

  const handleCreateNewUser = useCallback(() => {
    router.push('/admin/employee/create');
  }, [router]);

  const handleAdvancedFilters = useCallback(() => {
    console.log('Desplegando panel de filtros avanzados');
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPageNumber(newPage);
  }, []);

  const paginationRange = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f7f9fb]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#002d62] border-t-transparent"></div>
          <p className="mt-4 text-[#747781]">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f7f9fb]">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm border border-[#e0e3e5]">
          <p className="text-[#d93025] font-semibold">Error al cargar usuarios</p>
          <p className="text-[#747781] text-sm mt-2">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadUsers();
            }}
            className="mt-4 px-4 py-2 bg-[#002d62] text-white rounded-md text-sm hover:bg-[#00193c] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb]">
      <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-[#e0e3e5]">
        <div>
          <h1 className="text-2xl font-sans font-bold text-[#00193c] tracking-tight">
            Directorio de Usuarios
          </h1>
          <p className="text-[13px] font-sans text-[#747781] mt-1">
            Gestione los accesos y roles administrativos del sistema.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateNewUser}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#002d62] rounded-md text-[13px] font-semibold text-white hover:bg-[#00193c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-2"
          >
            Nuevo Empleado
          </button>
        </div>
      </header>

      <section className="px-8 py-4 bg-white border-b border-[#e0e3e5] flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#747781] pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o ID..."
            value={searchQueryString}
            onChange={e => {
              setSearchQueryString(e.target.value);
              setCurrentPageNumber(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-[#f7f9fb] border border-[#c4c6d1] rounded-md text-[13px] font-medium text-[#191c1e] placeholder:text-[#747781] transition-all focus:outline-none focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62] focus:bg-white"
          />
        </div>

        <button
          onClick={handleAdvancedFilters}
          className="inline-flex items-center gap-2 px-3 py-2.5 border border-[#c4c6d1] rounded-md text-[13px] font-semibold text-[#43474f] hover:bg-[#f2f4f6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62]"
        >
          <SlidersHorizontal className="size-4" />
          Filtros Avanzados
        </button>
      </section>

      <main className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar bg-white">
        {usersDisplayedOnCurrentPage.length > 0 ? (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#f8fafd] sticky top-0 z-10 shadow-[0_1px_0_#e0e3e5]">
              <tr>
                <th className="px-6 py-3.5 w-12">
                  <input
                    type="checkbox"
                    checked={isCurrentPageAllSelected}
                    onChange={toggleSelectAllDisplayedUsers}
                    className="size-4 cursor-pointer text-[#002d62] rounded-sm border-[#c4c6d1] focus:ring-[#002d62]"
                  />
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Identidad
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Estado Operativo
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Nivel de Acceso
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Última Sesión
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e3e5]">
              {usersDisplayedOnCurrentPage.map(user => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  isSelected={selectedUserIds.has(user.id)}
                  onToggleSelect={toggleSelectSpecificUser}
                  onViewInfo={handleViewInfo}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-[#747781]">
            <Search className="size-10 mb-4 text-[#c4c6d1]" />
            <p className="text-[14px] font-semibold text-[#191c1e]">No se encontraron registros</p>
            <p className="text-[13px] mt-1">
              Ajuste los parámetros de búsqueda e intente nuevamente.
            </p>
          </div>
        )}
      </main>

      <footer className="flex items-center justify-between px-8 py-4 bg-white border-t border-[#e0e3e5]">
        <div className="text-[13px] font-medium text-[#747781]">
          Mostrando{' '}
          <span className="font-bold text-[#191c1e]">{usersDisplayedOnCurrentPage.length}</span> de{' '}
          <span className="font-bold text-[#191c1e]">{totalUsers}</span> resultados
          {selectedUserIds.size > 0 && (
            <span className="ml-2 text-[#002d62] font-semibold">
              ({selectedUserIds.size} seleccionados)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPageNumber - 1))}
            disabled={currentPageNumber === 1}
            className="inline-flex items-center justify-center size-8 rounded-md border border-[#c4c6d1] text-[#43474f] hover:bg-[#f2f4f6] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Página anterior"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="flex items-center gap-1 mx-2">
            {paginationRange.map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`inline-flex items-center justify-center size-8 rounded-md text-[13px] font-semibold transition-all ${
                  currentPageNumber === page
                    ? 'bg-[#002d62] text-white border border-[#002d62] shadow-sm'
                    : 'text-[#43474f] hover:bg-[#f2f4f6] border border-transparent hover:border-[#c4c6d1]'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPageNumber + 1))}
            disabled={currentPageNumber === totalPages}
            className="inline-flex items-center justify-center size-8 rounded-md border border-[#c4c6d1] text-[#43474f] hover:bg-[#f2f4f6] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Página siguiente"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
