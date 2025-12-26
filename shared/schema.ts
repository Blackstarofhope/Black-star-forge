import { z } from "zod";

// File system types for the IDE
export interface FileNode {
  id: string;
  name: string;
  type: "file" | "directory";
  path: string;
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

export interface ProjectState {
  id: string;
  name: string;
  files: FileNode[];
  activeFileId: string | null;
  openTabs: string[];
}

// AI Chat types
export type AIModel = "gpt-4" | "claude-3" | "gemini-pro";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  model?: AIModel;
}

export interface AISettings {
  model: AIModel;
  apiKeys: {
    openai?: string;
    anthropic?: string;
    google?: string;
  };
}

// Knowledge base types
export interface KnowledgeEntry {
  id: string;
  url: string;
  title: string;
  content: string;
  timestamp: number;
  contributedToHive: boolean;
}

// Deployment types
export type DeploymentProvider = "vercel" | "netlify";
export type DeploymentStatus = "idle" | "deploying" | "success" | "error";

export interface DeploymentState {
  status: DeploymentStatus;
  provider: DeploymentProvider | null;
  url: string | null;
  error: string | null;
}

// Multiplayer session types
export interface CollaborationSession {
  id: string;
  hostId: string;
  participants: string[];
  isActive: boolean;
}

// Backend template types
export type BackendTemplate = "firebase" | "supabase";

export interface BackendConfig {
  template: BackendTemplate;
  apiKey?: string;
  projectId?: string;
  authDomain?: string;
}

// God View graph types
export interface DependencyNode {
  id: string;
  name: string;
  path: string;
  type: "component" | "page" | "utility" | "style";
}

export interface DependencyEdge {
  id: string;
  source: string;
  target: string;
}

// Zod schemas for validation
export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  timestamp: z.number(),
  model: z.enum(["gpt-4", "claude-3", "gemini-pro"]).optional(),
});

export const aiSettingsSchema = z.object({
  model: z.enum(["gpt-4", "claude-3", "gemini-pro"]),
  apiKeys: z.object({
    openai: z.string().optional(),
    anthropic: z.string().optional(),
    google: z.string().optional(),
  }),
});

export const knowledgeEntrySchema = z.object({
  id: z.string(),
  url: z.string().url(),
  title: z.string(),
  content: z.string(),
  timestamp: z.number(),
  contributedToHive: z.boolean(),
});

export const deploymentStateSchema = z.object({
  status: z.enum(["idle", "deploying", "success", "error"]),
  provider: z.enum(["vercel", "netlify"]).nullable(),
  url: z.string().nullable(),
  error: z.string().nullable(),
});

// User types (keeping existing structure)
export interface User {
  id: string;
  username: string;
  password: string;
}

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
