'use server';

export interface Category {
  slug: string; // English key -> what the backend expects as "category"
  label: string; // Spanish display name -> what the user sees
  description: string;
  priority: number;
}

interface CategoriesResponse {
  status: string;
  data: Category[];
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${process.env.BACKEND_URL}/api/v1/products/categories`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('No se pudieron cargar las categorías.');
  }

  const json: CategoriesResponse = await res.json();

  return (json.data ?? []).slice().sort((a, b) => a.priority - b.priority);
}
