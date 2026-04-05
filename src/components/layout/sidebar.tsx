'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Plus, BarChart3, Euro, History, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/add-entry', icon: Plus, label: 'Eintrag hinzufügen' },
  { href: '/analytics', icon: BarChart3, label: 'Analyse' },
  { href: '/costs', icon: Euro, label: 'Kosten' },
  { href: '/history', icon: History, label: 'Verlauf' },
  { href: '/settings', icon: Settings, label: 'Einstellungen' },
];

/**
 * Sidebar navigation component for desktop
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-24 hidden h-[calc(100vh-7.5rem)] w-[280px] shrink-0 lg:block">
      <nav
        className="glass-panel panel-glow flex h-full flex-col rounded-[30px] p-4"
        aria-label="Hauptnavigation"
      >
        <div className="mb-6 px-2 pt-2">
          <p className="text-text-secondary text-xs font-semibold tracking-[0.24em] uppercase">
            Navigation
          </p>
        </div>

        <div className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'motion-nav flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300',
                  'focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2',
                  isActive
                    ? 'text-text bg-white/58 shadow-sm ring-1 ring-white/50 backdrop-blur-md dark:bg-white/10 dark:ring-white/10'
                    : 'text-text-secondary hover:text-text hover:bg-white/30 dark:hover:bg-white/6',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-300',
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-secondary dark:text-text-secondary bg-white/40 dark:bg-white/8',
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="text-text-secondary mt-auto rounded-2xl border border-white/35 bg-white/34 p-4 text-sm shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/6">
          Behalte Verbrauch, Kosten und neue Einträge an einem Ort im Blick.
        </div>
      </nav>
    </aside>
  );
}
