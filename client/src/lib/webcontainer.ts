import { WebContainer } from "@webcontainer/api";
import type { FileNode } from "@shared/schema";

let webcontainerInstance: WebContainer | null = null;
let isBooting = false;

// Convert our file tree to WebContainer file system format
function convertToWebContainerFiles(nodes: FileNode[]): Record<string, any> {
  const result: Record<string, any> = {};

  for (const node of nodes) {
    if (node.type === "file") {
      result[node.name] = {
        file: {
          contents: node.content || "",
        },
      };
    } else if (node.type === "directory" && node.children) {
      result[node.name] = {
        directory: convertToWebContainerFiles(node.children),
      };
    }
  }

  return result;
}

export async function bootWebContainer(): Promise<WebContainer> {
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  if (isBooting) {
    // Wait for existing boot to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (webcontainerInstance) {
          clearInterval(checkInterval);
          resolve(webcontainerInstance);
        }
      }, 100);
    });
  }

  isBooting = true;

  try {
    webcontainerInstance = await WebContainer.boot();
    return webcontainerInstance;
  } finally {
    isBooting = false;
  }
}

export async function mountFiles(files: FileNode[]): Promise<void> {
  const container = await bootWebContainer();
  
  // Get the root folder's children (skip the root "my-project" wrapper)
  const rootFolder = files[0];
  if (rootFolder?.children) {
    const webContainerFiles = convertToWebContainerFiles(rootFolder.children);
    await container.mount(webContainerFiles);
  }
}

export async function writeFile(path: string, content: string): Promise<void> {
  const container = await bootWebContainer();
  // Remove leading slash for WebContainer paths
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  await container.fs.writeFile(cleanPath, content);
}

export async function readFile(path: string): Promise<string> {
  const container = await bootWebContainer();
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return await container.fs.readFile(cleanPath, "utf-8");
}

export async function mkdir(path: string): Promise<void> {
  const container = await bootWebContainer();
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  await container.fs.mkdir(cleanPath, { recursive: true });
}

export async function rm(path: string): Promise<void> {
  const container = await bootWebContainer();
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  await container.fs.rm(cleanPath, { recursive: true });
}

export interface ProcessOutput {
  stdout: string[];
  stderr: string[];
  exitCode: number;
}

export async function runCommand(
  command: string,
  args: string[],
  onOutput?: (data: string) => void
): Promise<ProcessOutput> {
  const container = await bootWebContainer();
  
  const process = await container.spawn(command, args);
  
  const stdout: string[] = [];
  const stderr: string[] = [];

  process.output.pipeTo(
    new WritableStream({
      write(data) {
        stdout.push(data);
        onOutput?.(data);
      },
    })
  );

  const exitCode = await process.exit;
  
  return { stdout, stderr, exitCode };
}

export async function installDependencies(
  onOutput?: (data: string) => void
): Promise<ProcessOutput> {
  return runCommand("npm", ["install"], onOutput);
}

export async function startDevServer(
  onOutput?: (data: string) => void,
  onServerReady?: (url: string) => void
): Promise<void> {
  const container = await bootWebContainer();
  
  const process = await container.spawn("npm", ["run", "dev"]);

  process.output.pipeTo(
    new WritableStream({
      write(data) {
        onOutput?.(data);
      },
    })
  );

  // Listen for server-ready event
  container.on("server-ready", (port, url) => {
    onServerReady?.(url);
  });
}

export async function teardown(): Promise<void> {
  if (webcontainerInstance) {
    await webcontainerInstance.teardown();
    webcontainerInstance = null;
  }
}

export function getWebContainer(): WebContainer | null {
  return webcontainerInstance;
}
