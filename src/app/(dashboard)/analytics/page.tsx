'use client';

import { useState } from 'react';
import { useEnergyStore } from '@/hooks/useEnergyStore';
import { AreaChart } from '@tremor/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { PeriodSelector } from '@/components/features/analytics/period-selector';
import { isAfter, subDays, subMonths, subYears } from 'date-fns';
import { formatDisplayDate } from '@/lib/utils';
import { getConsumptionPointsForPeriod } from '@/lib/calculations';
import { Activity, BarChart3, CalendarRange } from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart as RechartsBarChart,
} from 'recharts';

type Period = 'day' | 'week' | 'month' | 'year';

export default function AnalyticsPage() {
  const { readings } = useEnergyStore();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');

  const now = new Date();
  const getStartDate = () => {
    switch (selectedPeriod) {
      case 'day':
        return subDays(now, 7);
      case 'week':
        return subDays(now, 28);
      case 'month':
        return subMonths(now, 3);
      case 'year':
        return subYears(now, 1);
    }
  };

  const startDate = getStartDate();
  const filteredReadings = readings
    .filter((r) => isAfter(new Date(r.timestamp), startDate))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const periodConsumptionPoints = getConsumptionPointsForPeriod(readings, startDate);
  const consumptionData = periodConsumptionPoints.map(({ reading, consumption }) => ({
    date: formatDisplayDate(reading.timestamp),
    Zählerstand: reading.kwh,
    Verbrauch: consumption,
  }));

  const weekdayOrder = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;
  const weekdayIndexMap = [6, 0, 1, 2, 3, 4, 5];
  const weekdayBuckets = weekdayOrder.map((day) => ({
    day,
    total: 0,
    count: 0,
  }));

  periodConsumptionPoints.forEach(({ reading, consumption, previousReading }) => {
    if (!previousReading) {
      return;
    }

    const weekdayIndex = weekdayIndexMap[new Date(reading.timestamp).getDay()];
    const bucket = weekdayBuckets[weekdayIndex];

    bucket.total += consumption;
    bucket.count += 1;
  });

  const weekdayData = weekdayBuckets.map((bucket) => ({
    day: bucket.day,
    kwh: bucket.count > 0 ? bucket.total / bucket.count : 0,
  }));

  const hasData = filteredReadings.length > 0;
  const totalConsumption = consumptionData.reduce((sum, item) => sum + item.Verbrauch, 0);
  const intervalCount = periodConsumptionPoints.filter((point) => point.previousReading).length;
  const averageConsumption = intervalCount > 0 ? totalConsumption / intervalCount : 0;
  const strongestWeekday = weekdayData.reduce((max, day) => (day.kwh > max.kwh ? day : max));

  return (
    <div className="relative isolate space-y-6 overflow-hidden rounded-[36px] lg:space-y-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] rounded-[36px] bg-[radial-gradient(circle_at_8%_10%,rgba(56,132,255,0.12),transparent_34%),radial-gradient(circle_at_88%_16%,rgba(40,190,160,0.11),transparent_30%)]" />
      <Card variant="glass">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-text-secondary mb-4 inline-flex items-center gap-2 rounded-full border border-white/65 bg-white/60 px-3 py-1 text-xs font-semibold tracking-[0.24em] uppercase dark:border-white/10 dark:bg-white/8">
              <Activity className="text-primary h-3.5 w-3.5" />
              Analytics
            </div>
            <h1 className="text-text text-4xl font-semibold tracking-tight lg:text-5xl">Analyse</h1>
            <p className="text-text-secondary mt-3 max-w-xl text-base sm:text-lg">
              Zeiträume vergleichen, Verbrauchsmuster erkennen und die wichtigsten Trends schneller
              lesen.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
          </div>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[28px] bg-white/68 p-5 shadow-sm dark:bg-white/8">
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-2xl">
              <CalendarRange className="h-5 w-5" />
            </span>
            <div>
              <p className="text-text-secondary text-sm">Zeitraum</p>
              <p className="text-text text-lg font-semibold">
                {selectedPeriod === 'day'
                  ? '7 Tage'
                  : selectedPeriod === 'week'
                    ? '4 Wochen'
                    : selectedPeriod === 'month'
                      ? '3 Monate'
                      : '1 Jahr'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white/68 p-5 shadow-sm dark:bg-white/8">
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-2xl">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <p className="text-text-secondary text-sm">Durchschnitt</p>
              <p className="text-text text-lg font-semibold">{averageConsumption.toFixed(2)} kWh</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white/68 p-5 shadow-sm dark:bg-white/8">
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-2xl">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-text-secondary text-sm">Datenpunkte</p>
              <p className="text-text text-lg font-semibold">{filteredReadings.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="items-center">
            <div>
              <p className="text-text-secondary text-sm font-medium tracking-[0.2em] uppercase">
                Verlauf
              </p>
              <CardTitle className="mt-2">Verbrauch über Zeit</CardTitle>
            </div>
            <span className="text-primary flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 shadow-sm dark:bg-white/10">
              <Activity className="h-5 w-5" />
            </span>
          </CardHeader>

          <CardContent>
            {hasData ? (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] bg-white/62 px-4 py-4 shadow-sm dark:bg-white/8">
                    <p className="text-text-secondary text-xs tracking-[0.16em] uppercase">
                      Summe Zeitraum
                    </p>
                    <p className="text-text mt-2 text-lg font-semibold">
                      {totalConsumption.toFixed(2)} kWh
                    </p>
                  </div>
                  <div className="rounded-[22px] bg-white/62 px-4 py-4 shadow-sm dark:bg-white/8">
                    <p className="text-text-secondary text-xs tracking-[0.16em] uppercase">
                      Letzter Verbrauch
                    </p>
                    <p className="text-text mt-2 text-lg font-semibold">
                      {consumptionData.at(-1)?.Verbrauch.toFixed(2) ?? '0.00'} kWh
                    </p>
                  </div>
                  <div className="bg-primary rounded-[22px] px-4 py-4 text-white shadow-lg">
                    <p className="text-xs tracking-[0.16em] text-white/72 uppercase">
                      Höchster Ausschlag
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {Math.max(...consumptionData.map((item) => item.Verbrauch)).toFixed(2)} kWh
                    </p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[26px] bg-white/72 p-4 shadow-sm dark:bg-white/8">
                  {/* SVG gradient for analytics consumption area */}
                  <svg width="0" height="0" className="absolute" aria-hidden="true">
                    <defs>
                      <linearGradient id="ww-consumption-gradient" x1="0" y1="0" x2="0" y2="1">
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
                      [&_.recharts-area-area]:[fill:url(#ww-consumption-gradient)]
                      [&_.recharts-area-curve]:stroke-[#0072B2]
                      [&_.recharts-area-curve]:[stroke-width:2.5px]
                      [&_.recharts-layer.recharts-area-dots_circle]:fill-white
                      [&_.recharts-layer.recharts-area-dots_circle]:stroke-[#0072B2]
                      [&_.recharts-layer.recharts-area-dots_circle]:[stroke-width:2px]
                      [&_.recharts-layer.recharts-area-dots_circle]:[r:4px]
                      [&_.recharts-default-legend]:!mt-2"
                    data={consumptionData}
                    index="date"
                    categories={['Verbrauch']}
                    colors={['blue']}
                    valueFormatter={(value) => `${value.toFixed(2)} kWh`}
                    showLegend={true}
                    showGridLines={true}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] bg-white/62 px-6 py-12 text-center shadow-sm dark:bg-white/8">
                <div className="bg-primary/10 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-[20px]">
                  <Activity className="h-6 w-6" />
                </div>
                <p className="text-text text-lg font-medium">
                  Keine Daten für diesen Zeitraum vorhanden
                </p>
                <p className="text-text-secondary mt-2">
                  Wechsle den Zeitraum oder erfasse weitere Zählerstände.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="items-center">
            <div>
              <p className="text-text-secondary text-sm font-medium tracking-[0.2em] uppercase">
                Muster
              </p>
              <CardTitle className="mt-2">Durchschnitt pro Wochentag</CardTitle>
            </div>
            <span className="text-primary flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 shadow-sm dark:bg-white/10">
              <BarChart3 className="h-5 w-5" />
            </span>
          </CardHeader>

          <CardContent>
            <div className="mb-5 rounded-[22px] bg-white/62 px-4 py-4 shadow-sm dark:bg-white/8">
              <p className="text-text-secondary text-xs tracking-[0.16em] uppercase">
                Höchster Wochentag
              </p>
              <p className="text-text mt-2 text-lg font-semibold">
                {strongestWeekday.day} · {strongestWeekday.kwh.toFixed(2)} kWh
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[26px] bg-white/72 p-4 shadow-sm dark:bg-white/8">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={weekdayData} barCategoryGap="22%">
                    <CartesianGrid
                      vertical={false}
                      stroke="color-mix(in oklab, var(--color-border) 50%, transparent)"
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                      tickFormatter={(value) => `${value.toFixed(0)}`}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(0, 114, 178, 0.08)', radius: 12 }}
                      contentStyle={{
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.6)',
                        background: 'rgba(255,255,255,0.92)',
                        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
                      }}
                      formatter={(value) => {
                        const numericValue =
                          typeof value === 'number'
                            ? value
                            : typeof value === 'string'
                              ? Number(value)
                              : 0;

                        return [`${numericValue.toFixed(2)} kWh`, 'Durchschnitt'];
                      }}
                      labelStyle={{ color: 'var(--color-text)', fontWeight: 600 }}
                    />
                    <Bar dataKey="kwh" radius={[10, 10, 10, 10]} maxBarSize={38}>
                      {weekdayData.map((entry) => (
                        <Cell
                          key={entry.day}
                          fill="#0072B2"
                          stroke="#1E88D8"
                          strokeWidth={1.5}
                        />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
