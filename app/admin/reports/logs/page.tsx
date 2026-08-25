'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDate } from '@/lib/format';

// ============================================================================
// TIPOS
// ============================================================================

interface ReportLogEntry {
  id: number;
  generated_by: { name: string; email: string | null };
  report_type: string;
  format: string;
  filters: Record<string, string>;
  row_count: number;
  created_at: string;
}

interface ReportLogsResponse {
  data: ReportLogEntry[];
  total: number;
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  orders: 'Pedidos',
  inventory_stock: 'Inventario: Estado Actual',
  inventory_movements: 'Inventario: Movimientos',
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ReportLogsPage() {
  const [logs, setLogs] = useState<ReportLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/admin/reports/logs?limit=100', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Error al cargar el registro (código ${response.status}).`);
      }
      const result: ReportLogsResponse = await response.json();
      setLogs(result.data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar el registro.';
      setError(message);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb]">
      <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-[#e0e3e5]">
        <div>
          <h1 className="text-2xl font-sans font-bold text-[#00193c] tracking-tight">
            Registro de Reportes
          </h1>
          <p className="text-[13px] font-sans text-[#747781] mt-1">
            Historial de reportes generados por el personal administrativo.
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        {error && (
          <p className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="bg-white rounded-lg border border-[#e0e3e5] overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[#f8fafd]">
              <tr>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Reporte
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Formato
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Filtros
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Filas
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e3e5]">
              {logs.map(log => (
                <tr key={log.id} className="bg-white hover:bg-[#f8fafd] transition-colors">
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-semibold text-[#191c1e]">
                        {log.generated_by.name}
                      </span>
                      {log.generated_by.email && (
                        <span className="text-[12px] text-[#747781] mt-0.5">
                          {log.generated_by.email}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-[13px] text-[#43474f]">
                    {REPORT_TYPE_LABELS[log.report_type] ?? log.report_type}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-[#e0e3e5] bg-[#f2f4f6] text-[11px] font-medium uppercase text-[#43474f]">
                      {log.format}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {Object.entries(log.filters).length > 0 ? (
                        Object.entries(log.filters).map(([key, value]) => (
                          <span
                            key={key}
                            className="inline-flex items-center px-2 py-0.5 rounded-full border border-[#e0e3e5] bg-[#f2f4f6] text-[11px] font-medium text-[#43474f]"
                          >
                            {key}: {value}
                          </span>
                        ))
                      ) : (
                        <span className="text-[12px] text-[#747781]">Sin filtros</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-[13px] font-semibold text-[#191c1e]">
                    {log.row_count}
                  </td>
                  <td className="px-6 py-4 align-top text-[13px] text-[#43474f] whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!isLoading && logs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-[#747781]">
              <p className="text-[14px] font-semibold text-[#191c1e]">
                No hay reportes generados todavía
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center h-48">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#002d62] border-t-transparent" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
