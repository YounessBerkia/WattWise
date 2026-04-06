'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useEnergyStore } from '@/hooks/useEnergyStore';
import { contractSchema, type ContractFormData } from '@/lib/validators';
import { calculateYearlyProjection, calculateTotalCost } from '@/lib/calculations';
import { KPICard } from '@/components/features/dashboard/kpi-card';
import { Euro, TrendingUp, Sparkles } from 'lucide-react';

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

  // Balance: Vergleich Prognose vs. Vertrag
  const balance = {
    amount: Math.abs(projectedCost - expectedCost),
    type: projectedCost > expectedCost ? 'surcharge' : ('refund' as const),
  };

  return (
    <div className="w-full space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-text mb-2 text-3xl font-bold lg:text-4xl">Kosten & Vertrag</h1>
        <p className="text-text-secondary">Verwalten Sie Ihre Vertragsdaten</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(420px,0.95fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Vertragsdetails</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 md:grid-cols-2">
              <Input
                type="number"
                step="0.01"
                label="Preis pro kWh (€)"
                error={errors.pricePerKwh?.message}
                {...register('pricePerKwh', { valueAsNumber: true })}
                required
              />

              <Input
                type="number"
                step="0.01"
                label="Grundpreis monatlich (€)"
                error={errors.baseCostMonthly?.message}
                {...register('baseCostMonthly', { valueAsNumber: true })}
                required
              />

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
          <KPICard label="Jahresprognose" value={projectedCost.toFixed(2)} unit="€" icon={Euro} />

          <KPICard
            label={balance.type === 'surcharge' ? 'Nachzahlung' : 'Rückzahlung'}
            value={balance.amount.toFixed(2)}
            unit="€"
            icon={balance.type === 'surcharge' ? TrendingUp : Sparkles}
          />

          <KPICard
            label="Verbrauch Prognose"
            value={yearlyProjection}
            unit="kWh"
            icon={TrendingUp}
          />
        </div>
      </div>
    </div>
  );
}
