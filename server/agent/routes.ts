/**
 * API Routes for the Black Star Autonomous Agent
 */

import { Router } from 'express';
import { orchestrator } from './orchestrator';
import { nanoid } from 'nanoid';

const router = Router();

/**
 * POST /api/receive-order
 * Receive a new project order
 */
router.post('/receive-order', async (req, res) => {
  try {
    const { project_name, requirements } = req.body;

    if (!project_name || !requirements) {
      return res.status(400).json({
        error: 'Missing required fields: project_name and requirements'
      });
    }

    // Generate unique order ID
    const orderId = nanoid();

    const projectState = await orchestrator.receiveOrder({
      orderId,
      project_name,
      requirements
    });

    res.json({
      success: true,
      orderId,
      status: projectState.status,
      message: 'Order received. The Black Star Sweatshop is now working on your project.',
      project: {
        name: projectState.project_name,
        orderId: projectState.orderId,
        status: projectState.status
      }
    });
  } catch (error: any) {
    console.error('[API] Error receiving order:', error);
    res.status(500).json({
      error: 'Failed to process order',
      details: error.message
    });
  }
});

/**
 * POST /api/deploy-approval
 * Approve a project for deployment
 */
router.post('/deploy-approval', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        error: 'Missing required field: orderId'
      });
    }

    const result = await orchestrator.approveDeployment(orderId);

    if (result.success) {
      res.json({
        success: true,
        message: 'Project approved and deployed successfully',
        deploymentUrl: result.url
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('[API] Error approving deployment:', error);
    res.status(500).json({
      error: 'Failed to approve deployment',
      details: error.message
    });
  }
});

/**
 * POST /api/deploy-reject
 * Reject a project deployment
 */
router.post('/deploy-reject', async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    if (!orderId) {
      return res.status(400).json({
        error: 'Missing required field: orderId'
      });
    }

    const result = await orchestrator.rejectDeployment(
      orderId,
      reason || 'No reason provided'
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Project deployment rejected'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to reject deployment'
      });
    }
  } catch (error: any) {
    console.error('[API] Error rejecting deployment:', error);
    res.status(500).json({
      error: 'Failed to reject deployment',
      details: error.message
    });
  }
});

/**
 * GET /api/project-status/:orderId
 * Get status of a specific project
 */
router.get('/project-status/:orderId', (req, res) => {
  try {
    const { orderId } = req.params;

    const project = orchestrator.getProjectStatus(orderId);

    if (!project) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      project: {
        orderId: project.orderId,
        name: project.project_name,
        status: project.status,
        currentStep: project.currentStep,
        totalSteps: project.plan.length,
        plan: project.plan.map(step => ({
          title: step.title,
          status: step.status,
          retries: step.retries
        })),
        stripePaymentLink: project.stripePaymentLink
      }
    });
  } catch (error: any) {
    console.error('[API] Error getting project status:', error);
    res.status(500).json({
      error: 'Failed to get project status',
      details: error.message
    });
  }
});

/**
 * GET /api/projects
 * List all active projects
 */
router.get('/projects', (req, res) => {
  try {
    const projects = orchestrator.listProjects();

    res.json({
      success: true,
      count: projects.length,
      projects: projects.map(p => ({
        orderId: p.orderId,
        name: p.project_name,
        status: p.status,
        currentStep: p.currentStep,
        totalSteps: p.plan.length
      }))
    });
  } catch (error: any) {
    console.error('[API] Error listing projects:', error);
    res.status(500).json({
      error: 'Failed to list projects',
      details: error.message
    });
  }
});

/**
 * GET /api/statistics
 * Get agent statistics
 */
router.get('/statistics', (req, res) => {
  try {
    const stats = orchestrator.getStatistics();

    res.json({
      success: true,
      statistics: stats
    });
  } catch (error: any) {
    console.error('[API] Error getting statistics:', error);
    res.status(500).json({
      error: 'Failed to get statistics',
      details: error.message
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Black Star Sweatshop',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

export default router;
