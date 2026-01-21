import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import AppLayout from './AppLayout';

// Lazy load routes for code splitting
const DashboardRoute = lazy(() => import('./DashboardRoute'));
const PlanningRoute = lazy(() => import('./PlanningRoute'));
const SimulationRoute = lazy(() => import('./SimulationRoute'));
const ModelRoute = lazy(() => import('./ModelRoute'));
const DataStructureRoute = lazy(() => import('./DataStructureRoute'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardRoute /> },
      { path: 'planning', element: <PlanningRoute /> },
      { path: 'simulation', element: <SimulationRoute /> },
      { path: 'model', element: <ModelRoute /> },
      { path: 'data', element: <DataStructureRoute /> },
    ],
  },
]);
