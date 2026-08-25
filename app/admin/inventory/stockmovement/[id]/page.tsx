import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import StockMovementDetailsClient from './movementClient';
import { fetchStockMovementFromBackend } from '@/lib/inventory';

type StockMovementDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function StockMovementDetailsPage({ params }: StockMovementDetailsPageProps) {
  const { id } = await params;

  // Server-to-server call, forward the session cookie
  const cookieStore = await cookies();
  const movement = await fetchStockMovementFromBackend(id, cookieStore.toString());

  if (!movement) {
    notFound();
  }

  return <StockMovementDetailsClient initialMovement={movement} />;
}
