import { useState, useCallback } from "react";
import { 
  Wand2, 
  CheckCircle2, 
  Loader2, 
  GitBranch, 
  FileCode, 
  TestTube2, 
  Shield, 
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getGitHubConfig } from "@/hooks/useGitHubConfig";

interface Vulnerability {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  file: string;
  line: number;
  description: string;
  vulnerableCode: string;
  fixedCode: string;
  cweId: string;
}

interface RemediationResult {
  enhancedFix: string;
  explanation: string;
  steps: string[];
  testCases: string[];
  additionalChanges: { file: string; change: string }[];
  securityNotes: string[];
  rollbackPlan: string;
}

interface ValidationResult {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
  securityScore: number;
  confidence: "high" | "medium" | "low";
}

interface ApplyResult {
  commands: string[];
  prTitle: string;
  prBody: string;
  commitMessage: string;
  labels: string[];
  reviewers: string[];
}

interface RemediationWorkflowProps {
  vulnerability: Vulnerability;
  onClose: () => void;
  onApplied?: () => void;
}

type WorkflowStep = "idle" | "generating" | "validating" | "ready" | "applying" | "complete";

export const RemediationWorkflow = ({ vulnerability, onClose, onApplied }: RemediationWorkflowProps) => {
  const [step, setStep] = useState<WorkflowStep>("idle");
  const [progress, setProgress] = useState(0);
  const [remediation, setRemediation] = useState<RemediationResult | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [applyInfo, setApplyInfo] = useState<ApplyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState(false);

  const startRemediation = useCallback(async () => {
    setStep("generating");
    setProgress(10);
    setError(null);

    try {
      // Step 1: Generate enhanced fix
      const { data: genData, error: genError } = await supabase.functions.invoke("auto-remediation", {
        body: { vulnerability, action: "generate" },
      });

      if (genError) throw new Error(genError.message);
      if (genData?.error) throw new Error(genData.error);

      setRemediation(genData.result);
      setProgress(40);
      setStep("validating");

      // Step 2: Validate the fix
      const { data: valData, error: valError } = await supabase.functions.invoke("auto-remediation", {
        body: { 
          vulnerability: { ...vulnerability, fixedCode: genData.result.enhancedFix },
          action: "validate" 
        },
      });

      if (valError) throw new Error(valError.message);
      if (valData?.error) throw new Error(valData.error);

      setValidation(valData.result);
      setProgress(70);

      // Step 3: Generate apply workflow
      const { repoUrl, branch } = getGitHubConfig();
      const { data: applyData, error: applyError } = await supabase.functions.invoke("auto-remediation", {
        body: { 
          vulnerability: { ...vulnerability, fixedCode: genData.result.enhancedFix },
          action: "apply",
          context: { repository: repoUrl, branch }
        },
      });

      if (applyError) throw new Error(applyError.message);
      if (applyData?.error) throw new Error(applyData.error);

      setApplyInfo(applyData.result);
      setProgress(100);
      setStep("ready");

      toast.success("Remediation workflow ready!", {
        description: "Review the fix and apply when ready.",
      });
    } catch (err) {
      console.error("Remediation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate remediation");
      setStep("idle");
      toast.error("Failed to generate remediation");
    }
  }, [vulnerability]);

  const handleCopyCode = async () => {
    if (remediation?.enhancedFix) {
      await navigator.clipboard.writeText(remediation.enhancedFix);
      setCopiedCode(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyCommands = async () => {
    if (applyInfo?.commands) {
      await navigator.clipboard.writeText(applyInfo.commands.join("\n"));
      setCopiedCommands(true);
      toast.success("Commands copied to clipboard!");
      setTimeout(() => setCopiedCommands(false), 2000);
    }
  };

  const handleApplyFix = () => {
    const { repoUrl, branch } = getGitHubConfig();
    const prTitle = encodeURIComponent(applyInfo?.prTitle || `Fix: ${vulnerability.title}`);
    const prBody = encodeURIComponent(applyInfo?.prBody || vulnerability.description);
    const prUrl = `${repoUrl}/compare/${branch}...${branch}?quick_pull=1&title=${prTitle}&body=${prBody}`;
    window.open(prUrl, "_blank");
    setStep("complete");
    onApplied?.();
    toast.success("Opening GitHub to create PR...");
  };

  const handleEditOnGitHub = () => {
    const { repoUrl, branch } = getGitHubConfig();
    const editUrl = `${repoUrl}/edit/${branch}/${vulnerability.file}`;
    window.open(editUrl, "_blank");
  };

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      high: "bg-green-500/20 text-green-400 border-green-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      low: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[confidence as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="space-y-6">
      {/* Workflow Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Remediation Progress</span>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className={step !== "idle" ? "text-primary" : ""}>Generate</span>
          <span className={step === "validating" || step === "ready" || step === "complete" ? "text-primary" : ""}>Validate</span>
          <span className={step === "ready" || step === "complete" ? "text-primary" : ""}>Ready</span>
          <span className={step === "complete" ? "text-primary" : ""}>Applied</span>
        </div>
      </div>

      {/* Start Button */}
      {step === "idle" && (
        <div className="text-center space-y-4 py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Wand2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Automated Remediation</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              AI will generate an enhanced fix, validate it for security issues, and prepare a complete deployment workflow.
            </p>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm justify-center">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
          <Button onClick={startRemediation} size="lg" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Start Automated Remediation
          </Button>
        </div>
      )}

      {/* Loading State */}
      {(step === "generating" || step === "validating") && (
        <div className="text-center space-y-4 py-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <div>
            <h3 className="font-semibold">
              {step === "generating" ? "Generating Enhanced Fix..." : "Validating Security..."}
            </h3>
            <p className="text-sm text-muted-foreground">
              {step === "generating" 
                ? "Analyzing vulnerability and creating production-ready fix" 
                : "Checking for potential issues and security concerns"}
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {(step === "ready" || step === "complete") && remediation && (
        <Tabs defaultValue="fix" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="fix" className="gap-1">
              <FileCode className="h-3 w-3" />
              Fix
            </TabsTrigger>
            <TabsTrigger value="validation" className="gap-1">
              <Shield className="h-3 w-3" />
              Validation
            </TabsTrigger>
            <TabsTrigger value="tests" className="gap-1">
              <TestTube2 className="h-3 w-3" />
              Tests
            </TabsTrigger>
            <TabsTrigger value="apply" className="gap-1">
              <GitBranch className="h-3 w-3" />
              Apply
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fix" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Enhanced Fix</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleCopyCode}>
                    {copiedCode ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    {copiedCode ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <pre className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm font-mono">{remediation.enhancedFix}</code>
                  </pre>
                </ScrollArea>
                <p className="text-sm text-muted-foreground mt-3">{remediation.explanation}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Implementation Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {remediation.steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {remediation.additionalChanges.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Additional Changes Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {remediation.additionalChanges.map((change, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <FileCode className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{change.file}</span>
                          <p className="text-muted-foreground mt-1">{change.change}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="validation" className="space-y-4 mt-4">
            {validation && (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Validation Status</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getConfidenceBadge(validation.confidence)}>
                          {validation.confidence} confidence
                        </Badge>
                        {validation.isValid ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Issues Found</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{validation.securityScore}/10</div>
                        <div className="text-xs text-muted-foreground">Security Score</div>
                      </div>
                      <div className="flex-1">
                        <Progress value={validation.securityScore * 10} className="h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {validation.issues.length > 0 && (
                  <Card className="border-red-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-red-400">Potential Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {validation.issues.map((issue, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-red-300">
                            <AlertTriangle className="h-4 w-4 mt-0.5" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {validation.suggestions.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {validation.suggestions.map((sug, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                            {sug}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="tests" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Suggested Test Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {remediation.testCases.map((test, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <TestTube2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{test}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Security Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {remediation.securityNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Shield className="h-4 w-4 text-primary mt-0.5" />
                      {note}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-yellow-500" />
                  <CardTitle className="text-base">Rollback Plan</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{remediation.rollbackPlan}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apply" className="space-y-4 mt-4">
            {applyInfo && (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Git Commands</CardTitle>
                      <Button variant="outline" size="sm" onClick={handleCopyCommands}>
                        {copiedCommands ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                        {copiedCommands ? "Copied!" : "Copy All"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted rounded-lg p-4 overflow-x-auto">
                      <code className="text-sm font-mono">
                        {applyInfo.commands.join("\n")}
                      </code>
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Pull Request Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Title</span>
                      <p className="font-medium">{applyInfo.prTitle}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Commit Message</span>
                      <p className="font-mono text-sm">{applyInfo.commitMessage}</p>
                    </div>
                    <div className="flex gap-2">
                      {applyInfo.labels.map((label, i) => (
                        <Badge key={i} variant="outline">{label}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={handleEditOnGitHub} className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Edit File on GitHub
                  </Button>
                  <Button onClick={handleApplyFix} className="flex-1 bg-green-600 hover:bg-green-700">
                    <GitBranch className="h-4 w-4 mr-2" />
                    Create Pull Request
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Complete State */}
      {step === "complete" && (
        <div className="text-center py-4">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h3 className="font-semibold text-lg">Remediation Applied!</h3>
          <p className="text-sm text-muted-foreground">Pull request created. Review and merge when ready.</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};
