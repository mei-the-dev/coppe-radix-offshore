import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SimulationState } from '../types/simulation';

interface SimulationStoreState {
  simulationState: SimulationState;
  isRunning: boolean;
  // Actions
  setSimulationState: (state: SimulationState) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  updateVesselPositions: (vessels: SimulationState['vessels']) => void;
  updateLoadingOperations: (operations: SimulationState['loadingOperations']) => void;
}

export const useSimulationStore = create<SimulationStoreState>()(
  devtools(
    (set) => ({
      simulationState: {
        isRunning: false,
        currentTime: new Date(),
        weekStart: new Date(),
        vessels: [],
        loadingOperations: [],
      },
      isRunning: false,
      setSimulationState: (simulationState) => set({
        simulationState,
        isRunning: simulationState.isRunning
      }, false, 'setSimulationState'),
      startSimulation: () => set((state) => ({
        simulationState: { ...state.simulationState, isRunning: true },
        isRunning: true
      }), false, 'startSimulation'),
      stopSimulation: () => set((state) => ({
        simulationState: { ...state.simulationState, isRunning: false },
        isRunning: false
      }), false, 'stopSimulation'),
      resetSimulation: () => set({
        simulationState: {
          isRunning: false,
          currentTime: new Date(),
          weekStart: new Date(),
          vessels: [],
          loadingOperations: [],
        },
        isRunning: false
      }, false, 'resetSimulation'),
      updateVesselPositions: (vessels) => set((state) => ({
        simulationState: { ...state.simulationState, vessels }
      }), false, 'updateVesselPositions'),
      updateLoadingOperations: (loadingOperations) => set((state) => ({
        simulationState: { ...state.simulationState, loadingOperations }
      }), false, 'updateLoadingOperations'),
    }),
    { name: 'SimulationStore' }
  )
);
