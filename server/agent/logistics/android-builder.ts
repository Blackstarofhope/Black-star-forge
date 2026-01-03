/**
 * THE LOGISTICS DIVISION - Android Build Pipeline
 * Builds, verifies, and deploys Android apps to Google Play Internal
 */

import { spawn } from 'child_process';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { ValidationResult } from '../types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface AndroidBuildResult {
  success: boolean;
  apkPath?: string;
  aabPath?: string;
  screenshotPath?: string;
  error?: string;
  packageName?: string;
}

export class AndroidBuilder {
  private androidSdkRoot: string;
  private adbPath: string;

  constructor() {
    this.androidSdkRoot = process.env.ANDROID_SDK_ROOT || '';
    this.adbPath = path.join(this.androidSdkRoot, 'platform-tools', 'adb');
    
    if (!this.androidSdkRoot) {
      console.warn('[AndroidBuilder] ANDROID_SDK_ROOT not set - Android builds will fail');
    }
  }

  /**
   * Build Release APK/AAB locally
   */
  async buildRelease(projectDir: string): Promise<AndroidBuildResult> {
    console.log('[AndroidBuilder] Starting release build...');

    const androidDir = path.join(projectDir, 'android');
    
    // Check if android directory exists
    try {
      await fs.access(androidDir);
    } catch {
      return {
        success: false,
        error: 'Android directory not found in project'
      };
    }

    // Make gradlew executable
    const gradlewPath = path.join(androidDir, 'gradlew');
    try {
      await fs.chmod(gradlewPath, '755');
    } catch (error: any) {
      console.warn('[AndroidBuilder] Could not chmod gradlew:', error.message);
    }

    // Run bundleRelease
    return new Promise((resolve) => {
      const gradle = spawn('./gradlew', ['bundleRelease', '--stacktrace'], {
        cwd: androidDir,
        shell: true
      });

      let stdout = '';
      let stderr = '';

      gradle.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log('[AndroidBuilder]', output.trim());
      });

      gradle.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      gradle.on('close', async (code) => {
        if (code !== 0) {
          resolve({
            success: false,
            error: `Gradle build failed with code ${code}\n${stderr}`
          });
          return;
        }

        // Find the generated AAB/APK
        const aabPath = path.join(
          androidDir,
          'app/build/outputs/bundle/release/app-release.aab'
        );
        
        const apkPath = path.join(
          androidDir,
          'app/build/outputs/apk/release/app-release.apk'
        );

        // Check if AAB exists
        try {
          await fs.access(aabPath);
          console.log('[AndroidBuilder] ✅ AAB built successfully:', aabPath);
          
          resolve({
            success: true,
            aabPath,
            apkPath: await this.checkFileExists(apkPath) ? apkPath : undefined
          });
        } catch {
          resolve({
            success: false,
            error: 'Build completed but AAB/APK not found'
          });
        }
      });

      gradle.on('error', (error) => {
        resolve({
          success: false,
          error: `Failed to start Gradle: ${error.message}`
        });
      });
    });
  }

  /**
   * Build APK if only AAB was generated
   */
  async buildApk(projectDir: string): Promise<string | null> {
    console.log('[AndroidBuilder] Building APK for testing...');

    const androidDir = path.join(projectDir, 'android');

    return new Promise((resolve) => {
      const gradle = spawn('./gradlew', ['assembleRelease'], {
        cwd: androidDir,
        shell: true
      });

      gradle.on('close', async (code) => {
        if (code !== 0) {
          resolve(null);
          return;
        }

        const apkPath = path.join(
          androidDir,
          'app/build/outputs/apk/release/app-release.apk'
        );

        if (await this.checkFileExists(apkPath)) {
          resolve(apkPath);
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * Install APK on running emulator
   */
  async installOnEmulator(apkPath: string): Promise<ValidationResult> {
    console.log('[AndroidBuilder] Installing APK on emulator...');

    // Check if emulator is running
    const devices = await this.runAdb(['devices']);
    if (!devices.includes('emulator')) {
      return {
        passed: false,
        error: 'No emulator running. Start an emulator first: emulator -avd <name>'
      };
    }

    // Install APK
    return new Promise((resolve) => {
      const adb = spawn(this.adbPath, ['install', '-r', apkPath]);

      let output = '';

      adb.stdout.on('data', (data) => {
        output += data.toString();
      });

      adb.stderr.on('data', (data) => {
        output += data.toString();
      });

      adb.on('close', (code) => {
        if (code === 0 && output.includes('Success')) {
          console.log('[AndroidBuilder] ✅ APK installed successfully');
          resolve({ passed: true });
        } else {
          resolve({
            passed: false,
            error: `Failed to install APK: ${output}`
          });
        }
      });
    });
  }

  /**
   * Extract package name from AndroidManifest.xml
   */
  async getPackageName(projectDir: string): Promise<string | null> {
    const manifestPath = path.join(
      projectDir,
      'android/app/src/main/AndroidManifest.xml'
    );

    try {
      const content = await fs.readFile(manifestPath, 'utf-8');
      const match = content.match(/package="([^"]+)"/);
      return match ? match[1] : null;
    } catch (error: any) {
      console.error('[AndroidBuilder] Could not read AndroidManifest.xml:', error);
      return null;
    }
  }

  /**
   * Launch app on emulator
   */
  async launchApp(packageName: string): Promise<ValidationResult> {
    console.log(`[AndroidBuilder] Launching app: ${packageName}`);

    // Use monkey to force-launch
    const result = await this.runAdb([
      'shell',
      'monkey',
      '-p',
      packageName,
      '1'
    ]);

    if (result.includes('Events injected: 1')) {
      console.log('[AndroidBuilder] ✅ App launched');
      return { passed: true };
    }

    return {
      passed: false,
      error: `Failed to launch app: ${result}`
    };
  }

  /**
   * Capture screenshot from emulator
   */
  async captureScreenshot(outputPath: string): Promise<ValidationResult> {
    console.log('[AndroidBuilder] Capturing screenshot...');

    return new Promise((resolve) => {
      const screenshotFile = fs.open(outputPath, 'w');

      screenshotFile.then(async (file) => {
        const adb = spawn(this.adbPath, ['exec-out', 'screencap', '-p']);

        const writeStream = file.createWriteStream();
        adb.stdout.pipe(writeStream);

        adb.on('close', async (code) => {
          await file.close();

          if (code === 0) {
            console.log('[AndroidBuilder] ✅ Screenshot saved:', outputPath);
            resolve({ passed: true, details: { screenshotPath: outputPath } });
          } else {
            resolve({
              passed: false,
              error: 'Failed to capture screenshot'
            });
          }
        });
      }).catch((error: any) => {
        resolve({
          passed: false,
          error: `Failed to open output file: ${error.message}`
        });
      });
    });
  }

  /**
   * Vision Check - Verify app is running using Gemini
   */
  async visionCheck(screenshotPath: string): Promise<ValidationResult> {
    console.log('[AndroidBuilder] Running Gemini vision check...');

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
        `Analyze this Android app screenshot. 

Is this app running correctly? Look for:
- Is there a crash dialog visible?
- Is the screen completely blank/black?
- Does it show "App has stopped" or "Unfortunately, ... has stopped"?
- Is there actual app content visible?

Respond with "RUNNING" if the app appears to be working, or describe the issue if there's a problem.`
      ]);

      const response = result.response.text();
      console.log('[AndroidBuilder] Vision analysis:', response);

      if (response.toUpperCase().includes('RUNNING')) {
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
   * Deploy to Google Play Internal using Fastlane
   */
  async deployToPlayStore(aabPath: string): Promise<ValidationResult> {
    console.log('[AndroidBuilder] Deploying to Google Play Internal...');

    const jsonKeyPath = process.env.GOOGLE_PLAY_JSON_KEY;
    
    if (!jsonKeyPath) {
      return {
        passed: false,
        error: 'GOOGLE_PLAY_JSON_KEY not set in environment'
      };
    }

    // Check if fastlane is installed
    const fastlaneCheck = await this.runCommand('which', ['fastlane']);
    if (!fastlaneCheck) {
      return {
        passed: false,
        error: 'Fastlane not installed. Install with: gem install fastlane'
      };
    }

    return new Promise((resolve) => {
      const fastlane = spawn('fastlane', [
        'supply',
        '--aab', aabPath,
        '--track', 'internal',
        '--json_key', jsonKeyPath
      ]);

      let output = '';

      fastlane.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        console.log('[Fastlane]', text.trim());
      });

      fastlane.stderr.on('data', (data) => {
        output += data.toString();
      });

      fastlane.on('close', (code) => {
        if (code === 0) {
          console.log('[AndroidBuilder] ✅ Deployed to Google Play Internal');
          resolve({ passed: true });
        } else {
          resolve({
            passed: false,
            error: `Fastlane deployment failed: ${output}`
          });
        }
      });
    });
  }

  /**
   * Full Android Six Eyes verification pipeline
   */
  async verifyAndDeploy(
    projectDir: string,
    packageName: string
  ): Promise<AndroidBuildResult> {
    console.log('\n[AndroidBuilder] 🤖 Starting Android Six Eyes Verification...\n');

    // 1. Build Release
    const buildResult = await this.buildRelease(projectDir);
    if (!buildResult.success) {
      return buildResult;
    }

    // 2. Build APK if not available (for testing)
    let apkPath = buildResult.apkPath;
    if (!apkPath && buildResult.aabPath) {
      const builtApk = await this.buildApk(projectDir);
      if (!builtApk) {
        return {
          success: false,
          error: 'Could not generate APK for testing'
        };
      }
      apkPath = builtApk;
    }

    // 3. Install on emulator
    const installResult = await this.installOnEmulator(apkPath!);
    if (!installResult.passed) {
      return {
        success: false,
        error: installResult.error,
        aabPath: buildResult.aabPath
      };
    }

    // 4. Launch app
    const launchResult = await this.launchApp(packageName);
    if (!launchResult.passed) {
      return {
        success: false,
        error: launchResult.error,
        aabPath: buildResult.aabPath
      };
    }

    // Wait for app to fully load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 5. Capture screenshot
    const screenshotPath = path.join(projectDir, 'android-screenshot.png');
    const screenshotResult = await this.captureScreenshot(screenshotPath);
    if (!screenshotResult.passed) {
      return {
        success: false,
        error: screenshotResult.error,
        aabPath: buildResult.aabPath
      };
    }

    // 6. Vision check
    const visionResult = await this.visionCheck(screenshotPath);
    if (!visionResult.passed) {
      return {
        success: false,
        error: visionResult.error,
        aabPath: buildResult.aabPath,
        screenshotPath
      };
    }

    console.log('\n[AndroidBuilder] ✅ Android Six Eyes Verification PASSED\n');

    return {
      success: true,
      aabPath: buildResult.aabPath,
      apkPath,
      screenshotPath,
      packageName
    };
  }

  /**
   * Helper: Run ADB command
   */
  private async runAdb(args: string[]): Promise<string> {
    return this.runCommand(this.adbPath, args);
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

      proc.on('error', () => {
        resolve('');
      });
    });
  }

  /**
   * Helper: Check if file exists
   */
  private async checkFileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate Android environment
   */
  async validateEnvironment(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check ANDROID_SDK_ROOT
    if (!this.androidSdkRoot) {
      issues.push('ANDROID_SDK_ROOT not set');
    } else {
      const adbExists = await this.checkFileExists(this.adbPath);
      if (!adbExists) {
        issues.push(`ADB not found at ${this.adbPath}`);
      }
    }

    // Check GOOGLE_PLAY_JSON_KEY
    const jsonKeyPath = process.env.GOOGLE_PLAY_JSON_KEY;
    if (!jsonKeyPath) {
      issues.push('GOOGLE_PLAY_JSON_KEY not set');
    } else {
      const keyExists = await this.checkFileExists(jsonKeyPath);
      if (!keyExists) {
        issues.push(`Google Play JSON key not found at ${jsonKeyPath}`);
      }
    }

    // Check if emulator is running
    const devices = await this.runAdb(['devices']);
    if (!devices.includes('emulator')) {
      issues.push('No Android emulator running');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}
