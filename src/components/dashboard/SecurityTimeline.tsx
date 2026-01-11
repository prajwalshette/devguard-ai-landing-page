import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  GitPullRequest,
  Scan 
} from "lucide-react";

interface TimelineEvent {
  id: string;
  type: "scan" | "vulnerability" | "fix" | "pr";
  title: string;
  description: string;
  time: string;
  severity?: "high" | "medium" | "low";
}

const mockEvents: TimelineEvent[] = [
  {
    id: "1",
    type: "vulnerability",
    title: "Critical vulnerability detected",
    description: "SQL Injection in api/auth/login.ts",
    time: "2 min ago",
    severity: "high",
  },
  {
    id: "2",
    type: "fix",
    title: "Vulnerability resolved",
    description: "XSS in comments component fixed by Sarah",
    time: "15 min ago",
    severity: "medium",
  },
  {
    id: "3",
    type: "scan",
    title: "Automated scan completed",
    description: "web-client repository scanned",
    time: "1 hour ago",
  },
  {
    id: "4",
    type: "pr",
    title: "Security PR merged",
    description: "PR #342 - Rate limiting implementation",
    time: "2 hours ago",
  },
  {
    id: "5",
    type: "fix",
    title: "Vulnerability resolved",
    description: "Hardcoded secret removed from config",
    time: "3 hours ago",
    severity: "high",
  },
];

export function SecurityTimeline() {
  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case "vulnerability":
        return (
          <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
        );
      case "fix":
        return (
          <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-green-400" />
          </div>
        );
      case "scan":
        return (
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Scan className="h-4 w-4 text-primary" />
          </div>
        );
      case "pr":
        return (
          <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
            <GitPullRequest className="h-4 w-4 text-purple-400" />
          </div>
        );
    }
  };

  const getSeverityDot = (severity?: TimelineEvent["severity"]) => {
    if (!severity) return null;
    
    const colors = {
      high: "bg-red-500",
      medium: "bg-yellow-500",
      low: "bg-green-500",
    };

    return <span className={`h-2 w-2 rounded-full ${colors[severity]}`} />;
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Security Timeline</h3>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-4">
          {mockEvents.map((event, index) => (
            <div
              key={event.id}
              className="relative flex gap-4 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="relative z-10 flex-shrink-0">
                {getEventIcon(event)}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-foreground">
                    {event.title}
                  </h4>
                  {getSeverityDot(event.severity)}
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {event.description}
                </p>
                <p className="text-xs text-muted-foreground">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
