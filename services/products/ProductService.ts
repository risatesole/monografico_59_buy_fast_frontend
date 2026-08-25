import type { Product } from '@/entities/product';

export type ProductQueryParameters = {
  sort?: string;
  status?: string;
  limit?: number;
  offset?: number;
  tags?: string[];
  category?: number | null;
  search?: string;
};

export type Category = {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  status?: boolean;
  created_at?: string;
  updated_at?: string;
};

const DEFAULT_QUERY_PARAMS: Omit<ProductQueryParameters, 'tags'> = {
  sort: 'id',
  limit: 20,
  offset: 0,
  category: null,
};

export default class ProductService {
  private backendURL: string | undefined = process.env.NEXT_PUBLIC_API_URL;

  async getCategories(): Promise<Category[]> {
    if (!this.backendURL) {
      console.error('BACKEND_URL is not set');
      return [];
    }

    const url = `${this.backendURL}/api/v1/products/categories`;

    try {
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        console.error('Response not OK:', res.status, res.statusText);
        return [];
      }

      const json = await res.json();
      console.log('Categories response:', json);
      return json.data ?? [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Set/Create a new category
  async setCategory(
    categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Category | null> {
    if (!this.backendURL) {
      console.error('BACKEND_URL is not set');
      return null;
    }

    const url = `${this.backendURL}/api/v1/products/categories`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!res.ok) {
        console.error('Response not OK:', res.status, res.statusText);
        return null;
      }

      const json = await res.json();
      console.log('Category created:', json);
      return json.data ?? null;
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  }

  // You might also want a method to get a single category by ID
  async getCategoryById(id: number): Promise<Category | null> {
    if (!this.backendURL) {
      console.error('BACKEND_URL is not set');
      return null;
    }

    const url = `${this.backendURL}/api/v1/products/categories/${id}`;

    try {
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        console.error('Response not OK:', res.status, res.statusText);
        return null;
      }

      const json = await res.json();
      return json.data ?? null;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      return null;
    }
  }

  async getProducts(params: ProductQueryParameters = {}): Promise<Product[]> {
    if (!this.backendURL) {
      console.error('BACKEND_URL is not set');
      return [];
    }

    const queryParams = this.buildQueryParams(params);
    const url = `${this.backendURL}/api/v1/products?${queryParams}`;

    console.log('Fetching URL:', url);

    try {
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        console.error('Response not OK:', res.status, res.statusText);
        return [];
      }

      const json = await res.json();
      console.log('Response data:', json);
      return json.data ?? [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProductDetails(id: string): Promise<Product> {
    const res = await fetch(`${this.backendURL}/api/v1/products/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Product not found');
    const json = await res.json();
    return json.data;
  }

  private buildQueryParams(overrides: ProductQueryParameters): string {
    const { tags, ...rest } = overrides;
    const params = { ...DEFAULT_QUERY_PARAMS, ...rest };

    const entries = Object.entries(params).filter(([, value]) => value !== undefined);
    const stringEntries = entries.map(([key, value]) => [key, String(value)]);

    const searchParams = new URLSearchParams(stringEntries);

    if (tags && tags.length > 0) {
      searchParams.set('tags', tags.join(','));
    }

    return searchParams.toString();
  }
}
