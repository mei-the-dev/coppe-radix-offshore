/**
 * Legacy Tokens
 *
 * Temporary backward compatibility layer for existing code.
 * This maintains the old flat token structure while we migrate to the 3-tier system.
 *
 * @deprecated Use referenceTokens, semanticTokens, and componentTokens instead
 * @module @kira/design-system/tokens/legacy
 */

import { referenceTokens } from './reference';
import { semanticTokens } from './semantic';

// Re-export the original tokens structure for backward compatibility
export const tokens = {
  colors: {
    // Primary colors (navy blue - sea theme)
    primary: referenceTokens.colors.navy,
    // Secondary colors (teal/cyan - sea theme)
    secondary: referenceTokens.colors.teal,
    // Semantic colors
    success: {
      light: referenceTokens.colors.green[100],
      DEFAULT: referenceTokens.colors.green[500],
      dark: referenceTokens.colors.green[700],
    },
    warning: {
      light: referenceTokens.colors.yellow[100],
      DEFAULT: referenceTokens.colors.yellow[500],
      dark: referenceTokens.colors.yellow[700],
    },
    error: {
      light: referenceTokens.colors.red[100],
      DEFAULT: referenceTokens.colors.red[500],
      dark: referenceTokens.colors.red[700],
    },
    info: {
      light: referenceTokens.colors.blue[100],
      DEFAULT: referenceTokens.colors.blue[500],
      dark: referenceTokens.colors.blue[700],
    },
    // Grayscale
    gray: referenceTokens.colors.gray,
    // Base colors
    white: referenceTokens.colors.white,
    black: referenceTokens.colors.black,
    transparent: referenceTokens.colors.transparent,
    // Enhanced gradient colors
    accentGradient: semanticTokens.color.gradient.accent,
    primaryGradient: semanticTokens.color.gradient.primary,
    secondaryGradient: semanticTokens.color.gradient.secondary,
    // Interactive states
    surfaceInteractive: semanticTokens.color.surface.interactive,
    borderInteractive: semanticTokens.color.border.interactive,
    surfaceHover: semanticTokens.color.surface.hover,
    borderHover: semanticTokens.color.border.hover,
    // Glass morphism
    glassBgEnhanced: semanticTokens.color.glass.bgEnhanced,
    glassBorderEnhanced: semanticTokens.color.glass.borderEnhanced,
    glassBgDark: semanticTokens.color.glass.bgDark,
    glassBorderDark: semanticTokens.color.glass.borderDark,
    // Surface elevation
    surfaceElevated: semanticTokens.color.surface.elevated,
    surfaceElevatedLight: semanticTokens.color.surface.elevatedLight,
  },

  // Keep other token categories as-is for now
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
    },
  },

  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },

  borderRadius: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    glow: '0 0 20px rgba(51, 78, 104, 0.4)',
    'glow-lg': '0 0 40px rgba(51, 78, 104, 0.5)',
  },

  animation: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
    },
    timing: {
      linear: 'linear',
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Motion tokens with spring physics (Phase 3)
  motion: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      default: '300ms',
      slow: '500ms',
      slower: '700ms',
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    spring: {
      gentle: { tension: 120, friction: 14 },
      wobbly: { tension: 180, friction: 12 },
      stiff: { tension: 210, friction: 20 },
      default: { tension: 150, friction: 15 },
    },
  },

  zIndex: {
    hide: -1,
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
    toast: 1700,
  },

  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  touchTarget: {
    min: '44px',
    comfortable: '48px',
    large: '64px',
  },

  focus: {
    ring: {
      width: '2px',
      offset: '2px',
      color: '#334e68',
      colorError: '#ef4444',
    },
    outline: {
      style: 'solid',
      width: '2px',
      offset: '2px',
    },
  },

  transition: {
    property: {
      colors: 'background-color, border-color, color, fill, stroke',
      opacity: 'opacity',
      shadow: 'box-shadow',
      transform: 'transform',
      all: 'all',
    },
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    timing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  elevation: {
    0: { shadow: 'none', zIndex: 0 },
    1: { shadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', zIndex: 10 },
    2: { shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', zIndex: 20 },
    3: { shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', zIndex: 30 },
    4: { shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', zIndex: 40 },
  },

  grid: {
    columns: 12,
    gutter: {
      xs: '1rem',
      sm: '1.5rem',
      md: '2rem',
      lg: '2.5rem',
      xl: '3rem',
    },
  },

  container: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    full: '100%',
  },

  spatial: {
    canvas: {
      background: 'linear-gradient(135deg, var(--color-gray-50) 0%, var(--color-primary-50) 50%, var(--color-secondary-50) 100%)',
      gridSize: 20,
    },
    drag: {
      activeZIndex: 50,
      ringColor: 'var(--color-primary-400)',
      scale: 1.05,
    },
    cluster: {
      sizes: { sm: 120, md: 160, lg: 200 },
      gradients: {
        urgent: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        team: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        projects: 'linear-gradient(135deg, #334e68 0%, #243b53 100%)',
        reading: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      },
    },
  },

  ai: {
    insight: {
      background: 'linear-gradient(135deg, var(--color-primary-50), var(--color-info-light), rgba(99, 102, 241, 0.1))',
      border: 'var(--color-primary-100)',
    },
    sparkle: {
      color: 'var(--color-primary-600)',
    },
  },
};

export const voiceStates = {
  idle: { color: tokens.colors.info.DEFAULT, bg: tokens.colors.info.light, label: 'Ready' },
  recording: { color: tokens.colors.error.DEFAULT, bg: tokens.colors.error.light, label: 'Listening...' },
  processing: { color: tokens.colors.warning.DEFAULT, bg: tokens.colors.warning.light, label: 'Processing...' },
  speaking: { color: tokens.colors.success.DEFAULT, bg: tokens.colors.success.light, label: 'Speaking...' },
  error: { color: tokens.colors.error.dark, bg: tokens.colors.error.light, label: 'Error' },
};

export const alertSeverity = {
  info: { color: tokens.colors.info.DEFAULT, bg: tokens.colors.info.light, icon: 'info' },
  success: { color: tokens.colors.success.DEFAULT, bg: tokens.colors.success.light, icon: 'check-circle' },
  warning: { color: tokens.colors.warning.DEFAULT, bg: tokens.colors.warning.light, icon: 'alert-triangle' },
  error: { color: tokens.colors.error.DEFAULT, bg: tokens.colors.error.light, icon: 'x-circle' },
};

export default tokens;
