import { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  GitBranch,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Filter,
  BarChart3,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// Mock data for repository comparison
const repositoryData = [
  { 
    name: "frontend-app", 
    currentScore: 85, 
    previousScore: 72, 
    highFixed: 8, 
    mediumFixed: 12, 
    lowFixed: 5,
    avgFixTime: 2.3,
    trend: "improving"
  },
  { 
    name: "api-service", 
    currentScore: 78, 
    previousScore: 81, 
    highFixed: 3, 
    mediumFixed: 7, 
    lowFixed: 4,
    avgFixTime: 3.1,
    trend: "declining"
  },
  { 
    name: "auth-module", 
    currentScore: 92, 
    previousScore: 88, 
    highFixed: 5, 
    mediumFixed: 9, 
    lowFixed: 8,
    avgFixTime: 1.8,
    trend: "improving"
  },
  { 
    name: "data-pipeline", 
    currentScore: 71, 
    previousScore: 71, 
    highFixed: 2, 
    mediumFixed: 4, 
    lowFixed: 3,
    avgFixTime: 4.2,
    trend: "stable"
  },
  { 
    name: "mobile-backend", 
    currentScore: 88, 
    previousScore: 79, 
    highFixed: 6, 
    mediumFixed: 11, 
    lowFixed: 7,
    avgFixTime: 2.0,
    trend: "improving"
  },
];

// Time-based trend data
const timeSeriesData = [
  { period: "Week 1", "frontend-app": 72, "api-service": 75, "auth-module": 85, "data-pipeline": 68, "mobile-backend": 70 },
  { period: "Week 2", "frontend-app": 74, "api-service": 78, "auth-module": 86, "data-pipeline": 69, "mobile-backend": 73 },
  { period: "Week 3", "frontend-app": 76, "api-service": 80, "auth-module": 87, "data-pipeline": 70, "mobile-backend": 76 },
  { period: "Week 4", "frontend-app": 78, "api-service": 82, "auth-module": 88, "data-pipeline": 70, "mobile-backend": 79 },
  { period: "Week 5", "frontend-app": 80, "api-service": 81, "auth-module": 89, "data-pipeline": 71, "mobile-backend": 82 },
  { period: "Week 6", "frontend-app": 82, "api-service": 80, "auth-module": 90, "data-pipeline": 71, "mobile-backend": 85 },
  { period: "Week 7", "frontend-app": 84, "api-service": 79, "auth-module": 91, "data-pipeline": 71, "mobile-backend": 87 },
  { period: "Week 8", "frontend-app": 85, "api-service": 78, "auth-module": 92, "data-pipeline": 71, "mobile-backend": 88 },
];

// Vulnerability resolution speed data
const resolutionSpeedData = [
  { name: "frontend-app", high: 1.5, medium: 2.8, low: 4.2 },
  { name: "api-service", high: 2.1, medium: 3.5, low: 5.1 },
  { name: "auth-module", high: 1.2, medium: 2.0, low: 3.0 },
  { name: "data-pipeline", high: 3.2, medium: 4.8, low: 6.5 },
  { name: "mobile-backend", high: 1.4, medium: 2.2, low: 3.8 },
];

// Radar chart data for security dimensions
const securityDimensionsData = [
  { dimension: "Code Quality", "frontend-app": 85, "auth-module": 92, "mobile-backend": 88 },
  { dimension: "Dependencies", "frontend-app": 78, "auth-module": 88, "mobile-backend": 82 },
  { dimension: "Secrets Mgmt", "frontend-app": 90, "auth-module": 95, "mobile-backend": 91 },
  { dimension: "Access Control", "frontend-app": 82, "auth-module": 94, "mobile-backend": 85 },
  { dimension: "Input Validation", "frontend-app": 88, "auth-module": 90, "mobile-backend": 89 },
  { dimension: "Error Handling", "frontend-app": 80, "auth-module": 88, "mobile-backend": 84 },
];

// Monthly improvement metrics
const monthlyImprovementData = [
  { month: "Jan", vulnsFound: 45, vulnsFixed: 32, netReduction: -13 },
  { month: "Feb", vulnsFound: 38, vulnsFixed: 41, netReduction: 3 },
  { month: "Mar", vulnsFound: 42, vulnsFixed: 48, netReduction: 6 },
  { month: "Apr", vulnsFound: 35, vulnsFixed: 52, netReduction: 17 },
  { month: "May", vulnsFound: 28, vulnsFixed: 38, netReduction: 10 },
  { month: "Jun", vulnsFound: 22, vulnsFixed: 35, netReduction: 13 },
];

const repoColors: Record<string, string> = {
  "frontend-app": "hsl(var(--primary))",
  "api-service": "hsl(38, 92%, 50%)",
  "auth-module": "hsl(142, 71%, 45%)",
  "data-pipeline": "hsl(280, 65%, 60%)",
  "mobile-backend": "hsl(199, 89%, 48%)",
};

const SecurityTrends = () => {
  const [timeRange, setTimeRange] = useState("8w");
  const [selectedRepos, setSelectedRepos] = useState<string[]>(["frontend-app", "auth-module", "mobile-backend"]);

  const overallImprovement = repositoryData.reduce((acc, repo) => acc + (repo.currentScore - repo.previousScore), 0) / repositoryData.length;
  const totalVulnsFixed = repositoryData.reduce((acc, repo) => acc + repo.highFixed + repo.mediumFixed + repo.lowFixed, 0);
  const avgFixTime = repositoryData.reduce((acc, repo) => acc + repo.avgFixTime, 0) / repositoryData.length;
  const improvingRepos = repositoryData.filter(r => r.trend === "improving").length;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-primary" />
              Security Trends Comparison
            </h1>
            <p className="text-muted-foreground">
              Track improvement metrics across repositories and time periods
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px] bg-card/50">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4w">Last 4 weeks</SelectItem>
                <SelectItem value="8w">Last 8 weeks</SelectItem>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Score Change</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {overallImprovement > 0 ? "+" : ""}{overallImprovement.toFixed(1)}%
                  </p>
                </div>
                <div className={`rounded-full p-3 ${overallImprovement > 0 ? "bg-green-500/20" : "bg-red-500/20"}`}>
                  {overallImprovement > 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Vulns Resolved</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalVulnsFixed}</p>
                </div>
                <div className="rounded-full p-3 bg-green-500/20">
                  <Target className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Fix Time</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{avgFixTime.toFixed(1)}d</p>
                </div>
                <div className="rounded-full p-3 bg-blue-500/20">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Improving Repos</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{improvingRepos}/{repositoryData.length}</p>
                </div>
                <div className="rounded-full p-3 bg-purple-500/20">
                  <GitBranch className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Repository Comparison Table */}
        <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Repository Performance Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {repositoryData.map((repo) => {
                const change = repo.currentScore - repo.previousScore;
                return (
                  <div 
                    key={repo.name}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-1 h-12 rounded-full"
                        style={{ backgroundColor: repoColors[repo.name] }}
                      />
                      <div>
                        <p className="font-medium text-foreground">{repo.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {repo.highFixed + repo.mediumFixed + repo.lowFixed} vulnerabilities resolved
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Score</p>
                        <p className="text-lg font-bold">{repo.currentScore}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Change</p>
                        <div className="flex items-center justify-center gap-1">
                          {change > 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          ) : change < 0 ? (
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          ) : (
                            <Minus className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={`font-medium ${
                            change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-muted-foreground"
                          }`}>
                            {change > 0 ? "+" : ""}{change}
                          </span>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Avg Fix</p>
                        <p className="font-medium">{repo.avgFixTime}d</p>
                      </div>

                      <Badge 
                        variant={
                          repo.trend === "improving" ? "default" : 
                          repo.trend === "declining" ? "destructive" : 
                          "secondary"
                        }
                        className="capitalize min-w-[80px] justify-center"
                      >
                        {repo.trend}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Score Trends Over Time */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Security Score Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      domain={[60, 100]}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                    {selectedRepos.map((repo) => (
                      <Line 
                        key={repo}
                        type="monotone" 
                        dataKey={repo} 
                        stroke={repoColors[repo]}
                        strokeWidth={2}
                        dot={{ fill: repoColors[repo], strokeWidth: 2, r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Vulnerability Resolution Speed */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Resolution Time by Severity (days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resolutionSpeedData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      width={100}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                    <Bar dataKey="high" name="High" fill="hsl(0, 72%, 51%)" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="medium" name="Medium" fill="hsl(38, 92%, 50%)" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="low" name="Low" fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Security Dimensions Radar */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                Security Dimensions (Top 3 Repos)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={securityDimensionsData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis 
                      dataKey="dimension" 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    />
                    <Radar 
                      name="frontend-app" 
                      dataKey="frontend-app" 
                      stroke={repoColors["frontend-app"]}
                      fill={repoColors["frontend-app"]}
                      fillOpacity={0.2}
                    />
                    <Radar 
                      name="auth-module" 
                      dataKey="auth-module" 
                      stroke={repoColors["auth-module"]}
                      fill={repoColors["auth-module"]}
                      fillOpacity={0.2}
                    />
                    <Radar 
                      name="mobile-backend" 
                      dataKey="mobile-backend" 
                      stroke={repoColors["mobile-backend"]}
                      fill={repoColors["mobile-backend"]}
                      fillOpacity={0.2}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Improvement */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Monthly Vulnerability Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyImprovementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="vulnsFound" 
                      name="Found"
                      stroke="hsl(0, 72%, 51%)" 
                      fill="hsl(0, 72%, 51%)"
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="vulnsFixed" 
                      name="Fixed"
                      stroke="hsl(142, 71%, 45%)" 
                      fill="hsl(142, 71%, 45%)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Improvement Insights */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-background/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-medium text-sm">Best Performer</span>
                </div>
                <p className="text-lg font-bold text-foreground">auth-module</p>
                <p className="text-xs text-muted-foreground mt-1">
                  92 score, +4 improvement, 1.8d avg fix time
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="font-medium text-sm">Needs Attention</span>
                </div>
                <p className="text-lg font-bold text-foreground">data-pipeline</p>
                <p className="text-xs text-muted-foreground mt-1">
                  71 score, no change, 4.2d avg fix time
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="font-medium text-sm">Most Improved</span>
                </div>
                <p className="text-lg font-bold text-foreground">mobile-backend</p>
                <p className="text-xs text-muted-foreground mt-1">
                  +9 score improvement, 24 vulns fixed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SecurityTrends;
