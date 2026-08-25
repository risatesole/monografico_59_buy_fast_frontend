'use client';

import { useState, useEffect, useCallback, useRef, useTransition, memo, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  Edit2,
  FolderOpen,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchCategories, deleteCategory, type Category } from './actions';

// ============================================================================
// CONSTANTES Y UTILIDADES
// ============================================================================

const ITEMS_PER_PAGE = 5;
const SEARCH_DEBOUNCE_DELAY = 400;

// ============================================================================
// CUSTOM HOOK: Carga y paginación client-side sobre los datos reales
// ============================================================================

function useCategoriesPagination() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchCategories();
      setAllCategories(data);
    } catch {
      setLoadError('No se pudieron cargar las categorías.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await loadCategories();
    };
    loadData();

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [loadCategories]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_DELAY);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const filtered = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();
    if (!lowerSearch) return allCategories;
    return allCategories.filter(
      c =>
        c.label.toLowerCase().includes(lowerSearch) ||
        c.slug.toLowerCase().includes(lowerSearch) ||
        c.description.toLowerCase().includes(lowerSearch)
    );
  }, [allCategories, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const categories = filtered.slice(
    (currentPageClamped - 1) * ITEMS_PER_PAGE,
    currentPageClamped * ITEMS_PER_PAGE
  );

  return {
    categories,
    isLoading,
    loadError,
    searchTerm,
    handleSearch,
    clearSearch,
    currentPage: currentPageClamped,
    totalPages,
    totalItems: filtered.length,
    setCurrentPage,
    reload: loadCategories,
  };
}

// ============================================================================
// COMPONENTES DE PRESENTACIÓN (Memoizados)
// ============================================================================

const LoadingDots = memo(() => (
  <div className="flex space-x-1.5 justify-center py-12">
    <div className="size-3 bg-[#c4c6d1] rounded-full animate-bounce" />
    <div className="size-3 bg-[#002d62] rounded-full animate-bounce [animation-delay:0.2s]" />
    <div className="size-3 bg-[#c4c6d1] rounded-full animate-bounce [animation-delay:0.4s]" />
  </div>
));
LoadingDots.displayName = 'LoadingDots';

