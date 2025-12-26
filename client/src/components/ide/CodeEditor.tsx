import { useEffect, useRef } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIDEStore } from "@/lib/ide-store";
import { useTheme } from "@/lib/theme-provider";

// Black Star cyberpunk theme for Monaco
const blackStarTheme: Monaco.editor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "", foreground: "e0e8f0", background: "0a0a0f" },
    { token: "comment", foreground: "5c6773", fontStyle: "italic" },
    { token: "keyword", foreground: "00c8aa", fontStyle: "bold" },
    { token: "string", foreground: "a78bfa" },
    { token: "number", foreground: "f59e0b" },
    { token: "type", foreground: "38bdf8" },
    { token: "function", foreground: "22d3ee" },
    { token: "variable", foreground: "e0e8f0" },
    { token: "constant", foreground: "f472b6" },
    { token: "operator", foreground: "00c8aa" },
    { token: "delimiter", foreground: "64748b" },
    { token: "tag", foreground: "f472b6" },
    { token: "attribute.name", foreground: "00c8aa" },
    { token: "attribute.value", foreground: "a78bfa" },
  ],
  colors: {
    "editor.background": "#0a0a0f",
    "editor.foreground": "#e0e8f0",
    "editor.lineHighlightBackground": "#1a1a2e",
    "editor.selectionBackground": "#00c8aa30",
    "editor.inactiveSelectionBackground": "#00c8aa15",
    "editorLineNumber.foreground": "#3a3a5c",
    "editorLineNumber.activeForeground": "#00c8aa",
    "editorCursor.foreground": "#00c8aa",
    "editor.selectionHighlightBackground": "#00c8aa20",
    "editorIndentGuide.background": "#1a1a2e",
    "editorIndentGuide.activeBackground": "#2a2a4e",
    "editorGutter.background": "#0a0a0f",
    "editorWidget.background": "#0f0f18",
    "editorWidget.border": "#1a1a2e",
    "editorSuggestWidget.background": "#0f0f18",
    "editorSuggestWidget.border": "#1a1a2e",
    "editorSuggestWidget.selectedBackground": "#00c8aa30",
    "scrollbarSlider.background": "#2a2a4e80",
    "scrollbarSlider.hoverBackground": "#3a3a5c80",
    "scrollbarSlider.activeBackground": "#00c8aa40",
  },
};

function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
      return "javascript";
    case "jsx":
      return "javascript";
    case "ts":
      return "typescript";
    case "tsx":
      return "typescript";
    case "css":
      return "css";
    case "html":
      return "html";
    case "json":
      return "json";
    case "md":
      return "markdown";
    default:
      return "plaintext";
  }
}

export default function CodeEditor() {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const { theme } = useTheme();
  const {
    activeFileId,
    editorContent,
    openTabs,
    setActiveFile,
    closeTab,
    updateFileContent,
    findFileById,
    syncFileToContainer,
    isContainerReady,
  } = useIDEStore();

  const activeFile = activeFileId ? findFileById(activeFileId) : null;
  const syncTimeoutRef = useRef<number | null>(null);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Register Black Star theme
    monaco.editor.defineTheme("black-star", blackStarTheme);
    monaco.editor.setTheme("black-star");

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'JetBrains Mono', monospace",
      fontLigatures: true,
      minimap: { enabled: true, scale: 1 },
      scrollBeyondLastLine: false,
      renderWhitespace: "selection",
      cursorBlinking: "smooth",
      smoothScrolling: true,
      padding: { top: 16, bottom: 16 },
      lineNumbers: "on",
      glyphMargin: true,
      folding: true,
      bracketPairColorization: { enabled: true },
      guides: { bracketPairs: true, indentation: true },
    });
  };

  const handleEditorChange: OnChange = (value) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value);
      
      // Debounced sync to WebContainer
      if (isContainerReady && activeFile) {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = window.setTimeout(() => {
          syncFileToContainer(activeFile.path, value);
        }, 500);
      }
    }
  };

  // Update editor theme when app theme changes
  useEffect(() => {
    if (editorRef.current) {
      // Black Star theme works best in dark mode
      // For light mode, we could define an alternative, but the app is meant for dark mode
    }
  }, [theme]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Tab bar */}
      <div className="h-8 flex items-center bg-card border-b border-card-border overflow-x-auto">
        {openTabs.map((tabId) => {
          const file = findFileById(tabId);
          if (!file) return null;
          
          const isActive = activeFileId === tabId;
          
          return (
            <div
              key={tabId}
              className={cn(
                "h-full flex items-center gap-2 px-3 border-r border-border cursor-pointer group",
                isActive
                  ? "bg-background border-b-2 border-b-primary"
                  : "hover-elevate"
              )}
              onClick={() => setActiveFile(tabId)}
              data-testid={`tab-${file.name}`}
            >
              <span className="font-mono text-xs whitespace-nowrap">{file.name}</span>
              <Button
                size="icon"
                variant="ghost"
                className="w-4 h-4 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tabId);
                }}
                data-testid={`button-close-tab-${file.name}`}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Editor area */}
      <div className="flex-1">
        {activeFile ? (
          <Editor
            height="100%"
            language={getLanguageFromPath(activeFile.path)}
            value={editorContent}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme="black-star"
            options={{
              readOnly: false,
              automaticLayout: true,
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <span className="text-3xl text-muted-foreground font-mono">{"<>"}</span>
              </div>
              <p className="text-muted-foreground font-mono text-sm">
                Select a file to start editing
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
