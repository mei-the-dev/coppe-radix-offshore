/**
 * Design System Entry Point (in-repo, no external package)
 *
 * Central export for design tokens, theme utilities, and CSS.
 * All assets live in frontend/src/design-system/ – see DESIGN_SYSTEM.md.
 *
 * @module design-system
 */

export { tokens, voiceStates, alertSeverity } from './tokens/index';

// In-repo CSS (tokens, themes, glass, sea canvas)
import './tokens.css';
import './themes.css';
import './glass.css';
import './sea-canvas.css';

/**
 * Get CSS variable value
 * @param varName - CSS variable name (without --)
 * @returns The computed value
 */
export function getCSSVar(varName: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--${varName}`)
    .trim();
}

/**
 * Set CSS variable value
 * @param varName - CSS variable name (without --)
 * @param value - Value to set
 */
export function setCSSVar(varName: string, value: string): void {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty(`--${varName}`, value);
}

/**
 * Toggle theme between light and dark
 * @param theme - 'light' | 'dark' | 'system'
 */
export function setTheme(theme: 'light' | 'dark' | 'system'): void {
  if (typeof document === 'undefined') return;

  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
}

/**
 * Get current theme
 * @returns 'light' | 'dark' | 'system'
 */
export function getTheme(): 'light' | 'dark' | 'system' {
  if (typeof document === 'undefined') return 'system';

  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'system';
}

/**
 * Check if user prefers reduced motion
 * @returns boolean
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 * @returns boolean
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: more)').matches;
}

/**
 * Class name utility (like clsx/classnames)
 * @param args - Class names or objects with boolean values
 * @returns Combined class string
 */
export function cx(...args: (string | Record<string, boolean> | undefined | null)[]): string {
  return args
    .flatMap((arg) => {
      if (!arg) return [];
      if (typeof arg === 'string') return [arg];
      if (typeof arg === 'object') {
        return Object.entries(arg)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return [];
    })
    .join(' ');
}

// Re-export component interfaces
export * from './components/interfaces';
