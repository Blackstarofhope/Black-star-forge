import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Files,
  Network,
  BookOpen,
  Terminal as TerminalIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIDEStore } from "@/lib/ide-store";

import FileExplorer from "./FileExplorer";
import CodeEditor from "./CodeEditor";
import LivePreview from "./LivePreview";
import GodView from "./GodView";
import KnowledgeBase from "./KnowledgeBase";
import Terminal from "./Terminal";
import NazaharyChat from "./NazaharyChat";
import DeploymentModal from "./DeploymentModal";
import MultiplayerSession from "./MultiplayerSession";
import DownloadProject from "./DownloadProject";
import BackendWizard from "./BackendWizard";
import ThemeToggle from "./ThemeToggle";

export default function IDELayout() {
  const { activeSidebarTab, setActiveSidebarTab } = useIDEStore();
  const [showTerminal, setShowTerminal] = useState(true);

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden scanlines relative">
      {/* Header */}
      <header className="h-12 flex items-center justify-between gap-4 px-4 border-b border-border bg-sidebar z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">BS</span>
            </div>
            <h1 className="font-mono text-sm font-bold text-glow-teal hidden sm:block">
              The Black Star Forge
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <BackendWizard />
          <MultiplayerSession />
          <DownloadProject />
          <Separator orientation="vertical" className="h-6 mx-1" />
          <DeploymentModal />
          <ThemeToggle />
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left Sidebar */}
          <ResizablePanel defaultSize={18} minSize={12} maxSize={30}>
            <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
              {/* Sidebar tabs */}
              <Tabs
                value={activeSidebarTab}
                onValueChange={(v) => setActiveSidebarTab(v as "files" | "godview" | "knowledge")}
                className="flex flex-col h-full"
              >
                <TabsList className="grid grid-cols-3 h-10 rounded-none bg-sidebar border-b border-sidebar-border">
                  <TabsTrigger
                    value="files"
                    className="gap-1 text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                    data-testid="tab-files"
                  >
                    <Files className="w-3 h-3" />
                    <span className="hidden lg:inline">Files</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="godview"
                    className="gap-1 text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                    data-testid="tab-godview"
                  >
                    <Network className="w-3 h-3" />
                    <span className="hidden lg:inline">God View</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="knowledge"
                    className="gap-1 text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                    data-testid="tab-knowledge"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span className="hidden lg:inline">KB</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="files" className="flex-1 m-0 overflow-hidden">
                  <FileExplorer />
                </TabsContent>
                <TabsContent value="godview" className="flex-1 m-0 overflow-hidden">
                  <GodView />
                </TabsContent>
                <TabsContent value="knowledge" className="flex-1 m-0 overflow-hidden">
                  <KnowledgeBase />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center - Editor and Terminal */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={showTerminal ? 75 : 100} minSize={30}>
                  <CodeEditor />
                </ResizablePanel>

                {showTerminal && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={25} minSize={10} maxSize={50}>
                      <Terminal />
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>

              {/* Terminal toggle */}
              <button
                onClick={() => setShowTerminal(!showTerminal)}
                className="h-6 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground border-t border-border bg-muted/30 transition-colors"
                data-testid="button-toggle-terminal"
              >
                <TerminalIcon className="w-3 h-3" />
                Terminal
                {showTerminal ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronUp className="w-3 h-3" />
                )}
              </button>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right - Live Preview */}
          <ResizablePanel defaultSize={32} minSize={20} maxSize={50}>
            <LivePreview />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Nazahary Chat (floating) */}
      <NazaharyChat />
    </div>
  );
}
