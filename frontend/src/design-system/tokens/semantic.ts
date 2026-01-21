/**
 * Semantic Tokens (Tier 2)
 *
 * Contextual aliases that map a specific purpose to a reference token.
 * These communicate intent and enable theme switching by changing reference values.
 *
 * @module @kira/design-system/tokens/semantic
 */

import { referenceTokens } from './reference';

export const semanticTokens = {
  color: {
    // Primary brand color - Navy blue
    primary: referenceTokens.colors.navy[700],
    primaryHover: referenceTokens.colors.navy[800],
    primaryActive: referenceTokens.colors.navy[900],
    primaryLight: referenceTokens.colors.navy[100],
    primaryDark: referenceTokens.colors.navy[900],

    // Secondary brand color - Teal/sea
    secondary: referenceTokens.colors.teal[600],
    secondaryHover: referenceTokens.colors.teal[700],
    secondaryActive: referenceTokens.colors.teal[800],
    secondaryLight: referenceTokens.colors.teal[100],
    secondaryDark: referenceTokens.colors.teal[800],

    // Status colors
    success: referenceTokens.colors.green[500],
    successLight: referenceTokens.colors.green[100],
    successDark: referenceTokens.colors.green[700],
    successText: referenceTokens.colors.green[800],

    warning: referenceTokens.colors.yellow[500],
    warningLight: referenceTokens.colors.yellow[100],
    warningDark: referenceTokens.colors.yellow[700],
    warningText: referenceTokens.colors.yellow[800],

    error: referenceTokens.colors.red[500],
    errorLight: referenceTokens.colors.red[100],
    errorDark: referenceTokens.colors.red[700],
    errorText: referenceTokens.colors.red[800],

    info: referenceTokens.colors.blue[500],
    infoLight: referenceTokens.colors.blue[100],
    infoDark: referenceTokens.colors.blue[700],
    infoText: referenceTokens.colors.blue[800],

    // Surface colors
    surface: {
      default: referenceTokens.colors.white,
      raised: referenceTokens.colors.white,
      overlay: referenceTokens.colors.white,
      sunken: referenceTokens.colors.gray[50],
      interactive: `rgba(${hexToRgb(referenceTokens.colors.navy[700])}, 0.08)`,
      hover: `rgba(${hexToRgb(referenceTokens.colors.navy[700])}, 0.12)`,
      elevated: `rgba(${hexToRgb(referenceTokens.colors.gray[800])}, 0.8)`,
      elevatedLight: `rgba(${hexToRgb(referenceTokens.colors.white)}, 0.95)`,
    },

    // Text colors
    text: {
      primary: referenceTokens.colors.gray[900],
      secondary: referenceTokens.colors.gray[600],
      tertiary: referenceTokens.colors.gray[500],
      disabled: referenceTokens.colors.gray[400],
      inverse: referenceTokens.colors.white,
      link: referenceTokens.colors.navy[700],
      linkHover: referenceTokens.colors.navy[800],
      onPrimary: referenceTokens.colors.white,
      onSecondary: referenceTokens.colors.white,
      onSuccess: referenceTokens.colors.green[800],
      onWarning: referenceTokens.colors.yellow[800],
      onError: referenceTokens.colors.red[800],
      onInfo: referenceTokens.colors.blue[800],
    },

    // Border colors
    border: {
      default: referenceTokens.colors.gray[200],
      strong: referenceTokens.colors.gray[300],
      subtle: referenceTokens.colors.gray[100],
      focus: referenceTokens.colors.navy[700],
      interactive: `rgba(${hexToRgb(referenceTokens.colors.navy[700])}, 0.2)`,
      hover: `rgba(${hexToRgb(referenceTokens.colors.navy[700])}, 0.3)`,
    },

    // Background colors
    background: {
      primary: referenceTokens.colors.white,
      secondary: referenceTokens.colors.gray[50],
      tertiary: referenceTokens.colors.gray[100],
      inverse: referenceTokens.colors.gray[900],
      overlay: 'rgba(0, 0, 0, 0.5)',
    },

    // Interactive colors
    interactive: {
      default: referenceTokens.colors.navy[700],
      hover: referenceTokens.colors.navy[800],
      active: referenceTokens.colors.navy[900],
      disabled: referenceTokens.colors.gray[300],
    },

    // Transparent
    transparent: referenceTokens.colors.transparent,

    // Status backgrounds
    status: {
      successBg: referenceTokens.colors.green[100],
      warningBg: referenceTokens.colors.yellow[100],
      errorBg: referenceTokens.colors.red[100],
      infoBg: referenceTokens.colors.blue[100],
    },

    // Glass morphism
    glass: {
      bgEnhanced: `rgba(255, 255, 255, 0.7)`,
      borderEnhanced: `rgba(255, 255, 255, 0.3)`,
      bgDark: `rgba(${hexToRgb(referenceTokens.colors.gray[900])}, 0.8)`,
      borderDark: `rgba(${hexToRgb(referenceTokens.colors.navy[700])}, 0.15)`,
    },

    // Gradients - Navy/Sea theme
    gradient: {
      accent: `linear-gradient(135deg, ${referenceTokens.colors.navy[700]} 0%, ${referenceTokens.colors.teal[600]} 100%)`,
      primary: `linear-gradient(135deg, ${referenceTokens.colors.navy[700]}, ${referenceTokens.colors.navy[800]})`,
      secondary: `linear-gradient(135deg, ${referenceTokens.colors.teal[600]}, ${referenceTokens.colors.teal[700]})`,
    },
  },
} as const;

/**
 * Helper function to convert hex to RGB string
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

export type SemanticTokens = typeof semanticTokens;
