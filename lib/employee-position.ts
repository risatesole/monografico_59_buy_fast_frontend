// lib/employee-position.ts
//
// Shared employee-position type and Spanish display labels, used by the
// employee creation form and the admin employees report filters.

export type Position =
  | 'admin'
  | 'store_manager'
  | 'order_manager'
  | 'inventory_manager'
  | 'customer_support'
  | 'logistics'
  | 'content_manager'
  | 'finance';

export const POSITION_OPTIONS: { value: Position; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'store_manager', label: 'Gerente de tienda' },
  { value: 'order_manager', label: 'Gerente de pedidos' },
  { value: 'inventory_manager', label: 'Gerente de inventario' },
  { value: 'customer_support', label: 'Atención al cliente' },
  { value: 'logistics', label: 'Logística' },
  { value: 'content_manager', label: 'Gerente de contenido' },
  { value: 'finance', label: 'Finanzas' },
];
