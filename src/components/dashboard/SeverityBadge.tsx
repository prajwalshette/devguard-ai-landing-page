import { Badge } from "../ui/badge";

interface SeverityBadgeProps {
  severity: "high" | "medium" | "low";
  count: number;
}

export function SeverityBadge({ severity, count }: SeverityBadgeProps) {
  const labels = {
    high: "High",
    medium: "Med",
    low: "Low",
  };

  return (
    <Badge variant={severity} className="font-mono tabular-nums">
      {count} {labels[severity]}
    </Badge>
  );
}
