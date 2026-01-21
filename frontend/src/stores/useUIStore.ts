import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  activeView: 'dashboard' | 'planning' | 'simulation' | 'model' | 'data';
  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveView: (view: UIState['activeView']) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        activeView: 'dashboard',
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }, false, 'setSidebarOpen'),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),
        setActiveView: (activeView) => set({ activeView }, false, 'setActiveView'),
      }),
      { name: 'ui-storage' }
    ),
    { name: 'UIStore' }
  )
);
