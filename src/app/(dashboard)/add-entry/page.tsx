'use client';

import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useEnergyStore } from '@/hooks/useEnergyStore';
import {
  energyReadingSchema,
  validateReadingSequence,
  type EnergyReadingFormData,
} from '@/lib/validators';
import { getLatestReading } from '@/lib/calculations';
import { compressImage } from '@/lib/storage';
import { Camera, CalendarRange, UploadCloud, X } from 'lucide-react';

/**
 * Add Entry Page - Form to add new meter readings with optional photo
 */
export default function AddEntryPage() {
  const router = useRouter();
  const { readings, addReading } = useEnergyStore();
  const lastReading = getLatestReading(readings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<EnergyReadingFormData>({
    resolver: zodResolver(energyReadingSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setPhotoPreview(compressed);
    } catch (error) {
      console.error('Komprimierung fehlgeschlagen:', error);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
  };

  const onSubmit = async (data: EnergyReadingFormData) => {
    setIsSubmitting(true);

    if (!validateReadingSequence(data.kwh, lastReading?.kwh ?? null)) {
      setError('kwh', {
        message: `Zählerstand muss größer als ${lastReading?.kwh.toFixed(2)} sein`,
      });
      setIsSubmitting(false);
      return;
    }

    addReading({
      id: crypto.randomUUID(),
      timestamp: data.date,
      kwh: data.kwh,
      source: 'manual',
      photoBase64: photoPreview || undefined,
    });

    router.push('/dashboard');
  };

  return (
    <div className="relative isolate w-full space-y-6 overflow-hidden rounded-[36px] lg:space-y-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[26rem] rounded-[36px] bg-[radial-gradient(circle_at_10%_8%,rgba(46,170,126,0.14),transparent_34%),radial-gradient(circle_at_86%_16%,rgba(56,132,255,0.10),transparent_28%)]" />
      <Card variant="glass">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-text-secondary mb-4 inline-flex items-center gap-2 rounded-full border border-white/65 bg-white/60 px-3 py-1 text-xs font-semibold tracking-[0.24em] uppercase dark:border-white/10 dark:bg-white/8">
              <UploadCloud className="text-primary h-3.5 w-3.5" />
              Neuer Eintrag
            </div>
            <h1 className="text-text text-4xl font-semibold tracking-tight lg:text-5xl">
              Zählerstand eingeben
            </h1>
            <p className="text-text-secondary mt-3 max-w-xl text-base sm:text-lg">
              Trage deinen aktuellen Stand ein und füge bei Bedarf direkt ein Foto des Zählerfelds
              hinzu.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
            <div className="rounded-[24px] bg-white/62 p-4 shadow-sm dark:bg-white/8">
              <p className="text-text-secondary text-sm font-medium">Heute</p>
              <p className="text-text mt-2 text-2xl font-semibold tracking-tight">
                {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
              </p>
              <p className="text-text-secondary mt-1 text-sm">Schneller manueller Eintrag</p>
            </div>
            <div className="rounded-[24px] bg-white/62 p-4 shadow-sm dark:bg-white/8">
              <p className="text-text-secondary text-sm font-medium">Letzter Stand</p>
              <p className="text-text mt-2 text-2xl font-semibold tracking-tight">
                {lastReading ? lastReading.kwh.toFixed(2) : '--'}
                <span className="text-text-secondary ml-2 text-base font-medium">kWh</span>
              </p>
              <p className="text-text-secondary mt-1 text-sm">
                {lastReading
                  ? new Date(lastReading.timestamp).toLocaleDateString('de-DE')
                  : 'Noch keine Daten'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="items-center">
            <div>
              <p className="text-text-secondary text-sm font-medium tracking-[0.2em] uppercase">
                Formular
              </p>
              <CardTitle className="mt-2">Neuer Eintrag</CardTitle>
            </div>
            <span className="text-primary flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 shadow-sm dark:bg-white/10">
              <CalendarRange className="h-5 w-5" />
            </span>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  type="date"
                  label="Datum"
                  error={errors.date?.message}
                  {...register('date')}
                  required
                />

                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  label="Zählerstand (kWh)"
                  placeholder="12345.67"
                  error={errors.kwh?.message}
                  {...register('kwh', { valueAsNumber: true })}
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-text block text-sm font-medium tracking-tight">
                  Foto vom Zähler (optional)
                </label>
                <label className="group block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handlePhotoChange}
                  />
                  {photoPreview ? (
                    <div className="relative h-72 overflow-hidden rounded-[28px] border border-white/65 bg-white/60 shadow-sm dark:border-white/10 dark:bg-white/8">
                      <Image
                        src={photoPreview}
                        alt="Vorschau"
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          removePhoto();
                        }}
                        className="text-text absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/80 shadow-sm transition-colors hover:bg-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="group-hover:border-primary/45 rounded-[28px] border border-dashed border-white/70 bg-white/60 px-6 py-12 text-center shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-white/80 dark:border-white/10 dark:bg-white/8 dark:group-hover:bg-white/10">
                      <div className="bg-primary/10 text-primary mx-auto flex h-16 w-16 items-center justify-center rounded-[22px]">
                        <Camera className="h-7 w-7" />
                      </div>
                      <p className="text-text mt-5 text-lg font-semibold">Foto hochladen</p>
                      <p className="text-text-secondary mt-2 text-sm">
                        Ziehe ein Bild hierher oder klicke, um den Zählerstand als Nachweis
                        hinzuzufügen.
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? 'Speichern...' : 'Speichern'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/dashboard')}
                  className="w-full sm:w-auto"
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="items-center">
              <div>
                <p className="text-text-secondary text-sm font-medium tracking-[0.2em] uppercase">
                  Referenz
                </p>
                <CardTitle className="mt-2">Letzter Zählerstand</CardTitle>
              </div>
              <span className="text-primary flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 shadow-sm dark:bg-white/10">
                <CalendarRange className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardContent>
              {lastReading ? (
                <div className="rounded-[26px] bg-white/62 p-5 shadow-sm dark:bg-white/8">
                  <p className="text-text-secondary text-sm font-medium">Vorheriger Wert</p>
                  <p className="text-text mt-3 text-4xl font-semibold tracking-tight">
                    {lastReading.kwh.toFixed(2)}
                    <span className="text-text-secondary ml-2 text-base font-medium">kWh</span>
                  </p>
                  <p className="text-text-secondary mt-3 text-sm">
                    vom {new Date(lastReading.timestamp).toLocaleDateString('de-DE')}
                  </p>
                </div>
              ) : (
                <div className="rounded-[26px] bg-white/62 p-5 text-center shadow-sm dark:bg-white/8">
                  <div className="bg-primary/10 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-[20px]">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <p className="text-text font-medium">Noch kein vorheriger Eintrag</p>
                  <p className="text-text-secondary mt-2 text-sm">
                    Dein erster Eintrag legt die Basis für alle Analysen.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hinweise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-[22px] bg-white/62 p-4 shadow-sm dark:bg-white/8">
                <p className="text-text font-medium">Immer aufsteigend</p>
                <p className="text-text-secondary mt-1 text-sm">
                  Der neue Stand muss höher sein als der letzte gespeicherte Wert.
                </p>
              </div>
              <div className="rounded-[22px] bg-white/62 p-4 shadow-sm dark:bg-white/8">
                <p className="text-text font-medium">Fotos helfen später</p>
                <p className="text-text-secondary mt-1 text-sm">
                  Ein Bild macht manuelle Einträge nachvollziehbarer und reduziert Tippfehler.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
