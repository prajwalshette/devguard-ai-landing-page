import { useState } from "react";
import {
  Plus,
  Search,
  Settings2,
  RefreshCw,
  Shield,
  GitBranch,
  Clock,
  MoreVertical,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Repository {
  id: string;
  name: string;
  fullName: string;
  branch: string;
  lastScan: string;
  status: "healthy" | "warning" | "critical";
  issueCount: number;
  autoScan: boolean;
  scanOnPR: boolean;
}

const mockRepositories: Repository[] = [
  {
    id: "1",
    name: "frontend-app",
    fullName: "acme-org/frontend-app",
    branch: "main",
    lastScan: "2 hours ago",
    status: "healthy",
    issueCount: 2,
    autoScan: true,
    scanOnPR: true,
  },
  {
    id: "2",
    name: "backend-api",
    fullName: "acme-org/backend-api",
    branch: "main",
    lastScan: "1 day ago",
    status: "warning",
    issueCount: 8,
    autoScan: true,
    scanOnPR: true,
  },
  {
    id: "3",
    name: "mobile-app",
    fullName: "acme-org/mobile-app",
    branch: "develop",
    lastScan: "3 days ago",
    status: "critical",
    issueCount: 15,
    autoScan: false,
    scanOnPR: true,
  },
  {
    id: "4",
    name: "shared-libs",
    fullName: "acme-org/shared-libs",
    branch: "main",
    lastScan: "5 hours ago",
    status: "healthy",
    issueCount: 0,
    autoScan: true,
    scanOnPR: false,
  },
];

const StatusIcon = ({ status }: { status: Repository["status"] }) => {
  switch (status) {
    case "healthy":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-severity-medium" />;
    case "critical":
      return <XCircle className="h-4 w-4 text-severity-high" />;
  }
};

const StatusBadge = ({ status }: { status: Repository["status"] }) => {
  const variants = {
    healthy: "bg-green-500/20 text-green-500",
    warning: "bg-severity-medium/20 text-severity-medium",
    critical: "bg-severity-high/20 text-severity-high",
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${variants[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Repositories = () => {
  const [repositories, setRepositories] = useState(mockRepositories);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  const filteredRepos = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleScan = (repoId: string) => {
    toast.success("Scan initiated", {
      description: "Security scan has been queued for this repository.",
    });
  };

  const handleRemove = (repoId: string) => {
    setRepositories((prev) => prev.filter((r) => r.id !== repoId));
    toast.success("Repository removed");
  };

  const handleOpenSettings = (repo: Repository) => {
    setSelectedRepo(repo);
    setSettingsDialogOpen(true);
  };

  const handleSaveSettings = () => {
    if (selectedRepo) {
      setRepositories((prev) =>
        prev.map((r) => (r.id === selectedRepo.id ? selectedRepo : r))
      );
      toast.success("Settings saved");
      setSettingsDialogOpen(false);
    }
  };

  const handleAddRepository = () => {
    toast.success("Repository connected", {
      description: "New repository has been added successfully.",
    });
    setAddDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Repositories</h1>
            <p className="text-muted-foreground">
              Manage connected repositories and scan settings
            </p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Repository
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect Repository</DialogTitle>
                <DialogDescription>
                  Connect a GitHub repository to enable security scanning.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="repo-url">Repository URL</Label>
                  <Input
                    id="repo-url"
                    placeholder="https://github.com/org/repo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Default Branch</Label>
                  <Select defaultValue="main">
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">main</SelectItem>
                      <SelectItem value="master">master</SelectItem>
                      <SelectItem value="develop">develop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Auto-scan on push</p>
                      <p className="text-xs text-muted-foreground">
                        Scan code when changes are pushed
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Scan on PR</p>
                      <p className="text-xs text-muted-foreground">
                        Scan pull requests before merge
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRepository}>Connect</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Repository List */}
        <div className="space-y-4">
          {filteredRepos.map((repo) => (
            <div
              key={repo.id}
              className="bg-card/50 border border-border/50 rounded-lg p-5 hover:border-border transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-foreground">{repo.name}</h3>
                      <StatusBadge status={repo.status} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{repo.fullName}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        {repo.branch}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last scan: {repo.lastScan}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {repo.issueCount} issues
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScan(repo.id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Scan Now
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenSettings(repo)}
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover">
                      <DropdownMenuItem>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on GitHub
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleRemove(repo.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Quick Settings Toggle */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`auto-scan-${repo.id}`}
                    checked={repo.autoScan}
                    onCheckedChange={(checked) =>
                      setRepositories((prev) =>
                        prev.map((r) =>
                          r.id === repo.id ? { ...r, autoScan: checked } : r
                        )
                      )
                    }
                  />
                  <Label htmlFor={`auto-scan-${repo.id}`} className="text-sm">
                    Auto-scan
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id={`pr-scan-${repo.id}`}
                    checked={repo.scanOnPR}
                    onCheckedChange={(checked) =>
                      setRepositories((prev) =>
                        prev.map((r) =>
                          r.id === repo.id ? { ...r, scanOnPR: checked } : r
                        )
                      )
                    }
                  />
                  <Label htmlFor={`pr-scan-${repo.id}`} className="text-sm">
                    Scan PRs
                  </Label>
                </div>
              </div>
            </div>
          ))}

          {filteredRepos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No repositories found matching your search.</p>
            </div>
          )}
        </div>

        {/* Settings Dialog */}
        <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Repository Settings</DialogTitle>
              <DialogDescription>
                Configure scan settings for {selectedRepo?.fullName}
              </DialogDescription>
            </DialogHeader>
            {selectedRepo && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="settings-branch">Default Branch</Label>
                  <Select
                    value={selectedRepo.branch}
                    onValueChange={(value) =>
                      setSelectedRepo({ ...selectedRepo, branch: value })
                    }
                  >
                    <SelectTrigger id="settings-branch">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">main</SelectItem>
                      <SelectItem value="master">master</SelectItem>
                      <SelectItem value="develop">develop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Auto-scan on push</p>
                      <p className="text-xs text-muted-foreground">
                        Automatically scan when code is pushed
                      </p>
                    </div>
                    <Switch
                      checked={selectedRepo.autoScan}
                      onCheckedChange={(checked) =>
                        setSelectedRepo({ ...selectedRepo, autoScan: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Scan on PR</p>
                      <p className="text-xs text-muted-foreground">
                        Scan pull requests before merge
                      </p>
                    </div>
                    <Switch
                      checked={selectedRepo.scanOnPR}
                      onCheckedChange={(checked) =>
                        setSelectedRepo({ ...selectedRepo, scanOnPR: checked })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Scan Severity Threshold</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue placeholder="Select threshold" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Report all issues</SelectItem>
                      <SelectItem value="medium">Medium and above</SelectItem>
                      <SelectItem value="high">High and above</SelectItem>
                      <SelectItem value="critical">Critical only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Repositories;
