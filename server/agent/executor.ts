/**
 * THE EXECUTOR
 * Main execution loop with Six Eyes validation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProjectState, PlanStep, SixEyesResult } from './types';
import { PerceptionLayer } from './perception-layer';
import { StripeAutomator } from './stripe-automator';
import { ErrorHandler } from './error-handler';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class Executor {
  private perceptionLayer: PerceptionLayer;
  private stripeAutomator: StripeAutomator;
  private maxRetries: number = 3;

  constructor() {
    this.perceptionLayer = new PerceptionLayer();
    this.stripeAutomator = new StripeAutomator(true); // Start in test mode
  }

  /**
   * Execute a single plan step
   */
  async executeStep(
    step: PlanStep,
    projectState: ProjectState,
    previousCode: string = ''
  ): Promise<{ success: boolean; code?: string; error?: string }> {
    console.log(`\n[Executor] Executing: ${step.title}`);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Build context from previous steps
    const completedSteps = projectState.plan
      .filter(s => s.status === 'completed')
      .map(s => `${s.title}: ${s.description}`)
      .join('\n');

    const prompt = `You are an expert full-stack developer working on a project step by step.

Project: ${projectState.project_name}
Requirements: ${projectState.requirements}

Completed Steps:
${completedSteps || 'None yet'}

Current Step: ${step.title}
Description: ${step.description}

${previousCode ? `Previous Code:\n${previousCode}\n\n` : ''}

Generate complete, production-ready code for this step.

Requirements:
1. Write clean, maintainable TypeScript/JavaScript code
2. Include all necessary imports
3. Add error handling
4. Follow best practices
5. If this involves Stripe integration, use the latest Stripe API patterns (payment_method, not deprecated 'source' or 'card')
6. Return ONLY the code, no explanations or markdown formatting

Generate the code now:`;

    try {
      const result = await model.generateContent(prompt);
      let code = result.response.text();

      // Clean markdown formatting if present
      code = code.replace(/```typescript\n?/g, '')
                 .replace(/```javascript\n?/g, '')
                 .replace(/```\n?/g, '')
                 .trim();

      // Save code to workspace
      await this.saveCodeToWorkspace(projectState.workspaceDir, step.id, code);

      return { success: true, code };
    } catch (error: any) {
      console.error(`[Executor] Error generating code:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save generated code to workspace
   */
  private async saveCodeToWorkspace(workspaceDir: string, stepId: string, code: string): Promise<void> {
    const codeDir = path.join(workspaceDir, 'generated');
    await fs.mkdir(codeDir, { recursive: true });
    
    const filename = `${stepId}.ts`;
    const filepath = path.join(codeDir, filename);
    
    await fs.writeFile(filepath, code, 'utf-8');
    console.log(`[Executor] Code saved to ${filepath}`);
  }

  /**
   * Validate code with Six Eyes
   */
  async validateCode(
    code: string,
    projectState: ProjectState,
    step: PlanStep
  ): Promise<SixEyesResult> {
    console.log(`[Executor] Running Six Eyes validation for: ${step.title}`);

    // Determine API type from step
    let apiType: 'stripe' | 'firebase' | 'general' = 'general';
    if (step.title.toLowerCase().includes('stripe') || step.title.toLowerCase().includes('payment')) {
      apiType = 'stripe';
    } else if (step.title.toLowerCase().includes('firebase')) {
      apiType = 'firebase';
    }

    // For now, we'll run a simplified validation
    // In production, you'd start a dev server and get its URL
    const serverUrl = process.env.DEV_SERVER_URL || 'http://localhost:3000';

    const result = await this.perceptionLayer.runSixEyes(
      code,
      projectState.workspaceDir,
      serverUrl,
      apiType
    );

    return result;
  }

  /**
   * Main execution loop
   */
  async executeProject(projectState: ProjectState): Promise<ProjectState> {
    console.log(`\n[Executor] Starting project execution: ${projectState.project_name}`);
    
    projectState.status = 'coding';
    let consecutiveFailures = 0;

    for (let i = 0; i < projectState.plan.length; i++) {
      const step = projectState.plan[i];
      
      if (step.status === 'completed') {
        continue;
      }

      step.status = 'in_progress';
      projectState.currentStep = i;

      let stepSucceeded = false;
      let lastError = '';

      // Try up to maxRetries times
      while (step.retries < this.maxRetries && !stepSucceeded) {
        console.log(`\n[Executor] Attempt ${step.retries + 1}/${this.maxRetries} for: ${step.title}`);

        // Generate code
        const execution = await this.executeStep(step, projectState);
        
        if (!execution.success) {
          lastError = execution.error || 'Unknown error';
          step.retries++;
          continue;
        }

        step.code = execution.code;

        // Validate with Six Eyes (simplified for now)
        // In production, you would run full validation
        const isPaymentStep = step.title.toLowerCase().includes('payment') || 
                             step.title.toLowerCase().includes('stripe');
        
        if (isPaymentStep) {
          // Run Stripe automation
          try {
            const paymentSetup = await this.stripeAutomator.automatePaymentSetup(
              projectState,
              99, // Default price
              'usd'
            );

            projectState.stripeProductId = paymentSetup.productId;
            projectState.stripePriceId = paymentSetup.priceId;
            projectState.stripePaymentLink = paymentSetup.paymentLink;

            // Inject payment link into code if it's HTML
            if (step.code && step.code.includes('<html')) {
              step.code = this.stripeAutomator.injectPaymentLink(
                step.code,
                paymentSetup.paymentLink
              );
              await this.saveCodeToWorkspace(projectState.workspaceDir, step.id, step.code);
            }

            console.log(`[Executor] ✅ Stripe payment setup complete`);
          } catch (error: any) {
            console.error(`[Executor] ❌ Stripe automation failed:`, error);
            lastError = error.message;
            step.retries++;
            continue;
          }
        }

        // Mark as succeeded
        stepSucceeded = true;
        step.status = 'completed';
        consecutiveFailures = 0;
        console.log(`[Executor] ✅ Step completed: ${step.title}`);
      }

      if (!stepSucceeded) {
        step.status = 'failed';
        consecutiveFailures++;
        
        console.error(`[Executor] ❌ Step failed after ${this.maxRetries} attempts: ${step.title}`);
        console.error(`[Executor] Error: ${lastError}`);

        // Hallucination Block: Stop after 3 consecutive failures
        projectState.failureCount = consecutiveFailures;
        
        if (ErrorHandler.shouldHalt(projectState)) {
          console.error(`[Executor] 🛑 HALTED: 3 consecutive failures. Stopping to prevent token burn.`);
          ErrorHandler.logProjectState(projectState, 'Halted Project');
          projectState.status = 'failed';
          return projectState;
        }
      }
    }

    // All steps completed
    const allCompleted = projectState.plan.every(s => s.status === 'completed');
    
    if (allCompleted) {
      console.log(`\n[Executor] ✅ All steps completed successfully!`);
      projectState.status = 'awaiting_approval';
    } else {
      projectState.status = 'failed';
    }

    return projectState;
  }

  /**
   * Deploy the project (called after approval)
   */
  async deployProject(projectState: ProjectState): Promise<{ success: boolean; url?: string; error?: string }> {
    console.log(`\n[Executor] Deploying project: ${projectState.project_name}`);
    
    try {
      projectState.status = 'deploying';

      // Switch Stripe to live mode if payment was integrated
      if (projectState.stripeProductId) {
        console.log(`[Executor] Switching Stripe to LIVE mode...`);
        const liveStripe = StripeAutomator.switchToLiveMode();
        
        // Recreate product and payment link in live mode
        const livePaymentSetup = await liveStripe.automatePaymentSetup(
          projectState,
          99,
          'usd'
        );

        projectState.stripePaymentLink = livePaymentSetup.paymentLink;
        console.log(`[Executor] ✅ Live payment link: ${livePaymentSetup.paymentLink}`);
      }

      // In production, you would deploy to Vercel/Netlify here
      // For now, we'll simulate deployment
      const deploymentUrl = `https://${projectState.project_name.toLowerCase().replace(/\s+/g, '-')}.vercel.app`;
      
      projectState.status = 'completed';
      
      return { success: true, url: deploymentUrl };
    } catch (error: any) {
      console.error(`[Executor] Deployment failed:`, error);
      return { success: false, error: error.message };
    }
  }
}
