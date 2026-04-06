'use client';

import { AreaChart } from '@tremor/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { formatDisplayDate } from '@/lib/utils';
import type { EnergyReading } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, ArrowUpRight } from 'lucide-react';

interface ConsumptionChartProps {
  readings: EnergyReading[];
}

/**
 * Area chart showing consumption over time
 * Lazy loaded for performance optimization
 */
export function ConsumptionChart({ readings }: ConsumptionChartProps) {
  // Prepare data for chart
  const chartData = readings
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((r) => ({
      date: formatDisplayDate(r.timestamp),
      Zählerstand: r.kwh,
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="items-center">
          <div>
            <p className="text-text-secondary text-sm font-medium tracking-[0.2em] uppercase">
              Trend
            </p>
            <CardTitle className="mt-2">Verbrauch über Zeit</CardTitle>
          </div>
          <span className="text-primary flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 shadow-sm dark:bg-white/10">
            <Activity className="h-5 w-5" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="rounded-[24px] bg-white/62 px-6 py-12 text-center shadow-sm dark:bg-white/8">
            <div className="bg-primary/10 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-[20px]">
              <Activity className="h-6 w-6" />
            </div>
            <p className="text-text mt-5 text-lg font-medium">Keine Daten vorhanden</p>
            <p className="text-text-secondary py-2">
              Füge Zählerstände hinzu, um eine Verlaufskurve zu sehen.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="items-center">
        <div>
          <p className="text-text-secondary text-sm font-medium tracking-[0.2em] uppercase">
            Trend
          </p>
          <CardTitle className="mt-2">Verbrauch über Zeit</CardTitle>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-text-secondary hidden rounded-full border border-white/65 bg-white/75 px-3 py-1.5 text-sm shadow-sm sm:inline-flex dark:border-white/10 dark:bg-white/8">
            {chartData.length} Einträge
          </div>
          <span className="text-primary flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 shadow-sm dark:bg-white/10">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] bg-white/62 px-4 py-4 shadow-sm dark:bg-white/8">
            <p className="text-text-secondary text-xs tracking-[0.16em] uppercase">Erster Punkt</p>
            <p className="text-text mt-2 text-lg font-semibold">{chartData[0]?.date}</p>
          </div>
          <div className="rounded-[22px] bg-white/62 px-4 py-4 shadow-sm dark:bg-white/8">
            <p className="text-text-secondary text-xs tracking-[0.16em] uppercase">Aktuell</p>
            <p className="text-text mt-2 text-lg font-semibold">
              {chartData[chartData.length - 1]?.['Zählerstand'].toFixed(0)} kWh
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[26px] bg-white/72 p-4 shadow-sm dark:bg-white/8">
          {/* SVG gradient definition for the area fill */}
          <svg width="0" height="0" className="absolute" aria-hidden="true">
            <defs>
              <linearGradient id="ww-trend-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0072B2" stopOpacity="0.38" />
                <stop offset="75%" stopColor="#0072B2" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#0072B2" stopOpacity="0.01" />
              </linearGradient>
            </defs>
          </svg>
          <AreaChart
            className="relative h-80
              [&_.recharts-cartesian-axis-line]:stroke-transparent
              [&_.recharts-cartesian-axis-tick-line]:stroke-transparent
              [&_.recharts-cartesian-axis-tick-value]:fill-[var(--color-text-secondary)]
              [&_.recharts-cartesian-axis-tick-value]:text-[11px]
              [&_.recharts-cartesian-grid-horizontal_line]:stroke-[color:color-mix(in_oklab,var(--color-border)_50%,transparent)]
              [&_.recharts-cartesian-grid-vertical_line]:stroke-transparent
              [&_.recharts-area-area]:[fill:url(#ww-trend-gradient)]
              [&_.recharts-area-curve]:stroke-[#0072B2]
              [&_.recharts-area-curve]:[stroke-width:2.5px]
              [&_.recharts-layer.recharts-area-dots_circle]:fill-white
              [&_.recharts-layer.recharts-area-dots_circle]:stroke-[#0072B2]
              [&_.recharts-layer.recharts-area-dots_circle]:[stroke-width:2px]
              [&_.recharts-layer.recharts-area-dots_circle]:[r:4px]"
            data={chartData}
            index="date"
            categories={['Zählerstand']}
            colors={['blue']}
            valueFormatter={(value) => `${value.toFixed(2)} kWh`}
            showLegend={false}
            showGridLines={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for consumption chart
 */
export function ConsumptionChartSkeleton() {
  return (
    <Card>
      <CardHeader className="items-center">
        <div>
          <p className="text-text-secondary text-sm font-medium tracking-[0.2em] uppercase">
            Trend
          </p>
          <CardTitle className="mt-2">Verbrauch über Zeit</CardTitle>
        </div>
        <span className="text-primary flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 shadow-sm dark:bg-white/10">
          <Activity className="h-5 w-5" />
        </span>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-80 w-full rounded-[24px]" />
      </CardContent>
    </Card>
  );
}
