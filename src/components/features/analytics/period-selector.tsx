'use client';

import { cn } from '@/lib/utils';

type Period = 'day' | 'week' | 'month' | 'year';

interface PeriodSelectorProps {
  value: Period;
  onChange: (period: Period) => void;
}

/**
 * Period Selector - Tabs for filtering charts by time period
 */
export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const periods: { value: Period; label: string }[] = [
    { value: 'day', label: 'Tag' },
    { value: 'week', label: 'Woche' },
    { value: 'month', label: 'Monat' },
    { value: 'year', label: 'Jahr' },
  ];

  return (
    <div
      className="inline-flex rounded-full border border-white/65 bg-white/75 p-1.5 shadow-sm dark:border-white/12 dark:bg-white/8"
      role="tablist"
    >
      {periods.map((period) => (
        <button
          key={period.value}
          role="tab"
          aria-selected={value === period.value}
          onClick={() => onChange(period.value)}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-all duration-300',
            'focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2',
            value === period.value
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text hover:bg-white/80 dark:hover:bg-white/10',
          )}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
