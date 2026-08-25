import { type StockMovement } from '../types/stockMovement';

export default class InventoryService {
  async getStockMovements(params: {
    limit: number;
    offset: number;
    search?: string;
    sort?: string;
  }): Promise<StockMovement[]> {
    const queryParams = new URLSearchParams({
      limit: params.limit.toString(),
      offset: params.offset.toString(),
      ...(params.search && { search: params.search }),
      ...(params.sort && { sort: params.sort }),
    });

    const response = await fetch(
      `/api/v1/admin/inventory/stockmovement?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Forward cookies
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch stock movements');
    }

    const data = await response.json();
    return data.data || [];
  }
}

//  InventoryService();
