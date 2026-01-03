/**
 * THE ORCHESTRATOR
 * Main agent that coordinates all components
 */

import { ProjectOrder, ProjectState } from './types';
import { Planner } from './planner';
import { Executor } from './executor';
import { Notifier } from './notifier';
import { ErrorHandler } from './error-handler';
import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

export class BlackStarOrchestrator {
  private planner: Planner;
  private executor: Executor;
  private notifier: Notifier;
  private projectsDir: string;
  private activeProjects: Map<string, ProjectState>;

  constructor() {
    this.planner = new Planner();
    this.executor = new Executor();
    this.notifier = new Notifier();
    this.projectsDir = path.join(process.cwd(), 'projects');
    this.activeProjects = new Map();
    
    this.initializeWorkspace();
  }

  /**
   * Initialize workspace directory
   */
  private async initializeWorkspace(): Promise<void> {
    try {
      await fs.mkdir(this.projectsDir, { recursive: true });
      console.log(`[Orchestrator] Workspace initialized: ${this.projectsDir}`);
    } catch (error) {
      console.error('[Orchestrator] Failed to initialize workspace:', error);
    }
  }

  /**
   * Receive and process a new project order
   */
  async receiveOrder(order: ProjectOrder): Promise<ProjectState> {
    console.log(`\n[Orchestrator] 🌟 Received new order: ${order.project_name}`);
    
    // Create project workspace
    const workspaceDir = path.join(this.projectsDir, order.orderId);
    await fs.mkdir(workspaceDir, { recursive: true });

    // Initialize project state
    const projectState: ProjectState = {
      orderId: order.orderId,
      project_name: order.project_name,
      requirements: order.requirements,
      plan: [],
      currentStep: 0,
      status: 'planning',
      workspaceDir,
      failureCount: 0
    };

    this.activeProjects.set(order.orderId, projectState);

    // Start autonomous execution
    this.executeOrderAsync(projectState);

    return projectState;
  }

  /**
   * Autonomous execution pipeline (runs in background)
   */
  private async executeOrderAsync(projectState: ProjectState): Promise<void> {
    try {
      // PHASE 1: PLANNING
      console.log(`\n[Orchestrator] 📋 Phase 1: Planning`);
      projectState.status = 'planning';
      
      const plan = await this.planner.generatePlan({
        orderId: projectState.orderId,
        project_name: projectState.project_name,
        requirements: projectState.requirements
      });

      projectState.plan = plan;
      await this.planner.savePlanToFile(projectState.workspaceDir, plan);
      
      console.log(`[Orchestrator] ✅ Plan generated with ${plan.length} steps`);

      // PHASE 2: EXECUTION
      console.log(`\n[Orchestrator] 🔨 Phase 2: Execution`);
      projectState.status = 'coding';
      
      const result = await this.executor.executeProject(projectState);
      
      // Check if execution failed
      if (result.status === 'failed') {
        console.error(`\n[Orchestrator] ❌ Project execution failed`);
        ErrorHandler.logProjectState(result, 'Failed Project State');
        
        // Send error report email
        const errorReport = ErrorHandler.createErrorReport(
          result,
          `Project failed after ${result.failureCount} consecutive failures. Check the logs for details.`
        );
        
        await this.notifier.sendErrorReport(
          result,
          errorReport.error
        );
        
        return;
      }

      // PHASE 3: APPROVAL REQUEST
      console.log(`\n[Orchestrator] 📧 Phase 3: Requesting Approval`);
      projectState.status = 'awaiting_approval';
      
      await this.notifier.sendApprovalRequest(projectState);
      
      console.log(`[Orchestrator] ✅ Approval request sent to admin`);
      console.log(`[Orchestrator] 🔄 Waiting for deployment approval...`);

    } catch (error: any) {
      console.error(`\n[Orchestrator] 💥 Fatal error:`, error);
      projectState.status = 'failed';
      
      try {
        await this.notifier.sendErrorReport(projectState, error.message);
      } catch (emailError) {
        console.error('[Orchestrator] Failed to send error email:', emailError);
      }
    }
  }

  /**
   * Handle deployment approval
   */
  async approveDeployment(orderId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    console.log(`\n[Orchestrator] 🚀 Deployment approved for order: ${orderId}`);
    
    const projectState = this.activeProjects.get(orderId);
    
    if (!projectState) {
      return { success: false, error: 'Project not found' };
    }

    if (projectState.status !== 'awaiting_approval') {
      return { 
        success: false, 
        error: `Project is in ${projectState.status} state, not awaiting approval` 
      };
    }

    try {
      // Deploy the project
      const deploymentResult = await this.executor.deployProject(projectState);
      
      if (deploymentResult.success) {
        // Send deployment confirmation
        await this.notifier.sendDeploymentConfirmation(projectState, deploymentResult.url);
        
        console.log(`[Orchestrator] ✅ Project deployed successfully!`);
        return deploymentResult;
      } else {
        await this.notifier.sendErrorReport(projectState, deploymentResult.error || 'Deployment failed');
        return deploymentResult;
      }
    } catch (error: any) {
      console.error('[Orchestrator] Deployment error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle deployment rejection
   */
  async rejectDeployment(orderId: string, reason: string): Promise<{ success: boolean }> {
    console.log(`\n[Orchestrator] ❌ Deployment rejected for order: ${orderId}`);
    console.log(`[Orchestrator] Reason: ${reason}`);
    
    const projectState = this.activeProjects.get(orderId);
    
    if (!projectState) {
      return { success: false };
    }

    projectState.status = 'failed';
    
    // Could implement retry logic here if needed
    
    return { success: true };
  }

  /**
   * Get project status
   */
  getProjectStatus(orderId: string): ProjectState | null {
    return this.activeProjects.get(orderId) || null;
  }

  /**
   * List all active projects
   */
  listProjects(): ProjectState[] {
    return Array.from(this.activeProjects.values());
  }

  /**
   * Get project statistics
   */
  getStatistics() {
    const projects = Array.from(this.activeProjects.values());
    
    return {
      total: projects.length,
      planning: projects.filter(p => p.status === 'planning').length,
      coding: projects.filter(p => p.status === 'coding').length,
      validating: projects.filter(p => p.status === 'validating').length,
      awaiting_approval: projects.filter(p => p.status === 'awaiting_approval').length,
      deploying: projects.filter(p => p.status === 'deploying').length,
      completed: projects.filter(p => p.status === 'completed').length,
      failed: projects.filter(p => p.status === 'failed').length
    };
  }
}

// Singleton instance
export const orchestrator = new BlackStarOrchestrator();
