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
   * Send approval request email with screenshot attachments (multi-platform)
   */
  async sendApprovalRequest(projectState: ProjectState): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@blackstar.com';
    
    // Determine platforms
    const platforms = projectState.platforms || ['web'];
    const platformStr = platforms.length > 1 
      ? 'Web + Android' 
      : platforms[0] === 'android' ? 'Android' : 'Web';
    
    const subject = `🌟 [READY] Project: ${projectState.project_name} (${platformStr})`;
    
    let html = `
      <h2>🎉 Project Ready for Deployment Approval</h2>
      
      <h3>Project Details</h3>
      <ul>
        <li><strong>Name:</strong> ${projectState.project_name}</li>
        <li><strong>Order ID:</strong> ${projectState.orderId}</li>
        <li><strong>Platforms:</strong> ${platforms.join(', ').toUpperCase()}</li>
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

    // Web Platform Details
    if (platforms.includes('web') && projectState.webPreviewUrl) {
      html += `
        <h3>🌐 Web Platform</h3>
        <p><strong>Preview URL:</strong> <a href="${projectState.webPreviewUrl}">${projectState.webPreviewUrl}</a></p>
        <p><em>Currently on Vercel Preview. Will deploy to Production on approval.</em></p>
      `;
    }

    // Android Platform Details
    if (platforms.includes('android')) {
      html += `
        <h3>🤖 Android Platform</h3>
        <p><strong>Package:</strong> ${projectState.androidPackageName || 'N/A'}</p>
        <p><em>AAB built and tested on emulator. Will deploy to Google Play Internal on approval.</em></p>
      `;
    }

    if (projectState.stripePaymentLink) {
      html += `
        <h3>💳 Payment Integration</h3>
        <p><strong>Stripe Payment Link:</strong> <a href="${projectState.stripePaymentLink}">${projectState.stripePaymentLink}</a></p>
        <p><em>Note: Currently in TEST mode. Will switch to LIVE on deployment approval.</em></p>
      `;
    }

    html += `
      <h3>🚀 Deployment Actions</h3>
      <p><strong>To approve and deploy this project:</strong></p>
      <pre>POST ${process.env.BASE_URL || 'http://localhost:5000'}/api/deploy-approval</pre>
      <pre>{ "orderId": "${projectState.orderId}" }</pre>

      <p><strong>Or reply "DEPLOY" to this email (if email hook configured)</strong></p>

      <p><strong>To reject:</strong></p>
      <pre>POST ${process.env.BASE_URL || 'http://localhost:5000'}/api/deploy-reject</pre>
      <pre>{ "orderId": "${projectState.orderId}", "reason": "..." }</pre>
    `;

    const attachments = [];
    
    // Attach Web screenshot
    if (projectState.webScreenshotPath) {
      attachments.push({
        filename: 'website-screenshot.png',
        path: projectState.webScreenshotPath,
        cid: 'web-screenshot@blackstar'
      });
      
      html += `
        <h3>📸 Website Preview</h3>
        <p><img src="cid:web-screenshot@blackstar" alt="Website Screenshot" style="max-width: 800px; border: 2px solid #4A90E2; margin-bottom: 20px;" /></p>
      `;
    }

    // Attach Android screenshot
    if (projectState.androidScreenshotPath) {
      attachments.push({
        filename: 'android-screenshot.png',
        path: projectState.androidScreenshotPath,
        cid: 'android-screenshot@blackstar'
      });
      
      html += `
        <h3>📱 Android App Preview</h3>
        <p><img src="cid:android-screenshot@blackstar" alt="Android Screenshot" style="max-width: 400px; border: 2px solid #3DDC84; margin-bottom: 20px;" /></p>
      `;
    }

    // Legacy single screenshot support
    if (projectState.screenshotPath && !projectState.webScreenshotPath && !projectState.androidScreenshotPath) {
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

    html += `
      <hr>
      <p><em>The Black Star Sweatshop - Autonomous Revenue Agent with Logistics Division</em></p>
    `;

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
   * Send deployment confirmation (multi-platform)
   */
  async sendDeploymentConfirmation(projectState: ProjectState, deploymentUrl?: string): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@blackstar.com';
    
    const platforms = projectState.platforms || ['web'];
    const platformStr = platforms.join(' + ').toUpperCase();
    
    const subject = `✅ [BLACK STAR] ${platformStr} Deployed: ${projectState.project_name}`;
    
    let html = `
      <h2>🎉 Project Successfully Deployed to Production!</h2>
      
      <h3>Project Details</h3>
      <ul>
        <li><strong>Name:</strong> ${projectState.project_name}</li>
        <li><strong>Order ID:</strong> ${projectState.orderId}</li>
        <li><strong>Platforms:</strong> ${platformStr}</li>
      </ul>
    `;

    if (deploymentUrl) {
      // Parse multi-line deployment URLs
      const urls = deploymentUrl.split('\n');
      html += `<h3>🚀 Live Deployments</h3><ul>`;
      urls.forEach(url => {
        if (url.trim()) {
          const [platform, link] = url.split(':').map(s => s.trim());
          if (link && link.startsWith('http')) {
            html += `<li><strong>${platform}:</strong> <a href="${link}">${link}</a></li>`;
          } else {
            html += `<li>${url}</li>`;
          }
        }
      });
      html += `</ul>`;
    }

    if (platforms.includes('android')) {
      html += `
        <h3>🤖 Android Deployment</h3>
        <p><strong>Status:</strong> Deployed to Google Play Internal Track</p>
        <p><strong>Package:</strong> ${projectState.androidPackageName || 'N/A'}</p>
        <p><em>Access via Google Play Console → Internal Testing</em></p>
      `;
    }

    if (projectState.stripePaymentLink) {
      html += `
        <h3>💳 Live Payment Link</h3>
        <p><a href="${projectState.stripePaymentLink}">${projectState.stripePaymentLink}</a></p>
        <p><em>✅ Stripe is now in LIVE mode.</em></p>
      `;
    }

    html += `
      <hr>
      <p><em>The Black Star Sweatshop - Autonomous Revenue Agent with Logistics Division</em></p>
      <p><small>Multi-Platform Deployment: Web (Vercel) + Android (Google Play)</small></p>
    `;

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject,
      html
    });
  }
}
