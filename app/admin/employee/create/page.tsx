'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { POSITION_OPTIONS, type Position } from '@/lib/employee-position';

// ============================================================================
// CAPA DE DOMINIO Y TIPOS
// ============================================================================

interface CreateEmployeePayload {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  position: Position;
  profile: number;
  matricula?: string;
}

interface CreateEmployeeResponseData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  matricula: string | null;
  position: string;
  hired_at: string;
}

interface CreateEmployeeSuccessResponse {
  status: 'created';
  data: CreateEmployeeResponseData;
}

interface CreateEmployeeErrorResponse {
  status?: string;
  message?: string;
  errors?: Record<string, string[] | string>;
}

const inputClass =
  'w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]';

const labelClass = 'mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function CreateEmployeePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [position, setPosition] = useState<Position>('store_manager');
  const [matricula, setMatricula] = useState('');
  const [profiles, setProfiles] = useState<{ id: number; name: string }[]>([]);
  const [profileId, setProfileId] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/admin/profiles/', { credentials: 'include' })
      .then(res => res.json())
      .then(json => setProfiles(json.data ?? []))
      .catch(err => console.error('Error fetching profiles:', err));
  }, []);

  function validate(): string | null {
    if (!firstname.trim()) return 'El nombre es requerido.';
    if (!lastname.trim()) return 'El apellido es requerido.';
    if (!email.trim()) return 'El correo electrónico es requerido.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'El correo electrónico no es válido.';
    if (!password) return 'La contraseña es requerida.';
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (!position) return 'El puesto es requerido.';
    if (!profileId) return 'El perfil de acceso es requerido.';
    return null;
  }

  function extractErrorMessage(body: CreateEmployeeErrorResponse | null, status: number): string {
    if (body?.errors) {
      const firstEntry = Object.entries(body.errors)[0];
      if (firstEntry) {
        const [field, value] = firstEntry;
        const message = Array.isArray(value) ? value[0] : value;
        return `${field}: ${message}`;
      }
    }
    if (body?.message) return body.message;
    return `No se pudo crear el empleado (código ${status}).`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload: CreateEmployeePayload = {
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      email: email.trim(),
      password,
      position,
      profile: profileId as number,
      ...(matricula.trim() ? { matricula: matricula.trim() } : {}),
    };

    startTransition(async () => {
      try {
        const response = await fetch('/api/v1/employee/', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const body = await response.json().catch(() => null);

        if (!response.ok) {
          setError(extractErrorMessage(body, response.status));
          return;
        }

        const result = body as CreateEmployeeSuccessResponse;
        const fullName = `${result.data.first_name} ${result.data.last_name}`;
        setSuccess(`Empleado ${fullName} creado correctamente.`);

        setTimeout(() => {
          router.push('/admin/employee');
          router.refresh();
        }, 900);
      } catch (err) {
        console.error('Error creating employee:', err);
        setError('Error de red al crear el empleado. Intente nuevamente.');
      }
    });
  }

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb]">
      <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-[#e0e3e5]">
        <div>
          <button
            type="button"
            onClick={() => router.push('/admin/employee')}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#747781] hover:text-[#002d62] transition-colors mb-2"
          >
            <ArrowLeft className="size-3.5" />
            Volver al directorio
          </button>
          <h1 className="text-2xl font-sans font-bold text-[#00193c] tracking-tight">
            Nuevo empleado
          </h1>
          <p className="text-[13px] font-sans text-[#747781] mt-1">
            Registre un nuevo colaborador y asigne su puesto dentro de la organización.
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto max-w-2xl px-8 py-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <section className="rounded-lg border border-[#e0e3e5] bg-white p-6">
              <h2 className="mb-5 text-sm font-semibold text-[#191c1e]">Información personal</h2>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="firstname">
                    Nombre
                  </label>
                  <input
                    id="firstname"
                    className={inputClass}
                    value={firstname}
                    onChange={e => setFirstname(e.target.value)}
                    placeholder="Ej. Lia"
                    autoComplete="given-name"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="lastname">
                    Apellido
                  </label>
                  <input
                    id="lastname"
                    className={inputClass}
                    value={lastname}
                    onChange={e => setLastname(e.target.value)}
                    placeholder="Ej. Kutch"
                    autoComplete="family-name"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="email">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={inputClass}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="empleado@empresa.com"
                    autoComplete="email"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="password">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`${inputClass} pr-10`}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747781] hover:text-[#002d62] transition-colors"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="position">
                    Puesto
                  </label>
                  <select
                    id="position"
                    className={`${inputClass} appearance-none`}
                    value={position}
                    onChange={e => setPosition(e.target.value as Position)}
                  >
                    {POSITION_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="profile">
                    Perfil de acceso
                  </label>
                  <select
                    id="profile"
                    className={`${inputClass} appearance-none`}
                    value={profileId ?? ''}
                    onChange={e => setProfileId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Seleccione un perfil</option>
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="matricula">
                    Matrícula <span className="normal-case font-normal">(opcional)</span>
                  </label>
                  <input
                    id="matricula"
                    className={inputClass}
                    value={matricula}
                    onChange={e => setMatricula(e.target.value)}
                    placeholder="Ej. EMP-00123"
                    autoComplete="off"
                  />
                </div>
              </div>
            </section>

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/admin/employee')}
                className="rounded-md px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isPending}
                className={`rounded-md px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 ${
                  isPending
                    ? 'cursor-not-allowed bg-gray-400 opacity-70'
                    : 'bg-[#002d62] hover:bg-[#00193c] active:scale-[0.98]'
                }`}
              >
                {isPending ? 'Creando empleado...' : 'Crear empleado'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
