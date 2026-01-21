/**
 * Style Inspector
 * Check computed styles, verify CSS variables, check for conflicts, validate WCAG contrast
 */

import { debugLog, debugGroup, isDebugEnabled } from './debugMode';

export interface StyleCheck {
  property: string;
  expected: string;
  actual: string;
  match: boolean;
}

/**
 * Check computed styles for an element
 */
export const checkComputedStyles = (
  element: HTMLElement | null,
  expectedStyles: Record<string, string>
): StyleCheck[] => {
  if (!isDebugEnabled() || !element) return [];

  const computed = window.getComputedStyle(element);
  const checks: StyleCheck[] = [];

  for (const [property, expectedValue] of Object.entries(expectedStyles)) {
    const actualValue = computed.getPropertyValue(property).trim();
    const match = actualValue === expectedValue ||
                  (property === 'box-shadow' && actualValue !== 'none' && expectedValue !== 'none') ||
                  (property === 'border' && actualValue === '0px none rgb(0, 0, 0)' && expectedValue === 'none');

    checks.push({
      property,
      expected: expectedValue,
      actual: actualValue,
      match,
    });

    if (!match) {
      debugLog('style', `Style mismatch: ${property}`, {
        element,
        expected: expectedValue,
        actual: actualValue,
      });
    }
  }

  return checks;
};

/**
 * Verify CSS variables resolve correctly
 */
export const verifyCSSVariables = (element: HTMLElement | null, variables: string[]): Record<string, string> => {
  if (!isDebugEnabled() || !element) return {};

  const computed = window.getComputedStyle(element);
  const values: Record<string, string> = {};

  variables.forEach(variable => {
    const value = computed.getPropertyValue(variable).trim();
    values[variable] = value;

    if (!value) {
      debugLog('style', `CSS variable not set: ${variable}`, { element });
    }
  });

  return values;
};

/**
 * Check for style conflicts (e.g., border vs box-shadow)
 */
export const checkStyleConflicts = (element: HTMLElement | null): string[] => {
  if (!isDebugEnabled() || !element) return [];

  const computed = window.getComputedStyle(element);
  const conflicts: string[] = [];

  // Check if both border and box-shadow are set (might indicate old styling)
  const border = computed.getPropertyValue('border');
  const boxShadow = computed.getPropertyValue('box-shadow');

  if (border && border !== '0px none rgb(0, 0, 0)' && boxShadow && boxShadow !== 'none') {
    conflicts.push('Both border and box-shadow are set (consider using only box-shadow for modern design)');
  }

  // Check for generic 1px gray borders
  if (border && border.includes('1px') && border.includes('rgb(229, 231, 235)')) {
    conflicts.push('Generic 1px gray border detected (consider using box-shadow instead)');
  }

  if (conflicts.length > 0) {
    debugLog('style', 'Style conflicts detected', { element, conflicts });
  }

  return conflicts;
};

/**
 * Validate WCAG contrast ratio
 */
export const validateContrast = (
  foreground: string,
  background: string
): { ratio: number; level: 'AAA' | 'AA' | 'FAIL'; valid: boolean } => {
  if (!isDebugEnabled()) return { ratio: 0, level: 'FAIL', valid: false };

  // Convert hex/rgb to luminance
  const getLuminance = (_color: string): number => {
    // Simplified - would need proper color parsing
    // This is a placeholder implementation
    return 0.5; // Placeholder
  };

  const fgLum = getLuminance(foreground);
  const bgLum = getLuminance(background);

  const ratio = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);

  let level: 'AAA' | 'AA' | 'FAIL';
  let valid: boolean;

  if (ratio >= 7) {
    level = 'AAA';
    valid = true;
  } else if (ratio >= 4.5) {
    level = 'AA';
    valid = true;
  } else {
    level = 'FAIL';
    valid = false;
  }

  if (!valid) {
    debugLog('style', 'WCAG contrast validation failed', {
      foreground,
      background,
      ratio: ratio.toFixed(2),
      level,
    });
  }

  return { ratio, level, valid };
};

/**
 * Verify Card component styling
 */
export const verifyCardStyling = (element: HTMLElement | null): StyleCheck[] => {
  if (!isDebugEnabled() || !element) return [];

  return checkComputedStyles(element, {
    'border': 'none',
    'box-shadow': 'rgba(0, 0, 0, 0.08) 0px 1px 3px', // Should have shadow, not exact match needed
  });
};

/**
 * Verify Badge component styling
 */
export const verifyBadgeStyling = (element: HTMLElement | null): StyleCheck[] => {
  if (!isDebugEnabled() || !element) return [];

  return checkComputedStyles(element, {
    'display': 'inline-block',
    'border-radius': '0.375rem', // Should have rounded corners
  });
};

/**
 * Print style summary for an element
 */
export const printStyleSummary = (element: HTMLElement | null) => {
  if (!isDebugEnabled() || !element) return;

  debugGroup(`Style Summary: ${element.tagName}.${element.className}`, () => {
    const computed = window.getComputedStyle(element);

    console.log('Computed Styles:', {
      display: computed.display,
      padding: computed.padding,
      margin: computed.margin,
      border: computed.border,
      'box-shadow': computed.boxShadow,
      'background-color': computed.backgroundColor,
      color: computed.color,
    });

    const conflicts = checkStyleConflicts(element);
    if (conflicts.length > 0) {
      console.warn('Style Conflicts:', conflicts);
    }

    // Check CSS variables
    const cssVars = Array.from(document.styleSheets)
      .flatMap(sheet => {
        try {
          return Array.from(sheet.cssRules);
        } catch {
          return [];
        }
      })
      .filter(rule => rule instanceof CSSStyleRule)
      .flatMap(rule => {
        const styleRule = rule as CSSStyleRule;
        return Array.from(styleRule.style)
          .filter(prop => prop.startsWith('--'))
          .map(prop => prop);
      });

    if (cssVars.length > 0) {
      console.log('Available CSS Variables:', cssVars);
    }
  });
};
