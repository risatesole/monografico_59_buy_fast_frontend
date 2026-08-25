/**
 * Converts a number into a formatted US Dollar price string.
 * For example, 1234.56 becomes "$1,234.56".
 */
export const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
