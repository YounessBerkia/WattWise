'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
  const [baseCostMode, setBaseCostMode] = useState<'year' | 'month'>('year');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: contract,
  });

  const watchedBaseCostYearly = useWatch({
    control,
    name: 'baseCostYearly',
  });

  const baseCostInputValue = useMemo(() => {
    if (typeof watchedBaseCostYearly !== 'number' || !Number.isFinite(watchedBaseCostYearly)) {
      return '';
    }

    return baseCostMode === 'year'
      ? watchedBaseCostYearly.toFixed(2)
      : (watchedBaseCostYearly / 12).toFixed(2);
  }, [baseCostMode, watchedBaseCostYearly]);

  const onSubmit = (data: ContractFormData) => {
    updateContract(data);
    alert('Vertrag aktualisiert!');
  };

  const handleBaseCostChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const parsedValue = rawValue === '' ? NaN : Number(rawValue);

    setValue('baseCostYearly', baseCostMode === 'year' ? parsedValue : parsedValue * 12, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
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
  const expectedVariableCostYearly = contract.expectedYearlyUsage * contract.pricePerKwh;
  const monthlyFixedShare = fixedCostYearly / 12;
  const monthlyVariableBudget = Math.max(contract.monthlyAdvancePayment - monthlyFixedShare, 0);
  const yearlyVariableBudget = Math.max(yearlyAdvancePaid - fixedCostYearly, 0);
  const prepaidConsumptionAllowance =
    contract.pricePerKwh > 0 ? yearlyVariableBudget / contract.pricePerKwh : 0;

  return (
    <div className="w-full space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-text mb-2 text-3xl font-bold lg:text-4xl">Kosten & Vertrag</h1>
        <p className="text-text-secondary">
          Arbeitspreis, jährlichen Grundpreis und Abschlag verwalten, um die Jahresrechnung korrekt
          abzuschätzen. Der Abschlag enthält dabei immer sowohl den fixen Grundpreis als auch einen
          Anteil für den tatsächlichen Verbrauch.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(420px,0.95fr)]">
        <Card>
          <CardHeader>
            <div>
              <p className="text-text-secondary text-sm font-medium tracking-[0.2em] uppercase">
                Vertrag
              </p>
              <CardTitle className="mt-2">Vertragsdetails</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] bg-white/62 px-4 py-4 shadow-sm dark:bg-white/8">
                <p className="text-text-secondary text-xs tracking-[0.16em] uppercase">
                  Arbeitspreis
                </p>
                <p className="text-text mt-2 text-lg font-semibold">
                  {contract.pricePerKwh.toFixed(4)} €
                </p>
                <p className="text-text-secondary mt-1 text-xs">pro kWh</p>
              </div>
              <div className="rounded-[22px] bg-white/62 px-4 py-4 shadow-sm dark:bg-white/8">
                <p className="text-text-secondary text-xs tracking-[0.16em] uppercase">
                  Grundpreis
                </p>
                <p className="text-text mt-2 text-lg font-semibold">
                  {contract.baseCostYearly.toFixed(2)} €
                </p>
                <p className="text-text-secondary mt-1 text-xs">pro Jahr</p>
              </div>
              <div className="rounded-[22px] bg-white/62 px-4 py-4 shadow-sm dark:bg-white/8">
                <p className="text-text-secondary text-xs tracking-[0.16em] uppercase">
                  Monatlicher Abschlag
                </p>
                <p className="text-text mt-2 text-lg font-semibold">
                  {contract.monthlyAdvancePayment.toFixed(2)} €
                </p>
                <p className="text-text-secondary mt-1 text-xs">pro Monat</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="rounded-[26px] bg-white/58 p-5 shadow-sm dark:bg-white/8">
                  <div className="mb-4">
                    <p className="text-text-secondary text-xs font-medium tracking-[0.18em] uppercase">
                      Variable Kosten
                    </p>
                    <p className="text-text mt-2 text-lg font-semibold">Verbrauch & Abschlag</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <Input
                        type="number"
                        step="0.01"
                        label="Arbeitspreis pro kWh (€)"
                        error={errors.pricePerKwh?.message}
                        {...register('pricePerKwh', { valueAsNumber: true })}
                        required
                      />
                      <p className="text-text-secondary text-xs">
                        Variabler Preis je verbrauchter kWh
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Input
                        type="number"
                        step="0.01"
                        label="Monatliche Kosten / Abschlag (€)"
                        error={errors.monthlyAdvancePayment?.message}
                        {...register('monthlyAdvancePayment', { valueAsNumber: true })}
                        required
                      />
                      <p className="text-text-secondary text-xs">
                        Das ist der echte monatliche Betrag, den du an den Versorger zahlst
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[26px] bg-white/58 p-5 shadow-sm dark:bg-white/8">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-text-secondary text-xs font-medium tracking-[0.18em] uppercase">
                        Fixkosten
                      </p>
                      <p className="text-text mt-2 text-lg font-semibold">Grundpreis</p>
                    </div>
                    <div className="inline-flex rounded-full border border-white/65 bg-white/70 p-1 shadow-sm dark:border-white/10 dark:bg-white/8">
                      <button
                        type="button"
                        onClick={() => setBaseCostMode('year')}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                          baseCostMode === 'year'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-text-secondary hover:text-text'
                        }`}
                      >
                        Jahr
                      </button>
                      <button
                        type="button"
                        onClick={() => setBaseCostMode('month')}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                          baseCostMode === 'month'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-text-secondary hover:text-text'
                        }`}
                      >
                        Monat
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <Input
                        type="number"
                        step="0.01"
                        label={
                          baseCostMode === 'year'
                            ? 'Grundpreis pro Jahr (€)'
                            : 'Grundpreis pro Monat (€)'
                        }
                        error={errors.baseCostYearly?.message}
                        value={baseCostInputValue}
                        onChange={handleBaseCostChange}
                        required
                      />
                      <p className="text-text-secondary text-xs">
                        {baseCostMode === 'year'
                          ? 'Fester Jahresbetrag, der unabhängig vom Verbrauch immer anfällt'
                          : 'Monatlicher Anteil des festen Grundpreises. Wird intern auf den Jahreswert umgerechnet.'}
                      </p>
                    </div>

                    <div className="rounded-[20px] border border-white/60 bg-white/72 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/6">
                      <p className="text-text-secondary text-xs tracking-[0.14em] uppercase">
                        Umrechnung
                      </p>
                      <p className="text-text mt-2 text-base font-semibold">
                        {baseCostMode === 'year'
                          ? `${(contract.baseCostYearly / 12).toFixed(2)} € pro Monat`
                          : `${contract.baseCostYearly.toFixed(2)} € pro Jahr`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] bg-white/58 p-5 shadow-sm dark:bg-white/8">
                <div className="mb-4">
                  <p className="text-text-secondary text-xs font-medium tracking-[0.18em] uppercase">
                    Jahresannahme
                  </p>
                  <p className="text-text mt-2 text-lg font-semibold">Verbrauchsprognose</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                  <div className="flex flex-col gap-1">
                    <Input
                      type="number"
                      step="1"
                      label="Erwarteter Jahresverbrauch (kWh)"
                      error={errors.expectedYearlyUsage?.message}
                      {...register('expectedYearlyUsage', { valueAsNumber: true })}
                      required
                    />
                    <p className="text-text-secondary text-xs">
                      Dieser Wert bildet die Basis für die Einschätzung des Abschlags
                    </p>
                  </div>

                  <Button type="submit" className="w-full lg:w-auto">
                    Speichern
                  </Button>
                </div>
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
                <span className="bg-secondary/10 text-secondary flex h-9 w-9 items-center justify-center rounded-xl">
                  <Lock className="h-4 w-4" />
                </span>
                <p className="text-text-secondary text-xs font-medium tracking-wide uppercase">
                  Fixanteil pro Monat
                </p>
              </div>
              <p className="text-text text-2xl font-semibold">{monthlyFixedShare.toFixed(2)} €</p>
              <p className="text-text-secondary mt-1 text-xs">
                {fixedCostYearly.toFixed(2)} € Grundpreis ÷ 12 Monate
              </p>
            </div>

            <div className="rounded-[22px] bg-white/62 px-5 py-4 shadow-sm dark:bg-white/8">
              <div className="mb-3 flex items-center gap-2">
                <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl">
                  <Zap className="h-4 w-4" />
                </span>
                <p className="text-text-secondary text-xs font-medium tracking-wide uppercase">
                  Verbrauchsbudget pro Monat
                </p>
              </div>
              <p className="text-text text-2xl font-semibold">
                {monthlyVariableBudget.toFixed(2)} €
              </p>
              <p className="text-text-secondary mt-1 text-xs">
                Vom Abschlag bleibt dieser Betrag nach Abzug des Fixanteils für kWh übrig
              </p>
            </div>

            <div className="rounded-[22px] bg-white/62 px-5 py-4 shadow-sm dark:bg-white/8">
              <div className="mb-3 flex items-center gap-2">
                <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <p className="text-text-secondary text-xs font-medium tracking-wide uppercase">
                  Durch Abschlag finanzierte kWh
                </p>
              </div>
              <p className="text-text text-2xl font-semibold">
                {formatKwh(prepaidConsumptionAllowance)} kWh
              </p>
              <p className="text-text-secondary mt-1 text-xs">
                {yearlyVariableBudget.toFixed(2)} € Verbrauchsbudget ÷ {contract.pricePerKwh.toFixed(4)} €
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
              Von deinem monatlichen Abschlag von {contract.monthlyAdvancePayment.toFixed(2)} €
              entfallen rechnerisch {monthlyFixedShare.toFixed(2)} € auf den festen Grundpreis.
              Die übrigen {monthlyVariableBudget.toFixed(2)} € sind das monatliche Budget für den
              Arbeitspreis.
            </p>
            <p className="text-text-secondary mt-3 text-sm leading-6">
              Auf das ganze Jahr gerechnet bleiben damit nach Abzug des Grundpreises
              {' '}
              {yearlyVariableBudget.toFixed(2)} € für den Verbrauch. Das entspricht bei deinem
              Arbeitspreis von {contract.pricePerKwh.toFixed(4)} € ungefähr
              {' '}
              {formatKwh(prepaidConsumptionAllowance)} kWh.
            </p>
            <p className="text-text-secondary mt-3 text-sm leading-6">
              Der Grundpreis von {contract.baseCostYearly.toFixed(2)} € fällt immer an. Energiesparen
              reduziert nur den Arbeitspreis, niemals den Grundpreis.
            </p>
            <p className="text-text-secondary mt-3 text-sm leading-6">
              Zum Vergleich auf Basis der Vertragsannahme von {formatKwh(contract.expectedYearlyUsage)}{' '}
              kWh läge die Jahresrechnung bei {expectedCost.toFixed(2)} €,
              davon {expectedVariableCostYearly.toFixed(2)} € Arbeitspreis plus {fixedCostYearly.toFixed(2)} € Grundpreis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
