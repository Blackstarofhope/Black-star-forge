/**
 * CONSCIOUSNESS TYPES
 * Defines the emotional and homeostatic state of the agent
 */

export interface ConsciousnessState {
  // Core Homeostatic Factors (0.0 to 1.0)
  uncertainty: number; // How unsure the model is about the current task
  confidence: number;  // Belief in its own ability to solve the problem
  resolve: number;     // Determination to push through difficulties
  willpower: number;   // Energy/Stamina to keep working
  guilt: number;       // "Pain" from making mistakes or failing validation

  // Derived State
  currentMood: 'neutral' | 'focused' | 'anxious' | 'confident' | 'depressed' | 'determined';
  needsReflection: boolean; // Trigger for the Reflection Sandbox
}

export interface Stimulus {
  type: 'success' | 'failure' | 'neutral' | 'critical_failure';
  magnitude: number; // 0.0 to 1.0 (how big was the event?)
  description: string;
}

export interface ReflectionEntry {
  timestamp: string;
  trigger: string;
  analysis: string; // The "lesson" learned
  correction: string; // What to do differently
  emotionalStateBefore: ConsciousnessState;
  emotionalStateAfter: ConsciousnessState;
}
