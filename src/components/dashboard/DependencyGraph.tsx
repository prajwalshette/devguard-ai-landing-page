import { useState } from "react";
import { Package, AlertTriangle, CheckCircle, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Dependency {
  id: string;
  name: string;
  version: string;
  vulnerabilities: number;
  severity: "high" | "medium" | "low" | "none";
  children?: Dependency[];
  isExpanded?: boolean;
}

const mockDependencies: Dependency[] = [
  {
    id: "1",
    name: "express",
    version: "4.18.2",
    vulnerabilities: 2,
    severity: "high",
    children: [
      {
        id: "1-1",
        name: "body-parser",
        version: "1.20.2",
        vulnerabilities: 1,
        severity: "medium",
      },
      {
        id: "1-2",
        name: "cookie",
        version: "0.5.0",
        vulnerabilities: 1,
        severity: "high",
      },
    ],
  },
  {
    id: "2",
    name: "lodash",
    version: "4.17.21",
    vulnerabilities: 0,
    severity: "none",
  },
  {
    id: "3",
    name: "axios",
    version: "1.4.0",
    vulnerabilities: 1,
    severity: "medium",
    children: [
      {
        id: "3-1",
        name: "follow-redirects",
        version: "1.15.2",
        vulnerabilities: 1,
        severity: "medium",
      },
    ],
  },
  {
    id: "4",
    name: "jsonwebtoken",
    version: "9.0.0",
    vulnerabilities: 0,
    severity: "none",
  },
  {
    id: "5",
    name: "bcrypt",
    version: "5.1.0",
    vulnerabilities: 0,
    severity: "none",
  },
];

export function DependencyGraph() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["1"]));

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getSeverityColor = (severity: Dependency["severity"]) => {
    switch (severity) {
      case "high":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "low":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      default:
        return "text-muted-foreground bg-muted/50 border-border";
    }
  };

  const getNodeColor = (severity: Dependency["severity"]) => {
    switch (severity) {
      case "high":
        return "border-red-500/50 bg-red-500/10";
      case "medium":
        return "border-yellow-500/50 bg-yellow-500/10";
      case "low":
        return "border-green-500/50 bg-green-500/10";
      default:
        return "border-border bg-muted/30";
    }
  };

  const renderDependency = (dep: Dependency, level: number = 0) => {
    const isExpanded = expandedIds.has(dep.id);
    const hasChildren = dep.children && dep.children.length > 0;

    return (
      <div key={dep.id} className="relative">
        {/* Connection lines */}
        {level > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border" style={{ left: `${level * 24 - 12}px` }} />
        )}
        
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${getNodeColor(
            dep.severity
          )} hover:border-primary/30`}
          style={{ marginLeft: `${level * 24}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(dep.id)}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <ChevronRight
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </button>
          ) : (
            <div className="w-6" />
          )}

          <Package className="h-4 w-4 text-muted-foreground" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium text-foreground">
                {dep.name}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                v{dep.version}
              </span>
            </div>
          </div>

          {dep.vulnerabilities > 0 ? (
            <Badge
              variant="outline"
              className={`text-xs ${getSeverityColor(dep.severity)}`}
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              {dep.vulnerabilities}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-green-400 bg-green-500/10 border-green-500/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              Secure
            </Badge>
          )}
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            {dep.children!.map((child) => renderDependency(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const totalVulnerabilities = mockDependencies.reduce(
    (acc, dep) =>
      acc +
      dep.vulnerabilities +
      (dep.children?.reduce((a, c) => a + c.vulnerabilities, 0) || 0),
    0
  );

  const affectedPackages = mockDependencies.filter(
    (d) => d.vulnerabilities > 0 || d.children?.some((c) => c.vulnerabilities > 0)
  ).length;

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Dependency Graph</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-xs">
          <ExternalLink className="h-3 w-3 mr-1" />
          View All
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-muted/30">
          <p className="text-lg font-bold font-mono text-foreground">
            {mockDependencies.length}
          </p>
          <p className="text-xs text-muted-foreground">Packages</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/30">
          <p className="text-lg font-bold font-mono text-red-400">
            {totalVulnerabilities}
          </p>
          <p className="text-xs text-muted-foreground">Vulnerabilities</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/30">
          <p className="text-lg font-bold font-mono text-yellow-400">
            {affectedPackages}
          </p>
          <p className="text-xs text-muted-foreground">Affected</p>
        </div>
      </div>

      {/* Tree View */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {mockDependencies.map((dep) => renderDependency(dep))}
      </div>
    </div>
  );
}
