/**
 * Unified Design System Tokens
 *
 * Single source of truth for all design values across kira-tasks and kira-ai.
 * This file exports the 3-tier token architecture:
 * - Reference Tokens: Raw, primitive values
 * - Semantic Tokens: Contextual aliases with meaning
 * - Component Tokens: Scoped to specific components
 *
 * @module @kira/design-system/tokens
 */

// 3-Tier Token Architecture
export { referenceTokens } from './reference';
export { semanticTokens } from './semantic';
export { componentTokens } from './components';

// Legacy tokens for backward compatibility
export { tokens, voiceStates, alertSeverity } from './legacy';

// Re-export default for backward compatibility
export { default } from './legacy';
