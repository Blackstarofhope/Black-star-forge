import { useState } from "react";
import { RefreshCw, ExternalLink, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIDEStore } from "@/lib/ide-store";
import { cn } from "@/lib/utils";

export default function LivePreview() {
  const { previewUrl, isPreviewLoading, isContainerReady } = useIDEStore();
  const [inputUrl, setInputUrl] = useState(previewUrl);

  const handleRefresh = () => {
    const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
    if (iframe && previewUrl) {
      iframe.src = previewUrl;
    }
  };

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl) {
      const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
      if (iframe) {
        iframe.src = inputUrl;
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="h-10 flex items-center gap-2 px-3 border-b border-card-border">
        <span className="text-xs font-sans uppercase tracking-widest font-semibold text-muted-foreground">
          Preview
        </span>
      </div>

      {/* URL bar */}
      <div className="h-10 flex items-center gap-2 px-3 border-b border-card-border bg-muted/30">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleRefresh}
          disabled={!previewUrl || isPreviewLoading}
          data-testid="button-refresh-preview"
        >
          <RefreshCw className={cn("w-4 h-4", isPreviewLoading && "animate-spin")} />
        </Button>
        
        <form onSubmit={handleNavigate} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              value={inputUrl || previewUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="localhost:5173"
              className="h-7 pl-8 font-mono text-xs"
              data-testid="input-preview-url"
            />
          </div>
        </form>
        
        {previewUrl && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => window.open(previewUrl, "_blank")}
            data-testid="button-open-external"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Preview iframe */}
      <div className="flex-1 relative bg-white dark:bg-[#0a0a0f]">
        {!isContainerReady ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <p className="text-muted-foreground font-mono text-sm mb-2">
                Initializing WebContainer...
              </p>
              <p className="text-muted-foreground/60 text-xs">
                Setting up browser-native Node.js environment
              </p>
            </div>
          </div>
        ) : !previewUrl ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Globe className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-mono text-sm mb-2">
                No preview available
              </p>
              <p className="text-muted-foreground/60 text-xs">
                Run npm run dev to start the preview
              </p>
            </div>
          </div>
        ) : (
          <iframe
            id="preview-iframe"
            src={previewUrl}
            className="w-full h-full border-0"
            title="Live Preview"
            sandbox="allow-scripts allow-forms allow-same-origin allow-modals allow-popups"
            data-testid="iframe-preview"
          />
        )}
      </div>
    </div>
  );
}
