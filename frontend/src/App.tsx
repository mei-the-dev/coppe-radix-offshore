import './App.css';
import { DashboardPage } from './pages';
import { IconVessel } from './assets/icons';
import { SkipLink } from './components/atoms';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        {/* WCAG 2.4.1: Skip to main content link */}
        <SkipLink href="#main-content">Skip to main content</SkipLink>

        <header className="app-header" role="banner">
          <h1>
            <IconVessel size={32} className="header-icon" aria-hidden="true" />
            Macaé Loading Dashboard
          </h1>
          <p>PRIO Offshore Logistics - Platform Supply Vessel Loading Planning</p>
        </header>

        <main id="main-content" role="main">
          <DashboardPage />
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
