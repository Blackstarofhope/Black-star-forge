/**
 * LOGISTICS EXECUTOR
 * Orchestrates multi-platform builds (Web + Android)
 */

import { ProjectState } from './types';
import { AndroidBuilder, VercelDeployer, MultiPlatformBuildResult } from './logistics';
import { ErrorHandler } from './error-handler';
import { config } from './config';
import path from 'path';

export class LogisticsExecutor {
  private androidBuilder: AndroidBuilder;
  private vercelDeployer: VercelDeployer;

  constructor() {
    this.androidBuilder = new AndroidBuilder();
    this.vercelDeployer = new VercelDeployer();
  }

  /**
   * Detect platforms from project requirements
   */
  detectPlatforms(requirements: string): ('web' | 'android')[] {
    const platforms: ('web' | 'android')[] = [];
    
    const reqLower = requirements.toLowerCase();
    
    // Check for web keywords
    if (reqLower.includes('web') || 
        reqLower.includes('website') || 
        reqLower.includes('landing page') ||
        reqLower.includes('vercel') ||
        !reqLower.includes('android') && !reqLower.includes('mobile app')) {
      platforms.push('web');
    }
    
    // Check for Android keywords
    if (reqLower.includes('android') || 
        reqLower.includes('mobile app') ||
        reqLower.includes('app') && !reqLower.includes('web app')) {
      platforms.push('android');
    }
    
    // Default to web if nothing detected
    if (platforms.length === 0) {
      platforms.push('web');
    }
    
    return platforms;
  }

  /**
   * Build and verify all platforms
   */
  async buildAllPlatforms(projectState: ProjectState): Promise<MultiPlatformBuildResult> {
    console.log('\n[LogisticsExecutor] 🚀 Starting Multi-Platform Build Pipeline\n');
    
    if (config.isMockMode) {
      console.log('[LogisticsExecutor] 🎭 Mock Mode: Simulating builds');

      const platforms = projectState.platforms || ['web'];
      const result: MultiPlatformBuildResult = { overallSuccess: true };

      if (platforms.includes('web')) {
        result.web = {
          success: true,
          previewUrl: `https://${projectState.project_name.toLowerCase().replace(/\s+/g, '-')}.vercel.app`,
          screenshotPath: path.join(projectState.workspaceDir, 'web-screenshot.png')
        };
        projectState.webPreviewUrl = result.web.previewUrl;
        projectState.webScreenshotPath = result.web.screenshotPath;
      }

      if (platforms.includes('android')) {
        result.android = {
          success: true,
          aabPath: path.join(projectState.workspaceDir, 'android/app/build/outputs/bundle/release/app-release.aab'),
          screenshotPath: path.join(projectState.workspaceDir, 'android-screenshot.png')
        };
        projectState.androidPackageName = `com.blackstar.${projectState.project_name.toLowerCase().replace(/\s+/g, '')}`;
        projectState.androidScreenshotPath = result.android.screenshotPath;
      }

      projectState.status = 'awaiting_approval';
      return result;
    }

    const platforms = projectState.platforms || ['web'];
    const result: MultiPlatformBuildResult = {
      overallSuccess: true
    };

    // Build Web (Vercel)
    if (platforms.includes('web')) {
      console.log('[LogisticsExecutor] 🌐 Building Web Platform...');
      
      try {
        const webResult = await this.vercelDeployer.deployAndVerify(projectState.workspaceDir);
        
        result.web = {
          success: webResult.success,
          previewUrl: webResult.previewUrl,
          screenshotPath: webResult.screenshotPath,
          error: webResult.error
        };

        if (webResult.success) {
          projectState.webPreviewUrl = webResult.previewUrl;
          projectState.webScreenshotPath = webResult.screenshotPath;
          console.log('[LogisticsExecutor] ✅ Web build successful');
        } else {
          console.error('[LogisticsExecutor] ❌ Web build failed:', webResult.error);
          result.overallSuccess = false;
        }
      } catch (error: any) {
        console.error('[LogisticsExecutor] ❌ Web build error:', error);
        result.web = {
          success: false,
          error: error.message
        };
        result.overallSuccess = false;
      }
    }

    // Build Android
    if (platforms.includes('android')) {
      console.log('[LogisticsExecutor] 🤖 Building Android Platform...');
      
      try {
        // Get package name
        const packageName = await this.androidBuilder.getPackageName(projectState.workspaceDir);
        
        if (!packageName) {
          result.android = {
            success: false,
            error: 'Could not determine Android package name from AndroidManifest.xml'
          };
          result.overallSuccess = false;
        } else {
          projectState.androidPackageName = packageName;
          
          const androidResult = await this.androidBuilder.verifyAndDeploy(
            projectState.workspaceDir,
            packageName
          );

          result.android = {
            success: androidResult.success,
            aabPath: androidResult.aabPath,
            screenshotPath: androidResult.screenshotPath,
            error: androidResult.error
          };

          if (androidResult.success) {
            projectState.androidScreenshotPath = androidResult.screenshotPath;
            console.log('[LogisticsExecutor] ✅ Android build successful');
          } else {
            console.error('[LogisticsExecutor] ❌ Android build failed:', androidResult.error);
            result.overallSuccess = false;
          }
        }
      } catch (error: any) {
        console.error('[LogisticsExecutor] ❌ Android build error:', error);
        result.android = {
          success: false,
          error: error.message
        };
        result.overallSuccess = false;
      }
    }

    if (result.overallSuccess) {
      console.log('\n[LogisticsExecutor] ✅ All Platform Builds PASSED\n');
      projectState.status = 'awaiting_approval';
    } else {
      console.log('\n[LogisticsExecutor] ❌ Some Platform Builds FAILED\n');
      projectState.status = 'failed';
    }

    return result;
  }

