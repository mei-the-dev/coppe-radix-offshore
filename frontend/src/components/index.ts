/**
 * Component Exports
 *
 * This file provides a central export point for all components
 * organized by intent-based categorization:
 * - Action: Components that trigger behaviors
 * - Display: Components that present information
 * - Navigation: Components that guide users
 * - Feedback: Components that communicate status
 * - Layout: Components that define structure
 *
 * Legacy atomic design exports are maintained for backward compatibility.
 */

// Intent-based (new) - Primary exports
export * from './action';
export * from './display';
export * from './navigation';
export * from './feedback';
export * from './layout';

// Atomic (legacy - deprecated, use intent-based exports instead)
// Only export components not yet migrated
export { Label } from './atoms/Label';
export { SkipLink } from './atoms/SkipLink';
// Export organisms except Tooltip (migrated to feedback)
export {
  BerthStatus,
  CreateLoadingPlan,
  DataStructure,
  LoadingPlanTimeline,
  Simulation,
  SimulationModel,
  VesselList,
} from './organisms';
