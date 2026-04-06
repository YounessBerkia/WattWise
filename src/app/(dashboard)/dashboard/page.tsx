'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEnergyStore } from '@/hooks/useEnergyStore';
import { KPICard } from '@/components/features/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Zap, Calendar, TrendingUp, Target, ArrowUpRight, Sparkles } from 'lucide-react';
import {
  calculateAverageDailyUsage,
  calculateMonthlyProjection,
  calculateYearlyProjection,
  getLatestReading,
  calculateTrend,
  getReadingConsumptionPoints,
} from '@/lib/calculations';
import { formatDisplayDate, formatKwh } from '@/lib/utils';

// Lazy load chart component for performance
const ConsumptionChart = dynamic(
  () => import('@/components/features/dashboard/consumption-chart').then((m) => m.ConsumptionChart),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Verbrauch über Zeit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-border h-80 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    ),
  },
);

export default function DashboardPage() {
  const { readings, contract } = useEnergyStore();

  // Berechnungen
  const lastReading = getLatestReading(readings);
  const dailyAvg = calculateAverageDailyUsage(readings);
  const monthlyProjection = calculateMonthlyProjection(readings);
  const yearlyProjection = calculateYearlyProjection(readings);
  const consumptionPoints = getReadingConsumptionPoints(readings);

  // Aktueller Verbrauch (seit letztem Eintrag)
  const currentConsumption =
    consumptionPoints.length > 0 ? consumptionPoints[consumptionPoints.length - 1].consumption : 0;

  // Trends (Dummy-Werte für Demo - später aus echten Vergleichen)
  const consumptionTrend = calculateTrend(currentConsumption, 150);
  const dailyTrend = calculateTrend(dailyAvg, 8.0);
  const yearlyTrend = calculateTrend(yearlyProjection, contract.expectedYearlyUsage);
  const latestReadingDate = lastReading ? formatDisplayDate(lastReading.timestamp) : null;

  return (
    <div className="space-y-6 lg:space-y-8">
      <Card variant="glass" className="relative overflow-hidden [--motion-delay:40ms]">
        <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(56,132,255,0.14),transparent_42%),radial-gradient(circle_at_72%_18%,rgba(44,182,125,0.10),transparent_30%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-text-secondary mb-4 inline-flex items-center gap-2 rounded-full border border-white/65 bg-white/60 px-3 py-1 text-xs font-semibold tracking-[0.24em] uppercase dark:border-white/10 dark:bg-white/8">
              <Sparkles className="text-primary h-3.5 w-3.5" />
              Energy Overview
            </div>
            <h1 className="text-text text-4xl font-semibold tracking-tight lg:text-5xl">
              Dashboard
            </h1>
            <p className="text-text-secondary mt-3 max-w-xl text-base sm:text-lg">
              Verbrauch, Trends und Kosten an einem Ort mit einer ruhigeren, fokussierten Übersicht.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
            <div className="rounded-[24px] bg-white/62 p-4 shadow-sm dark:bg-white/8">
              <p className="text-text-secondary text-sm font-medium">Letzter Stand</p>
              <p className="text-text mt-2 text-3xl font-semibold tracking-tight">
                {lastReading ? lastReading.kwh.toFixed(0) : '--'}
                <span className="text-text-secondary ml-2 text-base font-medium">kWh</span>
              </p>
              <p className="text-text-secondary mt-1 text-sm">
                {latestReadingDate ? `Aktualisiert am ${latestReadingDate}` : 'Noch keine Daten'}
              </p>
            </div>

            <div className="bg-primary rounded-[24px] p-4 text-white shadow-lg">
              <p className="text-sm font-medium text-white/78">Jahresziel im Blick</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                {formatKwh(yearlyProjection)}
                <span className="ml-2 text-base font-medium text-white/70">kWh</span>
              </p>
              <p className="mt-1 text-sm text-white/78">
                {yearlyTrend.percentage.toFixed(1)}% vs. Vertragsziel
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap gap-3">
          <Link
            href="/add-entry"
            className="bg-primary inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:w-auto sm:text-base"
          >
            Eintrag hinzufügen
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href="/analytics"
            className="text-text inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/65 bg-white/75 px-6 text-sm font-medium shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md sm:w-auto sm:text-base dark:border-white/12 dark:bg-white/8 dark:hover:bg-white/12"
          >
            Zur Analyse
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Card>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <KPICard
          className="[--motion-delay:100ms]"
          label="Aktueller Verbrauch"
          value={formatKwh(currentConsumption)}
          unit="kWh"
          icon={Zap}
          trend={consumptionTrend}
          trendLabel="vs. vorherigem Eintrag"
        />

        <KPICard
          className="[--motion-delay:150ms]"
          label="Ø pro Tag"
          value={formatKwh(dailyAvg)}
          unit="kWh/Tag"
          icon={Calendar}
          trend={dailyTrend}
        />

        <KPICard
          className="[--motion-delay:200ms]"
          label="Prognose Monat"
          value={formatKwh(monthlyProjection)}
          unit="kWh"
          icon={TrendingUp}
        />

        <KPICard
          className="[--motion-delay:250ms]"
          label="Prognose Jahr"
          value={formatKwh(yearlyProjection)}
          unit="kWh"
          icon={Target}
          trend={yearlyTrend}
          trendLabel="vs. Vertragsziel"
        />
      </div>

      {/* Charts Area */}
      <div className="space-y-6">
        <ConsumptionChart readings={readings} />

        <Card className="relative overflow-hidden [--motion-delay:300ms]">
          <div className="from-primary/18 via-secondary/10 absolute inset-x-0 top-0 h-24 bg-gradient-to-br to-transparent" />
          <div className="relative flex h-full min-h-[24rem] flex-col">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-text-secondary text-sm font-medium tracking-[0.2em] uppercase">
                  Spotlight
                </p>
                <h3 className="text-text mt-2 text-2xl font-semibold tracking-tight">
                  Kostenübersicht
                </h3>
              </div>
              <span className="text-primary flex h-12 w-12 items-center justify-center rounded-2xl bg-white/75 shadow-sm dark:bg-white/10">
                <TrendingUp className="h-5 w-5" />
              </span>
            </div>

            <div className="text-text-secondary flex flex-1">
              {lastReading ? (
                <div className="grid w-full gap-4 rounded-[26px] bg-white/65 p-6 shadow-sm dark:bg-white/8">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.85fr)]">
                    <div>
                      <p className="text-text-secondary text-sm font-medium">
                        Aktueller Zählerstand
                      </p>
                      <p className="text-text mt-3 text-5xl font-semibold tracking-tight">
                        {lastReading.kwh.toFixed(0)}
                        <span className="text-text-secondary ml-2 text-lg font-medium">kWh</span>
                      </p>
                      <p className="text-text-secondary mt-3 text-sm">
                        Zuletzt erfasst am {latestReadingDate}
                      </p>
                    </div>

                    <div className="bg-primary rounded-3xl px-5 py-4 text-white shadow-lg">
                      <p className="text-sm font-medium text-white/78">Jährliche Projektion</p>
                      <p className="mt-3 text-3xl font-semibold tracking-tight">
                        {formatKwh(yearlyProjection)}
                        <span className="ml-2 text-base font-medium text-white/70">kWh</span>
                      </p>
                      <p className="mt-2 text-sm text-white/78">
                        {yearlyTrend.percentage.toFixed(1)}% vs. Vertragsziel
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="bg-background/70 dark:bg-background/30 rounded-2xl px-4 py-3">
                      <p className="text-text-secondary text-xs tracking-[0.16em] uppercase">
                        Monat
                      </p>
                      <p className="text-text mt-2 text-xl font-semibold">
                        {formatKwh(monthlyProjection)} kWh
                      </p>
                    </div>
                    <div className="bg-background/70 dark:bg-background/30 rounded-2xl px-4 py-3">
                      <p className="text-text-secondary text-xs tracking-[0.16em] uppercase">
                        Ø pro Tag
                      </p>
                      <p className="text-text mt-2 text-xl font-semibold">
                        {formatKwh(dailyAvg)} kWh
                      </p>
                    </div>
                    <div className="bg-background/70 dark:bg-background/30 rounded-2xl px-4 py-3">
                      <p className="text-text-secondary text-xs tracking-[0.16em] uppercase">
                        Aktueller Verbrauch
                      </p>
                      <p className="text-text mt-2 text-xl font-semibold">
                        {formatKwh(currentConsumption)} kWh
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full rounded-[26px] bg-white/65 p-8 text-center shadow-sm dark:bg-white/8">
                  <div className="bg-primary/10 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-[20px]">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <p className="text-text mt-5 text-lg font-medium">Keine Daten vorhanden</p>
                  <p className="text-text-secondary mt-2 text-sm">
                    Erfasse deinen ersten Zählerstand, um Kosten und Verbrauch sichtbar zu machen.
                  </p>
                  <Link
                    href="/add-entry"
                    className="bg-primary mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Ersten Eintrag erstellen
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Letzte Einträge */}
      <Card className="[--motion-delay:360ms]">
        <CardHeader className="items-center">
          <div>
            <CardTitle>Letzte Einträge</CardTitle>
            <p className="text-text-secondary mt-2 text-sm">
              Die neuesten Messpunkte für einen schnellen Verlauf.
            </p>
          </div>
          <Link
            href="/history"
            className="text-text-secondary hover:text-text hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 hover:bg-white/60 sm:inline-flex dark:hover:bg-white/8"
          >
            Alles ansehen
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {readings.length === 0 ? (
            <div className="rounded-[24px] bg-white/62 px-6 py-10 text-center shadow-sm dark:bg-white/8">
              <div className="bg-primary/10 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-[20px]">
                <Zap className="h-6 w-6" />
              </div>
              <p className="text-text mt-5 text-lg font-medium">Noch keine Zählerstände erfasst</p>
              <p className="text-text-secondary mt-2 text-sm">
                Füge deinen ersten Eintrag hinzu, damit Verlauf und Prognosen sichtbar werden.
              </p>
              <Link
                href="/add-entry"
                className="text-text mt-5 inline-flex items-center gap-2 rounded-full border border-white/65 bg-white/75 px-5 py-2.5 text-sm font-medium shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md dark:border-white/12 dark:bg-white/8 dark:hover:bg-white/12"
              >
                Jetzt starten
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {readings
                .slice(-5)
                .reverse()
                .map((reading) => (
                  <div
                    key={reading.id}
                    className="flex items-center justify-between rounded-2xl bg-white/62 px-4 py-4 shadow-sm dark:bg-white/8"
                  >
                    <div>
                      <p className="text-text-secondary text-sm font-medium">Messdatum</p>
                      <span className="text-text">
                        {formatDisplayDate(reading.timestamp)}
                      </span>
                    </div>
                    <span className="text-text text-lg font-semibold tracking-tight">
                      {reading.kwh.toFixed(2)} kWh
                    </span>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
