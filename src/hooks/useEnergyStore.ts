'use client';

import { hydrationFallbackStore, useEnergyStore as useEnergyStoreState } from '@/stores';

import { useHydration } from './useHydration';

export function useEnergyStore() {
  const isHydrated = useHydration();
  const actualStore = useEnergyStoreState();

  // Vor der Browser-Hydration liefern wir eine stabile Ersatzstruktur,
  // damit Server-HTML und Client-Initialzustand identisch bleiben.
  if (!isHydrated) {
    return hydrationFallbackStore;
  }

  return actualStore;
}
