// Core types for the Black Star Autonomous Agent

export interface ProjectOrder {
  project_name: string;
  requirements: string;
  orderId: string;
}

export interface ValidationResult {
  passed: boolean;
  error?: string;
  details?: any;
}

export interface PlanStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  code?: string;
  retries: number;
}

export interface ProjectState {
  orderId: string;
  project_name: string;
  requirements: string;
  plan: PlanStep[];
  currentStep: number;
  status: 'planning' | 'coding' | 'validating' | 'building' | 'awaiting_approval' | 'deploying' | 'completed' | 'failed';
  workspaceDir: string;
  stripeProductId?: string;
  stripePriceId?: string;
  stripePaymentLink?: string;
  screenshotPath?: string;
  failureCount: number;
  // Multi-platform support
  platforms?: ('web' | 'android')[];
  androidScreenshotPath?: string;
  webScreenshotPath?: string;
  webPreviewUrl?: string;
  androidPackageName?: string;
  // Mock mode
  mockMode: boolean;
}

export interface SixEyesResult {
  docVerify: ValidationResult;
  syntaxGate: ValidationResult;
  visualProof: ValidationResult;
  overallPassed: boolean;
}
