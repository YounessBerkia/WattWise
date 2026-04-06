'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useEnergyStore } from '@/hooks/useEnergyStore';
import { contractSchema, type ContractFormData } from '@/lib/validators';
import {
  calculateBalance,
  calculateMaximumRefund,
  calculateTotalCost,
  calculateYearlyAdvancePayment,
  calculateYearlyProjection,
} from '@/lib/calculations';
import { KPICard } from '@/components/features/dashboard/kpi-card';
import { Euro, TrendingUp, Sparkles, Zap, Lock, Wallet, ReceiptText } from 'lucide-react';
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
  const yearlyAdvancePaid = calculateYearlyAdvancePayment(contract);
  const actualBalance = calculateBalance(projectedCost, yearlyAdvancePaid);
  const maximumRefund = calculateMaximumRefund(contract);

  const variableCostYearly = yearlyProjection * contract.pricePerKwh;
  const fixedCostYearly = contract.baseCostYearly;

  return (
    <div className="w-full space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-text mb-2 text-3xl font-bold lg:text-4xl">Kosten & Vertrag</h1>
        <p className="text-text-secondary">
          Arbeitspreis, jährlichen Grundpreis und Abschlag verwalten, um die Jahresrechnung korrekt
          abzuschätzen.
        </p>
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
                  label="Grundpreis pro Jahr (€)"
                  error={errors.baseCostYearly?.message}
                  {...register('baseCostYearly', { valueAsNumber: true })}
                  required
                />
                <p className="text-text-secondary text-xs">
                  Fester Jahresbetrag, der unabhängig vom Verbrauch immer anfällt
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <Input
                  type="number"
                  step="0.01"
                  label="Monatlicher Abschlag (€)"
                  error={errors.monthlyAdvancePayment?.message}
                  {...register('monthlyAdvancePayment', { valueAsNumber: true })}
                  required
                />
                <p className="text-text-secondary text-xs">
                  Vorauszahlung pro Monat, aus der Erstattung oder Nachzahlung entsteht
                </p>
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
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
          <KPICard
            label="Jahresrechnung prognostiziert"
            value={projectedCost.toFixed(2)}
            unit="€"
            icon={ReceiptText}
          />

          <KPICard
            label={
              actualBalance.type === 'surcharge'
                ? 'Erwartete Nachzahlung'
                : 'Erwartete Rückerstattung'
            }
            value={actualBalance.amount.toFixed(2)}
            unit="€"
            icon={actualBalance.type === 'surcharge' ? TrendingUp : Sparkles}
          />

          <KPICard
            label="Im Jahr vorausbezahlt"
            value={yearlyAdvancePaid.toFixed(2)}
            unit="€"
            icon={Wallet}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kostenaufschlüsselung & Erstattung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[22px] bg-white/62 px-5 py-4 shadow-sm dark:bg-white/8">
              <div className="mb-3 flex items-center gap-2">
                <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl">
                  <Wallet className="h-4 w-4" />
                </span>
                <p className="text-text-secondary text-xs font-medium tracking-wide uppercase">
                  Jahresabschlag
                </p>
              </div>
              <p className="text-text text-2xl font-semibold">{yearlyAdvancePaid.toFixed(2)} €</p>
              <p className="text-text-secondary mt-1 text-xs">
                {contract.monthlyAdvancePayment.toFixed(2)} €/Monat × 12 Monate
              </p>
            </div>

            <div className="rounded-[22px] bg-white/62 px-5 py-4 shadow-sm dark:bg-white/8">
              <div className="mb-3 flex items-center gap-2">
                <span className="bg-secondary/10 text-secondary flex h-9 w-9 items-center justify-center rounded-xl">
                  <Lock className="h-4 w-4" />
                </span>
                <p className="text-text-secondary text-xs font-medium tracking-wide uppercase">
                  Max. Rückerstattung
                </p>
              </div>
              <p className="text-text text-2xl font-semibold">{maximumRefund.toFixed(2)} €</p>
              <p className="text-text-secondary mt-1 text-xs">
                Abschlag minus fixer Grundpreis bei 0 kWh Verbrauch
              </p>
            </div>

            <div className="rounded-[22px] bg-white/62 px-5 py-4 shadow-sm dark:bg-white/8">
              <div className="mb-3 flex items-center gap-2">
                <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <p className="text-text-secondary text-xs font-medium tracking-wide uppercase">
                  Verbrauchsprognose
                </p>
              </div>
              <p className="text-text text-2xl font-semibold">{formatKwh(yearlyProjection)} kWh</p>
              <p className="text-text-secondary mt-1 text-xs">
                Gegenüber Vertragsannahme: {formatKwh(contract.expectedYearlyUsage)} kWh
              </p>
            </div>
          </div>

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
                  Fester Grundpreis unabhängig vom Verbrauch
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
                <p className="text-2xl font-semibold">{projectedCost.toFixed(2)} €</p>
                <p className="mt-1 text-xs text-white/70">
                  Grundpreis + (Verbrauch × Arbeitspreis)
                </p>
              </div>
          </div>

          <div className="rounded-[24px] bg-white/62 p-5 shadow-sm dark:bg-white/8">
            <p className="text-text text-lg font-semibold">So wird die Rückerstattung berechnet</p>
            <p className="text-text-secondary mt-2 text-sm leading-6">
              Im Jahr bezahlt: {yearlyAdvancePaid.toFixed(2)} €.
              Tatsächliche Jahresrechnung laut aktueller Prognose: {projectedCost.toFixed(2)} €.
              Daraus ergibt sich aktuell eine{' '}
              {actualBalance.type === 'refund' ? 'Rückerstattung' : 'Nachzahlung'} von{' '}
              {actualBalance.amount.toFixed(2)} €.
            </p>
            <p className="text-text-secondary mt-3 text-sm leading-6">
              Der Grundpreis von {contract.baseCostYearly.toFixed(2)} € fällt immer an. Energiesparen
              reduziert nur den Arbeitspreis, niemals den Grundpreis.
            </p>
            <p className="text-text-secondary mt-3 text-sm leading-6">
              Zum Vergleich auf Basis der Vertragsannahme von {formatKwh(contract.expectedYearlyUsage)}{' '}
              kWh läge die Jahresrechnung bei {expectedCost.toFixed(2)} €.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
