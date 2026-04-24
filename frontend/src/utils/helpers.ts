import { useState, useEffect } from 'react';

/** Debounce a value — useful for search inputs */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/** Format price to USD string */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/** Format date to readable string */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Truncate text */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/** Get order status color */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-warning-500/20 text-warning-500',
    PROCESSING: 'bg-primary-500/20 text-primary-400',
    SHIPPED: 'bg-blue-500/20 text-blue-400',
    DELIVERED: 'bg-success-500/20 text-success-400',
    CANCELLED: 'bg-danger-500/20 text-danger-400',
    REFUNDED: 'bg-surface-500/20 text-surface-400',
  };
  return colors[status] || 'bg-surface-500/20 text-surface-400';
}
