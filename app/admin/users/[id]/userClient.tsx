'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldOff,
  BadgeCheck,
  BadgeX,
  Mail,
  Clock,
  KeyRound,
  Hash,
  Users,
  Pencil,
} from 'lucide-react';
import { User, getFullName, getRoleLabel } from '@/lib/users';

const dateFormatter = new Intl.DateTimeFormat('es-DO', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatDate(value: string | null): string {
  if (!value) return 'Nunca';
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return 'Nunca';
  }
}

type UserDetailsClientProps = {
  initialUser: User;
  isActingSuperuser: boolean;
};

export default function UserDetailsClient({
  initialUser,
  isActingSuperuser,
}: UserDetailsClientProps) {
  const [user, setUser] = useState<User>(initialUser);
  const [updatingField, setUpdatingField] = useState<'is_active' | 'institution_member' | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [availableProfiles, setAvailableProfiles] = useState<{ id: number; name: string }[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(
    user.profile?.id ?? null
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [isEditingMatricula, setIsEditingMatricula] = useState(false);
  const [matriculaDraft, setMatriculaDraft] = useState(user.matricula ?? '');
  const [isSavingMatricula, setIsSavingMatricula] = useState(false);

  useEffect(() => {
    if (user.role !== 'employee') return;

    fetch('/api/v1/admin/profiles/', { credentials: 'include' })
      .then(res => res.json())
      .then(json => setAvailableProfiles(json.data ?? []))
      .catch(err => console.error('Error fetching profiles:', err));
  }, [user.role]);

  const saveProfile = useCallback(async () => {
    if (selectedProfileId === null) return;

    setIsSavingProfile(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/v1/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: selectedProfileId }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'No se pudo actualizar el perfil de acceso.');
      }

      setUser(json.data);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'No se pudo actualizar el perfil de acceso.'
      );
    } finally {
      setIsSavingProfile(false);
    }
  }, [selectedProfileId, user.id]);

  const updateUser = useCallback(
    async (field: 'is_active' | 'institution_member', value: boolean) => {
      setUpdatingField(field);
      setErrorMessage(null);

      try {
        const response = await fetch(`/api/v1/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: value }),
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json.message || 'No se pudo actualizar el usuario.');
        }

        setUser(json.data);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'No se pudo actualizar el usuario.');
      } finally {
        setUpdatingField(null);
      }
    },
    [user.id]
  );

  const saveMatricula = useCallback(async () => {
    setIsSavingMatricula(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/v1/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricula: matriculaDraft }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'No se pudo actualizar la matrícula.');
      }

      setUser(json.data);
      setIsEditingMatricula(false);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo actualizar la matrícula.');
    } finally {
      setIsSavingMatricula(false);
    }
  }, [matriculaDraft, user.id]);

  const cancelEditMatricula = useCallback(() => {
    setMatriculaDraft(user.matricula ?? '');
    setIsEditingMatricula(false);
  }, [user.matricula]);

  const toggleActive = useCallback(() => {
    updateUser('is_active', !user.is_active);
  }, [updateUser, user.is_active]);

  const toggleMember = useCallback(() => {
    updateUser('institution_member', !user.institutionMember);
  }, [updateUser, user.institutionMember]);

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb]">
      <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-[#e0e3e5]">
        <div>
          <Link
            href="/admin/users" // ← CAMBIADO: /admin → /admin/users
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#747781] hover:text-[#002d62] transition-colors mb-2"
          >
            <ArrowLeft className="size-3.5" /> Volver a Usuarios
          </Link>
          <h1 className="text-2xl font-sans font-bold text-[#00193c] tracking-tight">
            {getFullName(user)}
          </h1>
          <p className="text-[13px] font-sans text-[#747781] mt-1">
            Detalles de la cuenta y estado.
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
        {errorMessage && (
          <div className="mb-6 px-4 py-3 rounded-md bg-[#ffdad6] border border-[#ffb4ab] text-[#93000a] text-[13px] font-medium">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <section className="lg:col-span-1 bg-white border border-[#e0e3e5] rounded-lg p-6">
            <div className="flex flex-col items-center text-center">
              {user.profilepicture ? (
                <Image
                  src={user.profilepicture}
                  alt={getFullName(user)}
                  width={80}
                  height={80}
                  className="size-20 rounded-full object-cover border border-[#e0e3e5]"
                />
              ) : null}
              <h2 className="mt-4 text-[16px] font-bold text-[#191c1e]">{getFullName(user)}</h2>
              <span className="mt-1 text-[12px] font-medium text-[#43474f] bg-[#f2f4f6] px-2.5 py-1 rounded-md border border-[#e0e3e5]">
                {getRoleLabel(user.role)}
              </span>

              <div className="w-full mt-6 pt-6 border-t border-[#e0e3e5] space-y-3 text-left">
                <div className="flex items-center gap-2.5 text-[13px] text-[#43474f]">
                  <Mail className="size-4 text-[#747781] shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[13px] text-[#43474f]">
                  <Hash className="size-4 text-[#747781] shrink-0" />
                  {isEditingMatricula ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <input
                        type="text"
                        value={matriculaDraft}
                        onChange={e => setMatriculaDraft(e.target.value)}
                        maxLength={30}
                        autoFocus
                        className="flex-1 min-w-0 rounded-md border border-[#c4c6d1] px-2 py-1 text-[13px] font-mono text-[#002d62] outline-none focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]"
                      />
                      <button
                        onClick={saveMatricula}
                        disabled={isSavingMatricula}
                        className="text-[12px] font-semibold text-[#002d62] hover:underline disabled:opacity-50"
                      >
                        {isSavingMatricula ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={cancelEditMatricula}
                        disabled={isSavingMatricula}
                        className="text-[12px] font-semibold text-[#747781] hover:underline disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-mono font-semibold text-[#002d62]">
                        Matrícula: {user.matricula || 'Sin asignar'}
                      </span>
                      {isActingSuperuser && (
                        <button
                          onClick={() => {
                            setMatriculaDraft(user.matricula ?? '');
                            setIsEditingMatricula(true);
                          }}
                          aria-label="Editar matrícula"
                          className="text-[#747781] hover:text-[#002d62] transition-colors"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2.5 text-[13px] text-[#43474f]">
                  <Clock className="size-4 text-[#747781] shrink-0" />
                  <span>Últ. acceso: {formatDate(user.lastLoggedIn)}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[13px] text-[#43474f]">
                  <KeyRound className="size-4 text-[#747781] shrink-0" />
                  <span>ID de cuenta: #{user.id}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Account controls + permissions */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white border border-[#e0e3e5] rounded-lg p-6">
              <h3 className="text-[14px] font-bold text-[#191c1e] mb-4">Estado de la Cuenta</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* is_active toggle */}
                <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-md border border-[#e0e3e5] bg-[#f8fafd]">
                  <div className="flex items-center gap-3">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                        user.is_active
                          ? 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]'
                          : 'bg-[#ffdad6] text-[#93000a] border-[#ffb4ab]'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          user.is_active ? 'bg-[#1e8e3e]' : 'bg-[#ba1a1a]'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        {user.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={toggleActive}
                    disabled={updatingField === 'is_active'}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62] disabled:opacity-50 disabled:pointer-events-none ${
                      user.is_active
                        ? 'border border-[#c4c6d1] text-[#43474f] hover:bg-[#f2f4f6]'
                        : 'bg-[#002d62] text-white hover:bg-[#00193c]'
                    }`}
                  >
                    {user.is_active ? (
                      <>
                        <ShieldOff className="size-3.5" />
                        {updatingField === 'is_active' ? 'Desactivando...' : 'Desactivar'}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-3.5" />
                        {updatingField === 'is_active' ? 'Activando...' : 'Activar'}
                      </>
                    )}
                  </button>
                </div>

                {/* institutionMember toggle */}
                <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-md border border-[#e0e3e5] bg-[#f8fafd]">
                  <div className="flex items-center gap-3">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                        user.institutionMember
                          ? 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]'
                          : 'bg-[#f2f4f6] text-[#747781] border-[#e0e3e5]'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          user.institutionMember ? 'bg-[#1e8e3e]' : 'bg-[#c4c6d1]'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        {user.institutionMember ? 'Miembro' : 'No Miembro'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={toggleMember}
                    disabled={updatingField === 'institution_member'}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62] disabled:opacity-50 disabled:pointer-events-none ${
                      user.institutionMember
                        ? 'border border-[#c4c6d1] text-[#43474f] hover:bg-[#f2f4f6]'
                        : 'bg-[#002d62] text-white hover:bg-[#00193c]'
                    }`}
                  >
                    {user.institutionMember ? (
                      <>
                        <BadgeX className="size-3.5" />
                        {updatingField === 'institution_member'
                          ? 'Quitando...'
                          : 'Quitar Membresía'}
                      </>
                    ) : (
                      <>
                        <BadgeCheck className="size-3.5" />
                        {updatingField === 'institution_member'
                          ? 'Asignando...'
                          : 'Asignar Membresía'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {user.role === 'employee' && (
              <div className="bg-white border border-[#e0e3e5] rounded-lg p-6">
                <h3 className="text-[14px] font-bold text-[#191c1e] mb-4 flex items-center gap-2">
                  <Users className="size-4 text-[#747781]" />
                  Perfil de Acceso
                </h3>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <select
                    value={selectedProfileId ?? ''}
                    onChange={e =>
                      setSelectedProfileId(e.target.value ? Number(e.target.value) : null)
                    }
                    className="flex-1 rounded-md border border-[#c4c6d1] px-3 py-2 text-[13px] text-[#191c1e] outline-none transition-colors focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]"
                  >
                    <option value="">Sin perfil asignado</option>
                    {availableProfiles.map(profile => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={saveProfile}
                    disabled={
                      isSavingProfile ||
                      selectedProfileId === null ||
                      selectedProfileId === user.profile?.id
                    }
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-[12px] font-semibold bg-[#002d62] text-white hover:bg-[#00193c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSavingProfile ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>

                <p className="mt-2 text-[12px] text-[#747781]">
                  Determina a qué secciones del panel administrativo tiene acceso este empleado.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
