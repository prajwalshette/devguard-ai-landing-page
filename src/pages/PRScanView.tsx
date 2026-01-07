import { ArrowLeft, GitPullRequest, Clock, AlertTriangle, CheckCircle, XCircle, EyeOff } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopNavigation } from "@/components/dashboard/TopNavigation";
import { VulnerabilityCard } from "@/components/dashboard/VulnerabilityCard";
import { useDismissedVulnerabilities, DismissReason } from "@/hooks/useDismissedVulnerabilities";

const mockVulnerabilities = [
  {
    id: "VULN-001",
    title: "SQL Injection vulnerability in user query",
    severity: "high" as const,
    file: "src/api/users.ts",
    line: 45,
    description:
      "User input is directly concatenated into SQL query without proper sanitization, allowing attackers to execute arbitrary SQL commands.",
    vulnerableCode: `const query = "SELECT * FROM users WHERE id = " + userId;
const result = await db.execute(query);`,
    fixedCode: `const query = "SELECT * FROM users WHERE id = $1";
const result = await db.execute(query, [userId]);`,
    cweId: "CWE-89",
    cweLink: "https://cwe.mitre.org/data/definitions/89.html",
  },
  {
    id: "VULN-002",
    title: "Cross-Site Scripting (XSS) in comment display",
    severity: "high" as const,
    file: "src/components/Comments.tsx",
    line: 23,
    description:
      "User-generated content is rendered without escaping, allowing attackers to inject malicious scripts.",
    vulnerableCode: `<div dangerouslySetInnerHTML={{ __html: comment.text }} />`,
    fixedCode: `import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(comment.text) 
}} />`,
    cweId: "CWE-79",
    cweLink: "https://cwe.mitre.org/data/definitions/79.html",
  },
  {
    id: "VULN-003",
    title: "Hardcoded API credentials",
    severity: "medium" as const,
    file: "src/config/api.ts",
    line: 12,
    description:
      "API credentials are hardcoded in the source code, which could be exposed in version control.",
    vulnerableCode: `const API_KEY = "sk_live_abc123xyz789";
const API_SECRET = "secret_key_here";`,
    fixedCode: `const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;`,
    cweId: "CWE-798",
    cweLink: "https://cwe.mitre.org/data/definitions/798.html",
  },
  {
    id: "VULN-004",
    title: "Missing rate limiting on authentication endpoint",
    severity: "medium" as const,
    file: "src/api/auth.ts",
    line: 78,
    description:
      "The login endpoint lacks rate limiting, making it susceptible to brute force attacks.",
    vulnerableCode: `app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await authenticate(email, password);
  // ...
});`,
    fixedCode: `import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per window
});

app.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  const user = await authenticate(email, password);
  // ...
});`,
    cweId: "CWE-307",
    cweLink: "https://cwe.mitre.org/data/definitions/307.html",
  },
  {
    id: "VULN-005",
    title: "Insecure cookie configuration",
    severity: "low" as const,
    file: "src/middleware/session.ts",
    line: 15,
    description:
      "Session cookies are not configured with secure flags, potentially exposing session data.",
    vulnerableCode: `res.cookie('session', token, {
  httpOnly: false,
  secure: false
});`,
    fixedCode: `res.cookie('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});`,
    cweId: "CWE-614",
    cweLink: "https://cwe.mitre.org/data/definitions/614.html",
  },
];

