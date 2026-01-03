/**
 * THE LOGISTICS DIVISION - Vercel Deployment Pipeline
 * Deploys to Vercel preview and verifies with Six Eyes
 */

import { spawn } from 'child_process';
import puppeteer from 'puppeteer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { ValidationResult } from '../types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface VercelDeployResult {
  success: boolean;
  previewUrl?: string;
  screenshotPath?: string;
  consoleErrors?: string[];
  error?: string;
}

export class VercelDeployer {
  private vercelToken: string;

  constructor() {
    this.vercelToken = process.env.VERCEL_TOKEN || '';
    
    if (!this.vercelToken) {
      console.warn('[VercelDeployer] VERCEL_TOKEN not set - Vercel deployments will fail');
    }
  }

  /**
   * Deploy to Vercel Preview
   */
  async deployPreview(projectDir: string): Promise<VercelDeployResult> {
    console.log('[VercelDeployer] Deploying to Vercel Preview...');

    if (!this.vercelToken) {
      return {
        success: false,
        error: 'VERCEL_TOKEN not set in environment'
      };
    }

    // Check if vercel CLI is installed
    const vercelCheck = await this.runCommand('which', ['vercel']);
    if (!vercelCheck) {
      return {
        success: false,
        error: 'Vercel CLI not installed. Install with: npm i -g vercel'
      };
    }

    return new Promise((resolve) => {
      const vercel = spawn('vercel', ['deploy', `--token=${this.vercelToken}`], {
        cwd: projectDir,
        shell: true
      });

      let stdout = '';
      let stderr = '';

      vercel.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log('[Vercel]', output.trim());
      });

      vercel.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      vercel.on('close', (code) => {
        if (code !== 0) {
          resolve({
            success: false,
            error: `Vercel deployment failed: ${stderr || stdout}`
          });
          return;
        }

        // Extract preview URL from output
        const urlMatch = stdout.match(/https:\/\/[^\s]+\.vercel\.app/);
        
        if (urlMatch) {
          const previewUrl = urlMatch[0];
          console.log('[VercelDeployer] ✅ Preview URL:', previewUrl);
          
          resolve({
            success: true,
            previewUrl
          });
        } else {
          resolve({
            success: false,
            error: 'Deployment succeeded but could not extract preview URL'
          });
        }
      });

      vercel.on('error', (error) => {
        resolve({
          success: false,
          error: `Failed to run vercel CLI: ${error.message}`
        });
      });
    });
  }

  /**
   * Deploy to Vercel Production
   */
  async deployProduction(projectDir: string): Promise<VercelDeployResult> {
    console.log('[VercelDeployer] Deploying to Vercel Production...');

    if (!this.vercelToken) {
      return {
        success: false,
        error: 'VERCEL_TOKEN not set in environment'
      };
    }

    return new Promise((resolve) => {
      const vercel = spawn(
        'vercel',
        ['deploy', '--prod', `--token=${this.vercelToken}`],
        {
          cwd: projectDir,
          shell: true
        }
      );

      let stdout = '';
      let stderr = '';

      vercel.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log('[Vercel]', output.trim());
      });

      vercel.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      vercel.on('close', (code) => {
        if (code !== 0) {
          resolve({
            success: false,
            error: `Vercel production deployment failed: ${stderr || stdout}`
          });
          return;
        }

        // Extract production URL
        const urlMatch = stdout.match(/https:\/\/[^\s]+/);
        
        if (urlMatch) {
          const productionUrl = urlMatch[0];
          console.log('[VercelDeployer] ✅ Production URL:', productionUrl);
          
          resolve({
            success: true,
            previewUrl: productionUrl
          });
        } else {
          resolve({
            success: false,
            error: 'Production deployment succeeded but could not extract URL'
          });
        }
      });
    });
  }

  /**
   * Verify deployment with Puppeteer
   */
  async verifyDeployment(
    url: string,
    screenshotPath: string
  ): Promise<VercelDeployResult> {
    console.log('[VercelDeployer] Verifying deployment with Puppeteer...');

    let browser;
    const consoleErrors: string[] = [];

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });

      // Listen for console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Listen for page errors
      page.on('pageerror', (error: any) => {
        consoleErrors.push(`Page Error: ${error?.message || String(error)}`);
      });

      // Listen for response errors (400/500)
      page.on('response', (response) => {
        const status = response.status();
        if (status >= 400) {
          consoleErrors.push(
            `HTTP ${status} on ${response.url()}`
          );
        }
      });

      // Navigate to URL
      console.log('[VercelDeployer] Navigating to:', url);
      
      try {
        await page.goto(url, {
          waitUntil: 'networkidle0',
          timeout: 60000 // 60 seconds for initial deploy
        });
      } catch (error: any) {
        await browser.close();
        return {
          success: false,
          error: `Failed to load page: ${error.message}`,
          consoleErrors
        };
      }

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Take screenshot
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log('[VercelDeployer] ✅ Screenshot saved:', screenshotPath);

      await browser.close();

      // Check for critical errors
      const criticalErrors = consoleErrors.filter(err => 
        err.includes('HTTP 5') || err.includes('HTTP 4')
      );

      if (criticalErrors.length > 0) {
        console.warn('[VercelDeployer] ⚠️  Critical errors detected:', criticalErrors);
      }

      return {
        success: true,
        previewUrl: url,
        screenshotPath,
        consoleErrors
      };

    } catch (error: any) {
      if (browser) await browser.close();
      
      return {
        success: false,
        error: `Verification error: ${error.message}`,
        consoleErrors
      };
    }
  }

  /**
   * Vision check - Verify site looks correct with Gemini
   */
  async visionCheck(screenshotPath: string): Promise<ValidationResult> {
    console.log('[VercelDeployer] Running Gemini vision check...');

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const imageData = await fs.readFile(screenshotPath);
      const base64Image = imageData.toString('base64');

      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/png'
          }
        },
        `Analyze this website screenshot.

Is this website working correctly? Look for:
- Is the page completely blank or white?
- Does it show a 404 "Page Not Found" error?
- Does it show a 500 "Internal Server Error"?
- Is there actual website content visible?
- Does it look like a properly rendered website?

Respond with "WORKING" if the website appears functional, or describe the issue if there's a problem.`
      ]);

      const response = result.response.text();
      console.log('[VercelDeployer] Vision analysis:', response);

      if (response.toUpperCase().includes('WORKING')) {
        return {
          passed: true,
          details: { analysis: response }
        };
      }

      return {
        passed: false,
        error: `Vision check failed: ${response}`,
        details: { analysis: response }
      };
    } catch (error: any) {
      return {
        passed: false,
        error: `Vision check error: ${error.message}`
      };
    }
  }

  /**
   * Full Vercel Six Eyes verification pipeline
   */
  async deployAndVerify(projectDir: string): Promise<VercelDeployResult> {
    console.log('\n[VercelDeployer] 🌐 Starting Vercel Six Eyes Verification...\n');

    // 1. Deploy to Preview
    const deployResult = await this.deployPreview(projectDir);
    if (!deployResult.success || !deployResult.previewUrl) {
      return deployResult;
    }

    const previewUrl = deployResult.previewUrl;

    // Wait for Vercel to finish building
    console.log('[VercelDeployer] Waiting for Vercel build to complete...');
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds

    // 2. Verify with Puppeteer
    const screenshotPath = path.join(projectDir, 'web-screenshot.png');
    const verifyResult = await this.verifyDeployment(previewUrl, screenshotPath);
    
    if (!verifyResult.success) {
      return verifyResult;
    }

    // 3. Vision check
    const visionResult = await this.visionCheck(screenshotPath);
    if (!visionResult.passed) {
      return {
        success: false,
        error: visionResult.error,
        previewUrl,
        screenshotPath,
        consoleErrors: verifyResult.consoleErrors
      };
    }

    // 4. Check for console errors
    if (verifyResult.consoleErrors && verifyResult.consoleErrors.length > 0) {
      const criticalErrors = verifyResult.consoleErrors.filter(err =>
        err.includes('HTTP 5') || err.includes('HTTP 4')
      );

      if (criticalErrors.length > 0) {
        console.warn('[VercelDeployer] ⚠️  Console errors detected but continuing...');
      }
    }

    console.log('\n[VercelDeployer] ✅ Vercel Six Eyes Verification PASSED\n');

    return {
      success: true,
      previewUrl,
      screenshotPath,
      consoleErrors: verifyResult.consoleErrors
    };
  }

  /**
   * Helper: Run shell command
   */
  private runCommand(command: string, args: string[]): Promise<string> {
    return new Promise((resolve) => {
      const proc = spawn(command, args);
      let output = '';

      proc.stdout.on('data', (data) => {
        output += data.toString();
      });

      proc.stderr.on('data', (data) => {
        output += data.toString();
      });

      proc.on('close', () => {
        resolve(output);
      });

      proc.on('error', (err: any) => {
        resolve('');
      });
    });
  }

  /**
   * Validate Vercel environment
   */
  async validateEnvironment(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check VERCEL_TOKEN
    if (!this.vercelToken) {
      issues.push('VERCEL_TOKEN not set');
    }

    // Check if Vercel CLI is installed
    const vercelInstalled = await this.runCommand('which', ['vercel']);
    if (!vercelInstalled) {
      issues.push('Vercel CLI not installed (npm i -g vercel)');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}
