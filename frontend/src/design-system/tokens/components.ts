/**
 * Component Tokens (Tier 3)
 *
 * Scoped tokens that map a semantic token to a specific property on a component.
 * These provide component-specific design values derived from semantic tokens.
 *
 * @module @kira/design-system/tokens/components
 */

import { semanticTokens } from './semantic';

export const componentTokens = {
  button: {
    background: {
      primary: semanticTokens.color.primary,
      secondary: semanticTokens.color.secondary,
      ghost: semanticTokens.color.transparent,
      danger: semanticTokens.color.error,
      success: semanticTokens.color.success,
      warning: semanticTokens.color.warning,
    },
    text: {
      primary: semanticTokens.color.text.onPrimary,
      secondary: semanticTokens.color.text.onSecondary,
      ghost: semanticTokens.color.text.primary,
      danger: semanticTokens.color.text.onError,
      success: semanticTokens.color.text.onSuccess,
      warning: semanticTokens.color.text.onWarning,
    },
    border: {
      default: semanticTokens.color.border.default,
      focus: semanticTokens.color.border.focus,
    },
    hover: {
      primary: semanticTokens.color.primaryHover,
      secondary: semanticTokens.color.secondaryHover,
      danger: semanticTokens.color.errorDark,
      success: semanticTokens.color.successDark,
      warning: semanticTokens.color.warningDark,
    },
    active: {
      primary: semanticTokens.color.primaryActive,
      secondary: semanticTokens.color.secondaryActive,
      danger: semanticTokens.color.errorDark,
      success: semanticTokens.color.successDark,
      warning: semanticTokens.color.warningDark,
    },
  },

  card: {
    surface: semanticTokens.color.surface.default,
    surfaceRaised: semanticTokens.color.surface.raised,
    surfaceElevated: semanticTokens.color.surface.elevated,
    border: semanticTokens.color.border.default,
    text: semanticTokens.color.text.primary,
    textSecondary: semanticTokens.color.text.secondary,
  },

  badge: {
    background: {
      default: semanticTokens.color.surface.sunken,
      primary: semanticTokens.color.primaryLight,
      success: semanticTokens.color.status.successBg,
      warning: semanticTokens.color.status.warningBg,
      error: semanticTokens.color.status.errorBg,
      info: semanticTokens.color.status.infoBg,
    },
    text: {
      default: semanticTokens.color.text.primary,
      primary: semanticTokens.color.primaryDark,
      success: semanticTokens.color.text.onSuccess,
      warning: semanticTokens.color.text.onWarning,
      error: semanticTokens.color.text.onError,
      info: semanticTokens.color.text.onInfo,
    },
  },

  alert: {
    success: {
      background: semanticTokens.color.status.successBg,
      border: semanticTokens.color.success,
      text: semanticTokens.color.text.onSuccess,
      icon: semanticTokens.color.success,
    },
    warning: {
      background: semanticTokens.color.status.warningBg,
      border: semanticTokens.color.warning,
      text: semanticTokens.color.text.onWarning,
      icon: semanticTokens.color.warning,
    },
    error: {
      background: semanticTokens.color.status.errorBg,
      border: semanticTokens.color.error,
      text: semanticTokens.color.text.onError,
      icon: semanticTokens.color.error,
    },
    info: {
      background: semanticTokens.color.status.infoBg,
      border: semanticTokens.color.info,
      text: semanticTokens.color.text.onInfo,
      icon: semanticTokens.color.info,
    },
  },

  input: {
    background: semanticTokens.color.surface.default,
    border: semanticTokens.color.border.default,
    borderFocus: semanticTokens.color.border.focus,
    borderError: semanticTokens.color.error,
    text: semanticTokens.color.text.primary,
    textPlaceholder: semanticTokens.color.text.tertiary,
    textDisabled: semanticTokens.color.text.disabled,
  },

  modal: {
    overlay: semanticTokens.color.background.overlay,
    surface: semanticTokens.color.surface.overlay,
    border: semanticTokens.color.border.subtle,
  },

  tooltip: {
    background: semanticTokens.color.background.inverse,
    text: semanticTokens.color.text.inverse,
    border: semanticTokens.color.border.subtle,
  },

  toast: {
    background: semanticTokens.color.surface.raised,
    border: semanticTokens.color.border.default,
    text: semanticTokens.color.text.primary,
    shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
} as const;

export type ComponentTokens = typeof componentTokens;
