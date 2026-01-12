import { useState, useCallback } from "react";
import { 
  Sparkles, 
  FileText, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Download,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface BatchSecurityAnalysisProps {
  vulnerabilities: Vulnerability[];
  context?: {
    repository?: string;
    prTitle?: string;
    prId?: string;
  };
}

export const BatchSecurityAnalysis = ({ 
  vulnerabilities, 
  context 
}: BatchSecurityAnalysisProps) => {
  const [report, setReport] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const highCount = vulnerabilities.filter(v => v.severity === "high").length;
  const mediumCount = vulnerabilities.filter(v => v.severity === "medium").length;
  const lowCount = vulnerabilities.filter(v => v.severity === "low").length;

  const generateReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setReport("");
    setProgress(0);
    setIsOpen(true);

    // Simulate initial progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 30));
    }, 100);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/batch-security-analysis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ vulnerabilities, context }),
        }
      );

      clearInterval(progressInterval);
      setProgress(40);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        if (response.status === 402) {
          throw new Error("AI credits exhausted. Please add funds to continue.");
        }
        throw new Error(errorData.error || "Failed to generate report");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullContent = "";
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });
        chunkCount++;
        
        // Update progress based on streaming
        setProgress(Math.min(40 + (chunkCount * 2), 95));

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullContent += content;
              setReport(fullContent);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setProgress(100);
      toast.success("Security report generated successfully!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Report generation failed";
      setError(message);
      toast.error("Report Generation Failed", { description: message });
    } finally {
      setIsLoading(false);
    }
  }, [vulnerabilities, context]);

  const downloadReport = useCallback(() => {
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  }, [report]);

  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
      .replace(/### (.*?)(\n|$)/g, '<h4 class="text-lg font-semibold text-foreground mt-6 mb-2 flex items-center gap-2">$1</h4>')
      .replace(/## (.*?)(\n|$)/g, '<h3 class="text-xl font-bold text-foreground mt-8 mb-3 pb-2 border-b border-border">$1</h3>')
      .replace(/# (.*?)(\n|$)/g, '<h2 class="text-2xl font-bold text-foreground mt-6 mb-4">$1</h2>')
      .replace(/- (.*?)(\n|$)/g, '<li class="ml-4 mb-1 text-muted-foreground">$1</li>')
      .replace(/\d+\. (.*?)(\n|$)/g, '<li class="ml-4 mb-1 list-decimal text-muted-foreground">$1</li>')
      .replace(/\n\n/g, '<br/><br/>');
  };

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card/50 to-primary/10 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-primary to-primary/60 p-3 shadow-lg shadow-primary/20">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Security Report</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Generate comprehensive analysis for all vulnerabilities
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vulnerability Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-severity-high/10 border border-severity-high/20 p-3">
              <XCircle className="h-4 w-4 text-severity-high" />
              <div>
                <p className="text-xs text-muted-foreground">High</p>
                <p className="text-lg font-bold text-severity-high">{highCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-severity-medium/10 border border-severity-medium/20 p-3">
              <AlertTriangle className="h-4 w-4 text-severity-medium" />
              <div>
                <p className="text-xs text-muted-foreground">Medium</p>
                <p className="text-lg font-bold text-severity-medium">{mediumCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-severity-low/10 border border-severity-low/20 p-3">
              <CheckCircle className="h-4 w-4 text-severity-low" />
              <div>
                <p className="text-xs text-muted-foreground">Low</p>
                <p className="text-lg font-bold text-severity-low">{lowCount}</p>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateReport}
            disabled={isLoading || vulnerabilities.length === 0}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="h-5 w-5 mr-2" />
                Generate AI Security Report
              </>
            )}
          </Button>

          {vulnerabilities.length === 0 && (
            <p className="text-sm text-center text-muted-foreground">
              No vulnerabilities to analyze
            </p>
          )}
        </CardContent>
      </Card>

      {/* Report Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              AI Security Analysis Report
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Badge variant="outline">{vulnerabilities.length} vulnerabilities analyzed</Badge>
              {context?.prTitle && (
                <Badge variant="secondary">{context.prTitle}</Badge>
              )}
            </DialogDescription>
          </DialogHeader>

          {isLoading && (
            <div className="space-y-3 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Analyzing vulnerabilities...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">{error}</span>
                </div>
                <Button size="sm" variant="outline" onClick={generateReport}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {report && (
            <ScrollArea className="flex-1 mt-4 max-h-[60vh]">
              <div 
                className="prose prose-sm dark:prose-invert max-w-none pr-4"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(report) }}
              />
            </ScrollArea>
          )}

          {report && !isLoading && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              <Button variant="outline" onClick={generateReport}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Regenerate
              </Button>
              <Button onClick={downloadReport}>
                <Download className="h-4 w-4 mr-1" />
                Download Report
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
