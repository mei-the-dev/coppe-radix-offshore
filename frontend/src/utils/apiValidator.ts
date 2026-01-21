/**
 * API Response Validator
 * Validate API response structure, check required fields, type checking
 */

import { debugLog, isDebugEnabled } from './debugMode';

export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null' | 'undefined';
  required?: boolean;
  validator?: (value: unknown) => boolean;
  nestedRules?: ValidationRule[];
}

/**
 * Validate array of items
 */
export const validateArray = (
  data: unknown,
  itemValidator: (item: unknown) => { valid: boolean; errors: string[] },
  label: string = 'array'
): { valid: boolean; errors: string[] } => {
  if (!isDebugEnabled()) {
    return { valid: true, errors: [] };
  }

  const errors: string[] = [];

  if (!Array.isArray(data)) {
    return { valid: false, errors: [`${label}: Expected array, got ${typeof data}`] };
  }

  data.forEach((item, index) => {
    const result = itemValidator(item);
    if (!result.valid) {
      errors.push(`${label}[${index}]: ${result.errors.join(', ')}`);
    }
  });

  if (errors.length > 0) {
    debugLog('api', `Array validation failed for ${label}`, { errors, itemCount: data.length });
  }

  return { valid: errors.length === 0, errors };
};


/**
 * Validate API response against rules
 */
export const validateAPIResponse = (
  endpoint: string,
  response: unknown,
  rules: ValidationRule[]
): { valid: boolean; errors: string[] } => {
  if (!isDebugEnabled()) {
    return { valid: true, errors: [] };
  }

  const errors: string[] = [];

  if (!response || typeof response !== 'object') {
    return { valid: false, errors: [`${endpoint}: Response is not an object`] };
  }

  const responseObj = response as Record<string, unknown>;

  for (const rule of rules) {
    const value = responseObj[rule.field];

    // Check required fields
    if (rule.required && (value === undefined || value === null)) {
      errors.push(`${endpoint}: Missing required field "${rule.field}"`);
      continue;
    }

    // Skip validation if field is optional and missing
    if (!rule.required && (value === undefined || value === null)) {
      continue;
    }

    // Check type
    const actualType = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
    if (actualType !== rule.type) {
      errors.push(`${endpoint}: Field "${rule.field}" expected ${rule.type}, got ${actualType}`);
      continue;
    }

    // Run custom validator
    if (rule.validator && !rule.validator(value)) {
      errors.push(`${endpoint}: Field "${rule.field}" failed custom validation`);
      continue;
    }

    // Validate nested rules
    if (rule.nestedRules && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const nestedResult = validateAPIResponse(
        `${endpoint}.${rule.field}`,
        value,
        rule.nestedRules
      );
      errors.push(...nestedResult.errors);
    }
  }

  if (errors.length > 0) {
    debugLog('api', `API response validation failed for ${endpoint}`, { errors, response });
  } else {
    debugLog('api', `API response validated successfully for ${endpoint}`);
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Common validation rules for PRIO API responses
 */
export const prioAPIResponseRules: ValidationRule[] = [
  {
    field: 'data',
    type: 'array',
    required: true,
  },
  {
    field: 'meta',
    type: 'object',
    required: false,
    nestedRules: [
      { field: 'total', type: 'number', required: false },
      { field: 'page', type: 'number', required: false },
      { field: 'per_page', type: 'number', required: false },
    ],
  },
];

/**
 * Validate vessel data structure
 */
export const validateVesselData = (vessel: unknown): { valid: boolean; errors: string[] } => {
  const rules: ValidationRule[] = [
    { field: 'id', type: 'string', required: true },
    { field: 'name', type: 'string', required: true },
    { field: 'type', type: 'string', required: true },
    { field: 'status', type: 'string', required: true },
    { field: 'deckCargoCapacity', type: 'number', required: true },
    { field: 'liquidMudCapacity', type: 'number', required: true },
  ];

  return validateAPIResponse('vessel', vessel, rules);
};

/**
 * Validate berth data structure
 */
export const validateBerthData = (berth: unknown): { valid: boolean; errors: string[] } => {
  const rules: ValidationRule[] = [
    { field: 'id', type: 'string', required: true },
    { field: 'name', type: 'string', required: true },
    { field: 'status', type: 'string', required: true },
    { field: 'maxDraught', type: 'number', required: true },
    { field: 'maxLength', type: 'number', required: true },
    { field: 'maxDeadweight', type: 'number', required: true },
  ];

  return validateAPIResponse('berth', berth, rules);
};
