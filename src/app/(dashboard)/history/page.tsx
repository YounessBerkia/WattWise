'use client';

import { useState } from 'react';
import { useEnergyStore } from '@/hooks/useEnergyStore';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { getReadingConsumptionPoints, sortReadingsByTimestamp } from '@/lib/calculations';
import { formatDisplayDate } from '@/lib/utils';
import { ArrowUpDown, Download, History, TableProperties, Trash2 } from 'lucide-react';

export default function HistoryPage() {
  const { readings, deleteReading } = useEnergyStore();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const chronological = sortReadingsByTimestamp(readings);
  const consumptionPoints = getReadingConsumptionPoints(readings);

  const consumptionById = new Map(
    consumptionPoints.map(({ reading, consumption }) => [reading.id, consumption])
  );

  const sorted = [...readings].sort((a, b) => {
    const comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleExportCSV = () => {
    const csv = [
      'Datum,Zählerstand (kWh),Verbrauch (kWh)',
      ...chronological.map((r) => {
        const consumption = consumptionById.get(r.id) ?? 0;
        return `${r.timestamp},${r.kwh},${consumption.toFixed(2)}`;
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wattwise-verlauf-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (readingId: string) => {
    if (deleteConfirmId === readingId) {
      deleteReading(readingId);
      setDeleteConfirmId(null);
      return;
    }

    setDeleteConfirmId(readingId);
  };

  return (
    <div className="relative isolate space-y-6 overflow-hidden rounded-[36px] lg:space-y-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[24rem] rounded-[36px] bg-[radial-gradient(circle_at_12%_12%,rgba(56,132,255,0.10),transparent_34%),radial-gradient(circle_at_84%_18%,rgba(152,116,255,0.08),transparent_28%)]" />
      <Card variant="glass">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-text-secondary mb-4 inline-flex items-center gap-2 rounded-full border border-white/65 bg-white/60 px-3 py-1 text-xs font-semibold tracking-[0.24em] uppercase dark:border-white/10 dark:bg-white/8">
              <History className="text-primary h-3.5 w-3.5" />
              Verlauf
            </div>
            <h1 className="text-text text-4xl font-semibold tracking-tight lg:text-5xl">
              Historie aller Einträge
            </h1>
            <p className="text-text-secondary mt-3 max-w-xl text-base sm:text-lg">
              Durchsuche alle gespeicherten Zählerstände, vergleiche Werte und exportiere sie bei
              Bedarf als CSV.
            </p>
          </div>

          <Button onClick={handleExportCSV} disabled={readings.length === 0}>
            <Download className="h-4 w-4" />
            CSV Export
          </Button>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[28px] bg-white/68 p-5 shadow-sm dark:bg-white/8">
          <p className="text-text-secondary text-sm">Einträge</p>
          <p className="text-text mt-2 text-3xl font-semibold tracking-tight">{readings.length}</p>
        </div>
        <div className="rounded-[28px] bg-white/68 p-5 shadow-sm dark:bg-white/8">
          <p className="text-text-secondary text-sm">Sortierung</p>
          <p className="text-text mt-2 text-3xl font-semibold tracking-tight">
            {sortOrder === 'asc' ? 'Aufsteigend' : 'Neu zuerst'}
          </p>
        </div>
        <div className="rounded-[28px] bg-white/68 p-5 shadow-sm dark:bg-white/8">
          <p className="text-text-secondary text-sm">Aktueller Wert</p>
          <p className="text-text mt-2 text-3xl font-semibold tracking-tight">
            {sorted[0] ? sorted[0].kwh.toFixed(1) : '--'}
            <span className="text-text-secondary ml-2 text-base font-medium">kWh</span>
          </p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="items-center">
          <div>
            <p className="text-text-secondary text-sm font-medium tracking-[0.2em] uppercase">
              Tabelle
            </p>
            <CardTitle className="mt-2">Alle Einträge ({readings.length})</CardTitle>
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="text-text-secondary hover:text-text inline-flex items-center gap-2 rounded-full border border-white/65 bg-white/75 px-4 py-2 text-sm font-medium shadow-sm transition-all duration-300 hover:-translate-y-0.5 dark:border-white/12 dark:bg-white/8"
          >
            <ArrowUpDown className="h-4 w-4" />
            Sortieren
          </button>
        </CardHeader>

        <CardContent>
          {readings.length === 0 ? (
            <div className="rounded-[24px] bg-white/62 px-6 py-12 text-center shadow-sm dark:bg-white/8">
              <div className="bg-primary/10 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-[20px]">
                <History className="h-6 w-6" />
              </div>
              <p className="text-text text-lg font-medium">Noch keine Zählerstände erfasst</p>
              <p className="text-text-secondary mt-2">
                Sobald Daten vorhanden sind, erscheint hier dein kompletter Verlauf.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="hidden rounded-[28px] bg-white/62 p-4 shadow-sm lg:block dark:bg-white/8">
                <div className="text-text-secondary grid grid-cols-[1.3fr_1fr_1fr_auto] gap-4 px-4 py-2 text-sm font-medium">
                  <span>Datum</span>
                  <span className="text-right">Zählerstand</span>
                  <span className="text-right">Verbrauch</span>
                  <span className="text-right">Aktion</span>
                </div>
                <div className="space-y-2">
                  {sorted.map((reading) => {
                    const consumption = consumptionById.get(reading.id) ?? 0;
                    return (
                      <div
                        key={reading.id}
                        className="bg-background/75 hover:bg-background dark:bg-background/30 grid grid-cols-[1.3fr_1fr_1fr_auto] gap-4 rounded-[22px] px-4 py-4 transition-colors duration-300"
                      >
                        <span className="text-text font-medium">
                          {formatDisplayDate(reading.timestamp)}
                        </span>
                        <span className="text-text text-right font-mono">
                          {reading.kwh.toFixed(2)} kWh
                        </span>
                        <span className="text-text text-right font-mono">
                          {consumption.toFixed(2)} kWh
                        </span>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant={deleteConfirmId === reading.id ? 'danger' : 'ghost'}
                            size="sm"
                            onClick={() => handleDelete(reading.id)}
                            className="min-w-[118px]"
                          >
                            <Trash2 className="h-4 w-4" />
                            {deleteConfirmId === reading.id ? 'Wirklich löschen?' : 'Löschen'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 lg:hidden">
                {sorted.map((reading) => {
                  const consumption = consumptionById.get(reading.id) ?? 0;
                  return (
                    <div
                      key={reading.id}
                      className="rounded-[24px] bg-white/62 p-5 shadow-sm dark:bg-white/8"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-text-secondary text-sm">Messdatum</p>
                          <p className="text-text mt-1 font-medium">
                            {formatDisplayDate(reading.timestamp)}
                          </p>
                        </div>
                        <span className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-2xl">
                          <TableProperties className="h-5 w-5" />
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-background/75 dark:bg-background/30 rounded-[20px] px-4 py-3">
                          <p className="text-text-secondary text-xs tracking-[0.14em] uppercase">
                            Stand
                          </p>
                          <p className="text-text mt-2 font-mono">{reading.kwh.toFixed(2)} kWh</p>
                        </div>
                        <div className="bg-background/75 dark:bg-background/30 rounded-[20px] px-4 py-3">
                          <p className="text-text-secondary text-xs tracking-[0.14em] uppercase">
                            Verbrauch
                          </p>
                          <p className="text-text mt-2 font-mono">{consumption.toFixed(2)} kWh</p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant={deleteConfirmId === reading.id ? 'danger' : 'secondary'}
                        size="sm"
                        onClick={() => handleDelete(reading.id)}
                        className="mt-4 w-full"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deleteConfirmId === reading.id ? 'Wirklich löschen?' : 'Eintrag löschen'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
