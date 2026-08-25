'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Download } from 'lucide-react';

type ValidationError = {
  field?: string;
  message: string;
  row?: number;
  duplicate_row?: number;
  warning?: boolean;
};

type ImportStats = {
  products_created: number;
  products_updated: number;
  variants_created: number;
  variants_updated: number;
  images_created: number;
  images_updated: number;
  images_skipped: number;
  total_rows: number;
  error_count?: number;
};

type ImportResponse = {
  success: boolean;
  stats?: ImportStats;
  error?: string;
  errors?: ValidationError[];
  warnings?: ValidationError[];
  validation_errors?: ValidationError[];
  errors_by_row?: Record<string, ValidationError[]>;
  partial_success?: boolean;
  detail?: string;
};

export default function ImportProductsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error' | 'partial'>(
    'idle'
  );
  const [statusMessage, setStatusMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [warnings, setWarnings] = useState<ValidationError[]>([]);
  const [stats, setStats] = useState<ImportStats | null>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension !== 'csv') {
        setUploadStatus('error');
        setStatusMessage('Por favor selecciona un archivo CSV válido');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setUploadStatus('idle');
      setStatusMessage('');
      setValidationErrors([]);
      setWarnings([]);
      setStats(null);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setUploadStatus('error');
      setStatusMessage('Por favor selecciona un archivo CSV primero');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setStatusMessage('');
    setValidationErrors([]);
    setWarnings([]);
    setStats(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

      const response = await fetch('/api/v1/products/import/csv', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRFToken': csrfToken || '',
        },
        credentials: 'include',
      });

      const data: ImportResponse = await response.json();

      if (response.status === 201) {
        setUploadStatus('success');
        setStatusMessage('Productos importados exitosamente');
        if (data.stats) setStats(data.stats);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else if (response.status === 207) {
        setUploadStatus('partial');
        setStatusMessage(data.error || 'Importación completada con errores');
        if (data.stats) setStats(data.stats);
        if (data.errors) setValidationErrors(data.errors);
        if (data.warnings) setWarnings(data.warnings);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else if (response.status === 400) {
        setUploadStatus('error');
        setStatusMessage(data.error || 'Error de validación en el archivo CSV');
        if (data.validation_errors) {
          setValidationErrors(data.validation_errors);
        }
        if (data.errors_by_row) {
          const formattedErrors = Object.entries(data.errors_by_row).flatMap(([row, errors]) =>
            (errors as ValidationError[]).map((err: ValidationError) => ({
              ...err,
              row: parseInt(row),
            }))
          );
          setValidationErrors(formattedErrors);
        }
        if (data.warnings) setWarnings(data.warnings);
      } else if (response.status === 401 || response.status === 403) {
        setUploadStatus('error');
        setStatusMessage(
          data.error || 'Error de autenticación. Por favor inicia sesión nuevamente.'
        );
      } else {
        setUploadStatus('error');
        setStatusMessage(data.error || 'Error al importar productos');
        if (data.errors) setValidationErrors(data.errors);
        if (data.warnings) setWarnings(data.warnings);
      }
    } catch {
      setUploadStatus('error');
      setStatusMessage('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile]);

  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setStatusMessage('');
    setValidationErrors([]);
    setWarnings([]);
    setStats(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const downloadTemplate = useCallback(() => {
    // Must match the columns ImportProductsCSVView actually parses
    // (products/default/views/product_import_csv.py) - see that file's
    // module docstring for the authoritative column list.
    const headers = [
      'SKU',
      'initial inventory',
      'minimum_stock',
      'selling_price',
      'tax_rate',
      'total_price',
      'product_name',
      'product_slug',
      'category',
      'product_type',
      'variant_atribute',
      'variant_name',
      'variant_description',
      'variant_slug',
      'variant_status',
      'image_thumbnail',
      'image_thumbnail_alt_text',
      'image_01',
      'image_01_alt_text',
      'image_02',
      'image_02_alt_text',
      'image_03',
      'image_03_alt_text',
      'image_04',
      'image_04_alt_text',
    ];

    const sampleRow = [
      'ARC-4P-001',
      '100',
      '20',
      '500',
      '0.05',
      '525',
      'Archivador Carta',
      'archivador-carta',
      'papeleria',
      'normal',
      '4 Pulgadas',
      'Archivador Carta - 4 Pulgadas',
      'Archivador resistente tamaño carta',
      'archivador-4-pulgadas',
      'TRUE',
      'https://example.com/thumb.jpg',
      'imagen del thumbnail',
      'https://example.com/img1.jpg',
      'imagen 1',
      'https://example.com/img2.jpg',
      'imagen 2',
      '',
      '',
      '',
      '',
    ];

    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'product_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb]">
      <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-[#e0e3e5]">
        <div>
          <h1 className="text-2xl font-sans font-bold text-[#00193c] tracking-tight">
            Importar Productos
          </h1>
          <p className="text-[13px] font-sans text-[#747781] mt-1">
            Sube un archivo CSV para importar productos en masa al catálogo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#c4c6d1] rounded-md text-[13px] font-semibold text-[#43474f] hover:bg-[#f2f4f6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62]"
          >
            <Download className="size-4" /> Descargar Plantilla
          </button>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#c4c6d1] rounded-md text-[13px] font-semibold text-[#43474f] hover:bg-[#f2f4f6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62]"
          >
            <X className="size-4" /> Cancelar
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-[#e0e3e5] p-8">
          <div className="flex flex-col items-center">
            {/* File Drop Zone */}
            <div
              className={`w-full border-2 border-dashed rounded-lg p-12 transition-colors ${
                selectedFile
                  ? 'border-[#002d62] bg-[#f0f4ff]'
                  : uploadStatus === 'error'
                    ? 'border-red-300 bg-red-50'
                    : 'border-[#c4c6d1] hover:border-[#002d62] hover:bg-[#f8fafd]'
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                {selectedFile ? (
                  <>
                    <FileSpreadsheet className="size-16 text-[#002d62]" />
                    <div className="text-center">
                      <p className="text-[16px] font-semibold text-[#191c1e]">
                        {selectedFile.name}
                      </p>
                      <p className="text-[13px] text-[#747781] mt-1">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                      <button
                        onClick={clearSelection}
                        className="mt-3 text-[13px] font-medium text-red-600 hover:text-red-700 transition-colors"
                      >
                        Cambiar archivo
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="size-16 text-[#747781]" />
                    <div className="text-center">
                      <p className="text-[16px] font-semibold text-[#191c1e]">
                        Arrastra tu archivo CSV aquí
                      </p>
                      <p className="text-[13px] text-[#747781] mt-1">
                        o haz clic para seleccionarlo
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-block mt-4 px-4 py-2 bg-[#002d62] rounded-md text-[13px] font-semibold text-white hover:bg-[#00193c] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-2"
                      >
                        Seleccionar archivo
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Status Messages */}
            {uploadStatus === 'success' && (
              <div className="w-full mt-6 p-4 bg-[#e6f4ea] border border-[#ceead6] rounded-md">
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-5 text-[#137333] flex-shrink-0" />
                  <p className="text-[14px] font-medium text-[#137333]">{statusMessage}</p>
                </div>
                {stats && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] text-[#137333]">
                    <div>
                      Productos creados: <strong>{stats.products_created}</strong>
                    </div>
                    <div>
                      Productos actualizados: <strong>{stats.products_updated}</strong>
                    </div>
                    <div>
                      Variantes creadas: <strong>{stats.variants_created}</strong>
                    </div>
                    <div>
                      Variantes actualizadas: <strong>{stats.variants_updated}</strong>
                    </div>
                    <div>
                      Imágenes creadas: <strong>{stats.images_created}</strong>
                    </div>
                    <div>
                      Imágenes actualizadas: <strong>{stats.images_updated}</strong>
                    </div>
                    <div className="col-span-2">
                      Total filas procesadas: <strong>{stats.total_rows}</strong>
                    </div>
                  </div>
                )}
              </div>
            )}

            {uploadStatus === 'partial' && (
              <div className="w-full mt-6 p-4 bg-[#fff8e1] border border-[#ffd54f] rounded-md">
                <div className="flex items-center gap-3">
                  <AlertCircle className="size-5 text-[#f57c00] flex-shrink-0" />
                  <p className="text-[14px] font-medium text-[#e65100]">{statusMessage}</p>
                </div>
                {stats && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] text-[#e65100]">
                    <div>
                      Productos creados: <strong>{stats.products_created}</strong>
                    </div>
                    <div>
                      Productos actualizados: <strong>{stats.products_updated}</strong>
                    </div>
                    <div>
                      Variantes creadas: <strong>{stats.variants_created}</strong>
                    </div>
                    <div>
                      Variantes actualizadas: <strong>{stats.variants_updated}</strong>
                    </div>
                    <div>
                      Imágenes creadas: <strong>{stats.images_created}</strong>
                    </div>
                    <div>
                      Imágenes actualizadas: <strong>{stats.images_updated}</strong>
                    </div>
                    <div className="col-span-2">
                      Total filas procesadas: <strong>{stats.total_rows}</strong>
                    </div>
                    {stats.error_count && (
                      <div className="col-span-2 text-red-600">
                        Errores: <strong>{stats.error_count}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="w-full mt-6 p-4 bg-[#ffdad6] border border-[#ffb4ab] rounded-md">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-[#93000a] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[14px] font-medium text-[#93000a]">{statusMessage}</p>
                    {validationErrors.length > 0 && (
                      <div className="mt-3 max-h-60 overflow-y-auto">
                        <p className="text-[13px] font-semibold text-[#93000a] mb-2">
                          Errores de validación ({validationErrors.length}):
                        </p>
                        <ul className="space-y-1">
                          {validationErrors.slice(0, 20).map((error, index) => (
                            <li
                              key={index}
                              className="text-[12px] text-[#93000a] bg-red-50 px-3 py-1 rounded border border-red-200"
                            >
                              {error.row && (
                                <span className="font-semibold">Fila {error.row}: </span>
                              )}
                              {error.field && (
                                <span className="font-semibold">{error.field}: </span>
                              )}
                              {error.message}
                            </li>
                          ))}
                          {validationErrors.length > 20 && (
                            <li className="text-[12px] text-[#747781]">
                              ... y {validationErrors.length - 20} errores más
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    {warnings.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[13px] font-semibold text-[#e65100] mb-2">
                          Advertencias ({warnings.length}):
                        </p>
                        <ul className="space-y-1">
                          {warnings.slice(0, 10).map((warning, index) => (
                            <li
                              key={index}
                              className="text-[12px] text-[#e65100] bg-yellow-50 px-3 py-1 rounded border border-yellow-200"
                            >
                              {warning.row && (
                                <span className="font-semibold">Fila {warning.row}: </span>
                              )}
                              {warning.field && (
                                <span className="font-semibold">{warning.field}: </span>
                              )}
                              {warning.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className={`w-full mt-6 py-3 rounded-md text-[14px] font-semibold transition-colors flex items-center justify-center gap-2 ${
                !selectedFile || isUploading
                  ? 'bg-[#c4c6d1] text-[#747781] cursor-not-allowed'
                  : 'bg-[#002d62] text-white hover:bg-[#00193c] focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-2'
              }`}
            >
              {isUploading ? (
                <>
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Subir CSV
                </>
              )}
            </button>

            {/* Help Text */}
            <div className="w-full mt-6 pt-6 border-t border-[#e0e3e5]">
              <p className="text-[12px] text-[#747781] text-center">
                El archivo CSV debe contener las columnas requeridas.
                <button
                  onClick={downloadTemplate}
                  className="text-[#002d62] font-semibold hover:underline ml-1"
                >
                  Descarga la plantilla
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
