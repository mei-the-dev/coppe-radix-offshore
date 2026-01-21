/**
 * Data Flow Inspector
 * Log API responses, verify data structure, track transformations
 */

import { debugLog, debugGroup, isDebugEnabled } from './debugMode';

export interface DataFlowStep {
  step: string;
  data: unknown;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

const dataFlowLog: DataFlowStep[] = [];
const MAX_LOG_SIZE = 100;

/**
 * Log API response
 */
export const logAPIResponse = (endpoint: string, response: unknown, metadata?: Record<string, unknown>) => {
  if (!isDebugEnabled()) return;

  const step: DataFlowStep = {
    step: `API: ${endpoint}`,
    data: response,
    timestamp: new Date(),
    metadata,
  };

  dataFlowLog.push(step);
  if (dataFlowLog.length > MAX_LOG_SIZE) {
    dataFlowLog.shift();
  }

  debugLog('api', `Response from ${endpoint}`, {
    response,
    metadata,
    structure: getDataStructure(response),
  });
};

/**
 * Log data transformation
 */
export const logDataTransformation = (
  from: string,
  to: string,
  data: unknown,
  transformation: (data: unknown) => unknown
) => {
  if (!isDebugEnabled()) return;

  const original = data;
  const transformed = transformation(data);

  const step: DataFlowStep = {
    step: `Transform: ${from} → ${to}`,
    data: transformed,
    timestamp: new Date(),
    metadata: {
      original,
      transformation: transformation.toString(),
    },
  };

  dataFlowLog.push(step);
  if (dataFlowLog.length > MAX_LOG_SIZE) {
    dataFlowLog.shift();
  }

  debugLog('api', `Data transformed: ${from} → ${to}`, {
    original,
    transformed,
    structure: getDataStructure(transformed),
  });
};

/**
 * Verify data structure matches expectations
 */
export const verifyDataStructure = (
  data: unknown,
  expectedStructure: Record<string, string | ((value: unknown) => boolean)>
): { valid: boolean; errors: string[] } => {
  if (!isDebugEnabled()) {
    return { valid: true, errors: [] };
  }

  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Data is not an object'] };
  }

  const dataObj = data as Record<string, unknown>;

  for (const [key, expected] of Object.entries(expectedStructure)) {
    if (!(key in dataObj)) {
      errors.push(`Missing required field: ${key}`);
      continue;
    }

    const value = dataObj[key];

    if (typeof expected === 'string') {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== expected) {
        errors.push(`${key}: expected ${expected}, got ${actualType}`);
      }
    } else if (typeof expected === 'function') {
      if (!expected(value)) {
        errors.push(`${key}: validation failed`);
      }
    }
  }

  if (errors.length > 0) {
    debugLog('api', 'Data structure validation failed', { data, errors, expectedStructure });
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Get data structure description
 */
export const getDataStructure = (data: unknown): string => {
  if (data === null) return 'null';
  if (data === undefined) return 'undefined';
  if (Array.isArray(data)) return `array[${data.length}]`;
  if (typeof data === 'object') {
    const keys = Object.keys(data);
    return `object{${keys.length} keys: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}}`;
  }
  return typeof data;
};

/**
 * Track data flow path
 */
export const trackDataFlow = (label: string, data: unknown) => {
  if (!isDebugEnabled()) return;

  const step: DataFlowStep = {
    step: label,
    data,
    timestamp: new Date(),
    metadata: {
      structure: getDataStructure(data),
    },
  };

  dataFlowLog.push(step);
  if (dataFlowLog.length > MAX_LOG_SIZE) {
    dataFlowLog.shift();
  }

  debugLog('api', `Data flow: ${label}`, {
    data,
    structure: getDataStructure(data),
  });
};

/**
 * Get data flow log
 */
export const getDataFlowLog = (): DataFlowStep[] => {
  return [...dataFlowLog];
};

/**
 * Clear data flow log
 */
export const clearDataFlowLog = () => {
  dataFlowLog.length = 0;
  debugLog('api', 'Data flow log cleared');
};

/**
 * Print data flow summary
 */
export const printDataFlowSummary = () => {
  if (!isDebugEnabled()) return;

  debugGroup('Data Flow Summary', () => {
    dataFlowLog.forEach((step, index) => {
      console.log(`${index + 1}. ${step.step}`, {
        structure: getDataStructure(step.data),
        timestamp: step.timestamp.toISOString(),
        ...step.metadata,
      });
    });
  });
};