  /**
   * Deploy Android to Google Play Production (after approval)
   */
  async deployAndroidProduction(projectState: ProjectState): Promise<boolean> {
    console.log('[LogisticsExecutor] 🚀 Deploying Android to Google Play Internal...');

    // Find the AAB path
    const aabPath = path.join(
      projectState.workspaceDir,
      'android/app/build/outputs/bundle/release/app-release.aab'
    );

    const deployResult = await this.androidBuilder.deployToPlayStore(aabPath);

    if (deployResult.passed) {
      console.log('[LogisticsExecutor] ✅ Android deployed to Google Play');
      return true;
    } else {
      console.error('[LogisticsExecutor] ❌ Android deployment failed:', deployResult.error);
      return false;
    }
  }

  /**
   * Deploy Web to Vercel Production (after approval)
   */
  async deployWebProduction(projectState: ProjectState): Promise<{ success: boolean; url?: string }> {
    console.log('[LogisticsExecutor] 🚀 Deploying Web to Vercel Production...');

    const deployResult = await this.vercelDeployer.deployProduction(projectState.workspaceDir);

    if (deployResult.success) {
      console.log('[LogisticsExecutor] ✅ Web deployed to Vercel Production');
      return {
        success: true,
        url: deployResult.previewUrl
      };
    } else {
      console.error('[LogisticsExecutor] ❌ Web deployment failed:', deployResult.error);
      return {
        success: false
      };
    }
  }

  /**
   * Validate logistics environment
   */
  async validateEnvironment(): Promise<{ valid: boolean; issues: string[] }> {
    const allIssues: string[] = [];

    // Validate Android environment
    const androidValidation = await this.androidBuilder.validateEnvironment();
    if (!androidValidation.valid) {
      allIssues.push('Android Environment Issues:');
      allIssues.push(...androidValidation.issues.map(i => `  - ${i}`));
    }

    // Validate Vercel environment
    const vercelValidation = await this.vercelDeployer.validateEnvironment();
    if (!vercelValidation.valid) {
      allIssues.push('Vercel Environment Issues:');
      allIssues.push(...vercelValidation.issues.map(i => `  - ${i}`));
    }

    if (allIssues.length > 0) {
      console.warn('\n⚠️  Logistics Environment Validation:');
      allIssues.forEach(issue => console.warn(issue));
      console.warn('\nSome features may not work. See documentation for setup.\n');
    }

    return {
      valid: allIssues.length === 0,
      issues: allIssues
    };
  }
}
