/**
 * Format number as Philippine Peso (PHP)
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "₱1,234.56")
 */
export function formatPHP(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Convert USD to PHP (approximate rate: 1 USD = 56 PHP)
 * Use this for converting existing USD prices to PHP
 */
export function usdToPhp(usdAmount: number): number {
  const exchangeRate = 56 // 1 USD = 56 PHP (approximate)
  return Math.round(usdAmount * exchangeRate * 100) / 100
}
