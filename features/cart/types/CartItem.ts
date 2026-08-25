export type CartItem = {
  id: number | string; // cart item id
  product: {
    id: number | string; // product variant id
    name: string;
    description: string;
    selling_price: number;
    slug: string;
    images: Array<{
      type: string;
      url: string;
    }>;
  };
  quantity: number;
  tax_rate: number;
};
