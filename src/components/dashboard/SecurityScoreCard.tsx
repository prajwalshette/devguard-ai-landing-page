import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SecurityScoreCardProps {
  score: number;
  change: number;
  period: string;
}

export const SecurityScoreCard = ({ score, change, period }: SecurityScoreCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-severity-high";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Attention";
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return "stroke-green-500";
    if (score >= 60) return "stroke-yellow-500";
    return "stroke-severity-high";
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" />
          Security Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="relative">
            <svg className="w-28 h-28 -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="45"
                fill="none"
                className="stroke-muted"
                strokeWidth="8"
              />
              <circle
                cx="56"
                cy="56"
                r="45"
                fill="none"
                className={getScoreRingColor(score)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold font-mono ${getScoreColor(score)}`}>
                {score}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <p className={`text-xl font-semibold ${getScoreColor(score)}`}>
              {getScoreLabel(score)}
            </p>
            <p className="text-sm text-muted-foreground">
              {change >= 0 ? (
                <span className="text-green-500">↑ +{change}%</span>
              ) : (
                <span className="text-severity-high">↓ {change}%</span>
              )}{" "}
              from {period}
            </p>
            <p className="text-xs text-muted-foreground">
              Based on vulnerability density and resolution rate
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
