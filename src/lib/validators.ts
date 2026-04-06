/**
 * WattWise Zod Validation Schemas
 *
 * Schemas for form validation and JSON import/export.
 * Uses Zod for runtime type validation with German error messages.
 */

import { z } from 'zod';

import type { EnergyReading } from '@/types';

/**
 * Energy Reading Form Schema
 * Validates individual meter reading submissions
 */
export const energyReadingSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datumsformat (YYYY-MM-DD)')
    .refine(
      (date) => {
        const d = new Date(date);
        return d <= new Date();
      },
      { message: 'Datum darf nicht in der Zukunft liegen' }
    ),

  kwh: z
    .number()
    .min(0, 'Zählerstand muss positiv sein')
    .max(999999.99, 'Zählerstand zu groß')
    .refine(
      (val) => Number.isFinite(val),
      { message: 'Ungültiger Zählerstand' }
    ),

  photo: z
    .instanceof(File)
    .refine(
      (file) => !file || file.size <= 5_000_000,
      { message: 'Datei zu groß (maximal 5 MB)' }
    )
    .refine(
      (file) => !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      { message: 'Nur JPEG, PNG oder WebP erlaubt' }
    )
    .optional()
    .nullable(),
});

export type EnergyReadingFormData = z.infer<typeof energyReadingSchema>;

/**
 * Contract Schema
 * Validates energy contract configuration
 */
export const contractSchema = z.object({
  pricePerKwh: z
    .number()
    .min(0.01, 'Preis muss mindestens 0,01 € sein')
    .max(10, 'Unrealistischer Preis (max. 10 €/kWh)')
    .multipleOf(0.01, 'Maximal 2 Nachkommastellen'),

  baseCostYearly: z
    .number()
    .min(0, 'Grundpreis muss positiv sein')
    .max(10000, 'Unrealistischer Grundpreis')
    .multipleOf(0.01, 'Maximal 2 Nachkommastellen'),

  expectedYearlyUsage: z
    .number()
    .int('Ganzzahl erforderlich')
    .min(100, 'Mindestens 100 kWh/Jahr')
    .max(100000, 'Maximal 100.000 kWh/Jahr'),

  monthlyAdvancePayment: z
    .number()
    .min(0, 'Abschlag muss positiv sein')
    .max(2000, 'Unrealistischer Abschlag')
    .multipleOf(0.01, 'Maximal 2 Nachkommastellen'),
});

export type ContractFormData = z.infer<typeof contractSchema>;

/**
 * Settings Schema
 * Validates user preferences
 */
export const settingsSchema = z.object({
  darkMode: z.boolean(),
  dateFormat: z.enum(['EU', 'US', 'ISO']),
  language: z.enum(['de', 'en']),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

/**
 * Complete WattWise Data Schema
 * Used for JSON import validation
 */
export const wattWiseDataSchema = z.object({
  version: z.number().int().min(1),
  readings: z.array(
    z.object({
      id: z.string().uuid(),
      timestamp: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      kwh: z.number().min(0),
      cost: z.number().min(0).optional(),
      source: z.enum(['manual', 'import']),
      photoBase64: z.string().optional(),
    })
  ),
  contract: contractSchema.extend({
    baseCostMonthly: z.number().optional(),
  }),
  settings: settingsSchema.extend({
    currency: z.literal('EUR'),
  }),
  metadata: z.object({
    createdAt: z.string(),
    lastModified: z.string(),
  }),
});

export type WattWiseDataValidated = z.infer<typeof wattWiseDataSchema>;

/**
 * Validates a JSON import string
 * @throws Error if JSON is invalid or schema doesn't match
 */
export function validateImportData(jsonData: string): WattWiseDataValidated {
  const parsed = JSON.parse(jsonData);
  const validated = wattWiseDataSchema.parse(parsed);
  const sortedReadings = [...validated.readings].sort((left, right) =>
    left.timestamp.localeCompare(right.timestamp)
  );

  for (let index = 1; index < sortedReadings.length; index += 1) {
    const previousReading = sortedReadings[index - 1];
    const currentReading = sortedReadings[index];

    if (currentReading.timestamp === previousReading.timestamp) {
      throw new Error('Import enthält mehrere Einträge für dasselbe Datum');
    }

    if (currentReading.kwh < previousReading.kwh) {
      throw new Error('Import enthält absteigende Zählerstände und kann nicht übernommen werden');
    }
  }

  return validated;
}

/**
 * Checks if a new reading value is valid compared to the last reading
 * @returns true if new reading is greater than last reading
 */
export interface ReadingSequenceValidationResult {
  valid: boolean;
  message?: string;
}

export function validateReadingSequence(
  newReading: number,
  previousReading: EnergyReading | null,
  nextReading: EnergyReading | null,
  sameDateReading: EnergyReading | null
): ReadingSequenceValidationResult {
  if (sameDateReading) {
    return {
      valid: false,
      message: `Für das Datum ${sameDateReading.timestamp} existiert bereits ein Eintrag`,
    };
  }

  if (previousReading && newReading <= previousReading.kwh) {
    return {
      valid: false,
      message: `Zählerstand muss größer als ${previousReading.kwh.toFixed(2)} sein`,
    };
  }

  if (nextReading && newReading >= nextReading.kwh) {
    return {
      valid: false,
      message: `Zählerstand muss kleiner als ${nextReading.kwh.toFixed(2)} sein`,
    };
  }

  return { valid: true };
}

/**
 * Safe parse wrapper that returns null instead of throwing
 */
export function safeParseImportData(
  jsonData: string
): WattWiseDataValidated | null {
  try {
    return validateImportData(jsonData);
  } catch {
    return null;
  }
}
