import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Vessel } from '../types';

export interface VesselFilters {
  status?: Vessel['status'][];
  type?: string[];
  search?: string;
}

interface VesselState {
  vessels: Vessel[];
  selectedVessel: Vessel | null;
  filters: VesselFilters;
  // Actions
  setVessels: (vessels: Vessel[]) => void;
  selectVessel: (id: string | null) => void;
  updateFilters: (filters: Partial<VesselFilters>) => void;
  resetFilters: () => void;
}

export const useVesselStore = create<VesselState>()(
  devtools(
    persist(
      (set) => ({
        vessels: [],
        selectedVessel: null,
        filters: {},
        setVessels: (vessels) => set({ vessels }, false, 'setVessels'),
        selectVessel: (id) => set((state) => ({
          selectedVessel: id ? state.vessels.find((v) => v.id === id) || null : null
        }), false, 'selectVessel'),
        updateFilters: (filters) => set((state) => ({
          filters: { ...state.filters, ...filters }
        }), false, 'updateFilters'),
        resetFilters: () => set({ filters: {} }, false, 'resetFilters'),
      }),
      { name: 'vessel-storage' }
    ),
    { name: 'VesselStore' }
  )
);
