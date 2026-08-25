// lib/tax.ts
//
// Shared tax-inclusive pricing helpers. `taxRate` is a fraction (e.g. 0.18 for
// 18%), matching ProductVariant.tax_rate on the backend.

export function getTaxAmount(basePrice: number, taxRate: number): number {
  return basePrice * taxRate;
}

export function getPriceWithTax(basePrice: number, taxRate: number): number {
  return basePrice + getTaxAmount(basePrice, taxRate);
}
