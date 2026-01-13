import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Brain, 
  Sparkles, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown,
  Target,
  Zap,
  Lock,
  Server,
  Code,
  Package,
  Eye,
  RefreshCw,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Recommendation {
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  description: string;
  impact: string;
  steps: string[];
}

interface RecommendationsData {
  recommendations: Recommendation[];
  overallAssessment: string;
  riskScore: number;
}

interface SecurityData {
  totalVulnerabilities: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  securityScore: number;
  patterns?: string[];
  repositoryCount: number;
  activeScans: number;
  lastScan: string;
  commonTypes?: string[];
}

interface SecurityRecommendationsProps {
  securityData?: SecurityData;
}

const defaultSecurityData: SecurityData = {
  totalVulnerabilities: 24,
  critical: 3,
  high: 8,
  medium: 9,
  low: 4,
  securityScore: 72,
  patterns: [
    "SQL Injection vulnerabilities in user input handling",
    "Missing authentication checks on API endpoints",
    "Outdated dependencies with known CVEs",
    "Hardcoded credentials in configuration files"
  ],
  repositoryCount: 12,
  activeScans: 3,
  lastScan: new Date().toISOString(),
  commonTypes: [
    "CWE-89: SQL Injection",
    "CWE-79: Cross-site Scripting",
    "CWE-287: Improper Authentication",
    "CWE-798: Hardcoded Credentials"
  ]
};

const categoryIcons: Record<string, React.ReactNode> = {
  "authentication": <Lock className="h-4 w-4" />,
  "authorization": <Shield className="h-4 w-4" />,
  "data-protection": <Eye className="h-4 w-4" />,
  "infrastructure": <Server className="h-4 w-4" />,
  "code-quality": <Code className="h-4 w-4" />,
  "dependencies": <Package className="h-4 w-4" />,
  "monitoring": <Target className="h-4 w-4" />
};

const priorityConfig = {
  critical: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertTriangle },
  high: { color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: AlertTriangle },
  medium: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Zap },
  low: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: CheckCircle2 }
};

export const SecurityRecommendations = ({ securityData = defaultSecurityData }: SecurityRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const generateRecommendations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('security-recommendations', {
        body: { securityData }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setRecommendations(response.data);
      toast.success("Security recommendations generated successfully");
    } catch (error) {
      console.error("Failed to generate recommendations:", error);
      toast.error("Failed to generate recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [securityData]);

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const getRiskLevel = (score: number) => {
    if (score >= 75) return { label: "Critical Risk", color: "text-red-400" };
    if (score >= 50) return { label: "High Risk", color: "text-orange-400" };
    if (score >= 25) return { label: "Medium Risk", color: "text-yellow-400" };
    return { label: "Low Risk", color: "text-green-400" };
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Security Recommendations</CardTitle>
              <CardDescription>
                Proactive security improvements based on detected patterns
              </CardDescription>
            </div>
          </div>
          <Button 
            onClick={generateRecommendations} 
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Recommendations
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!recommendations && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No recommendations yet</p>
            <p className="text-sm mt-1">
              Click "Generate Recommendations" to get AI-powered security insights
            </p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="relative inline-block">
              <Brain className="h-12 w-12 text-primary animate-pulse" />
              <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
            </div>
            <p className="text-lg font-medium mt-4">Analyzing security patterns...</p>
            <p className="text-sm text-muted-foreground mt-1">
              Our AI is reviewing your security data
            </p>
          </div>
        )}

        {recommendations && (
          <div className="space-y-6">
            {/* Risk Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-muted/50 border-border">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Risk Score</span>
                    <span className={`font-bold ${getRiskLevel(recommendations.riskScore).color}`}>
                      {recommendations.riskScore}/100
                    </span>
                  </div>
                  <Progress 
                    value={recommendations.riskScore} 
                    className="h-2"
                  />
                  <p className={`text-xs mt-1 ${getRiskLevel(recommendations.riskScore).color}`}>
                    {getRiskLevel(recommendations.riskScore).label}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/50 border-border">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Recommendations</span>
                  </div>
                  <p className="text-2xl font-bold">{recommendations.recommendations.length}</p>
                  <p className="text-xs text-muted-foreground">Actionable improvements</p>
                </CardContent>
              </Card>

              <Card className="bg-muted/50 border-border">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-muted-foreground">Critical Items</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {recommendations.recommendations.filter(r => r.priority === "critical").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Require immediate attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Overall Assessment */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Overall Assessment</h4>
                    <p className="text-sm text-muted-foreground">
                      {recommendations.overallAssessment}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations List */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {recommendations.recommendations.map((rec, index) => {
                  const PriorityIcon = priorityConfig[rec.priority].icon;
                  const isExpanded = expandedItems.has(index);

                  return (
                    <Collapsible key={index} open={isExpanded} onOpenChange={() => toggleExpanded(index)}>
                      <Card className="bg-muted/30 border-border hover:border-primary/30 transition-colors">
                        <CollapsibleTrigger className="w-full">
                          <CardContent className="pt-4 pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 text-left">
                                <div className="p-1.5 rounded bg-muted">
                                  {categoryIcons[rec.category] || <Shield className="h-4 w-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h4 className="font-medium">{rec.title}</h4>
                                    <Badge 
                                      variant="outline" 
                                      className={priorityConfig[rec.priority].color}
                                    >
                                      <PriorityIcon className="h-3 w-3 mr-1" />
                                      {rec.priority}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {rec.category}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {rec.description}
                                  </p>
                                </div>
                              </div>
                              <ChevronDown 
                                className={`h-5 w-5 text-muted-foreground transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`} 
                              />
                            </div>
                          </CardContent>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0 pb-4 border-t border-border mt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <Target className="h-4 w-4 text-primary" />
                                  Expected Impact
                                </h5>
                                <p className="text-sm text-muted-foreground">{rec.impact}</p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                                  Implementation Steps
                                </h5>
                                <ul className="space-y-1">
                                  {rec.steps.map((step, stepIndex) => (
                                    <li 
                                      key={stepIndex} 
                                      className="text-sm text-muted-foreground flex items-start gap-2"
                                    >
                                      <span className="text-primary font-mono text-xs mt-0.5">
                                        {stepIndex + 1}.
                                      </span>
                                      {step}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
