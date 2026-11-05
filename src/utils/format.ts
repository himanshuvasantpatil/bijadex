import { CurrencyConfig } from '../types';

export const GLOBAL_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', position: 'prefix', decimals: 2, decimalSep: '.', thousandSep: ',' },
  { code: 'EUR', symbol: '€', name: 'Euro', position: 'prefix', decimals: 2, decimalSep: ',', thousandSep: '.' },
  { code: 'GBP', symbol: '£', name: 'British Pound', position: 'prefix', decimals: 2, decimalSep: '.', thousandSep: ',' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', position: 'prefix', decimals: 2, decimalSep: '.', thousandSep: ',' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', position: 'prefix', decimals: 0, decimalSep: '.', thousandSep: ',' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', position: 'prefix', decimals: 2, decimalSep: '.', thousandSep: ',' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', position: 'prefix', decimals: 2, decimalSep: '.', thousandSep: ',' },
  { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', position: 'prefix', decimals: 2, decimalSep: '.', thousandSep: ',' },
  { code: 'SAR', symbol: 'SAR ', name: 'Saudi Riyal', position: 'prefix', decimals: 2, decimalSep: '.', thousandSep: ',' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', position: 'prefix', decimals: 2, decimalSep: '.', thousandSep: ',' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', position: 'prefix', decimals: 2, decimalSep: '.', thousandSep: ',' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', position: 'prefix', decimals: 2, decimalSep: ',', thousandSep: '.' },
  { code: 'ZAR', symbol: 'R ', name: 'South African Rand', position: 'prefix', decimals: 2, decimalSep: '.', thousandSep: ',' },
  { code: 'CHF', symbol: 'CHF ', name: 'Swiss Franc', position: 'prefix', decimals: 2, decimalSep: '.', thousandSep: '\'' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', position: 'prefix', decimals: 2, decimalSep: '.', thousandSep: ',' }
];

export const DEFAULT_CURRENCY = GLOBAL_CURRENCIES[0];

// Active runtime currency singleton for zero-overhead formatting
let currentActiveCurrency: CurrencyConfig = DEFAULT_CURRENCY;

export function setActiveCurrency(currency: CurrencyConfig) {
  currentActiveCurrency = currency;
}

export function getActiveCurrency(): CurrencyConfig {
  return currentActiveCurrency;
}

/**
 * Universal Currency Formatter respecting active business currency & country locale
 */
export function formatCurrency(amount: number, config?: CurrencyConfig): string {
  const c = config || currentActiveCurrency || DEFAULT_CURRENCY;
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);

  const fixed = absVal.toFixed(c.decimals);
  const parts = fixed.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, c.thousandSep);
  const decimalPart = parts[1] !== undefined ? `${c.decimalSep}${parts[1]}` : '';

  const formattedNum = `${integerPart}${decimalPart}`;

  if (c.position === 'suffix') {
    return `${isNegative ? '-' : ''}${formattedNum} ${c.symbol.trim()}`;
  }
  return `${isNegative ? '-' : ''}${c.symbol}${formattedNum}`;
}

export function formatCompactCurrency(amount: number, config?: CurrencyConfig): string {
  const c = config || currentActiveCurrency || DEFAULT_CURRENCY;
  if (Math.abs(amount) >= 1_000_000) {
    return `${c.symbol}${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${c.symbol}${(amount / 1_000).toFixed(1)}k`;
  }
  return formatCurrency(amount, c);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export function formatTimeOnly(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}
