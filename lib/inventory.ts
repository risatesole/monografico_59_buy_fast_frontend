// lib/inventory.ts

export interface StockMovement {
  id: number;
  date_time: string;
  product_variant: {
    id: number;
    name: string;
    description: string;
    variant_number: number;
    slug: string;
    sku: string;
    status: boolean;
    selling_price: number;
    tax_rate: number;
    minimum_stock: number;
    product: {
      id: number;
      name: string;
      slug: string;
      category: {
        slug: string;
        label: string;
        description: string;
        priority: number;
      };
      product_type: string;
      product_type_label: string;
      thumbnail: string;
      tags: string[];
      created_at: string;
      updated_at: string;
    };
    images: {
      url: string;
      type: string;
      alt_text: string;
      order: number;
    }[];
    created_at: string;
    updated_at: string;
  };
  movement_type: string;
  movement_type_label: string;
  quantity: number;
  balance: number;
  document_reference: string;
}

export async function fetchStockMovementFromBackend(
  id: string,
  cookieHeader: string
): Promise<StockMovement | null> {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';

  try {
    const response = await fetch(`${backendUrl}/api/v1/admin/inventory/stockmovement/${id}/`, {
      headers: {
        Cookie: cookieHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Failed to fetch stock movement ${id}: ${response.status}`);
      return null;
    }

    const json = await response.json();

    if (json.status !== 'ok' || !json.data) {
      return null;
    }

    return json.data as StockMovement;
  } catch (error) {
    console.error(`Error fetching stock movement ${id}:`, error);
    return null;
  }
}
