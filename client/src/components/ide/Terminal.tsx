import { useRef, useEffect, useState } from "react";
import { Terminal as TerminalIcon, Trash2, Play, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIDEStore } from "@/lib/ide-store";

export default function Terminal() {
  const { 
    terminalOutput, 
    clearTerminalOutput, 
    isContainerReady,
    startDevServer,
    previewUrl,
    isPreviewLoading 
  } = useIDEStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const handleStartServer = async () => {
    if (!isContainerReady || isStarting) return;
    setIsStarting(true);
    try {
      await startDevServer();
    } finally {
      setIsStarting(false);
    }
  };

  const isServerRunning = Boolean(previewUrl);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      <div className="h-8 flex items-center justify-between gap-2 px-3 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3 h-3 text-primary" />
          <span className="text-xs font-mono text-muted-foreground">Terminal</span>
        </div>
        
        <div className="flex items-center gap-1">
          {!isServerRunning && !isStarting && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs gap-1"
              onClick={handleStartServer}
              disabled={!isContainerReady || isPreviewLoading}
              data-testid="button-start-server"
            >
              <Play className="w-3 h-3 text-green-400" />
              Run
            </Button>
          )}
          
          {(isStarting || isPreviewLoading) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
              Starting...
            </div>
          )}
          
          {isServerRunning && !isStarting && (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Running
            </div>
          )}
          
          <Button
            size="icon"
            variant="ghost"
            className="w-5 h-5"
            onClick={clearTerminalOutput}
            data-testid="button-clear-terminal"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-auto p-3 font-mono text-xs">
        {terminalOutput.length === 0 ? (
          <div className="text-muted-foreground">
            {isContainerReady ? (
              <>
                <span className="text-primary">$</span> WebContainer ready. Click "Run" to start the dev server.
              </>
            ) : (
              <>
                <span className="text-primary">$</span> Booting WebContainer...
              </>
            )}
          </div>
        ) : (
          terminalOutput.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap text-foreground/90">
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
