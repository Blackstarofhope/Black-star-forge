import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useIDEStore } from "@/lib/ide-store";
import type { FileNode } from "@shared/schema";

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
}

function FileTreeItem({ node, depth }: FileTreeItemProps) {
  const { activeFileId, setActiveFile, toggleDirectory, createFile, deleteFile } = useIDEStore();
  const [isCreating, setIsCreating] = useState<"file" | "directory" | null>(null);
  const [newName, setNewName] = useState("");

  const isActive = activeFileId === node.id;
  const isDirectory = node.type === "directory";

  const handleClick = () => {
    if (isDirectory) {
      toggleDirectory(node.id);
    } else {
      setActiveFile(node.id);
    }
  };

  const handleCreate = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newName.trim() && isCreating) {
      createFile(node.path, newName.trim(), isCreating);
      setNewName("");
      setIsCreating(null);
    } else if (e.key === "Escape") {
      setNewName("");
      setIsCreating(null);
    }
  };

  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    const iconClass = "w-4 h-4 flex-shrink-0";
    
    switch (ext) {
      case "jsx":
      case "tsx":
        return <File className={cn(iconClass, "text-blue-400")} />;
      case "js":
      case "ts":
        return <File className={cn(iconClass, "text-yellow-400")} />;
      case "css":
        return <File className={cn(iconClass, "text-pink-400")} />;
      case "html":
        return <File className={cn(iconClass, "text-orange-400")} />;
      case "json":
        return <File className={cn(iconClass, "text-green-400")} />;
      default:
        return <File className={cn(iconClass, "text-muted-foreground")} />;
    }
  };

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 px-2 py-1 cursor-pointer hover-elevate rounded transition-colors",
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
          isActive && "border-l-2 border-primary"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
        data-testid={`file-${node.name}`}
      >
        {isDirectory && (
          <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            {node.isOpen ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </span>
        )}
        
        {isDirectory ? (
          node.isOpen ? (
            <FolderOpen className="w-4 h-4 flex-shrink-0 text-primary" />
          ) : (
            <Folder className="w-4 h-4 flex-shrink-0 text-primary" />
          )
        ) : (
          getFileIcon(node.name)
        )}
        
        <span className="font-mono text-xs truncate flex-1">{node.name}</span>
        
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1" style={{ visibility: "visible" }}>
          {isDirectory && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-5 h-5"
                  onClick={(e) => e.stopPropagation()}
                  data-testid={`button-add-${node.name}`}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCreating("file");
                  }}
                  data-testid="menu-new-file"
                >
                  <File className="w-4 h-4 mr-2" />
                  New File
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCreating("directory");
                  }}
                  data-testid="menu-new-folder"
                >
                  <Folder className="w-4 h-4 mr-2" />
                  New Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {node.id !== "root" && (
            <Button
              size="icon"
              variant="ghost"
              className="w-5 h-5 text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                deleteFile(node.id);
              }}
              data-testid={`button-delete-${node.name}`}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
      
      {isCreating && (
        <div style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }} className="py-1">
          <Input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleCreate}
            onBlur={() => {
              setNewName("");
              setIsCreating(null);
            }}
            placeholder={isCreating === "file" ? "filename.js" : "folder-name"}
            className="h-6 text-xs font-mono"
            data-testid="input-new-name"
          />
        </div>
      )}
      
      {isDirectory && node.isOpen && node.children?.map((child) => (
        <FileTreeItem key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

import CloudSyncToggle from "./CloudSyncToggle";

export default function FileExplorer() {
  const { files } = useIDEStore();

  return (
    <div className="h-full flex flex-col">
      <div className="h-10 flex items-center justify-between px-3 border-b border-sidebar-border">
        <span className="text-xs font-sans uppercase tracking-widest font-semibold text-muted-foreground">
          Explorer
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        {files.map((node) => (
          <FileTreeItem key={node.id} node={node} depth={0} />
        ))}
      </div>

      <CloudSyncToggle />
    </div>
  );
}
