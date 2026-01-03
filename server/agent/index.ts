/**
 * Black Star Autonomous Agent - Main Entry Point
 * Export all components for easy access
 */

export { BlackStarOrchestrator, orchestrator } from './orchestrator';
export { PerceptionLayer } from './perception-layer';
export { Planner } from './planner';
export { Executor } from './executor';
export { StripeAutomator } from './stripe-automator';
export { Notifier } from './notifier';

export type {
  ProjectOrder,
  ProjectState,
  PlanStep,
  ValidationResult,
  SixEyesResult
} from './types';
