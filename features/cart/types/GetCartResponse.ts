import type { CartItem } from './CartItem';

export type GetCartResponse = {
  status: string;
  data: {
    items: CartItem[];
  };
};