const CategoryRow = memo(
  ({
    category,
    onDelete,
    isDeleting,
  }: {
    category: Category;
    onDelete: (category: Category) => void;
    isDeleting: boolean;
  }) => {
    return (
      <tr className="border-b border-[#e0e3e5] bg-white hover:bg-[#f8fafd] transition-colors duration-150">
        <td className="px-6 py-4 font-mono text-[13px] text-[#43474f] font-semibold">
          {category.id}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-md border border-[#e0e3e5] bg-[#f2f4f6] flex items-center justify-center overflow-hidden shrink-0">
              {category.images.default ? (
                <Image
                  src={category.images.default}
                  alt={category.label}
                  width={40}
                  height={40}
                  className="size-full object-cover"
                  loading="lazy"
                  unoptimized
                />
              ) : (
                <FolderOpen className="size-4 text-[#c4c6d1]" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-[#191c1e] tracking-tight">
                {category.label}
              </span>
              <span className="text-[12px] text-[#747781] mt-0.5 font-mono">/{category.slug}</span>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <p className="text-[13px] text-[#43474f] truncate max-w-xs">
            {category.description || '—'}
          </p>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-[13px] font-semibold text-[#43474f]">{category.priority}</span>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/products/categories/edit/${category.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#c4c6d1] rounded-md text-[12px] font-semibold text-[#43474f] hover:bg-[#f2f4f6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62]"
            >
              <Edit2 className="size-3.5" /> Editar
            </Link>
            <button
              type="button"
              onClick={() => onDelete(category)}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 rounded-md text-[12px] font-semibold text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Trash2 className="size-3.5" /> {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </td>
      </tr>
    );
  }
);
CategoryRow.displayName = 'CategoryRow';

// ============================================================================
// COMPONENTE PRINCIPAL (PAGE)
// ============================================================================

export default function CategoriesPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    categories,
    isLoading,
    loadError,
    searchTerm,
    handleSearch,
    clearSearch,
    currentPage,
    totalPages,
    totalItems,
    setCurrentPage,
    reload,
  } = useCategoriesPagination();

  const paginationRange = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `¿Eliminar la categoría "${category.label}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setActionError(null);
    setDeletingId(category.id);

    startTransition(async () => {
      const result = await deleteCategory(String(category.id));
      setDeletingId(null);

      if (!result.ok) {
        setActionError(result.message);
        return;
      }

      await reload();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb]">
      {/* Header Institucional */}
      <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-[#e0e3e5]">
        <div>
          <h1 className="text-2xl font-sans font-bold text-[#00193c] tracking-tight">
            Jerarquía de Categorías
          </h1>
          <p className="text-[13px] font-sans text-[#747781] mt-1">
            Estructuración y segmentación del inventario general.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/categories/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#002d62] rounded-md text-[13px] font-semibold text-white hover:bg-[#00193c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002d62] focus:ring-offset-2"
          >
            <Plus className="size-4" /> Nueva Categoría
          </Link>
        </div>
      </header>

      {/* Toolbar / Filtros */}
      <section className="px-8 py-4 bg-white border-b border-[#e0e3e5]">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#747781] pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre, slug o descripción..."
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-[#f7f9fb] border border-[#c4c6d1] rounded-md text-[13px] font-medium text-[#191c1e] placeholder:text-[#747781] transition-all focus:outline-none focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62] focus:bg-white"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c4c6d1] hover:text-[#747781] transition-colors focus:outline-none"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        {actionError && <p className="mt-3 text-xs font-medium text-red-600">{actionError}</p>}
      </section>

      {/* Main Content */}
      <main className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar bg-white">
        {isLoading ? (
          <LoadingDots />
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#747781]">
            <p className="text-[14px] font-semibold text-red-600">{loadError}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#747781]">
            <FolderOpen className="size-12 mb-4 text-[#c4c6d1]" />
            <p className="text-[14px] font-semibold text-[#191c1e]">
              {searchTerm
                ? 'No se encontraron categorías coincidentes'
                : 'La estructura de categorías está vacía'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#f8fafd] sticky top-0 z-10 shadow-[0_1px_0_#e0e3e5]">
              <tr>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider w-20">
                  ID
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Categoría / Slug
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-[#747781] uppercase tracking-wider text-right">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e3e5]">
              {categories.map(category => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  onDelete={handleDelete}
                  isDeleting={isPending && deletingId === category.id}
                />
              ))}
            </tbody>
          </table>
        )}
      </main>

      {/* Footer / Paginación Numérica Clásica */}
      {!isLoading && !loadError && categories.length > 0 && (
        <footer className="flex items-center justify-between px-8 py-4 bg-white border-t border-[#e0e3e5]">
          <div className="text-[13px] font-medium text-[#747781]">
            Mostrando{' '}
            <span className="font-bold text-[#191c1e]">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{' '}
            a{' '}
            <span className="font-bold text-[#191c1e]">
              {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
            </span>{' '}
            de <span className="font-bold text-[#191c1e]">{totalItems}</span> registros
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center size-8 rounded-md border border-[#c4c6d1] text-[#43474f] hover:bg-[#f2f4f6] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" />
            </button>

            <div className="flex items-center gap-1 mx-2">
              {paginationRange.map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`inline-flex items-center justify-center size-8 rounded-md text-[13px] font-semibold transition-all ${
                    currentPage === page
                      ? 'bg-[#002d62] text-white border border-[#002d62] shadow-sm'
                      : 'text-[#43474f] hover:bg-[#f2f4f6] border border-transparent hover:border-[#c4c6d1]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center size-8 rounded-md border border-[#c4c6d1] text-[#43474f] hover:bg-[#f2f4f6] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Página siguiente"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
