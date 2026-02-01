import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getTheme, setTheme as setThemeUtil } from '../design-system';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * ThemeProvider
 *
 * Provides theme context to all components. Components automatically adapt
 * to theme changes without needing explicit darkMode props.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Default to dark theme for the Kanban UX (unless user explicitly set a preference)
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = getTheme();
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = getTheme();
    if (stored === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark';
  });

  useEffect(() => {
    setThemeUtil(theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const updateResolved = () => {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      };

      updateResolved();
      mediaQuery.addEventListener('change', updateResolved);
      return () => mediaQuery.removeEventListener('change', updateResolved);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setThemeUtil(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme hook
 *
 * Access theme context in components. Components automatically adapt
 * to theme changes via CSS variables.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
