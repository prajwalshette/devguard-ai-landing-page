import { 
  Scan, 
  FileCode, 
  Bell, 
  Shield, 
  GitPullRequest,
  Plus,
  Zap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface QuickAction {
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  onClick: () => void;
}

export function QuickActionsPanel() {
  const actions: QuickAction[] = [
    {
      icon: Scan,
      label: "Quick Scan",
      description: "Scan all repos",
      color: "from-primary to-cyan-400",
      onClick: () => {
        toast.info("Starting full repository scan...", {
          description: "This may take a few minutes",
        });
      },
    },
    {
      icon: GitPullRequest,
      label: "Review PRs",
      description: "12 pending",
      color: "from-purple-500 to-pink-500",
      onClick: () => {
        window.location.href = "/pull-requests";
      },
    },
    {
      icon: Bell,
      label: "Alerts",
      description: "3 new alerts",
      color: "from-orange-500 to-amber-500",
      onClick: () => {
        toast.info("Opening alerts...");
      },
    },
    {
      icon: Plus,
      label: "Add Repo",
      description: "Connect new",
      color: "from-green-500 to-emerald-500",
      onClick: () => {
        window.location.href = "/repositories";
      },
    },
  ];

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="group relative overflow-hidden rounded-lg border border-border/50 bg-muted/30 p-4 text-left transition-all hover:border-primary/50 hover:bg-muted/50"
          >
            {/* Gradient background on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`}
            />
            
            <div className="relative z-10">
              <div
                className={`h-10 w-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}
              >
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <p className="font-medium text-foreground">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
