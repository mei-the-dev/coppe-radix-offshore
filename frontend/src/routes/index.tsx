import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AppLayout from './AppLayout';

// Lazy load login page
const LoginPage = lazy(() => import('../pages/LoginPage'));

// Lazy load routes for code splitting
const DashboardRoute = lazy(() => import('./DashboardRoute'));
const PlanningRoute = lazy(() => import('./PlanningRoute'));
const SimulationRoute = lazy(() => import('./SimulationRoute'));
const ModelRoute = lazy(() => import('./ModelRoute'));
const DiagramRoute = lazy(() => import('./DiagramRoute'));
const DataExplorerRoute = lazy(() => import('./DataExplorerRoute'));
const MetricsRoute = lazy(() => import('./MetricsRoute'));

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<div className="loading-fallback"><div className="loading-spinner">Loading...</div></div>}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/diagram" replace /> },
      { path: 'diagram', element: <DiagramRoute /> },
      { path: 'dashboard', element: <DashboardRoute /> },
      { path: 'planning', element: <PlanningRoute /> },
      { path: 'simulation', element: <SimulationRoute /> },
      { path: 'model', element: <ModelRoute /> },
      { path: 'data', element: <DataExplorerRoute /> },
      { path: 'metrics', element: <MetricsRoute /> },
    ],
  },
]);
