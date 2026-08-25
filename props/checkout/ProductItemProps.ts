export type ProductItemProps = {
  item: {
    id: number | string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  };
};
