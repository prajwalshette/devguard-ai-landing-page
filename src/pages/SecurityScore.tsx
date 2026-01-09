import { ArrowLeft, Calendar, Download, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TopNavigation } from "@/components/dashboard/TopNavigation";
import { SecurityScoreCard } from "@/components/dashboard/SecurityScoreCard";
import { VulnerabilityTrendChart } from "@/components/dashboard/VulnerabilityTrendChart";
import { SeverityBreakdownChart } from "@/components/dashboard/SeverityBreakdownChart";
import { ResolutionRateChart } from "@/components/dashboard/ResolutionRateChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useRef } from "react";
import { exportSecurityReportPDF } from "@/utils/exportSecurityReport";
import { toast } from "sonner";

// Mock data for trends over time
const trendData = [
  { date: "Jan", high: 12, medium: 18, low: 8 },
  { date: "Feb", high: 10, medium: 15, low: 12 },
  { date: "Mar", high: 8, medium: 20, low: 10 },
  { date: "Apr", high: 15, medium: 14, low: 6 },
  { date: "May", high: 6, medium: 12, low: 9 },
  { date: "Jun", high: 4, medium: 10, low: 7 },
  { date: "Jul", high: 2, medium: 8, low: 5 },
];

const severityData = [
  { name: "High", value: 12, color: "hsl(0, 72%, 51%)" },
  { name: "Medium", value: 28, color: "hsl(38, 92%, 50%)" },
  { name: "Low", value: 15, color: "hsl(142, 71%, 45%)" },
];

const resolutionData = [
  { week: "Week 1", found: 15, resolved: 8 },
  { week: "Week 2", found: 12, resolved: 14 },
  { week: "Week 3", found: 8, resolved: 10 },
  { week: "Week 4", found: 10, resolved: 12 },
];

const topVulnerabilities = [
  { type: "SQL Injection", count: 8, severity: "high" as const },
  { type: "XSS", count: 6, severity: "high" as const },
  { type: "Hardcoded Secrets", count: 12, severity: "medium" as const },
  { type: "Missing Rate Limits", count: 9, severity: "medium" as const },
  { type: "Insecure Cookies", count: 5, severity: "low" as const },
];

const SecurityScore = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [isExporting, setIsExporting] = useState(false);

  // Refs for chart capture
  const scoreCardRef = useRef<HTMLDivElement>(null);
  const severityChartRef = useRef<HTMLDivElement>(null);
  const trendChartRef = useRef<HTMLDivElement>(null);
  const resolutionChartRef = useRef<HTMLDivElement>(null);

  const timeRangeLabels: Record<string, string> = {
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
    "1y": "Last year",
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportSecurityReportPDF({
        score: 78,
        scoreChange: 5,
        trendData,
        severityData,
        resolutionData,
        topVulnerabilities,
        timeRange: timeRangeLabels[timeRange],
        chartRefs: {
          scoreCard: scoreCardRef.current,
          severityChart: severityChartRef.current,
          trendChart: trendChartRef.current,
          resolutionChart: resolutionChartRef.current,
        },
      });
      toast.success("Security report exported with charts!");
    } catch (error) {
      toast.error("Failed to export report");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation isConnected={true} plan="free" />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Back Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="-ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px] bg-card/50">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting ? "Exporting..." : "Export PDF"}
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Security Score Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your security posture and vulnerability trends over time
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6">
          {/* Top Row - Score + Breakdown */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div ref={scoreCardRef}>
              <SecurityScoreCard score={78} change={5} period="last month" />
            </div>
            <div className="lg:col-span-2" ref={severityChartRef}>
              <SeverityBreakdownChart data={severityData} />
            </div>
          </div>

          {/* Middle Row - Trend Chart */}
          <div ref={trendChartRef}>
            <VulnerabilityTrendChart data={trendData} />
          </div>

          {/* Bottom Row - Resolution + Top Issues */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div ref={resolutionChartRef}>
              <ResolutionRateChart data={resolutionData} />
            </div>
            
            {/* Top Vulnerability Types */}
            <div className="border border-border/50 bg-card/50 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Top Vulnerability Types
              </h3>
              <div className="space-y-3">
                {topVulnerabilities.map((vuln, index) => (
                  <div
                    key={vuln.type}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground font-mono w-5">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium">{vuln.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          vuln.severity === "high"
                            ? "bg-severity-high/20 text-severity-high"
                            : vuln.severity === "medium"
                            ? "bg-severity-medium/20 text-severity-medium"
                            : "bg-severity-low/20 text-severity-low"
                        }`}
                      >
                        {vuln.severity}
                      </span>
                      <span className="text-sm font-mono text-foreground">
                        {vuln.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecurityScore;
