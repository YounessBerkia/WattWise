import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  DEFAULT_CONTRACT,
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  STORAGE_VERSION,
} from '@/lib/constants';
import type { Contract, EnergyReading, Settings, WattWiseData } from '@/types';

export interface EnergyStore extends WattWiseData {
  addReading: (newReading: EnergyReading) => void;
  updateReading: (
    readingId: string,
    readingChanges: Partial<EnergyReading>
  ) => void;
  deleteReading: (readingId: string) => void;
  updateContract: (contractChanges: Partial<Contract>) => void;
  updateSettings: (settingsChanges: Partial<Settings>) => void;
  resetAllData: () => void;
  exportData: () => WattWiseData;
  importData: (importedSnapshot: WattWiseData) => void;
}

const buildTimestamp = () => new Date().toISOString();

const sortReadingsByTimestamp = (
  unsortedReadings: EnergyReading[]
): EnergyReading[] => {
  return [...unsortedReadings].sort((leftReading, rightReading) => {
    return (
      new Date(leftReading.timestamp).getTime() -
      new Date(rightReading.timestamp).getTime()
    );
  });
};

const createInitialData = (): WattWiseData => {
  const initialTimestamp = buildTimestamp();

  return {
    version: STORAGE_VERSION,
    readings: [],
    contract: { ...DEFAULT_CONTRACT },
    settings: { ...DEFAULT_SETTINGS },
    metadata: {
      createdAt: initialTimestamp,
      lastModified: initialTimestamp,
    },
  };
};

const createHydrationFallback = (): EnergyStore => {
  const initialData = createInitialData();

  return {
    ...initialData,
    addReading: () => undefined,
    updateReading: () => undefined,
    deleteReading: () => undefined,
    updateContract: () => undefined,
    updateSettings: () => undefined,
    resetAllData: () => undefined,
    exportData: () => initialData,
    importData: () => undefined,
  };
};

const stampLastModified = (currentData: WattWiseData): WattWiseData => {
  return {
    ...currentData,
    metadata: {
      ...currentData.metadata,
      lastModified: buildTimestamp(),
    },
  };
};

const normaliseImportedSnapshot = (
  importedSnapshot: WattWiseData,
  existingCreatedAt: string
): WattWiseData => {
  const snapshotCreatedAt =
    importedSnapshot.metadata?.createdAt || existingCreatedAt || buildTimestamp();

  return {
    version: STORAGE_VERSION,
    readings: sortReadingsByTimestamp(importedSnapshot.readings ?? []),
    contract: {
      ...DEFAULT_CONTRACT,
      ...importedSnapshot.contract,
    },
    settings: {
      ...DEFAULT_SETTINGS,
      ...importedSnapshot.settings,
    },
    metadata: {
      createdAt: snapshotCreatedAt,
      lastModified: buildTimestamp(),
    },
  };
};

export const hydrationFallbackStore = createHydrationFallback();

export const useEnergyStore = create<EnergyStore>()(
  persist(
    (set, get) => ({
      ...createInitialData(),

      addReading: (newReading) => {
        set((currentState) =>
          stampLastModified({
            ...currentState,
            readings: sortReadingsByTimestamp([
              ...currentState.readings,
              newReading,
            ]),
          })
        );
      },

      updateReading: (readingId, readingChanges) => {
        set((currentState) =>
          stampLastModified({
            ...currentState,
            readings: sortReadingsByTimestamp(
              currentState.readings.map((storedReading) => {
                if (storedReading.id !== readingId) {
                  return storedReading;
                }

                return {
                  ...storedReading,
                  ...readingChanges,
                  id: storedReading.id,
                };
              })
            ),
          })
        );
      },

      deleteReading: (readingId) => {
        set((currentState) =>
          stampLastModified({
            ...currentState,
            readings: currentState.readings.filter(
              (storedReading) => storedReading.id !== readingId
            ),
          })
        );
      },

      updateContract: (contractChanges) => {
        set((currentState) =>
          stampLastModified({
            ...currentState,
            contract: {
              ...currentState.contract,
              ...contractChanges,
            },
          })
        );
      },

      updateSettings: (settingsChanges) => {
        set((currentState) =>
          stampLastModified({
            ...currentState,
            settings: {
              ...currentState.settings,
              ...settingsChanges,
            },
          })
        );
      },

      resetAllData: () => {
        set(() => createInitialData());
      },

      exportData: () => {
        const {
          version,
          readings,
          contract,
          settings,
          metadata,
        } = get();

        // Export enthält nur fachliche Daten, niemals Store-Aktionen.
        return {
          version,
          readings: sortReadingsByTimestamp(readings),
          contract: { ...contract },
          settings: { ...settings },
          metadata: { ...metadata },
        };
      },

      importData: (importedSnapshot) => {
        set((currentState) =>
          normaliseImportedSnapshot(
            importedSnapshot,
            currentState.metadata.createdAt
          )
        );
      },
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
