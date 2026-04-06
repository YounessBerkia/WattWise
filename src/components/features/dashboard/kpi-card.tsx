'use client';

import { Card } from '@/components/ui';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Trend } from '@/types';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: Trend;
  trendLabel?: string;
  className?: string;
}

/**
 * KPI Card component for dashboard metrics
 */
export function KPICard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  trendLabel,
  className,
}: KPICardProps) {
  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.direction === 'up') return 'bg-critical/10 text-critical'; // Rot für "up" = mehr Verbrauch
    if (trend.direction === 'down') return 'bg-efficient/10 text-efficient'; // Grün für "down" = weniger Verbrauch
    return 'bg-white/65 text-text-secondary dark:bg-white/8';
  };

  const trendColor = getTrendColor();

  return (
    <Card hoverable className={cn('overflow-hidden', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-text-secondary mb-2 text-sm font-medium">{label}</p>
          <div className="text-text text-4xl font-semibold tracking-tight">
            {value}
            {unit && <span className="text-text-secondary ml-2 text-lg font-medium">{unit}</span>}
          </div>
        </div>

        <span className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm">
          <Icon className="h-5 w-5" />
        </span>
      </div>

      {trend && (
        <div
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium',
            trendColor,
          )}
        >
          {trend.direction === 'up' && <TrendingUp className="h-4 w-4" />}
          {trend.direction === 'down' && <TrendingDown className="h-4 w-4" />}
          {trend.direction === 'neutral' && <Minus className="h-4 w-4" />}
          <span>
            {trend.percentage.toFixed(1)}% {trendLabel || 'vs. letzten Monat'}
          </span>
        </div>
      )}
    </Card>
  );
}
