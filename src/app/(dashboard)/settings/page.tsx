'use client';

import { useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { useEnergyStore } from '@/hooks/useEnergyStore';
import { exportToFile, importFromFile } from '@/lib/storage';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { AlertCircle, Check, Download, Moon, Settings2, Sun, Trash2, Upload } from 'lucide-react';

export default function SettingsPage() {
  const { setTheme, resolvedTheme } = useTheme();
  const { exportData, importData, resetAllData, readings } = useEnergyStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const handleExport = () => {
    const data = exportData();
    const jsonString = JSON.stringify(data, null, 2);
    exportToFile(jsonString);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const validatedData = await importFromFile(file);
      importData(validatedData);
      setImportStatus('success');
      setImportMessage('Daten erfolgreich importiert!');
    } catch (error) {
      setImportStatus('error');
      setImportMessage(error instanceof Error ? error.message : 'Import fehlgeschlagen');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setTimeout(() => {
      setImportStatus('idle');
      setImportMessage('');
    }, 3000);
  };

  const handleReset = () => {
    if (
      confirm(
        'Möchten Sie wirklich alle Daten zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.',
      )
    ) {
      resetAllData();
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="relative isolate w-full space-y-6 overflow-hidden rounded-[36px] lg:space-y-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[26rem] rounded-[36px] bg-[radial-gradient(circle_at_12%_12%,rgba(56,132,255,0.11),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(120,130,255,0.09),transparent_28%)]" />
      <Card variant="glass">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-text-secondary mb-4 inline-flex items-center gap-2 rounded-full border border-white/65 bg-white/60 px-3 py-1 text-xs font-semibold tracking-[0.24em] uppercase dark:border-white/10 dark:bg-white/8">
              <Settings2 className="text-primary h-3.5 w-3.5" />
              Einstellungen
            </div>
            <h1 className="text-text text-4xl font-semibold tracking-tight lg:text-5xl">
              WattWise anpassen
            </h1>
            <p className="text-text-secondary mt-3 max-w-xl text-base sm:text-lg">
              Verwalte Darstellung, Datenimport, Export und das Zurücksetzen deiner lokalen
              App-Daten.
            </p>
          </div>

          <div className="rounded-[24px] bg-white/62 p-4 shadow-sm dark:bg-white/8">
            <p className="text-text-secondary text-sm font-medium">Aktives Theme</p>
            <p className="text-text mt-2 text-2xl font-semibold tracking-tight">
              {resolvedTheme === 'dark' ? 'Dunkel' : 'Hell'}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="items-center">
              <div>
                <p className="text-text-secondary text-sm font-medium tracking-[0.2em] uppercase">
                  Darstellung
                </p>
                <CardTitle className="mt-2">Theme & Ansicht</CardTitle>
              </div>
              <span className="text-primary flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 shadow-sm dark:bg-white/10">
                {resolvedTheme === 'dark' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </span>
            </CardHeader>
            <CardContent>
              <div className="rounded-[26px] bg-white/62 p-5 shadow-sm dark:bg-white/8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-text font-medium">Dunkelmodus</p>
                    <p className="text-text-secondary mt-1 text-sm">
                      Aktuell: {resolvedTheme === 'dark' ? 'Dunkel' : 'Hell'}
                    </p>
                  </div>
                  <Button
                    variant={resolvedTheme === 'dark' ? 'primary' : 'secondary'}
                    onClick={toggleTheme}
                    aria-label={
                      resolvedTheme === 'dark' ? 'Zu Hellmodus wechseln' : 'Zu Dunkelmodus wechseln'
                    }
                  >
                    {resolvedTheme === 'dark' ? (
                      <>
                        <Moon className="h-4 w-4" />
                        Dunkel aktiv
                      </>
                    ) : (
                      <>
                        <Sun className="h-4 w-4" />
                        Hell aktiv
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <p className="text-text-secondary text-sm font-medium tracking-[0.2em] uppercase">
                  Datenverwaltung
                </p>
                <CardTitle className="mt-2">Import, Export und Reset</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[26px] bg-white/62 p-5 shadow-sm dark:bg-white/8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-text font-medium">Daten exportieren</p>
                    <p className="text-text-secondary mt-1 text-sm">
                      Lade alle Zählerstände und Einstellungen als JSON herunter.
                    </p>
                  </div>
                  <Button variant="secondary" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                    Exportieren
                  </Button>
                </div>
              </div>

              <div className="rounded-[26px] bg-white/62 p-5 shadow-sm dark:bg-white/8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-text font-medium">Daten importieren</p>
                    <p className="text-text-secondary mt-1 text-sm">
                      Lade Zählerstände aus einer vorhandenen JSON-Datei.
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".json"
                      className="hidden"
                      aria-label="JSON-Datei auswählen"
                    />
                    <Button variant="secondary" onClick={handleImportClick}>
                      <Upload className="h-4 w-4" />
                      Importieren
                    </Button>
                  </div>
                </div>
              </div>

              {importStatus !== 'idle' && (
                <div
                  className={`flex items-center gap-2 rounded-[22px] p-4 shadow-sm ${
                    importStatus === 'success'
                      ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                      : 'bg-red-500/10 text-red-700 dark:text-red-400'
                  }`}
                  role="alert"
                >
                  {importStatus === 'success' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">{importMessage}</span>
                </div>
              )}

              <div className="rounded-[26px] bg-white/62 p-5 shadow-sm dark:bg-white/8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-text font-medium">Daten zurücksetzen</p>
                    <p className="text-text-secondary mt-1 text-sm">
                      Entfernt alle Zählerstände und App-Einstellungen von diesem Gerät.
                    </p>
                  </div>
                  <Button variant="danger" onClick={handleReset} disabled={readings.length === 0}>
                    <Trash2 className="h-4 w-4" />
                    Zurücksetzen
                  </Button>
                </div>
                {readings.length === 0 && (
                  <p className="text-text-secondary mt-3 text-sm">
                    Keine Daten zum Zurücksetzen vorhanden.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Über WattWise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] bg-white/62 p-5 shadow-sm dark:bg-white/8">
                <p className="text-text font-medium">Lokale Energiezentrale</p>
                <p className="text-text-secondary mt-2 text-sm">
                  WattWise hilft dir, Verbrauch zu verfolgen, Kosten zu verstehen und deine Daten
                  übersichtlich zu halten.
                </p>
              </div>
              <div className="rounded-[24px] bg-white/62 p-5 shadow-sm dark:bg-white/8">
                <p className="text-text-secondary text-sm">Version</p>
                <p className="text-text mt-2 text-xl font-semibold tracking-tight">0.1.0</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-[22px] bg-white/62 p-4 shadow-sm dark:bg-white/8">
                <p className="text-text-secondary text-sm">Gespeicherte Einträge</p>
                <p className="text-text mt-2 text-2xl font-semibold tracking-tight">
                  {readings.length}
                </p>
              </div>
              <div className="rounded-[22px] bg-white/62 p-4 shadow-sm dark:bg-white/8">
                <p className="text-text-secondary text-sm">Bereit für Export</p>
                <p className="text-text mt-2 text-lg font-semibold">
                  {readings.length > 0 ? 'Ja' : 'Noch keine Daten'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
