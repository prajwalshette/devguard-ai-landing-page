import { useState, useEffect } from "react";
import { Settings, Github, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGitHubConfig } from "@/hooks/useGitHubConfig";
import { toast } from "sonner";

export const GitHubSettingsDialog = () => {
  const { config, updateConfig, resetConfig, defaultConfig } = useGitHubConfig();
  const [repoUrl, setRepoUrl] = useState(config.repoUrl);
  const [branch, setBranch] = useState(config.branch);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setRepoUrl(config.repoUrl);
    setBranch(config.branch);
  }, [config]);

  const handleSave = () => {
    const trimmedUrl = repoUrl.trim().replace(/\/$/, "");
    const trimmedBranch = branch.trim();

    if (!trimmedUrl) {
      toast.error("Repository URL is required");
      return;
    }

    if (!trimmedUrl.startsWith("https://github.com/")) {
      toast.error("Please enter a valid GitHub repository URL");
      return;
    }

    if (!trimmedBranch) {
      toast.error("Branch name is required");
      return;
    }

    updateConfig({ repoUrl: trimmedUrl, branch: trimmedBranch });
    toast.success("GitHub settings saved");
    setOpen(false);
  };

  const handleReset = () => {
    resetConfig();
    setRepoUrl(defaultConfig.repoUrl);
    setBranch(defaultConfig.branch);
    toast.success("Settings reset to defaults");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Settings
          </DialogTitle>
          <DialogDescription>
            Configure the repository for applying security fixes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url">Repository URL</Label>
            <Input
              id="repo-url"
              placeholder="https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The GitHub repository where fixes will be applied.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Input
              id="branch"
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The branch to create pull requests against.
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
