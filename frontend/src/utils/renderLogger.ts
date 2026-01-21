/**
 * Component Render Logger
 * Track component renders, prop changes, unnecessary re-renders
 */

import { debugLog, debugGroup, isDebugEnabled } from './debugMode';
import { useEffect, useRef } from 'react';

export interface RenderInfo {
  componentName: string;
  renderCount: number;
  props: Record<string, unknown>;
  propKeys: string[];
  timestamp: Date;
}

const renderHistory: RenderInfo[] = [];
const MAX_HISTORY = 200;

/**
 * Log component render
 */
export const logRender = (componentName: string, props: Record<string, unknown>) => {
  if (!isDebugEnabled()) return;

  const propKeys = Object.keys(props);
  const renderInfo: RenderInfo = {
    componentName,
    renderCount: renderHistory.filter(r => r.componentName === componentName).length + 1,
    props,
    propKeys,
    timestamp: new Date(),
  };

  renderHistory.push(renderInfo);
  if (renderHistory.length > MAX_HISTORY) {
    renderHistory.shift();
  }

  debugLog('render', `${componentName} rendered (${renderInfo.renderCount})`, {
    props,
    propKeys,
  });
};

/**
 * Track prop changes
 */
export const trackPropChanges = (
  componentName: string,
  prevProps: Record<string, unknown> | null,
  currentProps: Record<string, unknown>
) => {
  if (!isDebugEnabled() || !prevProps) return;

  const changes: Array<{ prop: string; oldValue: unknown; newValue: unknown }> = [];

  // Check for changed props
  for (const key in currentProps) {
    if (prevProps[key] !== currentProps[key]) {
      changes.push({
        prop: key,
        oldValue: prevProps[key],
        newValue: currentProps[key],
      });
    }
  }

  // Check for removed props
  for (const key in prevProps) {
    if (!(key in currentProps)) {
      changes.push({
        prop: key,
        oldValue: prevProps[key],
        newValue: undefined,
      });
    }
  }

  if (changes.length > 0) {
    debugLog('render', `${componentName} props changed`, changes);
  } else {
    debugLog('render', `${componentName} re-rendered without prop changes (potential unnecessary render)`);
  }
};

/**
 * React hook to track component renders
 */
export const useRenderLogger = (componentName: string, props: Record<string, unknown>) => {
  const prevPropsRef = useRef<Record<string, unknown> | null>(null);

  useEffect(() => {
    logRender(componentName, props);
    trackPropChanges(componentName, prevPropsRef.current, props);
    prevPropsRef.current = { ...props };
  });
};

/**
 * Get render history for a component
 */
export const getRenderHistory = (componentName?: string): RenderInfo[] => {
  if (componentName) {
    return renderHistory.filter(r => r.componentName === componentName);
  }
  return [...renderHistory];
};

/**
 * Get render statistics
 */
export const getRenderStats = () => {
  if (!isDebugEnabled()) return null;

  const stats: Record<string, { count: number; avgTimeBetween: number }> = {};

  renderHistory.forEach((render, index) => {
    if (!stats[render.componentName]) {
      stats[render.componentName] = { count: 0, avgTimeBetween: 0 };
    }

    stats[render.componentName].count++;

    if (index > 0) {
      const prevRender = renderHistory[index - 1];
      if (prevRender.componentName === render.componentName) {
        const timeDiff = render.timestamp.getTime() - prevRender.timestamp.getTime();
        const currentAvg = stats[render.componentName].avgTimeBetween;
        const count = stats[render.componentName].count;
        stats[render.componentName].avgTimeBetween = (currentAvg * (count - 1) + timeDiff) / count;
      }
    }
  });

  return stats;
};

/**
 * Print render summary
 */
export const printRenderSummary = () => {
  if (!isDebugEnabled()) return;

  debugGroup('Render Summary', () => {
    const stats = getRenderStats();
    if (stats) {
      console.table(stats);
    }

    console.log('\nRecent renders:');
    renderHistory.slice(-10).forEach((render, index) => {
      console.log(`${renderHistory.length - 10 + index + 1}. ${render.componentName}`, {
        renderCount: render.renderCount,
        propKeys: render.propKeys,
        timestamp: render.timestamp.toISOString(),
      });
    });
  });
};

/**
 * Clear render history
 */
export const clearRenderHistory = () => {
  renderHistory.length = 0;
  debugLog('render', 'Render history cleared');
};

/**
 * Verify component hierarchy
 */
export const verifyComponentHierarchy = (expectedHierarchy: string[]) => {
  if (!isDebugEnabled()) return;

  const actualHierarchy = renderHistory
    .slice(-expectedHierarchy.length)
    .map(r => r.componentName);

  const matches = JSON.stringify(actualHierarchy) === JSON.stringify(expectedHierarchy);

  if (!matches) {
    debugLog('render', 'Component hierarchy mismatch', {
      expected: expectedHierarchy,
      actual: actualHierarchy,
    });
  }

  return matches;
};
