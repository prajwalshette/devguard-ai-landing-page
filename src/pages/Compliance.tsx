import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  TrendingUp,
  Award,
  FileCheck,
  Target
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

// OWASP Top 10 2021 data
const owaspData = [
  { id: "A01", name: "Broken Access Control", status: "partial", score: 72, issues: 3, description: "Restrictions on authenticated users are not properly enforced" },
  { id: "A02", name: "Cryptographic Failures", status: "pass", score: 95, issues: 0, description: "Proper encryption for data in transit and at rest" },
  { id: "A03", name: "Injection", status: "partial", score: 68, issues: 5, description: "SQL, NoSQL, OS, LDAP injection prevention" },
  { id: "A04", name: "Insecure Design", status: "pass", score: 88, issues: 1, description: "Secure design patterns and threat modeling" },
  { id: "A05", name: "Security Misconfiguration", status: "fail", score: 45, issues: 8, description: "Secure configuration across the application stack" },
  { id: "A06", name: "Vulnerable Components", status: "partial", score: 62, issues: 12, description: "Using components with known vulnerabilities" },
  { id: "A07", name: "Auth Failures", status: "pass", score: 91, issues: 0, description: "Authentication and session management" },
  { id: "A08", name: "Software & Data Integrity", status: "pass", score: 85, issues: 1, description: "Code and infrastructure integrity verification" },
  { id: "A09", name: "Logging & Monitoring", status: "partial", score: 58, issues: 4, description: "Insufficient logging and monitoring" },
  { id: "A10", name: "SSRF", status: "pass", score: 94, issues: 0, description: "Server-Side Request Forgery prevention" },
];

// CWE Top 25 data
const cweData = [
  { id: "CWE-79", name: "Cross-site Scripting (XSS)", count: 8, severity: "high" },
  { id: "CWE-89", name: "SQL Injection", count: 3, severity: "critical" },
  { id: "CWE-787", name: "Out-of-bounds Write", count: 0, severity: "critical" },
  { id: "CWE-20", name: "Improper Input Validation", count: 5, severity: "high" },
  { id: "CWE-125", name: "Out-of-bounds Read", count: 0, severity: "high" },
  { id: "CWE-78", name: "OS Command Injection", count: 1, severity: "critical" },
  { id: "CWE-416", name: "Use After Free", count: 0, severity: "critical" },
  { id: "CWE-22", name: "Path Traversal", count: 2, severity: "high" },
  { id: "CWE-352", name: "Cross-Site Request Forgery", count: 4, severity: "medium" },
  { id: "CWE-434", name: "Unrestricted Upload", count: 1, severity: "high" },
];

// Radar chart data for compliance overview
const complianceRadar = [
  { standard: "OWASP", score: 76, fullMark: 100 },
  { standard: "CWE", score: 82, fullMark: 100 },
  { standard: "NIST", score: 71, fullMark: 100 },
  { standard: "ISO 27001", score: 68, fullMark: 100 },
  { standard: "SOC 2", score: 85, fullMark: 100 },
  { standard: "PCI DSS", score: 79, fullMark: 100 },
];

// Benchmark comparison
const benchmarkData = [
  { category: "Access Control", yours: 72, industry: 68, top10: 92 },
  { category: "Cryptography", yours: 95, industry: 75, top10: 98 },
  { category: "Input Validation", yours: 68, industry: 62, top10: 95 },
  { category: "Authentication", yours: 91, industry: 70, top10: 96 },
  { category: "Configuration", yours: 45, industry: 55, top10: 90 },
  { category: "Dependencies", yours: 62, industry: 58, top10: 88 },
];

// Compliance distribution
const complianceDistribution = [
  { name: "Compliant", value: 42, color: "#22c55e" },
  { name: "Partial", value: 28, color: "#f59e0b" },
  { name: "Non-Compliant", value: 12, color: "#ef4444" },
  { name: "Not Assessed", value: 18, color: "#6b7280" },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pass":
      return <CheckCircle2 className="h-5 w-5 text-green-400" />;
    case "partial":
      return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
    case "fail":
      return <XCircle className="h-5 w-5 text-red-400" />;
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pass":
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Compliant</Badge>;
    case "partial":
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Partial</Badge>;
    case "fail":
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Non-Compliant</Badge>;
    default:
      return null;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "text-red-400";
    case "high":
      return "text-orange-400";
    case "medium":
      return "text-yellow-400";
    case "low":
      return "text-blue-400";
    default:
      return "text-muted-foreground";
  }
};

