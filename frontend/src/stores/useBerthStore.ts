import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Berth } from '../types';

export interface BerthFilters {
  status?: Berth['status'][];
  search?: string;
}

interface BerthState {
  berths: Berth[];
  selectedBerth: Berth | null;
  filters: BerthFilters;
  // Actions
  setBerths: (berths: Berth[]) => void;
  selectBerth: (id: string | null) => void;
  updateFilters: (filters: Partial<BerthFilters>) => void;
  resetFilters: () => void;
}

export const useBerthStore = create<BerthState>()(
  devtools(
    persist(
      (set) => ({
        berths: [],
        selectedBerth: null,
        filters: {},
        setBerths: (berths) => set({ berths }, false, 'setBerths'),
        selectBerth: (id) => set((state) => ({
          selectedBerth: id ? state.berths.find((b) => b.id === id) || null : null
        }), false, 'selectBerth'),
        updateFilters: (filters) => set((state) => ({
          filters: { ...state.filters, ...filters }
        }), false, 'updateFilters'),
        resetFilters: () => set({ filters: {} }, false, 'resetFilters'),
      }),
      { name: 'berth-storage' }
    ),
    { name: 'BerthStore' }
  )
);
