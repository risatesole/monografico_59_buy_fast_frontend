import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// TYPES
// ============================================================================

interface ProductImage {
  id: number;
  image: string;
  image_type: string;
  alt_text: string;
  order: number;
}

interface ProductInventoryItem {
  variant_id: number;
  product_id: number;
  product_name: string;
  product_description: string;
  thumbnail: string | null;
  quantity: number;
  inventory_status: 'in_stock' | 'medium_stock' | 'low_stock' | 'out_of_stock';
  images: ProductImage[];
  sku: string;
  variantnumber: number;
  status: boolean;
  selling_price: number;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductInventoryItem[];
}

// Backend response types
interface BackendProduct {
  variant_id?: number;
  id?: number;
  product_id?: number;
  product_name?: string;
  product?: {
    name?: string;
    description?: string;
  };
  product_description?: string;
  thumbnail?: string | null;
  quantity?: number;
  images?: ProductImage[];
  sku?: string;
  variantnumber?: number;
  status?: boolean;
  selling_price?: string | number;
}

interface BackendResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: BackendProduct[];
}

// ============================================================================
// HELPERS
// ============================================================================

function getInventoryStatus(
  quantity: number
): 'in_stock' | 'medium_stock' | 'low_stock' | 'out_of_stock' {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity <= 10) return 'low_stock';
  if (quantity <= 50) return 'medium_stock';
  return 'in_stock';
}

function buildQueryParams(searchParams: URLSearchParams): string {
  const params = new URLSearchParams();

  // Pagination
  const limit = searchParams.get('limit') || '10';
  const offset = searchParams.get('offset') || '0';
  params.set('limit', limit);
  params.set('offset', offset);

  // Search
  const search = searchParams.get('search');
  if (search) params.set('search', search);

  // Status filter
  const status = searchParams.get('status');
  if (status) params.set('status', status);

  // Ordering
  const ordering = searchParams.get('ordering');
  if (ordering) params.set('ordering', ordering);

  // Category filter
  const category = searchParams.get('category');
  if (category) params.set('category', category);

  // Quantity filters
  const minQuantity = searchParams.get('min_quantity');
  if (minQuantity) params.set('min_quantity', minQuantity);

  const maxQuantity = searchParams.get('max_quantity');
  if (maxQuantity) params.set('max_quantity', maxQuantity);

  // Inventory status filter
  const inventoryStatus = searchParams.get('inventory_status');
  if (inventoryStatus) params.set('inventory_status', inventoryStatus);

  return params.toString();
}

function transformBackendItem(item: BackendProduct): ProductInventoryItem {
  return {
    variant_id: item.variant_id || item.id || 0,
    product_id: item.product_id || 0,
    product_name: item.product_name || item.product?.name || '',
    product_description: item.product_description || item.product?.description || '',
    thumbnail: item.thumbnail || null,
    quantity: item.quantity || 0,
    inventory_status: getInventoryStatus(item.quantity || 0),
    images: item.images || [],
    sku: item.sku || '',
    variantnumber: item.variantnumber || 0,
    status: item.status ?? true,
    selling_price:
      typeof item.selling_price === 'string'
        ? parseFloat(item.selling_price)
        : item.selling_price || 0,
  };
}

// ============================================================================
// GET HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = buildQueryParams(searchParams);

    // Build the backend API URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const url = `${backendUrl}/api/v1/admin/inventory/products/?${queryString}`;

    // Fetch data from backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Error al obtener el inventario' },
        { status: response.status }
      );
    }

    const data: BackendResponse = await response.json();

    // Transform the data to match our frontend types
    const transformedResults: ProductInventoryItem[] = (data.results || []).map(
      transformBackendItem
    );

    const responseData: ApiResponse = {
      count: data.count || 0,
      next: data.next || null,
      previous: data.previous || null,
      results: transformedResults,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
