import { useState, useCallback } from "react";
import { Sparkles, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Vulnerability {
  title: string;
  severity: string;
  file: string;
  line: number;
  description: string;
  vulnerableCode: string;
  fixedCode: string;
  cweId: string;
}

interface AISecurityInsightsProps {
  vulnerability: Vulnerability;
}

export const AISecurityInsights = ({ vulnerability }: AISecurityInsightsProps) => {
  const [insights, setInsights] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeVulnerability = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setInsights("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/security-insights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ vulnerability }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        if (response.status === 402) {
          throw new Error("AI credits exhausted. Please add funds to continue.");
        }
        throw new Error(errorData.error || "Failed to analyze vulnerability");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

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
              setInsights(fullContent);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setHasAnalyzed(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
      toast.error("AI Analysis Failed", { description: message });
    } finally {
      setIsLoading(false);
    }
  }, [vulnerability]);

  if (!hasAnalyzed && !isLoading) {
    return (
      <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/20 p-2">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">AI Security Analysis</h4>
              <p className="text-xs text-muted-foreground">
                Get natural language explanation and smart fix suggestions
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={analyzeVulnerability}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Analyze
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-full bg-primary/20 p-2 animate-pulse">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium">Analyzing vulnerability...</span>
          </div>
        </div>
        {insights && (
          <div className="prose prose-sm dark:prose-invert max-w-none mt-3 pl-11">
            <div 
              className="text-sm text-muted-foreground whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ 
                __html: insights
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-xs">$1</code>')
                  .replace(/### (.*?)(\n|$)/g, '<h4 class="text-foreground font-semibold mt-3 mb-1">$1</h4>')
                  .replace(/## (.*?)(\n|$)/g, '<h3 class="text-foreground font-bold mt-4 mb-2">$1</h3>')
                  .replace(/- (.*?)(\n|$)/g, '<li class="ml-4">$1</li>')
              }}
            />
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={analyzeVulnerability}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/20 p-2">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h4 className="font-medium text-sm">AI Security Analysis</h4>
        </div>
        <Button size="sm" variant="ghost" onClick={analyzeVulnerability}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>
      <div className="pl-11">
        <div 
          className="prose prose-sm dark:prose-invert max-w-none text-sm"
          dangerouslySetInnerHTML={{ 
            __html: insights
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-xs">$1</code>')
              .replace(/### (.*?)(\n|$)/g, '<h4 class="text-foreground font-semibold mt-3 mb-1">$1</h4>')
              .replace(/## (.*?)(\n|$)/g, '<h3 class="text-foreground font-bold mt-4 mb-2">$1</h3>')
              .replace(/- (.*?)(\n|$)/g, '<li class="ml-4">$1</li>')
              .replace(/\d+\. (.*?)(\n|$)/g, '<li class="ml-4 list-decimal">$1</li>')
          }}
        />
      </div>
    </div>
  );
};
