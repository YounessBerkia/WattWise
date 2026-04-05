import type { Balance, Contract, EnergyReading, Trend } from '@/types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Wandelt einen ISO-Datumswert in einen UTC-Zeitstempel um.
 */
function parseDateToTimestamp(dateValue: string): number | null {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return Date.UTC(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = Date.parse(dateValue);

  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Liefert eine chronologisch sortierte Kopie der Zählerstände.
 */
function sortReadingsByTimestamp(readings: EnergyReading[]): EnergyReading[] {
  return [...readings].sort((a, b) => {
    const aTimestamp = parseDateToTimestamp(a.timestamp) ?? 0;
    const bTimestamp = parseDateToTimestamp(b.timestamp) ?? 0;

    return aTimestamp - bTimestamp;
  });
}

/**
 * Berechnet den Verbrauch zwischen zwei Zählerständen in kWh.
 *
 * @throws {Error} Wenn der aktuelle Zählerstand kleiner als der vorherige ist.
 */
export function calculateConsumption(
  currentReading: number,
  previousReading: number,
): number {
  if (currentReading < previousReading) {
    throw new Error(
      'Der aktuelle Zählerstand darf nicht kleiner als der vorherige sein.',
    );
  }

  return currentReading - previousReading;
}

/**
 * Berechnet die Anzahl der Tage zwischen zwei Datumswerten.
 * Bei ungültigen oder invertierten Zeiträumen wird 0 zurückgegeben.
 */
export function calculateDaysBetween(startDate: string, endDate: string): number {
  const startTimestamp = parseDateToTimestamp(startDate);
  const endTimestamp = parseDateToTimestamp(endDate);

  if (startTimestamp === null || endTimestamp === null || endTimestamp < startTimestamp) {
    return 0;
  }

  return Math.floor((endTimestamp - startTimestamp) / MS_PER_DAY);
}

/**
 * Berechnet den durchschnittlichen Tagesverbrauch auf Basis der ältesten und neuesten Messung.
 * Bei weniger als zwei Zählerständen oder einer Laufzeit von 0 Tagen wird 0 zurückgegeben.
 */
export function calculateAverageDailyUsage(readings: EnergyReading[]): number {
  if (readings.length < 2) {
    return 0;
  }

  const sortedReadings = sortReadingsByTimestamp(readings);
  const firstReading = sortedReadings[0];
  const lastReading = sortedReadings[sortedReadings.length - 1];
  const dayCount = calculateDaysBetween(firstReading.timestamp, lastReading.timestamp);

  if (dayCount === 0) {
    return 0;
  }

  const consumption = calculateConsumption(lastReading.kwh, firstReading.kwh);

  return consumption / dayCount;
}

/**
 * Erstellt eine 30-Tage-Prognose auf Basis des durchschnittlichen Tagesverbrauchs.
 */
export function calculateMonthlyProjection(readings: EnergyReading[]): number {
  return calculateAverageDailyUsage(readings) * 30;
}

/**
 * Erstellt eine 365-Tage-Prognose auf Basis des durchschnittlichen Tagesverbrauchs.
 */
export function calculateYearlyProjection(readings: EnergyReading[]): number {
  return calculateAverageDailyUsage(readings) * 365;
}

/**
 * Berechnet die Gesamtkosten aus variablem Verbrauchspreis und fixem Grundpreis.
 * Der Grundpreis wird optional anteilig über die Anzahl der Tage berechnet.
 */
export function calculateTotalCost(
  consumptionKwh: number,
  contract: Contract,
  days = 30,
): number {
  const safeConsumption = Number.isFinite(consumptionKwh) ? Math.max(consumptionKwh, 0) : 0;
  const safeDays = Number.isFinite(days) ? Math.max(days, 0) : 0;
  const variableCost = safeConsumption * contract.pricePerKwh;
  const fixedCost = (contract.baseCostMonthly / 30) * safeDays;

  return variableCost + fixedCost;
}

/**
 * Berechnet die Bilanz zwischen gezahltem Abschlag und tatsächlichen Kosten.
 * Positive Differenzen werden als Nachzahlung, negative als Rückzahlung zurückgegeben.
 */
export function calculateBalance(actualCost: number, paidAmount: number): Balance {
  const difference = actualCost - paidAmount;

  return {
    amount: Math.abs(difference),
    type: difference > 0 ? 'surcharge' : 'refund',
  };
}

/**
 * Berechnet die prozentuale Veränderung zwischen zwei Werten.
 * Bei Division durch 0 wird die Veränderung mit 0 Prozent, aber korrekter Richtung, zurückgegeben.
 */
export function calculateTrend(
  currentValue: number,
  previousValue: number,
  comparisonLabel = '',
): Trend {
  if (currentValue === previousValue) {
    return {
      percentage: 0,
      direction: 'neutral',
      comparisonLabel,
    };
  }

  const direction: Trend['direction'] =
    currentValue > previousValue ? 'up' : 'down';

  if (previousValue === 0) {
    return {
      percentage: 0,
      direction,
      comparisonLabel,
    };
  }

  return {
    percentage: Math.abs(((currentValue - previousValue) / previousValue) * 100),
    direction,
    comparisonLabel,
  };
}

/**
 * Liefert den neuesten Zählerstand oder `null`, wenn keine Werte vorhanden sind.
 */
export function getLatestReading(readings: EnergyReading[]): EnergyReading | null {
  if (readings.length === 0) {
    return null;
  }

  const sortedReadings = sortReadingsByTimestamp(readings);

  return sortedReadings[sortedReadings.length - 1] ?? null;
}

/**
 * Berechnet den Verbrauch für einen Datumsbereich anhand der Messwerte innerhalb des Zeitraums.
 * Bei ungültigem Zeitraum oder weniger als zwei Messpunkten wird 0 zurückgegeben.
 *
 * @throws {Error} Wenn ein späterer Messwert kleiner als ein früherer Messwert ist.
 */
export function calculateConsumptionForDateRange(
  readings: EnergyReading[],
  startDate: string,
  endDate: string,
): number {
  const startTimestamp = parseDateToTimestamp(startDate);
  const endTimestamp = parseDateToTimestamp(endDate);

  if (startTimestamp === null || endTimestamp === null || endTimestamp < startTimestamp) {
    return 0;
  }

  const rangeReadings = sortReadingsByTimestamp(readings).filter((reading) => {
    const timestamp = parseDateToTimestamp(reading.timestamp);

    return timestamp !== null && timestamp >= startTimestamp && timestamp <= endTimestamp;
  });

  if (rangeReadings.length < 2) {
    return 0;
  }

  return calculateConsumption(
    rangeReadings[rangeReadings.length - 1].kwh,
    rangeReadings[0].kwh,
  );
}
