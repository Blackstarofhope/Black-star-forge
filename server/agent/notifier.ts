/**
 * THE NOTIFIER
 * Email notifications for project status and approvals
 */

import nodemailer from 'nodemailer';
import { ProjectState } from './types';
import path from 'path';

export class Notifier {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create transporter - supports multiple email services
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  /**
   * Send approval request email with screenshot attachment
   */
  async sendApprovalRequest(projectState: ProjectState): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@blackstar.com';
    
    const subject = `🌟 [BLACK STAR] Project Ready for Approval: ${projectState.project_name}`;
    
    let html = `
      <h2>Project Completed - Awaiting Your Approval</h2>
      
      <h3>Project Details</h3>
      <ul>
        <li><strong>Name:</strong> ${projectState.project_name}</li>
        <li><strong>Order ID:</strong> ${projectState.orderId}</li>
        <li><strong>Status:</strong> ${projectState.status}</li>
      </ul>

      <h3>Requirements</h3>
      <p>${projectState.requirements}</p>

      <h3>Implementation Summary</h3>
      <ul>
        ${projectState.plan.map(step => 
          `<li><strong>${step.title}:</strong> ${step.status === 'completed' ? '✅' : '⏳'}</li>`
        ).join('\n')}
      </ul>
    `;

    if (projectState.stripePaymentLink) {
      html += `
        <h3>💳 Payment Integration</h3>
        <p><strong>Stripe Payment Link:</strong> <a href="${projectState.stripePaymentLink}">${projectState.stripePaymentLink}</a></p>
        <p><em>Note: Currently in TEST mode. Will switch to LIVE on deployment approval.</em></p>
      `;
    }

    html += `
      <h3>🚀 Deployment Actions</h3>
      <p>To approve and deploy this project, use the following API endpoint:</p>
      <pre>POST ${process.env.BASE_URL || 'http://localhost:5000'}/api/deploy-approval</pre>
      <pre>{ "orderId": "${projectState.orderId}" }</pre>

      <p>Or reject with:</p>
      <pre>POST ${process.env.BASE_URL || 'http://localhost:5000'}/api/deploy-reject</pre>
      <pre>{ "orderId": "${projectState.orderId}", "reason": "..." }</pre>

      <hr>
      <p><em>The Black Star Sweatshop - Autonomous Revenue Agent</em></p>
    `;

    const attachments = [];
    
    // Attach screenshot if available
    if (projectState.screenshotPath) {
      attachments.push({
        filename: 'visual-proof.png',
        path: projectState.screenshotPath,
        cid: 'screenshot@blackstar'
      });
      
      html += `
        <h3>📸 Visual Proof of Life</h3>
        <p><img src="cid:screenshot@blackstar" alt="Screenshot" style="max-width: 800px; border: 2px solid #333;" /></p>
      `;
    }

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject,
      html,
      attachments
    });
  }

  /**
   * Send error report email when validation fails repeatedly
   */
  async sendErrorReport(projectState: ProjectState, error: string): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@blackstar.com';
    
    const subject = `🚨 [BLACK STAR] Project Failed: ${projectState.project_name}`;
    
    const html = `
      <h2>Project Execution Failed</h2>
      
      <h3>Project Details</h3>
      <ul>
        <li><strong>Name:</strong> ${projectState.project_name}</li>
        <li><strong>Order ID:</strong> ${projectState.orderId}</li>
        <li><strong>Status:</strong> ${projectState.status}</li>
        <li><strong>Failure Count:</strong> ${projectState.failureCount}</li>
      </ul>

      <h3>Requirements</h3>
      <p>${projectState.requirements}</p>

      <h3>Error Details</h3>
      <pre style="background: #f5f5f5; padding: 15px; border-left: 3px solid red;">${error}</pre>

      <h3>Progress</h3>
      <ul>
        ${projectState.plan.map(step => 
          `<li><strong>${step.title}:</strong> ${step.status} (${step.retries} retries)</li>`
        ).join('\n')}
      </ul>

      <p><em>The agent has stopped after 3 consecutive failures to prevent token burn.</em></p>

      <hr>
      <p><em>The Black Star Sweatshop - Autonomous Revenue Agent</em></p>
    `;

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject,
      html
    });
  }

  /**
   * Send deployment confirmation
   */
  async sendDeploymentConfirmation(projectState: ProjectState, deploymentUrl?: string): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@blackstar.com';
    
    const subject = `✅ [BLACK STAR] Project Deployed: ${projectState.project_name}`;
    
    let html = `
      <h2>Project Successfully Deployed! 🎉</h2>
      
      <h3>Project Details</h3>
      <ul>
        <li><strong>Name:</strong> ${projectState.project_name}</li>
        <li><strong>Order ID:</strong> ${projectState.orderId}</li>
      </ul>
    `;

    if (deploymentUrl) {
      html += `
        <h3>🌐 Live URL</h3>
        <p><a href="${deploymentUrl}">${deploymentUrl}</a></p>
      `;
    }

    if (projectState.stripePaymentLink) {
      html += `
        <h3>💳 Live Payment Link</h3>
        <p><a href="${projectState.stripePaymentLink}">${projectState.stripePaymentLink}</a></p>
        <p><em>Stripe is now in LIVE mode.</em></p>
      `;
    }

    html += `
      <hr>
      <p><em>The Black Star Sweatshop - Autonomous Revenue Agent</em></p>
    `;

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject,
      html
    });
  }
}
