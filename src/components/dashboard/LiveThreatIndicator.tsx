import { Shield, Zap, Activity } from "lucide-react";
import { useState, useEffect } from "react";

interface ThreatLevel {
  level: "low" | "medium" | "high" | "critical";
  activeThreats: number;
  lastScanTime: string;
  scanningRepo?: string;
}

export function LiveThreatIndicator() {
  const [isScanning, setIsScanning] = useState(true);
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>({
    level: "medium",
    activeThreats: 12,
    lastScanTime: "2 min ago",
    scanningRepo: "api-gateway",
  });

  // Simulate real-time scanning
  useEffect(() => {
    const repos = ["api-gateway", "web-client", "auth-service", "ml-pipeline"];
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % repos.length;
      setThreatLevel((prev) => ({
        ...prev,
        scanningRepo: repos[index],
        lastScanTime: "just now",
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getLevelColor = (level: ThreatLevel["level"]) => {
    switch (level) {
      case "critical":
        return "from-red-600 to-red-500";
      case "high":
        return "from-orange-500 to-amber-500";
      case "medium":
        return "from-yellow-500 to-amber-400";
      case "low":
        return "from-green-500 to-emerald-400";
    }
  };

  const getLevelTextColor = (level: ThreatLevel["level"]) => {
    switch (level) {
      case "critical":
        return "text-red-400";
      case "high":
        return "text-orange-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
    }
  };

  const getPulseColor = (level: ThreatLevel["level"]) => {
    switch (level) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 p-6 backdrop-blur-sm">
      {/* Animated Background Glow */}
      <div
        className={`absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br ${getLevelColor(
          threatLevel.level
        )} opacity-20 blur-3xl animate-pulse`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`h-12 w-12 rounded-xl bg-gradient-to-br ${getLevelColor(
                  threatLevel.level
                )} flex items-center justify-center`}
              >
                <Shield className="h-6 w-6 text-white" />
              </div>
              {/* Pulse indicator */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getPulseColor(
                    threatLevel.level
                  )} opacity-75`}
                />
                <span
                  className={`relative inline-flex rounded-full h-4 w-4 ${getPulseColor(
                    threatLevel.level
                  )}`}
                />
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Threat Level
              </h3>
              <p
                className={`text-sm font-medium uppercase tracking-wide ${getLevelTextColor(
                  threatLevel.level
                )}`}
              >
                {threatLevel.level}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold font-mono text-foreground">
              {threatLevel.activeThreats}
            </p>
            <p className="text-xs text-muted-foreground">Active Threats</p>
          </div>
        </div>

        {/* Real-time scanning indicator */}
        {isScanning && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Scanning{" "}
              <span className="text-foreground font-mono">
                {threatLevel.scanningRepo}
              </span>
            </span>
            <div className="ml-auto flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold font-mono text-green-400">89%</p>
            <p className="text-xs text-muted-foreground">Protected</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold font-mono text-foreground">24</p>
            <p className="text-xs text-muted-foreground">Scans Today</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold font-mono text-primary">5</p>
            <p className="text-xs text-muted-foreground">Fixed Today</p>
          </div>
        </div>
      </div>
    </div>
  );
}
