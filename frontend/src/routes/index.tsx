import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AppLayout from './AppLayout';

// Lazy load login page
const LoginPage = lazy(() => import('../pages/LoginPage'));

// Lazy load routes for code splitting
// Dashboard and Planning routes are now enabled for the Kanban UX
const DashboardRoute = lazy(() => import('./DashboardRoute'));
const PlanningRoute = lazy(() => import('./PlanningRoute'));
const SimulationRoute = lazy(() => import('./SimulationRoute'));
const ModelRoute = lazy(() => import('./ModelRoute'));
const DataStructureRoute = lazy(() => import('./DataStructureRoute'));
const MetricsRoute = lazy(() => import('./MetricsRoute'));
const KanbanRoute = lazy(() => import('../pages/KanbanPage'));

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
      { index: true, element: <Navigate to="/data" replace /> },
      { path: 'dashboard', element: <DashboardRoute /> },
      { path: 'planning', element: <PlanningRoute /> },
      { path: 'simulation', element: <SimulationRoute /> },
      { path: 'kanban', element: <KanbanRoute /> },
      { path: 'model', element: <ModelRoute /> },
      { path: 'data', element: <DataStructureRoute /> },
      { path: 'metrics', element: <MetricsRoute /> },
    ],
  },
]);
