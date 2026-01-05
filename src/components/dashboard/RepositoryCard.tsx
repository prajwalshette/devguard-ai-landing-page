import { GitBranch, ExternalLink } from "lucide-react";
import { SeverityBadge } from "./SeverityBadge";
import { Button } from "../ui/button";

interface Repository {
  id: string;
  name: string;
  owner: string;
  prsScanned: number;
  vulnerabilities: {
    high: number;
    medium: number;
    low: number;
  };
}

interface RepositoryCardProps {
  repo: Repository;
}

export function RepositoryCard({ repo }: RepositoryCardProps) {
  const totalVulns = repo.vulnerabilities.high + repo.vulnerabilities.medium + repo.vulnerabilities.low;

  return (
    <div className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-muted-foreground/20 hover:bg-card/80">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="h-4 w-4 text-muted-foreground shrink-0" />
            <h3 className="font-mono text-sm font-medium text-foreground truncate">
              <span className="text-muted-foreground">{repo.owner}/</span>
              {repo.name}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {repo.prsScanned} PRs scanned
          </p>
        </div>

        <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        {totalVulns === 0 ? (
          <span className="text-xs text-muted-foreground">No vulnerabilities detected</span>
        ) : (
          <>
            {repo.vulnerabilities.high > 0 && (
              <SeverityBadge severity="high" count={repo.vulnerabilities.high} />
            )}
            {repo.vulnerabilities.medium > 0 && (
              <SeverityBadge severity="medium" count={repo.vulnerabilities.medium} />
            )}
            {repo.vulnerabilities.low > 0 && (
              <SeverityBadge severity="low" count={repo.vulnerabilities.low} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