const PRScanView = () => {
  const { prId } = useParams();
  const { dismissed, dismissVulnerability, restoreVulnerability, getInfo } = useDismissedVulnerabilities();

  const activeVulnerabilities = mockVulnerabilities.filter(
    (v) => !dismissed.some((d) => d.id === v.id)
  );
  const dismissedVulnerabilities = mockVulnerabilities.filter(
    (v) => dismissed.some((d) => d.id === v.id)
  );

  const highCount = activeVulnerabilities.filter((v) => v.severity === "high").length;
  const mediumCount = activeVulnerabilities.filter((v) => v.severity === "medium").length;
  const lowCount = activeVulnerabilities.filter((v) => v.severity === "low").length;
  const totalCount = activeVulnerabilities.length;
  const dismissedCount = dismissedVulnerabilities.length;

  const handleDismiss = (id: string, reason: DismissReason) => {
    dismissVulnerability(id, reason);
  };

  const handleRestore = (id: string) => {
    restoreVulnerability(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation isConnected={true} plan="free" />

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Back Navigation */}
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        {/* PR Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <GitPullRequest className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">
                  PR #{prId || "142"}: Add user authentication flow
                </h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Scanned 2 hours ago
                </span>
                <span>Branch: feature/user-auth → main</span>
                <span>Author: @johndoe</span>
              </div>
            </div>
            <Badge variant="high" className="text-sm px-3 py-1">
              {totalCount} Issues Found
            </Badge>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Files Scanned</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold">24</p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">High Severity</span>
                <XCircle className="h-4 w-4 text-severity-high" />
              </div>
              <p className="text-2xl font-bold text-severity-high">{highCount}</p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Medium Severity</span>
                <AlertTriangle className="h-4 w-4 text-severity-medium" />
              </div>
              <p className="text-2xl font-bold text-severity-medium">{mediumCount}</p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Low Severity</span>
                <AlertTriangle className="h-4 w-4 text-severity-low" />
              </div>
              <p className="text-2xl font-bold text-severity-low">{lowCount}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Scan Progress</span>
              <span className="text-foreground font-medium">Complete</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
        </div>

        {/* Vulnerabilities List */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
            <TabsTrigger value="high">High ({highCount})</TabsTrigger>
            <TabsTrigger value="medium">Medium ({mediumCount})</TabsTrigger>
            <TabsTrigger value="low">Low ({lowCount})</TabsTrigger>
            <TabsTrigger value="dismissed" className="flex items-center gap-1">
              <EyeOff className="h-3 w-3" />
              Dismissed ({dismissedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {activeVulnerabilities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active vulnerabilities found.
              </div>
            ) : (
              activeVulnerabilities.map((vuln) => (
                <VulnerabilityCard 
                  key={vuln.id} 
                  {...vuln} 
                  onDismiss={handleDismiss}
                  onRestore={handleRestore}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="high" className="space-y-4">
            {activeVulnerabilities
              .filter((v) => v.severity === "high")
              .map((vuln) => (
                <VulnerabilityCard 
                  key={vuln.id} 
                  {...vuln} 
                  onDismiss={handleDismiss}
                  onRestore={handleRestore}
                />
              ))}
          </TabsContent>

          <TabsContent value="medium" className="space-y-4">
            {activeVulnerabilities
              .filter((v) => v.severity === "medium")
              .map((vuln) => (
                <VulnerabilityCard 
                  key={vuln.id} 
                  {...vuln} 
                  onDismiss={handleDismiss}
                  onRestore={handleRestore}
                />
              ))}
          </TabsContent>

          <TabsContent value="low" className="space-y-4">
            {activeVulnerabilities
              .filter((v) => v.severity === "low")
              .map((vuln) => (
                <VulnerabilityCard 
                  key={vuln.id} 
                  {...vuln} 
                  onDismiss={handleDismiss}
                  onRestore={handleRestore}
                />
              ))}
          </TabsContent>

          <TabsContent value="dismissed" className="space-y-4">
            {dismissedVulnerabilities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No dismissed vulnerabilities.
              </div>
            ) : (
              dismissedVulnerabilities.map((vuln) => {
                const info = getInfo(vuln.id);
                return (
                  <VulnerabilityCard 
                    key={vuln.id} 
                    {...vuln} 
                    isDismissed={true}
                    dismissReason={info?.reason}
                    onDismiss={handleDismiss}
                    onRestore={handleRestore}
                  />
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PRScanView;
