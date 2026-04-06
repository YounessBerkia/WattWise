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
