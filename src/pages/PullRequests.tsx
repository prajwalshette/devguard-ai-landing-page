import { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SeverityBadge } from "@/components/dashboard/SeverityBadge";
import {
  Search,
  GitPullRequest,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Filter,
  ExternalLink,
} from "lucide-react";

interface PullRequest {
  id: string;
  prNumber: number;
  title: string;
  repo: string;
  owner: string;
  author: string;
  authorAvatar: string;
  status: "clean" | "issues" | "critical";
  scannedAt: string;
  findings: {
    high: number;
    medium: number;
    low: number;
  };
  branch: string;
  baseBranch: string;
}

const mockPullRequests: PullRequest[] = [
  {
    id: "1",
    prNumber: 342,
    title: "Add rate limiting to auth endpoints",
    repo: "api-gateway",
    owner: "acme-corp",
    author: "john.doe",
    authorAvatar: "JD",
    status: "critical",
    scannedAt: "2 min ago",
    findings: { high: 1, medium: 2, low: 0 },
    branch: "feature/rate-limiting",
    baseBranch: "main",
  },
  {
    id: "2",
    prNumber: 128,
    title: "Update dependencies and fix vulnerabilities",
    repo: "web-client",
    owner: "acme-corp",
    author: "jane.smith",
    authorAvatar: "JS",
    status: "issues",
    scannedAt: "15 min ago",
    findings: { high: 0, medium: 0, low: 3 },
    branch: "chore/update-deps",
    baseBranch: "main",
  },
  {
    id: "3",
    prNumber: 89,
    title: "Implement OAuth2 refresh token rotation",
    repo: "auth-service",
    owner: "acme-corp",
    author: "alex.chen",
    authorAvatar: "AC",
    status: "issues",
    scannedAt: "1 hour ago",
    findings: { high: 0, medium: 1, low: 0 },
    branch: "feature/oauth-refresh",
    baseBranch: "develop",
  },
  {
    id: "4",
    prNumber: 45,
    title: "Add input validation for ML model params",
    repo: "ml-pipeline",
    owner: "acme-corp",
    author: "sarah.kim",
    authorAvatar: "SK",
    status: "critical",
    scannedAt: "2 hours ago",
    findings: { high: 2, medium: 3, low: 1 },
    branch: "feature/input-validation",
    baseBranch: "main",
  },
  {
    id: "5",
    prNumber: 23,
    title: "Update IAM policies for S3 buckets",
    repo: "infra-terraform",
    owner: "acme-corp",
    author: "mike.wilson",
    authorAvatar: "MW",
    status: "clean",
    scannedAt: "3 hours ago",
    findings: { high: 0, medium: 0, low: 0 },
    branch: "fix/iam-policies",
    baseBranch: "main",
  },
  {
    id: "6",
    prNumber: 567,
    title: "Refactor database connection pooling",
    repo: "api-gateway",
    owner: "acme-corp",
    author: "emma.brown",
    authorAvatar: "EB",
    status: "clean",
    scannedAt: "4 hours ago",
    findings: { high: 0, medium: 0, low: 0 },
    branch: "refactor/db-pooling",
    baseBranch: "main",
  },
  {
    id: "7",
    prNumber: 234,
    title: "Add CSRF protection middleware",
    repo: "web-client",
    owner: "acme-corp",
    author: "david.lee",
    authorAvatar: "DL",
    status: "issues",
    scannedAt: "5 hours ago",
    findings: { high: 0, medium: 2, low: 1 },
    branch: "security/csrf-protection",
    baseBranch: "main",
  },
  {
    id: "8",
    prNumber: 112,
    title: "Implement password strength validator",
    repo: "auth-service",
    owner: "acme-corp",
    author: "lisa.wang",
    authorAvatar: "LW",
    status: "clean",
    scannedAt: "1 day ago",
    findings: { high: 0, medium: 0, low: 0 },
    branch: "feature/password-validator",
    baseBranch: "develop",
  },
];

function getStatusIcon(status: PullRequest["status"]) {
  switch (status) {
    case "clean":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "issues":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "critical":
      return <XCircle className="h-5 w-5 text-red-500" />;
  }
}

function getStatusBadge(status: PullRequest["status"]) {
  switch (status) {
    case "clean":
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Clean</Badge>;
    case "issues":
      return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Issues Found</Badge>;
    case "critical":
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Critical</Badge>;
  }
}

export default function PullRequests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [repoFilter, setRepoFilter] = useState<string>("all");

  const repos = [...new Set(mockPullRequests.map((pr) => pr.repo))];

  const filteredPRs = mockPullRequests.filter((pr) => {
    const matchesSearch =
      pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.repo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.prNumber.toString().includes(searchQuery);
    const matchesStatus = statusFilter === "all" || pr.status === statusFilter;
    const matchesRepo = repoFilter === "all" || pr.repo === repoFilter;
    return matchesSearch && matchesStatus && matchesRepo;
  });

  const totalFindings = mockPullRequests.reduce(
    (acc, pr) => ({
      high: acc.high + pr.findings.high,
      medium: acc.medium + pr.findings.medium,
      low: acc.low + pr.findings.low,
    }),
    { high: 0, medium: 0, low: 0 }
  );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pull Requests</h1>
          <p className="text-muted-foreground">View and manage scanned pull requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <GitPullRequest className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{mockPullRequests.length}</p>
                  <p className="text-sm text-muted-foreground">Total PRs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalFindings.high}</p>
                  <p className="text-sm text-muted-foreground">High Severity</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalFindings.medium}</p>
                  <p className="text-sm text-muted-foreground">Medium Severity</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {mockPullRequests.filter((pr) => pr.status === "clean").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Clean PRs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search PRs by title, repo, or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-background border-border">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="clean">Clean</SelectItem>
                <SelectItem value="issues">Issues</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={repoFilter} onValueChange={setRepoFilter}>
              <SelectTrigger className="w-[160px] bg-background border-border">
                <SelectValue placeholder="Repository" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Repositories</SelectItem>
                {repos.map((repo) => (
                  <SelectItem key={repo} value={repo}>
                    {repo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* PR List */}
        <div className="space-y-3">
          {filteredPRs.map((pr) => (
            <Card key={pr.id} className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {getStatusIcon(pr.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/pr/${pr.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors truncate"
                        >
                          #{pr.prNumber} {pr.title}
                        </Link>
                        {getStatusBadge(pr.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">{pr.owner}/{pr.repo}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          {pr.branch} → {pr.baseBranch}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {pr.scannedAt}
                        </span>
                      </div>
                      {(pr.findings.high > 0 || pr.findings.medium > 0 || pr.findings.low > 0) && (
                        <div className="flex items-center gap-2 mt-3">
                          {pr.findings.high > 0 && (
                            <SeverityBadge severity="high" count={pr.findings.high} />
                          )}
                          {pr.findings.medium > 0 && (
                            <SeverityBadge severity="medium" count={pr.findings.medium} />
                          )}
                          {pr.findings.low > 0 && (
                            <SeverityBadge severity="low" count={pr.findings.low} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-medium">
                      {pr.authorAvatar}
                    </div>
                    <Link to={`/pr/${pr.id}`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        View
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPRs.length === 0 && (
          <div className="text-center py-12">
            <GitPullRequest className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No pull requests found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== "all" || repoFilter !== "all"
                ? "Try adjusting your filters"
                : "No scanned pull requests yet"}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
