'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';
import { POSITION_OPTIONS, type Position } from '@/lib/employee-position';

// ============================================================================
// TIPOS Y CONSTANTES
// ============================================================================

type SortField = 'name' | 'email' | 'hired_at' | 'position';
type SortDirection = 'asc' | 'desc';

interface ProfileOption {
  id: number;
  name: string;
}

const SORT_FIELD_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'hired_at', label: 'Fecha de contratación' },
  { value: 'name', label: 'Nombre' },
  { value: 'email', label: 'Email' },
  { value: 'position', label: 'Posición' },
];

const inputClass =
  'w-full rounded-md border border-[#c4c6d1] px-3 py-2.5 text-[13px] font-medium text-[#191c1e] outline-none transition-colors focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]';

const labelClass = 'mb-1.5 block text-xs font-semibold tracking-wide text-[#747781] uppercase';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function EmployeesReportPage() {
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState<Position | ''>('');
  const [profile, setProfile] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<SortField>('hired_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    let isMounted = true;

    fetch('/api/v1/admin/profiles/', { credentials: 'include' })
      .then(response => response.json())
      .then(result => {
        if (isMounted) setProfiles(result.data ?? []);
      })
      .catch(() => {
        if (isMounted) setProfiles([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const buildDownloadUrl = useCallback(
    (reportFormat: 'pdf' | 'csv') => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (position) params.set('position', position);
      if (profile) params.set('profile', profile);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      params.set('sort', sortDirection === 'desc' ? `-${sortField}` : sortField);
      params.set('report_format', reportFormat);
      return `/api/v1/admin/reports/employees?${params.toString()}`;
    },
    [search, position, profile, dateFrom, dateTo, sortField, sortDirection]
  );

  const handleDownload = useCallback(
    (reportFormat: 'pdf' | 'csv') => {
      window.location.href = buildDownloadUrl(reportFormat);
    },
    [buildDownloadUrl]
  );

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb]">
      <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-[#e0e3e5]">
        <div>
          <h1 className="text-2xl font-sans font-bold text-[#00193c] tracking-tight">Reportes</h1>
          <p className="text-[13px] font-sans text-[#747781] mt-1">
            Genere reportes del personal administrativo en formato PDF o CSV.
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-3xl bg-white rounded-lg border border-[#e0e3e5] p-6">
          <h2 className="text-sm font-semibold text-[#191c1e] mb-5">Empleados</h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="employees-search">
                Búsqueda (nombre o email)
              </label>
              <input
                id="employees-search"
                type="text"
                className={inputClass}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="employees-position">
                Posición
              </label>
              <select
                id="employees-position"
                className={inputClass}
                value={position}
                onChange={e => setPosition(e.target.value as Position | '')}
              >
                <option value="">Todas</option>
                {POSITION_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="employees-profile">
                Perfil de acceso
              </label>
              <select
                id="employees-profile"
                className={inputClass}
                value={profile}
                onChange={e => setProfile(e.target.value)}
              >
                <option value="">Todos</option>
                {profiles.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="employees-date-from">
                  Contratado desde
                </label>
                <input
                  id="employees-date-from"
                  type="date"
                  className={inputClass}
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="employees-date-to">
                  Hasta
                </label>
                <input
                  id="employees-date-to"
                  type="date"
                  className={inputClass}
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="employees-sort-field">
                Ordenar por
              </label>
              <select
                id="employees-sort-field"
                className={inputClass}
                value={sortField}
                onChange={e => setSortField(e.target.value as SortField)}
              >
                {SORT_FIELD_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="employees-sort-direction">
                Dirección
              </label>
              <select
                id="employees-sort-direction"
                className={inputClass}
                value={sortDirection}
                onChange={e => setSortDirection(e.target.value as SortDirection)}
              >
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[#e0e3e5]">
            <button
              onClick={() => handleDownload('pdf')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#002d62] rounded-md text-[13px] font-semibold text-white hover:bg-[#00193c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-2"
            >
              <FileText className="size-4" /> Descargar PDF
            </button>
            <button
              onClick={() => handleDownload('csv')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#c4c6d1] rounded-md text-[13px] font-semibold text-[#43474f] hover:bg-[#f2f4f6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-2"
            >
              <FileSpreadsheet className="size-4" /> Descargar CSV
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
