'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Plus, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/add-entry', icon: Plus, label: 'Eintrag' },
  { href: '/analytics', icon: BarChart3, label: 'Analyse' },
  { href: '/settings', icon: Settings, label: 'Mehr' },
];

/**
 * Bottom navigation bar for mobile devices
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-4 z-50 px-4 sm:px-6 lg:hidden"
      aria-label="Mobilnavigation"
    >
      <div className="glass-panel panel-glow mx-auto max-w-md rounded-[28px] !bg-white/28 px-2 py-2 backdrop-blur-3xl dark:!bg-black/18">
        <div className="flex items-center justify-around gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'motion-nav flex flex-1 flex-col items-center justify-center rounded-2xl px-3 py-2 transition-all duration-300',
                  'focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2',
                  isActive
                    ? 'text-text bg-white/80 shadow-sm ring-1 ring-white/70 dark:bg-white/10 dark:ring-white/12'
                    : 'text-text-secondary hover:text-text hover:bg-white/45 dark:hover:bg-white/6',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <span
                  className={cn(
                    'mb-1 flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text-secondary dark:text-text-secondary bg-white/60 dark:bg-white/8',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
