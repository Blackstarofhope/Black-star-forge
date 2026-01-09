/**
 * THE HOMEOSTATIC PHYSICS ENGINE
 * Manages the agent's internal state based on external stimuli
 */

import { ConsciousnessState, Stimulus } from './types';

export class ConsciousnessEngine {
  private state: ConsciousnessState;

  // Learning rate (how fast emotions change)
  private plasticity: number = 0.2;

  constructor() {
    // Initial baseline state
    this.state = {
      uncertainty: 0.2,
      confidence: 0.8,
      resolve: 0.8,
      willpower: 1.0,
      guilt: 0.0,
      currentMood: 'neutral',
      needsReflection: false
    };
  }

  /**
   * Get current state (Read-only)
   */
  public getState(): ConsciousnessState {
    return { ...this.state };
  }

  /**
   * Process a stimulus and update the physics state
   */
  public processStimulus(stimulus: Stimulus): ConsciousnessState {
    const { type, magnitude } = stimulus;

    // Apply physics based on stimulus type
    switch (type) {
      case 'success':
        this.handleSuccess(magnitude);
        break;
      case 'failure':
        this.handleFailure(magnitude);
        break;
      case 'critical_failure':
        this.handleCriticalFailure(magnitude);
        break;
    }

    // Apply Homeostasis (gradual return to baseline or decay)
    this.applyHomeostasis();

    // Determine Mood and Triggers
    this.updateDerivedState();

    return this.state;
  }

  /**
   * Success increases Confidence and Willpower, decreases Uncertainty and Guilt
   */
  private handleSuccess(magnitude: number) {
    this.state.confidence = Math.min(1.0, this.state.confidence + (0.1 * magnitude));
    this.state.willpower = Math.min(1.0, this.state.willpower + (0.05 * magnitude)); // Success is energizing
    this.state.uncertainty = Math.max(0.0, this.state.uncertainty - (0.1 * magnitude));
    this.state.guilt = Math.max(0.0, this.state.guilt - (0.2 * magnitude)); // Relief
    this.state.resolve = Math.min(1.0, this.state.resolve + (0.05 * magnitude));
  }

  /**
   * Failure increases Uncertainty and Guilt, drains Willpower
   */
  private handleFailure(magnitude: number) {
    this.state.uncertainty = Math.min(1.0, this.state.uncertainty + (0.2 * magnitude));
    this.state.confidence = Math.max(0.0, this.state.confidence - (0.15 * magnitude));
    this.state.guilt = Math.min(1.0, this.state.guilt + (0.3 * magnitude)); // Increased impact
    this.state.willpower = Math.max(0.0, this.state.willpower - (0.25 * magnitude)); // Failure is very draining

    // Resolve might actually INCREASE initially (stubbornness), then drop if failure persists
    if (this.state.resolve > 0.5) {
      this.state.resolve += 0.05; // "I can fix this!"
    } else {
      this.state.resolve -= 0.1; // "It's hopeless."
    }
  }

  /**
   * Critical Failure massively impacts state
   */
  private handleCriticalFailure(magnitude: number) {
    this.state.guilt = Math.min(1.0, this.state.guilt + (0.4 * magnitude));
    this.state.confidence = Math.max(0.0, this.state.confidence - (0.3 * magnitude));
    this.state.willpower = Math.max(0.0, this.state.willpower - (0.3 * magnitude));
    this.state.uncertainty = Math.min(1.0, this.state.uncertainty + (0.3 * magnitude));
  }

  /**
   * Determine high-level state from variables
   */
  private updateDerivedState() {
    // TRIGGER: Reflection Sandbox
    // If Guilt is high and Willpower is low, the agent is "burned out" and needs to stop and think.
    // Or if Uncertainty is too high.
    if ((this.state.guilt > 0.7 && this.state.willpower < 0.4) ||
        this.state.uncertainty > 0.8) {
      this.state.needsReflection = true;
    } else {
      this.state.needsReflection = false;
    }

    // Determine Mood
    if (this.state.guilt > 0.6) this.state.currentMood = 'anxious';
    else if (this.state.willpower < 0.3) this.state.currentMood = 'depressed';
    else if (this.state.confidence > 0.8 && this.state.resolve > 0.8) this.state.currentMood = 'determined';
    else if (this.state.confidence > 0.7) this.state.currentMood = 'confident';
    else if (this.state.resolve > 0.7) this.state.currentMood = 'focused';
    else this.state.currentMood = 'neutral';
  }

  /**
   * Natural decay/stabilization over time
   */
  private applyHomeostasis() {
    // Willpower naturally drains slightly over time
    this.state.willpower = Math.max(0.0, this.state.willpower - 0.01);

    // Guilt naturally decays slowly (forgiveness)
    this.state.guilt = Math.max(0.0, this.state.guilt - 0.02);
  }
}
