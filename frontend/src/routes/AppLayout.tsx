import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { IconVessel } from '../assets/icons';
import { Stack } from '../components/layout';
import { Button } from '../components/action';
import { useAuth } from '../contexts/AuthContext';
import './AppLayout.css';

export default function AppLayout() {
  const { isAuthenticated, loading, logout } = useAuth();

  const navItems = [
    // Dashboard, Planning, and Visualization are hidden (under development)
    // { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    // { path: '/planning', label: 'Planning', icon: 'planning' },
    // { path: '/simulation', label: 'Visualization', icon: 'simulation' },
    { path: '/model', label: 'Model', icon: 'model' },
    { path: '/data', label: 'Data Structure', icon: 'data' },
    { path: '/metrics', label: 'Metrics', icon: 'metrics' },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="app-layout">
        <div className="loading-fallback">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <header className="app-header" role="banner">
        <div className="header-content">
          <div className="logo">
            <IconVessel size={32} className="header-icon" aria-hidden="true" />
            <div>
              <h1>Macaé Loading Dashboard</h1>
              <p>PRIO Offshore Logistics - Platform Supply Vessel Loading Planning</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <nav className="app-nav" role="navigation" aria-label="Main navigation">
        <div className="nav-container">
          <Stack direction="row" gap="sm" className="nav-tabs">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-tab ${isActive ? 'nav-tab--active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </Stack>
        </div>
      </nav>

      <main id="main-content" role="main" className="app-main">
        <Suspense
          fallback={
            <div className="loading-fallback">
              <div className="loading-spinner">Loading...</div>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
