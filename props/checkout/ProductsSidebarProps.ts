export type ProductsSidebarProps = {
  items: {
    id: number | string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }[];
  total: number;
};
