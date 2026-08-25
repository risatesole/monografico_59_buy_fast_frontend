'use client';

import { createContext, useContext } from 'react';
import type { NavbarCartItem } from '@/components/navbar';

const CartContext = createContext<NavbarCartItem[]>([]);
export const useCheckoutCart = () => useContext(CartContext);

export function CheckoutWithCart({
  children,
  cartItems,
}: {
  children: React.ReactNode;
  cartItems: NavbarCartItem[];
}) {
  return <CartContext.Provider value={cartItems}>{children}</CartContext.Provider>;
}
