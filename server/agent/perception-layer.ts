/**
 * THE PERCEPTION LAYER - "Six Eyes" Protocol
 * The gatekeeper for all AI actions
 */

import { spawn } from 'child_process';
import puppeteer from 'puppeteer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { ValidationResult, SixEyesResult } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class PerceptionLayer {
  /**
   * The Infinity Barrier - Doc Verify
   * Verifies function signatures against API documentation
   */
  async docVerify(code: string, apiType: 'stripe' | 'firebase' | 'general'): Promise<ValidationResult> {
    try {
      // Simple knowledge base of common deprecated patterns
      const deprecatedPatterns: Record<string, string[]> = {
        stripe: [
          'source:', // Deprecated in favor of payment_method
          'bitcoin_receiver', // Deprecated API
          'card:', // Should use payment_method
        ],
        firebase: [
          'firebase.database()', // Old SDK pattern
        ],
        general: []
      };

      const patterns = deprecatedPatterns[apiType] || [];
      
      for (const pattern of patterns) {
        if (code.includes(pattern)) {
          return {
            passed: false,
            error: `Deprecated API pattern detected: ${pattern}`,
            details: { pattern, apiType }
          };
        }
      }

      // Use Gemini to analyze the code for potential API issues
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `Analyze this code for deprecated or incorrect API usage for ${apiType}. 
      Focus on function signatures and parameters.
      
      Code:
      ${code}
      
      Respond with "VALID" if the code looks correct, or describe the issue if there's a problem.`;
      
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      if (response.toUpperCase().includes('VALID')) {
        return { passed: true };
      }
      
      return {
        passed: response.toUpperCase().includes('VALID'),
        error: response.includes('VALID') ? undefined : `API verification issue: ${response}`,
        details: { response }
      };
    } catch (error: any) {
      return {
        passed: false,
        error: `Doc verification error: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Spectral Analysis - Syntax Gate
   * TypeScript compilation must pass with zero errors
   */
  async syntaxGate(workspaceDir: string): Promise<ValidationResult> {
    return new Promise((resolve) => {
      const tsc = spawn('npx', ['tsc', '--noEmit', '--project', workspaceDir], {
        cwd: workspaceDir
      });

      let stderr = '';
      let stdout = '';

      tsc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      tsc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      tsc.on('close', (code) => {
        if (code === 0) {
          resolve({ passed: true });
        } else {
          resolve({
            passed: false,
            error: `TypeScript compilation failed with code ${code}`,
            details: { stdout, stderr }
          });
        }
      });

      tsc.on('error', (error) => {
        resolve({
          passed: false,
          error: `Failed to run TypeScript compiler: ${error.message}`,
          details: { error: error.message }
        });
      });
    });
  }

  /**
   * Domain Expansion - Visual Proof
   * Puppeteer screenshot + Gemini Vision verification
   */
  async visualProof(url: string, workspaceDir: string): Promise<ValidationResult> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });

      // Navigate with timeout
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Wait a bit for dynamic content
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Take screenshot
      const screenshotPath = path.join(workspaceDir, 'visual-proof.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });

      await browser.close();

      // Use Gemini Vision to analyze the screenshot
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
        `Analyze this screenshot of a web application. Is this a valid, working page? 
        Look for:
        - Is the page completely blank?
        - Does it show a 404 error?
        - Does it show a 500 error?
        - Does it show any error messages?
        - Is there actual content visible?
        
        Respond with "VALID" if the page looks functional, or describe the issue if there's a problem.`
      ]);

      const response = result.response.text();
      
      if (response.toUpperCase().includes('VALID')) {
        return { 
          passed: true,
          details: { screenshotPath, analysis: response }
        };
      }

      return {
        passed: false,
        error: `Visual verification failed: ${response}`,
        details: { screenshotPath, analysis: response }
      };

    } catch (error: any) {
      if (browser) await browser.close();
      return {
        passed: false,
        error: `Visual proof error: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  /**
   * Run all Six Eyes checks
   */
  async runSixEyes(
    code: string,
    workspaceDir: string,
    serverUrl: string,
    apiType: 'stripe' | 'firebase' | 'general' = 'general'
  ): Promise<SixEyesResult> {
    // Run checks sequentially
    const docVerify = await this.docVerify(code, apiType);
    
    let syntaxGate: ValidationResult = { passed: true };
    let visualProof: ValidationResult = { passed: true };

    // Only proceed to syntax check if doc verify passed
    if (docVerify.passed) {
      syntaxGate = await this.syntaxGate(workspaceDir);
      
      // Only proceed to visual check if syntax passed
      if (syntaxGate.passed) {
        visualProof = await this.visualProof(serverUrl, workspaceDir);
      }
    }

    const overallPassed = docVerify.passed && syntaxGate.passed && visualProof.passed;

    return {
      docVerify,
      syntaxGate,
      visualProof,
      overallPassed
    };
  }
}
