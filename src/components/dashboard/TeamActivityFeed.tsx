import { 
  CheckCircle, 
  AlertTriangle, 
  GitPullRequest, 
  Shield,
  MessageSquare,
  XCircle 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamMember {
  name: string;
  avatar?: string;
  initials: string;
}

interface Activity {
  id: string;
  user: TeamMember;
  action: "fixed" | "found" | "reviewed" | "commented" | "dismissed";
  target: string;
  severity?: "high" | "medium" | "low";
  time: string;
}

const mockActivities: Activity[] = [
  {
    id: "1",
    user: { name: "Sarah Chen", initials: "SC" },
    action: "fixed",
    target: "SQL Injection in auth/login.ts",
    severity: "high",
    time: "2 min ago",
  },
  {
    id: "2",
    user: { name: "Mike Johnson", initials: "MJ" },
    action: "found",
    target: "XSS vulnerability in comments.tsx",
    severity: "medium",
    time: "15 min ago",
  },
  {
    id: "3",
    user: { name: "Emily Davis", initials: "ED" },
    action: "reviewed",
    target: "PR #342 - Rate limiting",
    time: "1 hour ago",
  },
  {
    id: "4",
    user: { name: "Alex Kim", initials: "AK" },
    action: "dismissed",
    target: "False positive in config.ts",
    severity: "low",
    time: "2 hours ago",
  },
  {
    id: "5",
    user: { name: "Jordan Lee", initials: "JL" },
    action: "commented",
    target: "Hardcoded secrets discussion",
    time: "3 hours ago",
  },
];

export function TeamActivityFeed() {
  const getActionIcon = (action: Activity["action"]) => {
    switch (action) {
      case "fixed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "found":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "reviewed":
        return <GitPullRequest className="h-4 w-4 text-purple-500" />;
      case "commented":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "dismissed":
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionText = (action: Activity["action"]) => {
    switch (action) {
      case "fixed":
        return "fixed";
      case "found":
        return "discovered";
      case "reviewed":
        return "reviewed";
      case "commented":
        return "commented on";
      case "dismissed":
        return "dismissed";
    }
  };

  const getSeverityBadge = (severity?: Activity["severity"]) => {
    if (!severity) return null;
    
    const colors = {
      high: "bg-red-500/20 text-red-400 border-red-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      low: "bg-green-500/20 text-green-400 border-green-500/30",
    };

    return (
      <span className={`text-xs px-1.5 py-0.5 rounded border ${colors[severity]}`}>
        {severity}
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Team Activity</h3>
        </div>
        <div className="flex -space-x-2">
          {mockActivities.slice(0, 4).map((activity, i) => (
            <Avatar key={i} className="h-7 w-7 border-2 border-background">
              <AvatarImage src={activity.user.avatar} />
              <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                {activity.user.initials}
              </AvatarFallback>
            </Avatar>
          ))}
          <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground">+3</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {mockActivities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.user.avatar} />
              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                {activity.user.initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm text-foreground">
                  {activity.user.name}
                </span>
                {getActionIcon(activity.action)}
                <span className="text-sm text-muted-foreground">
                  {getActionText(activity.action)}
                </span>
                {getSeverityBadge(activity.severity)}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {activity.target}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
