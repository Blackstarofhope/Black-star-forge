/**
 * THE PLANNER
 * Breaks down project requirements into atomic coding steps
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { PlanStep, ProjectOrder } from './types';
import fs from 'fs/promises';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class Planner {
  /**
   * Generate a detailed plan from project requirements
   */
  async generatePlan(order: ProjectOrder): Promise<PlanStep[]> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `You are a senior software architect. Break down this project into atomic, sequential coding steps.

Project: ${order.project_name}
Requirements: ${order.requirements}

Generate a detailed implementation plan with these characteristics:
1. Each step should be small and focused on one specific task
2. Steps should be in logical order (setup -> implementation -> integration -> validation)
3. If the project involves payments, include Stripe integration steps
4. Include testing and validation steps
5. Each step should be completable independently

Format your response as a JSON array of steps:
[
  {
    "id": "step-1",
    "title": "Setup Project Structure",
    "description": "Initialize Node.js project with TypeScript, create folder structure, setup package.json"
  },
  {
    "id": "step-2", 
    "title": "Create Express Server",
    "description": "Setup Express server with basic routes and middleware"
  }
]

Important: Return ONLY the JSON array, no markdown formatting or explanations.`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Clean the response (remove markdown code blocks if present)
      let jsonText = responseText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').trim();
      }

      const rawSteps = JSON.parse(jsonText);
      
      // Convert to PlanStep format
      const steps: PlanStep[] = rawSteps.map((step: any) => ({
        id: step.id,
        title: step.title,
        description: step.description,
        status: 'pending',
        retries: 0
      }));

      return steps;
    } catch (error: any) {
      console.error('Planning error:', error);
      
      // Fallback: create a basic plan
      return [
        {
          id: 'step-1',
          title: 'Setup Project',
          description: 'Initialize project structure and dependencies',
          status: 'pending',
          retries: 0
        },
        {
          id: 'step-2',
          title: 'Implement Core Features',
          description: order.requirements,
          status: 'pending',
          retries: 0
        },
        {
          id: 'step-3',
          title: 'Add Validation',
          description: 'Add error handling and validation',
          status: 'pending',
          retries: 0
        }
      ];
    }
  }

  /**
   * Save plan to markdown file for transparency
   */
  async savePlanToFile(workspaceDir: string, steps: PlanStep[]): Promise<void> {
    const planPath = path.join(workspaceDir, 'plan.md');
    
    let markdown = '# Project Implementation Plan\n\n';
    markdown += `Generated: ${new Date().toISOString()}\n\n`;
    
    steps.forEach((step, index) => {
      markdown += `## Step ${index + 1}: ${step.title}\n\n`;
      markdown += `**ID:** ${step.id}\n\n`;
      markdown += `**Description:** ${step.description}\n\n`;
      markdown += `**Status:** ${step.status}\n\n`;
      markdown += '---\n\n';
    });

    await fs.writeFile(planPath, markdown, 'utf-8');
  }

  /**
   * Update plan file with current progress
   */
  async updatePlanFile(workspaceDir: string, steps: PlanStep[]): Promise<void> {
    await this.savePlanToFile(workspaceDir, steps);
  }
}
