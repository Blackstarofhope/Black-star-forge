import { useState } from "react";
import {
  Rocket,
  Cloud,
  Check,
  X,
  Copy,
  ExternalLink,
  Loader2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { useIDEStore } from "@/lib/ide-store";
import type { DeploymentProvider, DeploymentStatus } from "@shared/schema";

interface DeployStep {
  provider: DeploymentProvider;
  status: "pending" | "active" | "success" | "error";
  message: string;
}

export default function DeploymentModal() {
  const { deployment, setDeploymentStatus, getAllFiles } = useIDEStore();
  const [isOpen, setIsOpen] = useState(false);
  const [steps, setSteps] = useState<DeployStep[]>([
    { provider: "vercel", status: "pending", message: "Waiting to deploy..." },
    { provider: "netlify", status: "pending", message: "Failover ready" },
  ]);
  const { toast } = useToast();

  const handleDeploy = async () => {
    setDeploymentStatus({ status: "deploying", provider: "vercel", url: null, error: null });
    
    // Step 1: Try Vercel
    setSteps([
      { provider: "vercel", status: "active", message: "Connecting to Vercel..." },
      { provider: "netlify", status: "pending", message: "Failover ready" },
    ]);

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate Vercel failure (for demo purposes)
    const vercelSuccess = Math.random() > 0.5;

    if (vercelSuccess) {
      const deployedUrl = `https://blackstar-${Date.now().toString(36)}.vercel.app`;
      setSteps([
        { provider: "vercel", status: "success", message: "Deployed successfully!" },
        { provider: "netlify", status: "pending", message: "Not needed" },
      ]);
      setDeploymentStatus({
        status: "success",
        provider: "vercel",
        url: deployedUrl,
        error: null,
      });
      toast({
        title: "Deployment successful",
        description: `Your app is live at ${deployedUrl}`,
      });
    } else {
      // Vercel failed, try Netlify
      setSteps([
        { provider: "vercel", status: "error", message: "Quota exceeded (402)" },
        { provider: "netlify", status: "active", message: "Failover activated..." },
      ]);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const netlifySuccess = true; // Netlify always succeeds in demo
      
      if (netlifySuccess) {
        const deployedUrl = `https://blackstar-${Date.now().toString(36)}.netlify.app`;
        setSteps([
          { provider: "vercel", status: "error", message: "Quota exceeded (402)" },
          { provider: "netlify", status: "success", message: "Deployed successfully!" },
        ]);
        setDeploymentStatus({
          status: "success",
          provider: "netlify",
          url: deployedUrl,
          error: null,
        });
        toast({
          title: "Failover successful",
          description: `Deployed to Netlify: ${deployedUrl}`,
        });
      } else {
        setSteps([
          { provider: "vercel", status: "error", message: "Quota exceeded (402)" },
          { provider: "netlify", status: "error", message: "Deployment failed" },
        ]);
        setDeploymentStatus({
          status: "error",
          provider: null,
          url: null,
          error: "Both deployment targets failed",
        });
        toast({
          title: "Deployment failed",
          description: "Both Vercel and Netlify deployments failed",
          variant: "destructive",
        });
      }
    }
  };

  const handleCopyUrl = () => {
    if (deployment.url) {
      navigator.clipboard.writeText(deployment.url);
      toast({
        title: "URL copied",
        description: "Deployment URL copied to clipboard",
      });
    }
  };

  const handleReset = () => {
    setDeploymentStatus({ status: "idle", provider: null, url: null, error: null });
    setSteps([
      { provider: "vercel", status: "pending", message: "Waiting to deploy..." },
      { provider: "netlify", status: "pending", message: "Failover ready" },
    ]);
  };

  const getStepIcon = (status: DeployStep["status"]) => {
    switch (status) {
      case "pending":
        return <div className="w-3 h-3 rounded-full bg-muted" />;
      case "active":
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case "success":
        return <Check className="w-4 h-4 text-green-500" />;
      case "error":
        return <X className="w-4 h-4 text-destructive" />;
    }
  };

  const getProviderIcon = (provider: DeploymentProvider) => {
    return provider === "vercel" ? (
      <span className="text-xs font-bold">V</span>
    ) : (
      <span className="text-xs font-bold">N</span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "gap-2 px-6",
            deployment.status === "deploying" && "deploy-pulse"
          )}
          data-testid="button-deploy"
        >
          <Rocket className="w-4 h-4" />
          Deploy Live
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" />
            Never-Down Deployment
          </DialogTitle>
          <DialogDescription>
            Automatic failover from Vercel to Netlify for guaranteed uptime.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Deployment steps visualization */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.provider}>
                <div
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all",
                    step.status === "active" && "border-primary bg-primary/5",
                    step.status === "success" && "border-green-500/50 bg-green-500/5",
                    step.status === "error" && "border-destructive/50 bg-destructive/5",
                    step.status === "pending" && "border-border bg-muted/30"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {getProviderIcon(step.provider)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm capitalize">
                        {step.provider}
                      </span>
                      {index === 0 && (
                        <Badge variant="outline" className="text-[10px] h-4">Primary</Badge>
                      )}
                      {index === 1 && (
                        <Badge variant="secondary" className="text-[10px] h-4">Failover</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{step.message}</p>
                  </div>
                  
                  {getStepIcon(step.status)}
                </div>
                
                {index === 0 && (
                  <div className="flex justify-center py-1">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Success state */}
          {deployment.status === "success" && deployment.url && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="font-medium text-sm text-green-500">Deployed!</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-background/50 px-2 py-1 rounded truncate">
                  {deployment.url}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-7 h-7"
                  onClick={handleCopyUrl}
                  data-testid="button-copy-url"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-7 h-7"
                  onClick={() => window.open(deployment.url!, "_blank")}
                  data-testid="button-visit-url"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Error state */}
          {deployment.status === "error" && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="font-medium text-sm text-destructive">Deployment Failed</span>
              </div>
              <p className="text-xs text-muted-foreground">{deployment.error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            {deployment.status !== "idle" && (
              <Button variant="outline" onClick={handleReset} data-testid="button-reset-deploy">
                Reset
              </Button>
            )}
            <Button
              onClick={handleDeploy}
              disabled={deployment.status === "deploying"}
              data-testid="button-start-deploy"
            >
              {deployment.status === "deploying" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  {deployment.status === "error" ? "Retry" : "Deploy Now"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
