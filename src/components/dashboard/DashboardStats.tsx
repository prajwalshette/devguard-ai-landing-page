import { Shield, GitPullRequest, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  {
    label: "Security Score",
    value: "78",
    icon: Shield,
    description: "Good",
    isScore: true,
    linkTo: "/security-score",
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
      {stats.map((stat, index) => {
        const content = (
          <div
            className={`rounded-lg border border-border bg-card p-4 animate-fade-in ${
              stat.linkTo ? "cursor-pointer hover:border-primary/50 transition-colors group" : ""
            }`}
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.isScore ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              {stat.linkTo && (
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-semibold font-mono ${stat.isScore ? "text-green-500" : "text-foreground"}`}>
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground">{stat.description}</span>
            </div>
          </div>
        );

        if (stat.linkTo) {
          return (
            <Link key={stat.label} to={stat.linkTo}>
              {content}
            </Link>
          );
        }

        return <div key={stat.label}>{content}</div>;
      })}
    </div>
  );
}
