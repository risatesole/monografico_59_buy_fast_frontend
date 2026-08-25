import type { Product } from '@/entities/product';

type StockMovementType = 'initial_inventory' | 'purchase_entry' | 'customer_sell';

export type StockMovement = {
  id: number;
  date_time: string;
  product: Product;
  movement: {
    type: StockMovementType;
  };
  quantity: number;
  balance: number;
  document_reference: string | null;
};

export type StockMomentResponse = {
  status: 'ok';
  data: StockMovement[];
};
