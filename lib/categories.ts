// lib/categories.ts
//
// Shared category list fetcher, used by the categories index page and the
// home page's category strip.

export interface Category {
  label: string;
  description: string;
  priority: number;
  slug: string;
  images: {
    banner: string;
    cart: string;
    default: string;
  };
}

const DJANGO_BASE = process.env.BACKEND_URL ?? 'http://localhost:8000';

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${DJANGO_BASE}/api/v1/products/categories`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 30, tags: ['categories'] },
    });

    if (!res.ok) {
      throw new Error(`Error en API HTTP: ${res.status}`);
    }

    const json = await res.json();
    const data = json.data;

    // Supports both the old format (Record) and the new one (Array)
    const categoriesArray = Array.isArray(data) ? data : Object.values(data ?? {});

    return categoriesArray.sort((a, b) => a.priority - b.priority);
  } catch (error) {
    console.error('[Categories Fetch Error]:', error);
    return [];
  }
}
