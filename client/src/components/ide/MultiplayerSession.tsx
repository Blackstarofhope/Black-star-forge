import { useState } from "react";
import { Users, Link2, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useIDEStore } from "@/lib/ide-store";
import { nanoid } from "nanoid";

export default function MultiplayerSession() {
  const { sessionId, setSessionId, isCollaborating, setIsCollaborating } = useIDEStore();
  const [isOpen, setIsOpen] = useState(false);
  const [joinSessionId, setJoinSessionId] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCreateSession = () => {
    const newSessionId = nanoid(10);
    setSessionId(newSessionId);
    setIsCollaborating(true);
    toast({
      title: "Session created",
      description: "Share the session link with collaborators",
    });
  };

  const handleJoinSession = () => {
    if (joinSessionId.trim()) {
      setSessionId(joinSessionId.trim());
      setIsCollaborating(true);
      toast({
        title: "Joined session",
        description: "You're now collaborating in real-time",
      });
      setJoinSessionId("");
    }
  };

  const handleLeaveSession = () => {
    setSessionId(null);
    setIsCollaborating(false);
    toast({
      title: "Left session",
      description: "You've disconnected from the collaboration",
    });
  };

  const handleCopyLink = () => {
    if (sessionId) {
      const link = `${window.location.origin}?session=${sessionId}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copied",
        description: "Session link copied to clipboard",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isCollaborating ? "default" : "outline"}
          size="sm"
          className="gap-2"
          data-testid="button-multiplayer"
        >
          <Users className="w-4 h-4" />
          {isCollaborating ? (
            <Badge variant="secondary" className="ml-1 text-[10px] h-4">
              Live
            </Badge>
          ) : (
            "Ghost Protocol"
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Ghost Protocol - Multiplayer
          </DialogTitle>
          <DialogDescription>
            Collaborate in real-time with others. Share your session link for instant access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {isCollaborating && sessionId ? (
            <>
              {/* Active session */}
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium">Session Active</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {sessionId}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={`${window.location.origin}?session=${sessionId}`}
                    className="font-mono text-xs"
                    data-testid="input-session-link"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCopyLink}
                    data-testid="button-copy-session"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={handleLeaveSession}
                className="w-full"
                data-testid="button-leave-session"
              >
                <X className="w-4 h-4 mr-2" />
                Leave Session
              </Button>
            </>
          ) : (
            <>
              {/* Create new session */}
              <div className="space-y-2">
                <Button
                  onClick={handleCreateSession}
                  className="w-full"
                  data-testid="button-create-session"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Create New Session
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Generate a shareable link for real-time collaboration
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Join existing session */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={joinSessionId}
                    onChange={(e) => setJoinSessionId(e.target.value)}
                    placeholder="Enter session ID..."
                    className="font-mono text-xs"
                    data-testid="input-join-session"
                  />
                  <Button
                    variant="outline"
                    onClick={handleJoinSession}
                    disabled={!joinSessionId.trim()}
                    data-testid="button-join-session"
                  >
                    Join
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Join an existing session with a shared link
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
