import { Check, X, Minus } from "lucide-react";

interface ComparisonItem {
  feature: string;
  devguard: "yes" | "no" | "partial";
  enterprise: "yes" | "no" | "partial";
}

const comparisonData: ComparisonItem[] = [
  { feature: "Setup time", devguard: "yes", enterprise: "no" },
  { feature: "PR-level scanning", devguard: "yes", enterprise: "partial" },
  { feature: "Plain-English explanations", devguard: "yes", enterprise: "no" },
  { feature: "Copy-paste fixes", devguard: "yes", enterprise: "no" },
  { feature: "Affordable for startups", devguard: "yes", enterprise: "no" },
  { feature: "No false positive noise", devguard: "yes", enterprise: "no" },
  { feature: "Free for open source", devguard: "yes", enterprise: "partial" },
  { feature: "Enterprise compliance", devguard: "partial", enterprise: "yes" },
];

const getStatusIcon = (status: "yes" | "no" | "partial") => {
  switch (status) {
    case "yes":
      return <Check className="w-5 h-5 text-primary" />;
    case "no":
      return <X className="w-5 h-5 text-destructive/70" />;
    case "partial":
      return <Minus className="w-5 h-5 text-muted-foreground" />;
  }
};

const Comparison = () => {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Glow effect */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,hsl(174_72%_56%/0.08)_0%,transparent_70%)]" />

      <div className="container relative z-10 px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block text-primary font-mono text-sm uppercase tracking-wider mb-4">
            Comparison
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            DevGuard AI vs{" "}
            <span className="text-muted-foreground">Enterprise tools</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Enterprise SAST tools are built for compliance, not developers. 
            We built DevGuard AI for teams who want to ship fast and secure.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4 p-4 sm:p-6 border-b border-border bg-secondary/30">
              <div className="text-sm font-medium text-muted-foreground">Feature</div>
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  DevGuard AI
                </span>
              </div>
              <div className="text-center">
                <span className="text-sm text-muted-foreground font-medium">Enterprise Tools</span>
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border">
              {comparisonData.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-4 p-4 sm:p-6 transition-colors hover:bg-secondary/20"
                >
                  <div className="text-sm font-medium">{item.feature}</div>
                  <div className="flex justify-center">
                    {getStatusIcon(item.devguard)}
                  </div>
                  <div className="flex justify-center">
                    {getStatusIcon(item.enterprise)}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer note */}
            <div className="p-4 sm:p-6 border-t border-border bg-secondary/20">
              <p className="text-xs text-muted-foreground text-center">
                <Minus className="w-4 h-4 inline mr-1" />
                Partial support means feature exists but with significant limitations
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
