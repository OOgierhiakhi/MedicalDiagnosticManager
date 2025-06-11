/**
 * Utility functions for currency formatting and parsing
 */

/**
 * Formats a currency amount for display with proper thousand separators
 * @param amount - The amount to format (string or number)
 * @param currency - The currency symbol (default: "₦")
 * @returns Formatted currency string
 */
export function formatCurrency(amount: string | number | null | undefined, currency: string = "₦"): string {
  // Handle null, undefined, empty string, or 0
  if (amount === null || amount === undefined || amount === '') return `${currency}0`;
  if (amount === 0) return `${currency}0`;
  
  // Convert to string and clean non-numeric characters except dots and dashes
  const cleanAmount = String(amount).replace(/[^\d.-]/g, '');
  
  // Parse as float
  const numAmount = parseFloat(cleanAmount);
  
  // Check if parsing resulted in NaN
  if (isNaN(numAmount)) {
    console.warn('formatCurrency: Invalid amount received:', amount, 'cleaned:', cleanAmount);
    return `${currency}0`;
  }
  
  return `${currency}${numAmount.toLocaleString()}`;
}

/**
 * Parses a currency amount to a number, handling various string formats
 * @param amount - The amount to parse
 * @returns Parsed number or 0 if invalid
 */
export function parseCurrencyAmount(amount: string | number | null | undefined): number {
  if (!amount && amount !== 0) return 0;
  
  const cleanAmount = amount.toString().replace(/[^\d.-]/g, '');
  const numAmount = parseFloat(cleanAmount);
  
  return isNaN(numAmount) ? 0 : numAmount;
}

/**
 * Validates if an amount is a valid currency value
 * @param amount - The amount to validate
 * @returns True if valid, false otherwise
 */
export function isValidCurrencyAmount(amount: string | number | null | undefined): boolean {
  if (!amount && amount !== 0) return false;
  
  const cleanAmount = amount.toString().replace(/[^\d.-]/g, '');
  const numAmount = parseFloat(cleanAmount);
  
  return !isNaN(numAmount) && numAmount >= 0;
}