import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { LoadingPlan } from '../types';

export interface LoadingPlanFilters {
  status?: LoadingPlan['status'][];
  vesselId?: string;
  berthId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface LoadingPlanState {
  loadingPlans: LoadingPlan[];
  selectedPlan: LoadingPlan | null;
  filters: LoadingPlanFilters;
  // Actions
  setLoadingPlans: (plans: LoadingPlan[]) => void;
  addLoadingPlan: (plan: LoadingPlan) => void;
  updateLoadingPlan: (id: string, plan: Partial<LoadingPlan>) => void;
  removeLoadingPlan: (id: string) => void;
  selectPlan: (id: string | null) => void;
  updateFilters: (filters: Partial<LoadingPlanFilters>) => void;
  resetFilters: () => void;
}

export const useLoadingPlanStore = create<LoadingPlanState>()(
  devtools(
    persist(
      (set) => ({
        loadingPlans: [],
        selectedPlan: null,
        filters: {},
        setLoadingPlans: (loadingPlans) => set({ loadingPlans }, false, 'setLoadingPlans'),
        addLoadingPlan: (plan) => set((state) => ({
          loadingPlans: [...state.loadingPlans, plan]
        }), false, 'addLoadingPlan'),
        updateLoadingPlan: (id, updates) => set((state) => ({
          loadingPlans: state.loadingPlans.map((plan) =>
            plan.id === id ? { ...plan, ...updates } : plan
          )
        }), false, 'updateLoadingPlan'),
        removeLoadingPlan: (id) => set((state) => ({
          loadingPlans: state.loadingPlans.filter((plan) => plan.id !== id),
          selectedPlan: state.selectedPlan?.id === id ? null : state.selectedPlan
        }), false, 'removeLoadingPlan'),
        selectPlan: (id) => set((state) => ({
          selectedPlan: id ? state.loadingPlans.find((p) => p.id === id) || null : null
        }), false, 'selectPlan'),
        updateFilters: (filters) => set((state) => ({
          filters: { ...state.filters, ...filters }
        }), false, 'updateFilters'),
        resetFilters: () => set({ filters: {} }, false, 'resetFilters'),
      }),
      { name: 'loading-plan-storage' }
    ),
    { name: 'LoadingPlanStore' }
  )
);
