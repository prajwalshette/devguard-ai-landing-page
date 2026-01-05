import { GitPullRequest, ExternalLink, Clock } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface Activity {
  id: string;
  prNumber: number;
  prTitle: string;
  repo: string;
  owner: string;
  scannedAt: string;
  findings: {
    high: number;
    medium: number;
    low: number;
  };
}

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const totalFindings = activity.findings.high + activity.findings.medium + activity.findings.low;
  const hasHighSeverity = activity.findings.high > 0;

  return (
    <div className="group flex items-start gap-3 py-3 px-2 rounded-md transition-colors hover:bg-muted/50">
      <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${
        hasHighSeverity ? "bg-severity-high/15" : "bg-muted"
      }`}>
        <GitPullRequest className={`h-3.5 w-3.5 ${
          hasHighSeverity ? "text-severity-high" : "text-muted-foreground"
        }`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-mono text-xs text-muted-foreground">#{activity.prNumber}</span>
          <span className="text-sm text-foreground truncate">{activity.prTitle}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{activity.owner}/{activity.repo}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {activity.scannedAt}
          </span>
        </div>
        {totalFindings > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            {activity.findings.high > 0 && (
              <Badge variant="high" className="text-[10px] px-1.5 py-0">
                {activity.findings.high} high
              </Badge>
            )}
            {activity.findings.medium > 0 && (
              <Badge variant="medium" className="text-[10px] px-1.5 py-0">
                {activity.findings.medium} med
              </Badge>
            )}
            {activity.findings.low > 0 && (
              <Badge variant="low" className="text-[10px] px-1.5 py-0">
                {activity.findings.low} low
              </Badge>
            )}
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      >
        <ExternalLink className="h-3.5 w-3.5 mr-1" />
        View PR
      </Button>
    </div>
  );
}
