'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useEnergyStore } from '@/hooks/useEnergyStore';
import { contractSchema, type ContractFormData } from '@/lib/validators';
import { calculateYearlyProjection, calculateTotalCost } from '@/lib/calculations';
import { KPICard } from '@/components/features/dashboard/kpi-card';
import { Euro, TrendingUp, Sparkles, Zap, Lock } from 'lucide-react';
import { formatKwh } from '@/lib/utils';

export default function CostsPage() {
  const { contract, updateContract, readings } = useEnergyStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: contract,
  });

  const onSubmit = (data: ContractFormData) => {
    updateContract(data);
    alert('Vertrag aktualisiert!');
  };

  // Berechnungen
  const yearlyProjection = calculateYearlyProjection(readings);
  const projectedCost = calculateTotalCost(yearlyProjection, contract, 365);
  const expectedCost = calculateTotalCost(contract.expectedYearlyUsage, contract, 365);

  // Aufschlüsselung: variable vs. fixe Kosten (konsistent mit calculateTotalCost)
  const variableCostYearly = yearlyProjection * contract.pricePerKwh;
  const fixedCostYearly = (contract.baseCostMonthly / 30) * 365;

  // Balance: Vergleich Prognose vs. Vertrag
  const balance = {
    amount: Math.abs(projectedCost - expectedCost),
    type: projectedCost > expectedCost ? 'surcharge' : ('refund' as const),
  };

  return (
    <div className="w-full space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-text mb-2 text-3xl font-bold lg:text-4xl">Kosten & Vertrag</h1>
        <p className="text-text-secondary">Verwalten Sie Ihre Vertragsdaten und Kostenprojektionen</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(420px,0.95fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Vertragsdetails</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Input
                  type="number"
                  step="0.01"
                  label="Arbeitspreis pro kWh (€)"
                  error={errors.pricePerKwh?.message}
                  {...register('pricePerKwh', { valueAsNumber: true })}
                  required
                />
                <p className="text-text-secondary text-xs">Variabler Preis je verbrauchter kWh</p>
              </div>

              <div className="flex flex-col gap-1">
                <Input
                  type="number"
                  step="0.01"
                  label="Fixkosten monatlich (€)"
                  error={errors.baseCostMonthly?.message}
                  {...register('baseCostMonthly', { valueAsNumber: true })}
                  required
                />
                <p className="text-text-secondary text-xs">
                  Grundpreis, Netzentgelt u. a. feste monatliche Kosten
                </p>
              </div>

              <div className="md:col-span-2">
                <Input
                  type="number"
                  step="1"
                  label="Erwarteter Jahresverbrauch (kWh)"
                  error={errors.expectedYearlyUsage?.message}
                  {...register('expectedYearlyUsage', { valueAsNumber: true })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Button type="submit">Speichern</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-1">
          <KPICard label="Jahresprognose gesamt" value={projectedCost.toFixed(2)} unit="€" icon={Euro} />

          <KPICard
            label={balance.type === 'surcharge' ? 'Erwartete Nachzahlung' : 'Erwartete Rückzahlung'}
            value={balance.amount.toFixed(2)}
            unit="€"
            icon={balance.type === 'surcharge' ? TrendingUp : Sparkles}
          />

          <KPICard
            label="Verbrauch Prognose"
            value={formatKwh(yearlyProjection)}
            unit="kWh"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Kostenaufschlüsselung */}
      {yearlyProjection > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kostenaufschlüsselung (Jahresprognose)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[22px] bg-white/62 px-5 py-4 shadow-sm dark:bg-white/8">
                <div className="mb-3 flex items-center gap-2">
                  <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl">
                    <Zap className="h-4 w-4" />
                  </span>
                  <p className="text-text-secondary text-xs font-medium tracking-wide uppercase">
                    Verbrauchskosten
                  </p>
                </div>
                <p className="text-text text-2xl font-semibold">{variableCostYearly.toFixed(2)} €</p>
                <p className="text-text-secondary mt-1 text-xs">
                  {formatKwh(yearlyProjection)} kWh × {contract.pricePerKwh.toFixed(4)} €
                </p>
              </div>

              <div className="rounded-[22px] bg-white/62 px-5 py-4 shadow-sm dark:bg-white/8">
                <div className="mb-3 flex items-center gap-2">
                  <span className="bg-secondary/10 text-secondary flex h-9 w-9 items-center justify-center rounded-xl">
                    <Lock className="h-4 w-4" />
                  </span>
                  <p className="text-text-secondary text-xs font-medium tracking-wide uppercase">
                    Fixkosten
                  </p>
                </div>
                <p className="text-text text-2xl font-semibold">{fixedCostYearly.toFixed(2)} €</p>
                <p className="text-text-secondary mt-1 text-xs">
                  {contract.baseCostMonthly.toFixed(2)} €/Monat × 12,17 Monate
                </p>
              </div>

              <div className="bg-primary rounded-[22px] px-5 py-4 text-white shadow-lg">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                    <Euro className="h-4 w-4" />
                  </span>
                  <p className="text-xs font-medium tracking-wide text-white/75 uppercase">
                    Gesamt
                  </p>
                </div>
                <p className="text-2xl font-semibold">
                  {(variableCostYearly + fixedCostYearly).toFixed(2)} €
                </p>
                <p className="mt-1 text-xs text-white/70">
                  Verbrauch + Fixkosten pro Jahr
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
