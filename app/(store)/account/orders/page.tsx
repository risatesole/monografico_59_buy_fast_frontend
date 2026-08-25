import { Suspense } from 'react';
import OrdersContent from './OrdersContent';
import { SectionLabel } from '@/components/account/SectionLabel';

function OrdersFallback() {
  return (
    <div>
      <SectionLabel>Órdenes</SectionLabel>
      <div style={{ padding: '3rem', textAlign: 'center', color: '#43474f' }}>
        Cargando órdenes...
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersFallback />}>
      <OrdersContent />
    </Suspense>
  );
}
