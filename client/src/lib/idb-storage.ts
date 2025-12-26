import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { FileNode, KnowledgeEntry, AIModel } from "@shared/schema";

interface BlackStarDB extends DBSchema {
  files: {
    key: string;
    value: {
      id: string;
      data: FileNode[];
      lastModified: number;
    };
  };
  settings: {
    key: string;
    value: {
      key: string;
      value: any;
    };
  };
  knowledge: {
    key: string;
    value: KnowledgeEntry;
    indexes: { "by-timestamp": number };
  };
  chatHistory: {
    key: string;
    value: {
      id: string;
      role: "user" | "assistant" | "system";
      content: string;
      timestamp: number;
      model?: AIModel;
    };
    indexes: { "by-timestamp": number };
  };
}

const DB_NAME = "blackstar-forge";
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<BlackStarDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<BlackStarDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<BlackStarDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Files store
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "id" });
      }

      // Settings store
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }

      // Knowledge base store
      if (!db.objectStoreNames.contains("knowledge")) {
        const knowledgeStore = db.createObjectStore("knowledge", { keyPath: "id" });
        knowledgeStore.createIndex("by-timestamp", "timestamp");
      }

      // Chat history store
      if (!db.objectStoreNames.contains("chatHistory")) {
        const chatStore = db.createObjectStore("chatHistory", { keyPath: "id" });
        chatStore.createIndex("by-timestamp", "timestamp");
      }
    },
  });

  return dbInstance;
}

// File operations
export async function saveFiles(projectId: string, files: FileNode[]): Promise<void> {
  const db = await getDB();
  await db.put("files", {
    id: projectId,
    data: files,
    lastModified: Date.now(),
  });
}

export async function loadFiles(projectId: string): Promise<FileNode[] | null> {
  const db = await getDB();
  const result = await db.get("files", projectId);
  return result?.data || null;
}

export async function deleteProject(projectId: string): Promise<void> {
  const db = await getDB();
  await db.delete("files", projectId);
}

export async function listProjects(): Promise<string[]> {
  const db = await getDB();
  return db.getAllKeys("files");
}

// Settings operations
export async function saveSetting(key: string, value: any): Promise<void> {
  const db = await getDB();
  await db.put("settings", { key, value });
}

export async function loadSetting<T>(key: string): Promise<T | null> {
  const db = await getDB();
  const result = await db.get("settings", key);
  return result?.value ?? null;
}

// Knowledge base operations
export async function saveKnowledgeEntry(entry: KnowledgeEntry): Promise<void> {
  const db = await getDB();
  await db.put("knowledge", entry);
}

export async function loadKnowledgeEntries(): Promise<KnowledgeEntry[]> {
  const db = await getDB();
  return db.getAllFromIndex("knowledge", "by-timestamp");
}

export async function deleteKnowledgeEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("knowledge", id);
}

// Chat history operations
export async function saveChatMessage(message: {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  model?: AIModel;
}): Promise<void> {
  const db = await getDB();
  await db.put("chatHistory", message);
}

export async function loadChatHistory(): Promise<Array<{
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  model?: AIModel;
}>> {
  const db = await getDB();
  return db.getAllFromIndex("chatHistory", "by-timestamp");
}

export async function clearChatHistory(): Promise<void> {
  const db = await getDB();
  await db.clear("chatHistory");
}

// API keys (encrypted storage would be ideal, but for now using settings)
export async function saveApiKeys(keys: {
  openai?: string;
  anthropic?: string;
  google?: string;
}): Promise<void> {
  await saveSetting("apiKeys", keys);
}

export async function loadApiKeys(): Promise<{
  openai?: string;
  anthropic?: string;
  google?: string;
} | null> {
  return loadSetting("apiKeys");
}

// Theme preference
export async function saveTheme(theme: "dark" | "light"): Promise<void> {
  await saveSetting("theme", theme);
}

export async function loadTheme(): Promise<"dark" | "light" | null> {
  return loadSetting("theme");
}

// Selected AI model
export async function saveAIModel(model: AIModel): Promise<void> {
  await saveSetting("aiModel", model);
}

export async function loadAIModel(): Promise<AIModel | null> {
  return loadSetting("aiModel");
}
