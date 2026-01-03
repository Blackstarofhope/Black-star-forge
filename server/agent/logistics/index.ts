/**
 * THE LOGISTICS DIVISION
 * Automated build and verification for Web (Vercel) and Android (Google Play)
 */

export { AndroidBuilder } from './android-builder';
export { VercelDeployer } from './vercel-deployer';
export type { AndroidBuildResult } from './android-builder';
export type { VercelDeployResult } from './vercel-deployer';

export interface MultiPlatformBuildResult {
  android?: {
    success: boolean;
    aabPath?: string;
    screenshotPath?: string;
    error?: string;
  };
  web?: {
    success: boolean;
    previewUrl?: string;
    screenshotPath?: string;
    error?: string;
  };
  overallSuccess: boolean;
}
