// lib/format.ts
//
// Shared display formatters for money (Dominican peso) and dates, used by
// admin pages that show order data (order list, dashboard, etc.).

const dateFormatter = new Intl.DateTimeFormat('es-DO', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const currencyFormatter = new Intl.NumberFormat('es-DO', {
  style: 'currency',
  currency: 'DOP',
});

export function formatDate(dateString: string): string {
  try {
    return dateFormatter.format(new Date(dateString));
  } catch {
    return dateString;
  }
}

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}
