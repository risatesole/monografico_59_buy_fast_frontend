// lib/order-status.ts
//
// Shared order-status display config (label, colors, icon) used by admin
// pages that show orders (order list, dashboard, etc.).

import { Clock, CheckCircle2, Undo2, CreditCard, XCircle } from 'lucide-react';

export type OrderStatus = 'awaiting_payment' | 'fulfilled' | 'pending' | 'returned' | 'cancelled';

export const STATUS_UI: Record<
  OrderStatus,
  { badge: string; dot: string; label: string; icon: React.ElementType }
> = {
  awaiting_payment: {
    badge: 'bg-[#e8f0fe] text-[#1967d2] border-[#d2e3fc]',
    dot: 'bg-[#4285f4]',
    label: 'Esperando pago',
    icon: CreditCard,
  },
  pending: {
    badge: 'bg-[#fef7e0] text-[#b06000] border-[#feefc3]',
    dot: 'bg-[#f9ab00]',
    label: 'Pendiente',
    icon: Clock,
  },
  fulfilled: {
    badge: 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]',
    dot: 'bg-[#1e8e3e]',
    label: 'Completada',
    icon: CheckCircle2,
  },
  returned: {
    badge: 'bg-[#f1f3f4] text-[#5f6368] border-[#e8eaed]',
    dot: 'bg-[#9aa0a6]',
    label: 'Devuelta',
    icon: Undo2,
  },
  cancelled: {
    badge: 'bg-[#fce8e6] text-[#c5221f] border-[#fad2cf]',
    dot: 'bg-[#ea4335]',
    label: 'Cancelada',
    icon: XCircle,
  },
};
