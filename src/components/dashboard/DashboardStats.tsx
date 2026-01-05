import { Shield, GitPullRequest, AlertTriangle, CheckCircle } from "lucide-react";

const stats = [
  {
    label: "Repositories",
    value: "5",
    icon: Shield,
    description: "monitored",
  },
  {
    label: "PRs Scanned",
    value: "202",
    icon: GitPullRequest,
    description: "this month",
  },
  {
    label: "Issues Found",
    value: "47",
    icon: AlertTriangle,
    description: "total active",
  },
  {
    label: "Resolved",
    value: "124",
    icon: CheckCircle,
    description: "all time",
  },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="rounded-lg border border-border bg-card p-4 animate-fade-in"
          style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-foreground font-mono">{stat.value}</span>
            <span className="text-xs text-muted-foreground">{stat.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
