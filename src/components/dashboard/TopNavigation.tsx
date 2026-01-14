import { Github, Zap } from "lucide-react";
import { DevGuardLogo } from "./DevGuardLogo";
import { GitHubSettingsDialog } from "./GitHubSettingsDialog";
import { NotificationCenter } from "./NotificationCenter";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

interface TopNavigationProps {
  isConnected: boolean;
  plan: "free" | "pro";
}

export function TopNavigation({ isConnected, plan }: TopNavigationProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/">
            <DevGuardLogo />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <NotificationCenter />
          
          <GitHubSettingsDialog />
          
          <div className="flex items-center gap-2">
            <Github className="h-4 w-4 text-muted-foreground" />
            <Badge variant={isConnected ? "connected" : "disconnected"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>

          <Badge variant={plan === "pro" ? "pro" : "free"} className="uppercase tracking-wide">
            {plan}
          </Badge>

          {plan === "free" && (
            <Button variant="upgrade" size="sm">
              <Zap className="h-3.5 w-3.5" />
              Upgrade to Pro
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
