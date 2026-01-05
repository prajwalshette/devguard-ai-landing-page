import { ActivityItem } from "./ActivityItem";

const mockActivity = [
  {
    id: "1",
    prNumber: 342,
    prTitle: "Add rate limiting to auth endpoints",
    repo: "api-gateway",
    owner: "acme-corp",
    scannedAt: "2 min ago",
    findings: { high: 1, medium: 2, low: 0 },
  },
  {
    id: "2",
    prNumber: 128,
    prTitle: "Update dependencies and fix vulnerabilities",
    repo: "web-client",
    owner: "acme-corp",
    scannedAt: "15 min ago",
    findings: { high: 0, medium: 0, low: 3 },
  },
  {
    id: "3",
    prNumber: 89,
    prTitle: "Implement OAuth2 refresh token rotation",
    repo: "auth-service",
    owner: "acme-corp",
    scannedAt: "1 hour ago",
    findings: { high: 0, medium: 1, low: 0 },
  },
  {
    id: "4",
    prNumber: 45,
    prTitle: "Add input validation for ML model params",
    repo: "ml-pipeline",
    owner: "acme-corp",
    scannedAt: "2 hours ago",
    findings: { high: 2, medium: 3, low: 1 },
  },
  {
    id: "5",
    prNumber: 23,
    prTitle: "Update IAM policies for S3 buckets",
    repo: "infra-terraform",
    owner: "acme-corp",
    scannedAt: "3 hours ago",
    findings: { high: 0, medium: 0, low: 0 },
  },
];

export function RecentActivity() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <p className="text-sm text-muted-foreground">Last scanned pull requests</p>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="divide-y divide-border">
          {mockActivity.map((activity, index) => (
            <div
              key={activity.id}
              className="animate-fade-in"
              style={{ animationDelay: `${100 + index * 50}ms`, animationFillMode: "backwards" }}
            >
              <ActivityItem activity={activity} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
