import { create } from "zustand";
import type { FileNode, AIModel, ChatMessage, KnowledgeEntry, DeploymentState, DependencyNode, DependencyEdge } from "@shared/schema";
import { nanoid } from "nanoid";
import * as idb from "./idb-storage";
import * as webcontainer from "./webcontainer";

// Default starter files for a new project
const defaultFiles: FileNode[] = [
  {
    id: "root",
    name: "my-project",
    type: "directory",
    path: "/",
    isOpen: true,
    children: [
      {
        id: "package-json",
        name: "package.json",
        type: "file",
        path: "/package.json",
        content: JSON.stringify({
          name: "my-project",
          version: "1.0.0",
          type: "module",
          scripts: {
            dev: "vite",
            build: "vite build",
            preview: "vite preview"
          },
          dependencies: {
            react: "^18.2.0",
            "react-dom": "^18.2.0"
          },
          devDependencies: {
            vite: "^5.0.0",
            "@vitejs/plugin-react": "^4.2.0"
          }
        }, null, 2),
      },
      {
        id: "index-html",
        name: "index.html",
        type: "file",
        path: "/index.html",
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
      },
      {
        id: "vite-config",
        name: "vite.config.js",
        type: "file",
        path: "/vite.config.js",
        content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,
      },
      {
        id: "src",
        name: "src",
        type: "directory",
        path: "/src",
        isOpen: true,
        children: [
          {
            id: "main-jsx",
            name: "main.jsx",
            type: "file",
            path: "/src/main.jsx",
            content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
          },
          {
            id: "app-jsx",
            name: "App.jsx",
            type: "file",
            path: "/src/App.jsx",
            content: `import { useState } from 'react'
import Header from './components/Header.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <Header />
      <main>
        <h1>Welcome to Black Star Forge</h1>
        <button onClick={() => setCount(c => c + 1)}>
          Count: {count}
        </button>
      </main>
    </div>
  )
}

export default App`,
          },
          {
            id: "index-css",
            name: "index.css",
            type: "file",
            path: "/src/index.css",
            content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, sans-serif;
  background: #0a0a0f;
  color: #e0e0e0;
  min-height: 100vh;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: #00c8aa;
  margin-bottom: 1rem;
}

button {
  background: linear-gradient(135deg, #00c8aa, #8b5cf6);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
}

button:hover {
  transform: scale(1.05);
}`,
          },
          {
            id: "components",
            name: "components",
            type: "directory",
            path: "/src/components",
            isOpen: false,
            children: [
              {
                id: "header-jsx",
                name: "Header.jsx",
                type: "file",
                path: "/src/components/Header.jsx",
                content: `export default function Header() {
  return (
    <header style={{
      padding: '1rem',
      borderBottom: '1px solid #1a1a2e',
      marginBottom: '2rem'
    }}>
      <nav>
        <span style={{ color: '#00c8aa', fontWeight: 'bold' }}>
          My App
        </span>
      </nav>
    </header>
  )
}`,
              },
            ],
          },
        ],
      },
    ],
  },
];

interface IDEState {
  // File system
  files: FileNode[];
  activeFileId: string | null;
  openTabs: string[];
  
  // Editor
  editorContent: string;
  
  // Preview
  previewUrl: string;
  isPreviewLoading: boolean;
  
  // WebContainer
  isContainerReady: boolean;
  terminalOutput: string[];
  
  // God View
  dependencyNodes: DependencyNode[];
  dependencyEdges: DependencyEdge[];
  
  // AI Chat
  chatMessages: ChatMessage[];
  aiModel: AIModel;
  apiKeys: { openai?: string; anthropic?: string; google?: string };
  isChatOpen: boolean;
  isListening: boolean;
  
  // Knowledge Base
  knowledgeEntries: KnowledgeEntry[];
  hiveContributeEnabled: boolean;
  
  // Deployment
  deployment: DeploymentState;
  
  // Multiplayer
  sessionId: string | null;
  isCollaborating: boolean;
  
  // Sidebar
  activeSidebarTab: "files" | "godview" | "knowledge";
  
  // Actions
  setFiles: (files: FileNode[]) => void;
  setActiveFile: (id: string | null) => void;
  updateFileContent: (id: string, content: string) => void;
  openTab: (id: string) => void;
  closeTab: (id: string) => void;
  toggleDirectory: (id: string) => void;
  createFile: (parentPath: string, name: string, type: "file" | "directory", content?: string) => void;
  deleteFile: (id: string) => void;
  
  setEditorContent: (content: string) => void;
  setPreviewUrl: (url: string) => void;
  setPreviewLoading: (loading: boolean) => void;
  setContainerReady: (ready: boolean) => void;
  addTerminalOutput: (output: string) => void;
  clearTerminalOutput: () => void;
  
  setDependencyGraph: (nodes: DependencyNode[], edges: DependencyEdge[]) => void;
  
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => ChatMessage;
  setAIModel: (model: AIModel) => void;
  setApiKey: (provider: "openai" | "anthropic" | "google", key: string) => void;
  toggleChat: () => void;
  setIsListening: (listening: boolean) => void;
  
  addKnowledgeEntry: (entry: Omit<KnowledgeEntry, "id" | "timestamp">) => void;
  removeKnowledgeEntry: (id: string) => void;
  toggleHiveContribute: () => void;
  
  setDeploymentStatus: (status: DeploymentState) => void;
  
  setSessionId: (id: string | null) => void;
  setIsCollaborating: (collaborating: boolean) => void;
  
  setActiveSidebarTab: (tab: "files" | "godview" | "knowledge") => void;
  
  // File finder helper
  findFileById: (id: string) => FileNode | undefined;
  findFileByPath: (path: string) => FileNode | undefined;
  getAllFiles: () => FileNode[];
  
  // Persistence and WebContainer
  initializeFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
  bootContainer: () => Promise<void>;
  syncFileToContainer: (path: string, content: string) => Promise<void>;
  runContainerCommand: (command: string, args: string[]) => Promise<void>;
  startDevServer: () => Promise<void>;
}

const findInTree = (nodes: FileNode[], id: string): FileNode | undefined => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findInTree(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

const findByPathInTree = (nodes: FileNode[], path: string): FileNode | undefined => {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findByPathInTree(node.children, path);
      if (found) return found;
    }
  }
  return undefined;
};

const getAllFilesFlat = (nodes: FileNode[]): FileNode[] => {
  const result: FileNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children) {
      result.push(...getAllFilesFlat(node.children));
    }
  }
  return result;
};

const updateNodeInTree = (nodes: FileNode[], id: string, updater: (node: FileNode) => FileNode): FileNode[] => {
  return nodes.map(node => {
    if (node.id === id) {
      return updater(node);
    }
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, id, updater) };
    }
    return node;
  });
};

export const useIDEStore = create<IDEState>((set, get) => ({
  // Initial state
  files: defaultFiles,
  activeFileId: "app-jsx",
  openTabs: ["app-jsx"],
  editorContent: defaultFiles[0]?.children?.find(c => c.id === "src")?.children?.find(c => c.id === "app-jsx")?.content || "",
  previewUrl: "",
  isPreviewLoading: false,
  isContainerReady: false,
  terminalOutput: [],
  dependencyNodes: [],
  dependencyEdges: [],
  chatMessages: [],
  aiModel: "gpt-4",
  apiKeys: {},
  isChatOpen: false,
  isListening: false,
  knowledgeEntries: [],
  hiveContributeEnabled: false,
  deployment: { status: "idle", provider: null, url: null, error: null },
  sessionId: null,
  isCollaborating: false,
  activeSidebarTab: "files",
  
  // Actions
  setFiles: (files) => set({ files }),
  
  setActiveFile: (id) => {
    if (!id) {
      set({ activeFileId: null, editorContent: "" });
      return;
    }
    const file = get().findFileById(id);
    if (file && file.type === "file") {
      set({ activeFileId: id, editorContent: file.content || "" });
      if (!get().openTabs.includes(id)) {
        set({ openTabs: [...get().openTabs, id] });
      }
    }
  },
  
  updateFileContent: (id, content) => {
    set({
      files: updateNodeInTree(get().files, id, (node) => ({ ...node, content })),
      editorContent: get().activeFileId === id ? content : get().editorContent,
    });
  },
  
  openTab: (id) => {
    if (!get().openTabs.includes(id)) {
      set({ openTabs: [...get().openTabs, id] });
    }
    get().setActiveFile(id);
  },
  
  closeTab: (id) => {
    const tabs = get().openTabs.filter(t => t !== id);
    set({ openTabs: tabs });
    if (get().activeFileId === id) {
      get().setActiveFile(tabs[tabs.length - 1] || null);
    }
  },
  
  toggleDirectory: (id) => {
    set({
      files: updateNodeInTree(get().files, id, (node) => ({
        ...node,
        isOpen: !node.isOpen,
      })),
    });
  },
  
  createFile: (parentPath, name, type, content) => {
    const newId = nanoid();
    const newPath = parentPath === "/" ? `/${name}` : `${parentPath}/${name}`;
    const fileContent = type === "file" ? (content || "") : undefined;

    const newNode: FileNode = {
      id: newId,
      name,
      type,
      path: newPath,
      content: fileContent,
      children: type === "directory" ? [] : undefined,
      isOpen: type === "directory" ? false : undefined,
    };
    
    const addToParent = (nodes: FileNode[], targetPath: string): FileNode[] => {
      return nodes.map(node => {
        if (node.path === targetPath && node.type === "directory") {
          return { ...node, children: [...(node.children || []), newNode], isOpen: true };
        }
        if (node.children) {
          return { ...node, children: addToParent(node.children, targetPath) };
        }
        return node;
      });
    };
    
    set({ files: addToParent(get().files, parentPath) });
    
    // Mirror to WebContainer
    if (get().isContainerReady) {
      if (type === "file") {
        webcontainer.writeFile(newPath, fileContent || "").catch(console.error);
      } else {
        webcontainer.mkdir(newPath).catch(console.error);
      }
    }
  },
  
  deleteFile: (id) => {
    // Get file path before removing from tree
    const fileToDelete = findInTree(get().files, id);
    const pathToDelete = fileToDelete?.path;
    const removeFromTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.filter(node => node.id !== id).map(node => ({
        ...node,
        children: node.children ? removeFromTree(node.children) : undefined,
      }));
    };
    
    set({
      files: removeFromTree(get().files),
      openTabs: get().openTabs.filter(t => t !== id),
      activeFileId: get().activeFileId === id ? null : get().activeFileId,
    });
    
    // Mirror deletion to WebContainer
    if (get().isContainerReady && pathToDelete) {
      webcontainer.rm(pathToDelete).catch(console.error);
    }
  },
  
  setEditorContent: (content) => set({ editorContent: content }),
  setPreviewUrl: (url) => set({ previewUrl: url }),
  setPreviewLoading: (loading) => set({ isPreviewLoading: loading }),
  setContainerReady: (ready) => set({ isContainerReady: ready }),
  addTerminalOutput: (output) => set({ terminalOutput: [...get().terminalOutput, output] }),
  clearTerminalOutput: () => set({ terminalOutput: [] }),
  
  setDependencyGraph: (nodes, edges) => set({ dependencyNodes: nodes, dependencyEdges: edges }),
  
  addChatMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: nanoid(),
      timestamp: Date.now(),
    };
    set({ chatMessages: [...get().chatMessages, newMessage] });
    // Persist immediately
    idb.saveChatMessage(newMessage);
    return newMessage;
  },
  
  setAIModel: (model) => {
    set({ aiModel: model });
    idb.saveAIModel(model);
  },
  setApiKey: (provider, key) => {
    const newKeys = { ...get().apiKeys, [provider]: key };
    set({ apiKeys: newKeys });
    idb.saveApiKeys(newKeys);
  },
  toggleChat: () => set({ isChatOpen: !get().isChatOpen }),
  setIsListening: (listening) => set({ isListening: listening }),
  
  addKnowledgeEntry: (entry) => {
    const newEntry: KnowledgeEntry = {
      ...entry,
      id: nanoid(),
      timestamp: Date.now(),
    };
    set({ knowledgeEntries: [...get().knowledgeEntries, newEntry] });
    // Persist immediately
    idb.saveKnowledgeEntry(newEntry);
  },
  
  removeKnowledgeEntry: (id) => {
    set({ knowledgeEntries: get().knowledgeEntries.filter(e => e.id !== id) });
    // Remove from storage
    idb.deleteKnowledgeEntry(id);
  },
  
  toggleHiveContribute: () => set({ hiveContributeEnabled: !get().hiveContributeEnabled }),
  
  setDeploymentStatus: (status) => set({ deployment: status }),
  
  setSessionId: (id) => set({ sessionId: id }),
  setIsCollaborating: (collaborating) => set({ isCollaborating: collaborating }),
  
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  
  findFileById: (id) => findInTree(get().files, id),
  findFileByPath: (path) => findByPathInTree(get().files, path),
  getAllFiles: () => getAllFilesFlat(get().files),
  
  // Persistence - Load from IndexedDB
  initializeFromStorage: async () => {
    try {
      // Load files
      const savedFiles = await idb.loadFiles("default-project");
      if (savedFiles && savedFiles.length > 0) {
        set({ files: savedFiles });
      }
      
      // Load API keys
      const savedKeys = await idb.loadApiKeys();
      if (savedKeys) {
        set({ apiKeys: savedKeys });
      }
      
      // Load AI model preference
      const savedModel = await idb.loadAIModel();
      if (savedModel) {
        set({ aiModel: savedModel });
      }
      
      // Load knowledge entries
      const savedKnowledge = await idb.loadKnowledgeEntries();
      if (savedKnowledge.length > 0) {
        set({ knowledgeEntries: savedKnowledge });
      }
      
      // Load chat history
      const savedChat = await idb.loadChatHistory();
      if (savedChat.length > 0) {
        set({ chatMessages: savedChat as ChatMessage[] });
      }
    } catch (error) {
      console.error("Failed to load from storage:", error);
    }
  },
  
  // Persistence - Save to IndexedDB
  saveToStorage: async () => {
    try {
      await idb.saveFiles("default-project", get().files);
      await idb.saveApiKeys(get().apiKeys);
      await idb.saveAIModel(get().aiModel);
    } catch (error) {
      console.error("Failed to save to storage:", error);
    }
  },
  
  // WebContainer - Boot and mount files
  bootContainer: async () => {
    try {
      get().addTerminalOutput("[WebContainer] Booting...");
      await webcontainer.bootWebContainer();
      get().addTerminalOutput("[WebContainer] Ready");
      
      // Mount initial files
      get().addTerminalOutput("[WebContainer] Mounting files...");
      await webcontainer.mountFiles(get().files);
      get().addTerminalOutput("[WebContainer] Files mounted");
      
      set({ isContainerReady: true });
    } catch (error) {
      get().addTerminalOutput(`[WebContainer] Boot failed: ${error}`);
      console.error("WebContainer boot failed:", error);
    }
  },
  
  // WebContainer - Sync a file change
  syncFileToContainer: async (path, content) => {
    if (!get().isContainerReady) return;
    try {
      await webcontainer.writeFile(path, content);
    } catch (error) {
      console.error("Failed to sync file to container:", error);
    }
  },
  
  // WebContainer - Run a command
  runContainerCommand: async (command, args) => {
    if (!get().isContainerReady) {
      get().addTerminalOutput("[WebContainer] Container not ready");
      return;
    }
    
    get().addTerminalOutput(`$ ${command} ${args.join(" ")}`);
    
    const result = await webcontainer.runCommand(command, args, (data) => {
      get().addTerminalOutput(data);
    });
    
    if (result.exitCode !== 0) {
      get().addTerminalOutput(`[Exit code: ${result.exitCode}]`);
    }
  },
  
  // WebContainer - Start dev server
  startDevServer: async () => {
    if (!get().isContainerReady) {
      get().addTerminalOutput("[WebContainer] Container not ready");
      return;
    }
    
    set({ isPreviewLoading: true });
    get().addTerminalOutput("[WebContainer] Installing dependencies...");
    
    await webcontainer.installDependencies((data) => {
      get().addTerminalOutput(data);
    });
    
    get().addTerminalOutput("[WebContainer] Starting dev server...");
    
    await webcontainer.startDevServer(
      (data) => {
        get().addTerminalOutput(data);
      },
      (url) => {
        set({ previewUrl: url, isPreviewLoading: false });
        get().addTerminalOutput(`[WebContainer] Server ready at ${url}`);
      }
    );
  },
}));
