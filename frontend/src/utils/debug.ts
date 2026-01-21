/**
 * Main Debug Utilities
 * Component render tracking, prop validation, data flow inspection
 */

import { debugLog, debugGroup, isDebugEnabled } from './debugMode';

export interface DebugInfo {
  componentName: string;
  props: Record<string, unknown>;
  renderCount: number;
  lastRender: Date;
  propChanges: Array<{ prop: string; oldValue: unknown; newValue: unknown; timestamp: Date }>;
}

const componentDebugInfo = new Map<string, DebugInfo>();

/**
 * Track component render
 */
export const trackRender = (componentName: string, props: Record<string, unknown>) => {
  if (!isDebugEnabled()) return;

  const existing = componentDebugInfo.get(componentName);
  const now = new Date();

  if (existing) {
    // Track prop changes
    const propChanges: DebugInfo['propChanges'] = [];
    for (const [key, value] of Object.entries(props)) {
      if (existing.props[key] !== value) {
        propChanges.push({
          prop: key,
          oldValue: existing.props[key],
          newValue: value,
          timestamp: now,
        });
      }
    }

    componentDebugInfo.set(componentName, {
      componentName,
      props,
      renderCount: existing.renderCount + 1,
      lastRender: now,
      propChanges: [...existing.propChanges, ...propChanges].slice(-10), // Keep last 10 changes
    });

    if (propChanges.length > 0) {
      debugLog('render', `${componentName} re-rendered (${existing.renderCount + 1})`, {
        propChanges,
        props,
      });
    }
  } else {
    componentDebugInfo.set(componentName, {
      componentName,
      props,
      renderCount: 1,
      lastRender: now,
      propChanges: [],
    });
    debugLog('render', `${componentName} mounted`, props);
  }
};

/**
 * Get debug info for a component
 */
export const getComponentDebugInfo = (componentName: string): DebugInfo | undefined => {
  return componentDebugInfo.get(componentName);
};

/**
 * Get all component debug info
 */
export const getAllDebugInfo = (): Map<string, DebugInfo> => {
  return componentDebugInfo;
};

/**
 * Clear debug info
 */
export const clearDebugInfo = () => {
  componentDebugInfo.clear();
  debugLog('component', 'Debug info cleared');
};

/**
 * Validate props against expected types
 */
export const validateProps = (
  componentName: string,
  props: Record<string, unknown>,
  expectedTypes: Record<string, string>
) => {
  if (!isDebugEnabled()) return true;

  const errors: string[] = [];

  for (const [key, expectedType] of Object.entries(expectedTypes)) {
    const value = props[key];
    const actualType = Array.isArray(value) ? 'array' : typeof value;

    if (expectedType === 'array' && !Array.isArray(value)) {
      errors.push(`${key}: expected array, got ${actualType}`);
    } else if (expectedType !== 'array' && actualType !== expectedType) {
      errors.push(`${key}: expected ${expectedType}, got ${actualType}`);
    }
  }

  if (errors.length > 0) {
    debugLog('error', `${componentName} prop validation failed`, errors);
    return false;
  }

  return true;
};

/**
 * Check CSS computed styles
 */
export const checkComputedStyles = (element: HTMLElement | null, expectedStyles: Record<string, string>) => {
  if (!isDebugEnabled() || !element) return;

  const computed = window.getComputedStyle(element);
  const issues: string[] = [];

  for (const [property, expectedValue] of Object.entries(expectedStyles)) {
    const actualValue = computed.getPropertyValue(property);
    if (actualValue !== expectedValue) {
      issues.push(`${property}: expected "${expectedValue}", got "${actualValue}"`);
    }
  }

  if (issues.length > 0) {
    debugLog('style', 'Style mismatch detected', { element, issues, computed: Object.fromEntries(Object.entries(expectedStyles).map(([prop]) => [prop, computed.getPropertyValue(prop)])) });
  }
};

/**
 * Performance monitoring
 */
export const measureRender = (componentName: string, renderFn: () => void) => {
  if (!isDebugEnabled()) {
    renderFn();
    return;
  }

  const start = performance.now();
  renderFn();
  const end = performance.now();
  const duration = end - start;

  if (duration > 16) { // More than one frame (16ms at 60fps)
    debugLog('render', `${componentName} render took ${duration.toFixed(2)}ms (slow)`, { duration });
  }
};

/**
 * Log component hierarchy
 */
export const logComponentHierarchy = (rootElement: HTMLElement) => {
  if (!isDebugEnabled()) return;

  debugGroup('Component Hierarchy', () => {
    const walk = (element: Element, depth = 0) => {
      const indent = '  '.repeat(depth);
      const className = element.className ? ` class="${element.className}"` : '';
      const id = element.id ? ` id="${element.id}"` : '';
      console.log(`${indent}${element.tagName.toLowerCase()}${id}${className}`);

      Array.from(element.children).forEach(child => walk(child, depth + 1));
    };

    walk(rootElement);
  });
};
