import { Zap, BookOpen, Coins, Shield, Clock, Code2 } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "No CI/CD setup",
    description: "Connect your GitHub repo in 30 seconds. We handle all the infrastructure so you can focus on building.",
  },
  {
    icon: BookOpen,
    title: "Developer-friendly explanations",
    description: "Every vulnerability comes with context, risk level, and a clear fix. No cryptic error codes or jargon.",
  },
  {
    icon: Coins,
    title: "Affordable for small teams",
    description: "Pay only for what you scan. Free tier for open source projects. No enterprise sales calls required.",
  },
  {
    icon: Shield,
    title: "OWASP Top 10 coverage",
    description: "Comprehensive checks for SQL injection, XSS, CSRF, broken auth, and all critical web vulnerabilities.",
  },
  {
    icon: Clock,
    title: "Fast scans",
    description: "Get results in under 60 seconds. DevGuard AI analyzes only the diff, not your entire codebase.",
  },
  {
    icon: Code2,
    title: "Multi-language support",
    description: "Works with JavaScript, TypeScript, Python, Go, Ruby, Java, and more. One tool for your whole stack.",
  },
];

const Features = () => {
  return (
    <section className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />

      <div className="container relative z-10 px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block text-primary font-mono text-sm uppercase tracking-wider mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Built for developers,{" "}
            <span className="text-gradient">not compliance teams</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Security tools shouldn't slow you down. DevGuard AI integrates 
            seamlessly into your existing workflow.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 sm:p-8 rounded-2xl border border-border bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/60"
            >
              <div className="mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
