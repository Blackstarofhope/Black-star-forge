/**
 * Centralized Error Handling for the Black Star Agent
 * Implements the Hallucination Blocking (3-strike rule)
 */

import { ProjectState } from './types';

export class ErrorHandler {
  private static readonly MAX_CONSECUTIVE_FAILURES = 3;
  
  /**
   * Check if project should halt due to consecutive failures
   */
  static shouldHalt(projectState: ProjectState): boolean {
    return projectState.failureCount >= this.MAX_CONSECUTIVE_FAILURES;
  }

  /**
   * Format error message for logging
   */
  static formatError(error: any): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}\n${error.stack || ''}`;
    }
    return String(error);
  }

  /**
   * Handle validation failure
   */
  static handleValidationFailure(
    projectState: ProjectState,
    stepId: string,
    error: string
  ): void {
    const step = projectState.plan.find(s => s.id === stepId);
    if (step) {
      step.retries++;
      
      console.error(`[ErrorHandler] Validation failed for ${step.title} (attempt ${step.retries})`);
      console.error(`[ErrorHandler] Error: ${error}`);

      // Check if this is a consecutive failure
      const previousStep = projectState.plan[projectState.currentStep - 1];
      if (previousStep && previousStep.status === 'failed') {
        projectState.failureCount++;
      } else {
        projectState.failureCount = 1; // Reset if not consecutive
      }

      if (this.shouldHalt(projectState)) {
        console.error(`\n[ErrorHandler] 🛑 HALTING EXECUTION`);
        console.error(`[ErrorHandler] Reason: ${this.MAX_CONSECUTIVE_FAILURES} consecutive failures detected`);
        console.error(`[ErrorHandler] This prevents infinite token burn and hallucination loops.`);
        projectState.status = 'failed';
      }
    }
  }

  /**
   * Handle API errors gracefully
   */
  static handleApiError(error: any, context: string): { error: string; details?: any } {
    console.error(`[ErrorHandler] API Error in ${context}:`, error);
    
    if (error.response) {
      // API responded with error status
      return {
        error: `API error: ${error.response.status} ${error.response.statusText}`,
        details: error.response.data
      };
    } else if (error.request) {
      // Request made but no response
      return {
        error: 'No response from API',
        details: { message: 'The request was made but no response was received' }
      };
    } else {
      // Error in request setup
      return {
        error: error.message || 'Unknown error',
        details: { context }
      };
    }
  }

  /**
   * Safe async wrapper with error handling
   */
  static async safeAsync<T>(
    operation: () => Promise<T>,
    context: string,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      console.error(`[ErrorHandler] Error in ${context}:`, error);
      console.error(this.formatError(error));
      return fallback;
    }
  }

  /**
   * Validate environment variables
   */
  static validateEnvironment(): { valid: boolean; missing: string[] } {
    const required = [
      'GEMINI_API_KEY',
      'EMAIL_USER',
      'EMAIL_PASSWORD',
      'STRIPE_TEST_KEY',
      'ADMIN_EMAIL'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      console.error('[ErrorHandler] Missing required environment variables:');
      missing.forEach(key => console.error(`  - ${key}`));
      return { valid: false, missing };
    }

    return { valid: true, missing: [] };
  }

  /**
   * Log project state for debugging
   */
  static logProjectState(projectState: ProjectState, label: string = 'State'): void {
    console.log(`\n[ErrorHandler] ${label}:`);
    console.log(`  Order ID: ${projectState.orderId}`);
    console.log(`  Project: ${projectState.project_name}`);
    console.log(`  Status: ${projectState.status}`);
    console.log(`  Current Step: ${projectState.currentStep + 1}/${projectState.plan.length}`);
    console.log(`  Failure Count: ${projectState.failureCount}`);
    console.log(`  Steps:`);
    projectState.plan.forEach((step, idx) => {
      const icon = step.status === 'completed' ? '✅' : 
                   step.status === 'failed' ? '❌' : 
                   step.status === 'in_progress' ? '⏳' : '⏸️';
      console.log(`    ${icon} ${idx + 1}. ${step.title} (${step.status}, ${step.retries} retries)`);
    });
  }

  /**
   * Create error report object
   */
  static createErrorReport(
    projectState: ProjectState,
    error: any
  ): {
    orderId: string;
    projectName: string;
    status: string;
    failureCount: number;
    error: string;
    steps: any[];
    timestamp: string;
  } {
    return {
      orderId: projectState.orderId,
      projectName: projectState.project_name,
      status: projectState.status,
      failureCount: projectState.failureCount,
      error: this.formatError(error),
      steps: projectState.plan.map(step => ({
        id: step.id,
        title: step.title,
        status: step.status,
        retries: step.retries
      })),
      timestamp: new Date().toISOString()
    };
  }
}

// Validate environment on module load
const validation = ErrorHandler.validateEnvironment();
if (!validation.valid) {
  console.warn('\n⚠️  Warning: Some environment variables are not set.');
  console.warn('The agent may not function correctly without proper configuration.');
  console.warn('Please copy .env.example to .env and fill in your credentials.\n');
}
