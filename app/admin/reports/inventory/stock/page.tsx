'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';

// ============================================================================
// TIPOS Y CONSTANTES
// ============================================================================

type SortField = 'name' | 'sku' | 'total_quantity' | 'created_at' | 'selling_price';
type SortDirection = 'asc' | 'desc';
type InventoryStatus = '' | 'in_stock' | 'medium_stock' | 'low_stock' | 'out_of_stock';

interface CategoryOption {
  slug: string;
  label: string;
}

const SORT_FIELD_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'created_at', label: 'Fecha de creación' },
  { value: 'name', label: 'Nombre' },
  { value: 'sku', label: 'SKU' },
  { value: 'total_quantity', label: 'Cantidad' },
  { value: 'selling_price', label: 'Precio' },
];

const INVENTORY_STATUS_OPTIONS: { value: InventoryStatus; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'in_stock', label: 'En Stock' },
  { value: 'medium_stock', label: 'Stock Medio' },
  { value: 'low_stock', label: 'Stock Bajo' },
  { value: 'out_of_stock', label: 'Sin Stock' },
];

const inputClass =
  'w-full rounded-md border border-[#c4c6d1] px-3 py-2.5 text-[13px] font-medium text-[#191c1e] outline-none transition-colors focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]';

const labelClass = 'mb-1.5 block text-xs font-semibold tracking-wide text-[#747781] uppercase';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function InventoryStockReportPage() {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [category, setCategory] = useState('');
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus>('');
  const [search, setSearch] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [maxQuantity, setMaxQuantity] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    let isMounted = true;

    fetch('/api/v1/products/categories', { credentials: 'include' })
      .then(response => response.json())
      .then(result => {
        if (isMounted) setCategories(result.data ?? []);
      })
      .catch(() => {
        if (isMounted) setCategories([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const buildDownloadUrl = useCallback(
    (reportFormat: 'pdf' | 'csv') => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (inventoryStatus) params.set('inventory_status', inventoryStatus);
      if (search) params.set('search', search);
      if (minQuantity) params.set('min_quantity', minQuantity);
      if (maxQuantity) params.set('max_quantity', maxQuantity);
      params.set('ordering', sortDirection === 'desc' ? `-${sortField}` : sortField);
      params.set('report_format', reportFormat);
      return `/api/v1/admin/reports/inventory/stock?${params.toString()}`;
    },
    [category, inventoryStatus, search, minQuantity, maxQuantity, sortField, sortDirection]
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
            Genere reportes del estado actual del inventario en formato PDF o CSV.
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-3xl bg-white rounded-lg border border-[#e0e3e5] p-6">
          <h2 className="text-sm font-semibold text-[#191c1e] mb-5">Inventario — Estado Actual</h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="stock-category">
                Categoría
              </label>
              <select
                id="stock-category"
                className={inputClass}
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="">Todas</option>
                {categories.map(option => (
                  <option key={option.slug} value={option.slug}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="stock-status">
                Estado de inventario
              </label>
              <select
                id="stock-status"
                className={inputClass}
                value={inventoryStatus}
                onChange={e => setInventoryStatus(e.target.value as InventoryStatus)}
              >
                {INVENTORY_STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="stock-search">
                Búsqueda (nombre o SKU)
              </label>
              <input
                id="stock-search"
                type="text"
                className={inputClass}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="stock-min-quantity">
                  Cant. mínima
                </label>
                <input
                  id="stock-min-quantity"
                  type="number"
                  className={inputClass}
                  value={minQuantity}
                  onChange={e => setMinQuantity(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="stock-max-quantity">
                  Cant. máxima
                </label>
                <input
                  id="stock-max-quantity"
                  type="number"
                  className={inputClass}
                  value={maxQuantity}
                  onChange={e => setMaxQuantity(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="stock-sort-field">
                Ordenar por
              </label>
              <select
                id="stock-sort-field"
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
              <label className={labelClass} htmlFor="stock-sort-direction">
                Dirección
              </label>
              <select
                id="stock-sort-direction"
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
