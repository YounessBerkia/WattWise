/**
 * Utility functions for className merging
 */
import { clsx, type ClassValue } from 'clsx';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names with Tailwind CSS conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatiert ein gespeichertes Datum konsistent als DD-MM-YYYY.
 */
export function formatDisplayDate(dateValue: string | Date) {
  return format(new Date(dateValue), 'dd-MM-yyyy');
}

/**
 * Formatiert einen kWh-Wert auf maximal 2 Nachkommastellen ohne unnötige Nullen.
 * 7141.0 → "7141", 8.5 → "8.5", 8.54 → "8.54"
 */
export function formatKwh(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  if (rounded % 1 === 0) return rounded.toFixed(0);
  if ((rounded * 10) % 1 === 0) return rounded.toFixed(1);
  return rounded.toFixed(2);
}
