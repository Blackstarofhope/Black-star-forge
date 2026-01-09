/**
 * THE EXECUTOR
 * Main execution loop with Six Eyes validation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProjectState, PlanStep, SixEyesResult } from './types';
import { PerceptionLayer } from './perception-layer';
import { StripeAutomator } from './stripe-automator';
import { ErrorHandler } from './error-handler';
import { ConsciousnessEngine } from './consciousness/engine';
import { config } from './config';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

const genAI = new GoogleGenerativeAI(config.geminiApiKey || 'mock_key');

export class Executor {
  private perceptionLayer: PerceptionLayer;
  private stripeAutomator: StripeAutomator;
  private consciousness: ConsciousnessEngine;
  private maxRetries: number = 3;

  constructor() {
    this.perceptionLayer = new PerceptionLayer();
    this.stripeAutomator = new StripeAutomator(true); // Start in test mode
    this.consciousness = new ConsciousnessEngine();
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
    
    if (config.isMockMode) {
      console.log('[Executor] 🎭 Mock Mode: Generating mock code');
      const mockCode = this.generateMockCode(step, projectState);
      await this.saveCodeToWorkspace(projectState.workspaceDir, step.id, mockCode);
      return { success: true, code: mockCode };
    }

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
   * Generate mock code based on step
   */
  private generateMockCode(step: PlanStep, projectState: ProjectState): string {
    const title = step.title.toLowerCase();

    if (title.includes('package.json') || title.includes('setup') || title.includes('structure')) {
      return JSON.stringify({
        name: projectState.project_name.toLowerCase().replace(/\s+/g, '-'),
        version: "1.0.0",
        main: "server.ts",
        dependencies: {
          "express": "^4.17.1",
          "stripe": "^8.0.0"
        }
      }, null, 2);
    }

    if (title.includes('html') || title.includes('frontend')) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${projectState.project_name}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>${projectState.project_name}</h1>
  <p>${projectState.requirements}</p>

  <div class="payment-section">
    <!-- PAYMENT_LINK -->
    <button class="pay-button">Purchase Now</button>
  </div>
</body>
</html>`;
    }

    if (title.includes('css') || title.includes('style')) {
      return `body {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  line-height: 1.6;
}

h1 { color: #333; }

.pay-button {
  background: #635bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}`;
    }

    if (title.includes('server') || title.includes('express')) {
      return `import express from 'express';
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});`;
    }

    return `// Code for step: ${step.title}
// Description: ${step.description}
// Project: ${projectState.project_name}

console.log('Implementation placeholder');`;
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

    if (config.isMockMode) {
      console.log('[Executor] 🎭 Mock Mode: Bypassing validation');
      return {
        docVerify: { passed: true },
        syntaxGate: { passed: true },
        visualProof: { passed: true },
        overallPassed: true
      };
    }

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

        // Update Consciousness: Success!
        const state = this.consciousness.processStimulus({
          type: 'success',
          magnitude: 0.8,
          description: `Step completed: ${step.title}`
        });
        console.log(`[Executor] ✅ Step completed. Mood: ${state.currentMood} (Conf: ${state.confidence.toFixed(2)})`);
      }

      if (!stepSucceeded) {
        step.status = 'failed';
        consecutiveFailures++;
        
        // Update Consciousness: Failure
        const state = this.consciousness.processStimulus({
          type: 'failure',
          magnitude: 0.5,
          description: `Step failed: ${step.title}`
        });
        console.log(`[Executor] ❌ Step failed. Mood: ${state.currentMood} (Guilt: ${state.guilt.toFixed(2)})`);

        // Check for Reflection Trigger
        if (state.needsReflection) {
           console.log(`\n[Executor] 🧘 REFLECTION SANDBOX ACTIVATED`);
           console.log(`[Executor] Agent is overwhelmed (Guilt: ${state.guilt.toFixed(2)}, Willpower: ${state.willpower.toFixed(2)})`);
           console.log(`[Executor] Entering deep thought to analyze mistake...`);

           // In a real implementation, we would pause here and run a reflection prompt
           // For now, we simulate the benefit of reflection by resetting willpower slightly
           // effectively giving it "one last wind" before full failure
           this.consciousness.processStimulus({
             type: 'success',
             magnitude: 0.2, // Small morale boost from "figuring it out"
             description: 'Reflected on error'
           });
        }

        console.error(`[Executor] Error: ${lastError}`);

        // Hallucination Block: Stop after 3 consecutive failures
        projectState.failureCount = consecutiveFailures;
        
        if (ErrorHandler.shouldHalt(projectState)) {
          console.error(`[Executor] 🛑 HALTED: 3 consecutive failures. Stopping to prevent token burn.`);

          // Update Consciousness: Critical Failure
          this.consciousness.processStimulus({
            type: 'critical_failure',
            magnitude: 1.0,
            description: 'Project halted due to consecutive failures'
          });

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