const Compliance = () => {
  const overallScore = Math.round(owaspData.reduce((acc, item) => acc + item.score, 0) / owaspData.length);
  const totalIssues = owaspData.reduce((acc, item) => acc + item.issues, 0);
  const compliantCount = owaspData.filter(item => item.status === "pass").length;

  return (
    <DashboardLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold text-foreground">Security Compliance</h1>
            <Badge variant="outline" className="gap-1">
              <FileCheck className="h-3 w-3" />
              Standards Tracking
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Track adherence to OWASP Top 10, CWE, and industry security benchmarks
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Compliance</p>
                  <p className="text-3xl font-bold">{overallScore}%</p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
              </div>
              <Progress value={overallScore} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">OWASP Compliant</p>
                  <p className="text-3xl font-bold">{compliantCount}/10</p>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {10 - compliantCount} categories need attention
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Issues</p>
                  <p className="text-3xl font-bold">{totalIssues}</p>
                </div>
                <div className="p-3 rounded-full bg-orange-500/10">
                  <AlertTriangle className="h-6 w-6 text-orange-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Across all compliance categories
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Industry Ranking</p>
                  <p className="text-3xl font-bold">Top 25%</p>
                </div>
                <div className="p-3 rounded-full bg-purple-500/10">
                  <Award className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <TrendingUp className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">+5% from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="owasp" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="owasp">OWASP Top 10</TabsTrigger>
            <TabsTrigger value="cwe">CWE Top 25</TabsTrigger>
            <TabsTrigger value="benchmarks">Industry Benchmarks</TabsTrigger>
            <TabsTrigger value="overview">Compliance Overview</TabsTrigger>
          </TabsList>

          {/* OWASP Tab */}
          <TabsContent value="owasp" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      OWASP Top 10 (2021)
                    </CardTitle>
                    <CardDescription>
                      Compliance status for each OWASP category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {owaspData.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          {getStatusIcon(item.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs text-muted-foreground">{item.id}</span>
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-medium">{item.score}%</div>
                              <div className="text-xs text-muted-foreground">{item.issues} issues</div>
                            </div>
                            {getStatusBadge(item.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base">OWASP Score Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={owaspData}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                          <YAxis dataKey="id" type="category" width={40} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar 
                            dataKey="score" 
                            fill="hsl(var(--primary))"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* CWE Tab */}
          <TabsContent value="cwe" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  CWE Top 25 Most Dangerous Weaknesses
                </CardTitle>
                <CardDescription>
                  Common Weakness Enumeration tracking across your codebase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {cweData.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${item.count === 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                          {item.count === 0 ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">{item.id}</span>
                            <Badge variant="outline" className={getSeverityColor(item.severity)}>
                              {item.severity}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mt-0.5">{item.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${item.count === 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {item.count}
                        </p>
                        <p className="text-xs text-muted-foreground">findings</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Benchmarks Tab */}
          <TabsContent value="benchmarks" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Industry Benchmark Comparison
                </CardTitle>
                <CardDescription>
                  Compare your security posture against industry averages and top performers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={benchmarkData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                      <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="yours" name="Your Score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="industry" name="Industry Avg" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="top10" name="Top 10%" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Compliance Radar
                  </CardTitle>
                  <CardDescription>
                    Multi-framework compliance overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={complianceRadar}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="standard" stroke="hsl(var(--muted-foreground))" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                        <Radar
                          name="Compliance Score"
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.3}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    Control Status Distribution
                  </CardTitle>
                  <CardDescription>
                    Overall compliance status across all controls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={complianceDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {complianceDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compliance Frameworks Summary */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Framework Compliance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {complianceRadar.map((framework) => (
                    <div key={framework.standard} className="p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">{framework.standard}</span>
                        <span className={`font-bold ${
                          framework.score >= 80 ? 'text-green-400' : 
                          framework.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {framework.score}%
                        </span>
                      </div>
                      <Progress value={framework.score} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {framework.score >= 80 ? 'Excellent compliance' : 
                         framework.score >= 60 ? 'Needs improvement' : 'Requires attention'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Compliance;
