import { useState } from "react";
import { Download, Loader2, FileArchive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIDEStore } from "@/lib/ide-store";
import JSZip from "jszip";
import type { FileNode } from "@shared/schema";

export default function DownloadProject() {
  const { files, findFileById } = useIDEStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const addFilesToZip = (zip: JSZip, nodes: FileNode[], basePath: string = "") => {
    for (const node of nodes) {
      const path = basePath ? `${basePath}/${node.name}` : node.name;
      
      if (node.type === "file" && node.content !== undefined) {
        zip.file(path, node.content);
      } else if (node.type === "directory" && node.children) {
        const folder = zip.folder(path);
        if (folder) {
          addFilesToZip(folder, node.children, "");
        }
      }
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const zip = new JSZip();

      // Get the root folder (my-project)
      const rootFolder = files[0];
      if (rootFolder?.children) {
        addFilesToZip(zip, rootFolder.children, "");
      }

      // Ensure README.md exists
      const readmeContent = `# My Project

This project was created with **The Black Star Forge** - an autonomous AI-IDE.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

- Built with React + Vite
- Created using WebContainer technology
- Zero vendor lock-in

---

*Exported from The Black Star Forge*
`;

      if (!zip.file("README.md")) {
        zip.file("README.md", readmeContent);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = "my-project.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Project downloaded",
        description: "Your project has been exported as a zip file",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not create the zip file",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={isDownloading}
      className="gap-2"
      data-testid="button-download-project"
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      Eject
    </Button>
  );
}
