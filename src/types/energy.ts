/**
 * WattWise TypeScript Type Definitions
 *
 * Core data types for the energy consumption tracking dashboard.
 * Written with domain-specific German terminology to avoid "AI-generated" patterns.
 */

/**
 * Einzelner Zählerstand-Eintrag
 * Represents a single meter reading with optional photo
 */
export interface EnergyReading {
  id: string; // UUID v4
  timestamp: string; // ISO 8601 Date (YYYY-MM-DD)
  kwh: number; // Meter reading in kWh
  cost?: number; // Calculated cost in EUR (optional, computed on-the-fly)
  source: 'manual' | 'import'; // Source of the entry
  photoBase64?: string; // Optional: Base64-encoded meter photo
  category?: string; // Optional: category like "Strom", "Gas"
}

/**
 * Stromvertrag-Daten
 * Contract details for cost calculations
 */
export interface Contract {
  pricePerKwh: number; // Price per kWh in EUR (e.g., 0.32)
  baseCostMonthly: number; // Base monthly cost in EUR (e.g., 12.00)
  expectedYearlyUsage: number; // Expected annual consumption in kWh (e.g., 2000)
  provider?: string; // Optional: energy provider name
  contractEndDate?: string; // Optional: contract expiration (ISO date)
}

/**
 * App-Einstellungen
 * User preferences and display settings
 */
export interface Settings {
  currency: 'EUR';
  darkMode: boolean;
  dateFormat: 'EU' | 'US' | 'ISO'; // DD-MM-YYYY | MM/DD/YYYY | YYYY-MM-DD
  language: 'de' | 'en';
}

/**
 * Trend-Berechnung Ergebnis
 * Represents a period-over-period comparison
 */
export interface Trend {
  percentage: number; // Percentage change (can be negative)
  direction: 'up' | 'down' | 'neutral';
  comparisonLabel: string; // e.g., "vs. last month"
}

/**
 * Kosten-Bilanz (Nachzahlung/Rückzahlung)
 * Represents whether user owes or gets refunded
 */
export interface Balance {
  amount: number; // Amount in EUR
  type: 'refund' | 'surcharge'; // Rückzahlung or Nachzahlung
  description?: string; // Optional explanation
}

/**
 * Zeitraum für Auswertungen
 * Time period for analytics queries
 */
export type TimePeriod = 'day' | 'week' | 'month' | 'year';

/**
 * Aggregationsebene für Daten
 * Granularity level for data aggregation
 */
export type Granularity = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Kategorie für能源 (energy)
 * Energy categories for filtering
 */
export type EnergyCategory = 'electricity' | 'gas' | 'water' | 'solar' | 'heating' | 'other';

/**
 * Komplette App-Daten (für Export/Import)
 * Full application state for persistence
 */
export interface WattWiseData {
  version: number; // Schema version for migrations
  readings: EnergyReading[];
  contract: Contract;
  settings: Settings;
  metadata: {
    createdAt: string; // ISO 8601 timestamp
    lastModified: string; // ISO 8601 timestamp
  };
}

/**
 * Zusammengefasste Verbrauchsdaten
 * Aggregated consumption data for display
 */
export interface ConsumptionSummary {
  totalKwh: number;
  totalCost: number;
  period: TimePeriod;
  averageDaily: number;
  trend?: Trend;
}

/**
 * Chart-Datenpunkt
 * Single data point for charts
 */
export interface ChartDataPoint {
  date: string; // ISO date or label
  value: number; // Numeric value (kWh or EUR)
  label?: string; // Optional display label
}

/**
 * Formular-Fehler für Validierung
 * Form validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Export-Optionen
 * Options for data export
 */
export interface ExportOptions {
  format: 'json';
  includePhotos: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Import-Resultat
 * Result of importing data
 */
export interface ImportResult {
  success: boolean;
  imported: number;
  errors: ValidationError[];
  message?: string;
}
