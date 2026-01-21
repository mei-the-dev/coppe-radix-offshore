/**
 * 2025 UX Design Best Practices Color Palette
 * WCAG AAA compliant (7:1 contrast for normal text, 4.5:1 for large)
 * Softer, more accessible colors following modern design trends
 */

export const colors2025 = {
  // Primary - Navy blue (sea theme)
  primary: {
    50: '#f0f4f8',   // Lightest navy
    100: '#d9e2ec',
    200: '#bcccdc',
    300: '#9fb3c8',
    400: '#829ab1',
    500: '#627d98',
    600: '#486581',
    700: '#334e68',  // Main navy
    800: '#243b53',
    900: '#102a43',
    950: '#0a1f2e',
  },

  // Secondary - Teal/cyan (sea theme)
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
  },

  // Semantic colors - WCAG AAA compliant
  success: {
    light: '#d1fae5',  // Softer, better contrast
    DEFAULT: '#10b981', // Better than #22c55e for contrast
    dark: '#059669',
    text: '#065f46',    // High contrast text
  },

  warning: {
    light: '#fef3c7',  // Softer
    DEFAULT: '#f59e0b',
    dark: '#d97706',
    text: '#92400e',
  },

  error: {
    light: '#fee2e2',  // Softer
    DEFAULT: '#ef4444',
    dark: '#dc2626',
    text: '#991b1b',
  },

  info: {
    light: '#dbeafe',  // Softer
    DEFAULT: '#3b82f6',
    dark: '#2563eb',
    text: '#1e40af',
  },

  // Status colors for vessels/berths - WCAG compliant
  status: {
    available: {
      bg: '#d1fae5',    // success-light
      text: '#065f46',  // High contrast
      border: '#10b981',
    },
    in_port: {
      bg: '#dbeafe',    // info-light
      text: '#1e40af',  // High contrast
      border: '#3b82f6',
    },
    in_transit: {
      bg: '#fef3c7',    // warning-light
      text: '#92400e',  // High contrast
      border: '#f59e0b',
    },
    at_platform: {
      bg: '#ede9fe',    // primary-100
      text: '#4c1d95',  // High contrast
      border: '#8b5cf6',
    },
    maintenance: {
      bg: '#fee2e2',    // error-light
      text: '#991b1b',  // High contrast
      border: '#ef4444',
    },
    occupied: {
      bg: '#fee2e2',
      text: '#991b1b',
      border: '#ef4444',
    },
    reserved: {
      bg: '#fef3c7',
      text: '#92400e',
      border: '#f59e0b',
    },
  },

  // Neutral grays - Refined for 2025
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
};
