'use client';

import { useState, useCallback } from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';
import { STATUS_UI, type OrderStatus } from '@/lib/order-status';

// ============================================================================
// TIPOS Y CONSTANTES
// ============================================================================

type SortField = 'id' | 'lastname' | 'created_at';
type SortDirection = 'asc' | 'desc';

const SORT_FIELD_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'created_at', label: 'Fecha' },
  { value: 'id', label: 'ID' },
  { value: 'lastname', label: 'Cliente' },
];

const STATUS_OPTIONS: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'awaiting_payment', label: STATUS_UI.awaiting_payment.label },
  { value: 'pending', label: STATUS_UI.pending.label },
  { value: 'fulfilled', label: STATUS_UI.fulfilled.label },
  { value: 'returned', label: STATUS_UI.returned.label },
  { value: 'cancelled', label: STATUS_UI.cancelled.label },
];

const inputClass =
  'w-full rounded-md border border-[#c4c6d1] px-3 py-2.5 text-[13px] font-medium text-[#191c1e] outline-none transition-colors focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]';

const labelClass = 'mb-1.5 block text-xs font-semibold tracking-wide text-[#747781] uppercase';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ReportsPage() {
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const buildDownloadUrl = useCallback(
    (reportFormat: 'pdf' | 'csv') => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      params.set('sort', sortDirection === 'desc' ? `-${sortField}` : sortField);
      params.set('report_format', reportFormat);
      return `/api/v1/admin/reports/orders?${params.toString()}`;
    },
    [status, dateFrom, dateTo, sortField, sortDirection]
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
            Genere reportes de pedidos filtrados en formato PDF o CSV.
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-3xl bg-white rounded-lg border border-[#e0e3e5] p-6">
          <h2 className="text-sm font-semibold text-[#191c1e] mb-5">Pedidos</h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="report-status">
                Estado
              </label>
              <select
                id="report-status"
                className={inputClass}
                value={status}
                onChange={e => setStatus(e.target.value as OrderStatus | '')}
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="report-date-from">
                  Desde
                </label>
                <input
                  id="report-date-from"
                  type="date"
                  className={inputClass}
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="report-date-to">
                  Hasta
                </label>
                <input
                  id="report-date-to"
                  type="date"
                  className={inputClass}
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="report-sort-field">
                Ordenar por
              </label>
              <select
                id="report-sort-field"
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
              <label className={labelClass} htmlFor="report-sort-direction">
                Dirección
              </label>
              <select
                id="report-sort-direction"
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
