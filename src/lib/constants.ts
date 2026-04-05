/**
 * WattWise Constants
 *
 * Application-wide constants, defaults, and configuration values.
 * Written with German context in mind.
 */

import type { Contract, Settings, EnergyCategory } from '@/types';

/**
 * App identification
 */
export const APP_NAME = 'WattWise';
export const APP_VERSION = '1.0.0';

/**
 * LocalStorage key and schema version
 */
export const STORAGE_KEY = 'wattwise-storage';
export const STORAGE_VERSION = 1;

/**
 * Default contract values (German average 2026)
 */
export const DEFAULT_CONTRACT: Contract = {
  pricePerKwh: 0.32, // EUR per kWh (avg. 2026)
  baseCostMonthly: 12.0, // Monthly base fee
  expectedYearlyUsage: 2000, // kWh per year
};

/**
 * Default user settings
 */
export const DEFAULT_SETTINGS: Settings = {
  currency: 'EUR',
  darkMode: false,
  dateFormat: 'EU', // DD.MM.YYYY
  language: 'de',
};

/**
 * Chart colors — Okabe-Ito CVD-safe palette
 * Each color maps to an energy category for consistent visualization
 */
export const CHART_COLORS: Record<EnergyCategory, string> = {
  electricity: '#0072B2', // Deep Blue — primary electricity
  gas: '#E69F00', // Orange — gas/heating
  water: '#56B4E9', // Sky Blue — water
  solar: '#009E73', // Teal-Green — solar/efficient
  heating: '#D55E00', // Vermillion — heating critical
  other: '#CC79A7', // Reddish Purple — other
};

/**
 * Additional semantic colors for UI
 */
export const UI_COLORS = {
  primary: '#0072B2',
  secondary: '#009E73',
  efficient: '#22c55e', // Green for good status
  caution: '#f59e0b', // Amber for warnings
  critical: '#ef4444', // Red for errors/critical
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
} as const;

/**
 * Date format strings (compatible with date-fns)
 */
export const DATE_FORMATS = {
  EU: 'dd.MM.yyyy', // German: 02.04.2026
  US: 'MM/dd/yyyy', // US: 04/02/2026
  ISO: 'yyyy-MM-dd', // ISO: 2026-04-02
} as const;

/**
 * Photo upload constraints
 */
export const MAX_PHOTO_SIZE_MB = 5;
export const PHOTO_MAX_WIDTH = 800;
export const PHOTO_QUALITY = 0.7; // JPEG quality 0-1

/**
 * Limits and thresholds
 */
export const LIMITS = {
  maxReadingsPerYear: 1000,
  minKwhValue: 0,
  maxKwhValue: 999999.99,
  minCostPerKwh: 0.01,
  maxCostPerKwh: 10.0,
  localStorageSizeMb: 5,
} as const;

/**
 * UI sizing constants (8px grid system)
 */
export const SPACING = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
} as const;

/**
 * Breakpoints (matching Tailwind v4)
 */
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Animation durations (ms)
 */
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

/**
 * Route paths for navigation
 */
export const ROUTES = {
  dashboard: '/dashboard',
  addEntry: '/add-entry',
  analytics: '/analytics',
  costs: '/costs',
  history: '/history',
  settings: '/settings',
} as const;

/**
 * Period labels in German
 */
export const PERIOD_LABELS = {
  day: 'Tag',
  week: 'Woche',
  month: 'Monat',
  year: 'Jahr',
} as const;

/**
 * Error messages (German)
 */
export const ERROR_MESSAGES = {
  invalidDate: 'Ungültiges Datum',
  invalidKwh: 'Zählerstand muss zwischen 0 und 999999,99 liegen',
  invalidCost: 'Ungültiger Kostenwert',
  importFailed: 'Import fehlgeschlagen',
  exportFailed: 'Export fehlgeschlagen',
  storageFull: 'Speicherplatz erschöpft',
  photoTooLarge: 'Foto zu groß (max. 5 MB)',
} as const;