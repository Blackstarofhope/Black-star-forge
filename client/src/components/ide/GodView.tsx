import { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { useIDEStore } from "@/lib/ide-store";
import type { FileNode, DependencyNode, DependencyEdge } from "@shared/schema";

// Custom node component for the dependency graph
function DependencyNodeComponent({ data }: { data: { label: string; type: string } }) {
  const typeColors: Record<string, string> = {
    component: "from-cyan-500/20 to-teal-500/20 border-cyan-500/50",
    page: "from-purple-500/20 to-pink-500/20 border-purple-500/50",
    utility: "from-amber-500/20 to-orange-500/20 border-amber-500/50",
    style: "from-pink-500/20 to-rose-500/20 border-pink-500/50",
  };

  return (
    <div
      className={`px-4 py-2 rounded-lg border bg-gradient-to-br backdrop-blur-sm cursor-pointer transition-transform hover:scale-105 ${typeColors[data.type] || typeColors.utility}`}
    >
      <div className="font-mono text-xs text-foreground">{data.label}</div>
      <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
        {data.type}
      </div>
    </div>
  );
}

const nodeTypes = {
  dependency: DependencyNodeComponent,
};

// Parse file content to extract imports
function parseImports(content: string): string[] {
  const imports: string[] = [];
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    // Only include local imports (starting with . or /)
    if (importPath.startsWith(".") || importPath.startsWith("/")) {
      imports.push(importPath);
    }
  }
  
  return imports;
}

// Determine file type for styling
function getFileType(name: string): "component" | "page" | "utility" | "style" {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("page") || lowerName.includes("view")) return "page";
  if (lowerName.endsWith(".css") || lowerName.endsWith(".scss")) return "style";
  if (lowerName.endsWith(".jsx") || lowerName.endsWith(".tsx")) return "component";
  return "utility";
}

// Flatten file tree to get all files
function flattenFiles(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  for (const node of nodes) {
    if (node.type === "file") {
      result.push(node);
    }
    if (node.children) {
      result.push(...flattenFiles(node.children));
    }
  }
  return result;
}

// Resolve import path relative to current file
function resolveImportPath(currentPath: string, importPath: string): string {
  if (importPath.startsWith("/")) {
    return importPath;
  }
  
  const currentDir = currentPath.split("/").slice(0, -1).join("/");
  const parts = [...currentDir.split("/"), ...importPath.split("/")];
  const resolved: string[] = [];
  
  for (const part of parts) {
    if (part === "..") {
      resolved.pop();
    } else if (part !== "." && part !== "") {
      resolved.push(part);
    }
  }
  
  return "/" + resolved.join("/");
}

export default function GodView() {
  const { files, setActiveFile } = useIDEStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Build dependency graph from files
  useEffect(() => {
    const allFiles = flattenFiles(files);
    const jsFiles = allFiles.filter(f => 
      f.name.endsWith(".js") || 
      f.name.endsWith(".jsx") || 
      f.name.endsWith(".ts") || 
      f.name.endsWith(".tsx")
    );

    // Create nodes
    const graphNodes: Node[] = jsFiles.map((file, index) => {
      const cols = 3;
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      return {
        id: file.id,
        type: "dependency",
        position: { x: col * 200, y: row * 120 },
        data: {
          label: file.name,
          type: getFileType(file.name),
          path: file.path,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });

    // Create edges based on imports
    const graphEdges: Edge[] = [];
    const pathToId = new Map(allFiles.map(f => [f.path, f.id]));

    for (const file of jsFiles) {
      if (!file.content) continue;
      
      const imports = parseImports(file.content);
      for (const importPath of imports) {
        let resolved = resolveImportPath(file.path, importPath);
        
        // Try common extensions
        const extensions = ["", ".js", ".jsx", ".ts", ".tsx"];
        let targetId: string | undefined;
        
        for (const ext of extensions) {
          targetId = pathToId.get(resolved + ext);
          if (targetId) break;
          // Try /index variants
          targetId = pathToId.get(resolved + "/index" + ext);
          if (targetId) break;
        }
        
        if (targetId && targetId !== file.id) {
          graphEdges.push({
            id: `${file.id}-${targetId}`,
            source: file.id,
            target: targetId,
            animated: true,
            style: { stroke: "hsl(175, 85%, 45%)", strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "hsl(175, 85%, 45%)",
            },
          });
        }
      }
    }

    setNodes(graphNodes);
    setEdges(graphEdges);
  }, [files, setNodes, setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setActiveFile(node.id);
  }, [setActiveFile]);

  return (
    <div className="h-full flex flex-col">
      <div className="h-10 flex items-center px-3 border-b border-sidebar-border">
        <span className="text-xs font-sans uppercase tracking-widest font-semibold text-muted-foreground">
          God View
        </span>
      </div>
      
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1} 
            color="hsl(220 15% 18%)" 
          />
          <Controls 
            className="bg-card border-card-border"
            showInteractive={false}
          />
          <MiniMap
            nodeStrokeColor="hsl(175, 85%, 45%)"
            nodeColor="hsl(220 18% 10%)"
            maskColor="hsl(220 20% 4% / 0.8)"
            className="bg-card border-card-border"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
