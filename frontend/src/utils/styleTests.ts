/**
 * Component Style Tests
 * Verify Card has shadow (not border), Badge has correct colors, hover states, spacing
 */

import { debugLog, debugGroup, isDebugEnabled } from './debugMode';
import { checkStyleConflicts } from './styleInspector';

/**
 * Test Card component styling
 */
export const testCardStyling = (element: HTMLElement | null): boolean => {
  if (!isDebugEnabled() || !element) return true;

  debugGroup('Card Style Test', () => {
    const computed = window.getComputedStyle(element);

    // Check for shadow (should have shadow, not border)
    const hasShadow = computed.boxShadow !== 'none';
    const hasBorder = computed.border && computed.border !== '0px none rgb(0, 0, 0)';

    console.log('Shadow check:', hasShadow ? '✅ Has shadow' : '❌ No shadow');
    console.log('Border check:', !hasBorder ? '✅ No border (correct)' : '❌ Has border (should use shadow instead)');

    if (!hasShadow) {
      debugLog('style', 'Card missing box-shadow', { element, computed: computed.boxShadow });
    }

    if (hasBorder) {
      debugLog('style', 'Card has border (should use shadow instead)', { element, border: computed.border });
    }

    // Check padding
    const padding = computed.padding;
    console.log('Padding:', padding);

    // Check hover state (if element has hover class or can be hovered)
    if (element.classList.contains('molecule-card--hoverable')) {
      console.log('Hoverable: ✅');
    }

    return hasShadow && !hasBorder;
  });

  return true;
};

/**
 * Test Badge component styling
 */
export const testBadgeStyling = (element: HTMLElement | null): boolean => {
  if (!isDebugEnabled() || !element) return true;

  debugGroup('Badge Style Test', () => {
    const computed = window.getComputedStyle(element);

    // Check for correct colors (should use CSS variables)
    const color = computed.color;
    const backgroundColor = computed.backgroundColor;

    console.log('Color:', color);
    console.log('Background:', backgroundColor);

    // Check if using CSS variables
    const usesCSSVars = color.includes('var(') || backgroundColor.includes('var(');
    console.log('Uses CSS Variables:', usesCSSVars ? '✅' : '❌');

    // Check border-radius
    const borderRadius = computed.borderRadius;
    console.log('Border Radius:', borderRadius);

    // Check conflicts
    const conflicts = checkStyleConflicts(element);
    if (conflicts.length > 0) {
      console.warn('Conflicts:', conflicts);
    }

    return true;
  });

  return true;
};

/**
 * Test hover states
 */
export const testHoverStates = (element: HTMLElement | null): boolean => {
  if (!isDebugEnabled() || !element) return true;

  debugGroup('Hover State Test', () => {
    const computed = window.getComputedStyle(element);
    const transition = computed.transition;

    console.log('Transition:', transition);

    // Simulate hover (can't actually trigger hover, but can check if transition is set)
    if (transition && transition !== 'all 0s ease 0s') {
      console.log('Hover transition: ✅');
    } else {
      console.log('Hover transition: ❌ (no transition set)');
      debugLog('style', 'Element missing hover transition', { element });
    }

    return true;
  });

  return true;
};

/**
 * Test spacing
 */
export const testSpacing = (element: HTMLElement | null): boolean => {
  if (!isDebugEnabled() || !element) return true;

  debugGroup('Spacing Test', () => {
    const computed = window.getComputedStyle(element);

    const padding = {
      top: computed.paddingTop,
      right: computed.paddingRight,
      bottom: computed.paddingBottom,
      left: computed.paddingLeft,
    };

    const margin = {
      top: computed.marginTop,
      right: computed.marginRight,
      bottom: computed.marginBottom,
      left: computed.marginLeft,
    };

    console.log('Padding:', padding);
    console.log('Margin:', margin);

    // Check if using CSS variables for spacing
    const usesSpacingVars = Object.values(padding).some(p => p.includes('var(--spacing'));
    console.log('Uses spacing variables:', usesSpacingVars ? '✅' : '❌');

    return true;
  });

  return true;
};

/**
 * Run all style tests on an element
 */
export const runAllStyleTests = (element: HTMLElement | null, componentType: 'card' | 'badge' | 'button' | 'other' = 'other') => {
  if (!isDebugEnabled() || !element) return;

  debugGroup(`Style Tests: ${componentType}`, () => {
    switch (componentType) {
      case 'card':
        testCardStyling(element);
        testHoverStates(element);
        testSpacing(element);
        break;
      case 'badge':
        testBadgeStyling(element);
        testSpacing(element);
        break;
      default:
        testHoverStates(element);
        testSpacing(element);
    }

    // Always check for conflicts
    const conflicts = checkStyleConflicts(element);
    if (conflicts.length > 0) {
      console.warn('Style Conflicts:', conflicts);
    }
  });
};
