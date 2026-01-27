import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { IconVessel } from '../assets/icons';
import { Stack } from '../components/layout';
import { Button } from '../components/action';
import { useAuth } from '../contexts/AuthContext';
import { NAV_ITEMS } from './routeConfig';
import './AppLayout.css';

export default function AppLayout() {
  const { isAuthenticated, loading, logout } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="app-layout sea-canvas">
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
    <div className="app-layout sea-canvas">
      <header className="app-header" role="banner">
        <div className="header-content">
          <div className="logo">
            <IconVessel size={32} className="header-icon" aria-hidden="true" />
            <div>
              <h1>ROTAVIVA</h1>
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
            {NAV_ITEMS.map((item) => (
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
          <div className="app-main-outlet">
            <Outlet />
          </div>
        </Suspense>
      </main>
    </div>
  );
}
