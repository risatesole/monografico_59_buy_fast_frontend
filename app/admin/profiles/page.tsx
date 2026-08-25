'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Trash2, Pencil, ShieldCheck } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface PermissionCatalogEntry {
  code: string;
  label: string;
}

interface Profile {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  is_protected: boolean;
  employee_count: number;
}

interface ProfilesResponse {
  success: boolean;
  message?: string;
  data: Profile[];
  meta: { permission_catalog: PermissionCatalogEntry[] };
}

interface PermissionGroup {
  key: string;
  label: string;
  items: PermissionCatalogEntry[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const RESOURCE_GROUP_LABELS: Record<string, string> = {
  employees: 'Empleados',
  customers: 'Clientes',
  products: 'Productos',
  inventory: 'Inventario',
  orders: 'Órdenes',
  reports: 'Reportes',
};

const inputClass =
  'w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]';

const labelClass = 'mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase';

function groupPermissionCatalog(catalog: PermissionCatalogEntry[]): PermissionGroup[] {
  const groups = new Map<string, PermissionGroup>();

  catalog.forEach(entry => {
    const key = entry.code.split('.')[0];
    if (!groups.has(key)) {
      groups.set(key, { key, label: RESOURCE_GROUP_LABELS[key] ?? key, items: [] });
    }
    groups.get(key)!.items.push(entry);
  });

  return Array.from(groups.values());
}

// ============================================================================
// PERMISSION CHECKBOX GROUP
// ============================================================================

interface PermissionGroupFieldsProps {
  groups: PermissionGroup[];
  selected: Set<string>;
  onToggle: (code: string) => void;
}

function PermissionGroupFields({ groups, selected, onToggle }: PermissionGroupFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {groups.map(group => (
        <div key={group.key} className="rounded-md border border-[#e0e3e5] p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#747781]">
            {group.label}
          </p>
          <div className="flex flex-col gap-1.5">
            {group.items.map(item => (
              <label key={item.code} className="flex items-center gap-2 text-sm text-[#191c1e]">
                <input
                  type="checkbox"
                  checked={selected.has(item.code)}
                  onChange={() => onToggle(item.code)}
                  className="size-4 rounded border-gray-300 text-[#002d62] focus:ring-[#002d62]"
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [permissionCatalog, setPermissionCatalog] = useState<PermissionCatalogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<'closed' | 'create' | 'edit'>('closed');
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const permissionGroups = useMemo(
    () => groupPermissionCatalog(permissionCatalog),
    [permissionCatalog]
  );

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/admin/profiles/', { credentials: 'include' });
      const result: ProfilesResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || `Error al cargar perfiles (código ${response.status}).`);
      }

      setProfiles(result.data ?? []);
      setPermissionCatalog(result.meta?.permission_catalog ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar perfiles.';
      setError(message);
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadProfiles = async () => {
      await fetchProfiles();
    };
    loadProfiles();
  }, [fetchProfiles]);

  function openCreateForm() {
    setFormMode('create');
    setEditingProfile(null);
    setName('');
    setDescription('');
    setSelectedPermissions(new Set());
    setFormError(null);
  }

  function openEditForm(profile: Profile) {
    setFormMode('edit');
    setEditingProfile(profile);
    setName(profile.name);
    setDescription(profile.description);
    setSelectedPermissions(new Set(profile.permissions));
    setFormError(null);
  }

  function closeForm() {
    setFormMode('closed');
    setEditingProfile(null);
    setFormError(null);
  }

  function togglePermission(code: string) {
    setSelectedPermissions(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('El nombre del perfil es requerido.');
      return;
    }

    setIsSubmitting(true);

    try {
      const isEdit = formMode === 'edit' && editingProfile;
      const url = isEdit
        ? `/api/v1/admin/profiles/${editingProfile.id}/`
        : '/api/v1/admin/profiles/';
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          permissions: Array.from(selectedPermissions),
        }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok || body?.success === false) {
        setFormError(body?.message || `No se pudo guardar el perfil (código ${response.status}).`);
        return;
      }

      closeForm();
      await fetchProfiles();
    } catch (err) {
      console.error('Error saving profile:', err);
      setFormError('Error de red al guardar el perfil. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(profile: Profile) {
    setError(null);

    try {
      const response = await fetch(`/api/v1/admin/profiles/${profile.id}/`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.message || `No se pudo eliminar el perfil (código ${response.status}).`);
        return;
      }

      await fetchProfiles();
    } catch (err) {
      console.error('Error deleting profile:', err);
      setError('Error de red al eliminar el perfil. Intente nuevamente.');
    }
  }

  function deleteDisabledReason(profile: Profile): string | null {
    if (profile.is_protected) return 'No se puede eliminar el perfil Superuser';
    if (profile.employee_count > 0) {
      return `No se puede eliminar: ${profile.employee_count} empleado(s) asignado(s)`;
    }
    return null;
  }

  if (isLoading && profiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f7f9fb]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#002d62] border-t-transparent"></div>
          <p className="mt-4 text-[#747781]">Cargando perfiles...</p>
        </div>
      </div>
    );
  }

  if (error && profiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f7f9fb]">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm border border-[#e0e3e5]">
          <p className="text-[#d93025] font-semibold">Error al cargar perfiles</p>
          <p className="text-[#747781] text-sm mt-2">{error}</p>
          <button
            onClick={() => fetchProfiles()}
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
            Perfiles de Acceso
          </h1>
          <p className="text-[13px] font-sans text-[#747781] mt-1">
            Gestión de perfiles y permisos asignables a los empleados
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#002d62] text-white rounded-md text-[13px] font-semibold hover:bg-[#00193c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-2 shadow-sm"
        >
          <Plus className="size-4" />
          Nuevo Perfil
        </button>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        {error && (
          <p className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {formMode !== 'closed' && (
          <section className="mb-6 rounded-lg border border-[#e0e3e5] bg-white p-6">
            <h2 className="mb-5 text-sm font-semibold text-[#191c1e]">
              {formMode === 'create' ? 'Nuevo perfil' : `Editar perfil: ${editingProfile?.name}`}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="profile-name">
                    Nombre
                  </label>
                  <input
                    id="profile-name"
                    className={inputClass}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej. Gerente de Inventario"
                    disabled={formMode === 'edit' && editingProfile?.is_protected}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="profile-description">
                    Descripción
                  </label>
                  <input
                    id="profile-description"
                    className={inputClass}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Descripción breve del perfil"
                    disabled={formMode === 'edit' && editingProfile?.is_protected}
                  />
                </div>
              </div>

              <div>
                <p className={labelClass}>Permisos</p>
                <PermissionGroupFields
                  groups={permissionGroups}
                  selected={selectedPermissions}
                  onToggle={togglePermission}
                />
              </div>

              {formError && (
                <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-md px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`rounded-md px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 ${
                    isSubmitting
                      ? 'cursor-not-allowed bg-gray-400 opacity-70'
                      : 'bg-[#002d62] hover:bg-[#00193c] active:scale-[0.98]'
                  }`}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar perfil'}
                </button>
              </div>
            </form>
          </section>
        )}

        <div className="bg-white rounded-lg border border-[#e0e3e5] overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[#f8fafd]">
              <tr>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Permisos
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Empleados
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e3e5]">
              {profiles.map(profile => {
                const disabledReason = deleteDisabledReason(profile);
                return (
                  <tr
                    key={profile.id}
                    className="bg-white hover:bg-[#f8fafd] transition-colors duration-150 ease-in-out"
                  >
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-2">
                        {profile.is_protected && <ShieldCheck className="size-4 text-[#002d62]" />}
                        <span className="text-[14px] font-semibold text-[#191c1e]">
                          {profile.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className="text-[13px] text-[#43474f]">
                        {profile.description || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {profile.permissions.length > 0 ? (
                          profile.permissions.map(code => (
                            <span
                              key={code}
                              className="inline-flex items-center px-2 py-0.5 rounded-full border border-[#e0e3e5] bg-[#f2f4f6] text-[11px] font-medium text-[#43474f]"
                            >
                              {code}
                            </span>
                          ))
                        ) : (
                          <span className="text-[12px] text-[#747781]">Sin permisos</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className="text-[13px] font-semibold text-[#191c1e]">
                        {profile.employee_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditForm(profile)}
                          disabled={profile.is_protected}
                          title={
                            profile.is_protected ? 'El perfil Superuser no es editable' : undefined
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[13px] font-medium text-[#002d62] bg-[#e8f0fe] hover:bg-[#d2e3fc] border border-transparent hover:border-[#002d62] transition-all focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-1 disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <Pencil className="size-3.5" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(profile)}
                          disabled={!!disabledReason}
                          title={disabledReason ?? undefined}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[13px] font-medium text-[#d93025] bg-[#fce8e6] hover:bg-[#f5c6c2] border border-transparent hover:border-[#d93025] transition-all focus:outline-none focus:ring-2 focus:ring-[#d93025] focus:ring-offset-1 disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <Trash2 className="size-3.5" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {profiles.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-[#747781]">
              <p className="text-[14px] font-semibold text-[#191c1e]">
                No hay perfiles registrados
              </p>
              <p className="text-[13px] mt-1">Cree un nuevo perfil para asignar permisos.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
