import { useState } from "react";
import { Cloud, CloudOff, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CloudSyncToggle() {
  const [isCloudSyncEnabled, setIsCloudSyncEnabled] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      // Show upgrade dialog (mock - user is not authenticated)
      setShowUpgradeDialog(true);
    } else {
      setIsCloudSyncEnabled(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 p-3 border-t border-sidebar-border">
        <div className="flex-1 flex items-center gap-2">
          {isCloudSyncEnabled ? (
            <Cloud className="w-4 h-4 text-primary" />
          ) : (
            <CloudOff className="w-4 h-4 text-muted-foreground" />
          )}
          <div>
            <Label htmlFor="cloud-sync" className="text-xs font-medium">
              Cloud Sync
            </Label>
            <p className="text-[10px] text-muted-foreground">
              Sync to Firestore
            </p>
          </div>
        </div>
        <Switch
          id="cloud-sync"
          checked={isCloudSyncEnabled}
          onCheckedChange={handleToggle}
          data-testid="switch-cloud-sync"
        />
      </div>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent" />
              Upgrade to Architect Tier
            </DialogTitle>
            <DialogDescription>
              Cloud sync requires the Architect tier for secure file storage across devices.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Architect Tier</span>
                <Badge variant="outline" className="text-primary">
                  Coming Soon
                </Badge>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Cloud className="w-3 h-3 text-primary" />
                  Cloud file sync via Firestore
                </li>
                <li className="flex items-center gap-2">
                  <Cloud className="w-3 h-3 text-primary" />
                  Project versioning & history
                </li>
                <li className="flex items-center gap-2">
                  <Cloud className="w-3 h-3 text-primary" />
                  Team collaboration features
                </li>
              </ul>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Your files are currently saved locally in your browser using IndexedDB.
            </p>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Continue with Local Storage
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
