export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

export function calculatePercentage(shares: number, totalShares: number): number {
  if (totalShares === 0) return 0;
  return Math.round((shares / totalShares) * 100 * 10) / 10;
}