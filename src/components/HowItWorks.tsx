import { GitPullRequest, Scan, MessageSquare, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: GitPullRequest,
    title: "Open a pull request",
    description: "Push your code and open a PR as you normally would. No changes to your workflow required.",
    code: `git checkout -b feature/auth
git push origin feature/auth
# Open PR on GitHub ✓`,
  },
  {
    number: "02",
    icon: Scan,
    title: "DevGuard AI scans the diff",
    description: "Our AI analyzes only the changed code, checking for OWASP Top 10, injection flaws, auth issues, and more.",
    code: `Scanning 12 files changed...
├── src/auth/login.ts
├── src/api/users.ts
└── src/db/queries.ts
Found: 2 issues`,
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "Get clear fixes as PR comments",
    description: "Receive inline comments explaining each vulnerability with copy-paste fixes. No security expertise needed.",
    code: `// ⚠️ SQL Injection Risk
// Line 42: user input in query
- db.query(\`SELECT * WHERE id=\${id}\`)
+ db.query('SELECT * WHERE id=?', [id])`,
  },
];

const HowItWorks = () => {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsl(174_72%_56%/0.05)_0%,transparent_70%)]" />

      <div className="container relative z-10 px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block text-primary font-mono text-sm uppercase tracking-wider mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Security in{" "}
            <span className="text-gradient">three simple steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            No CLI tools to install. No CI/CD pipelines to configure. 
            Just connect your repo and start shipping secure code.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="space-y-8 sm:space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="group relative">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-start">
                  {/* Step info */}
                  <div className="flex-1 lg:max-w-md">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-primary font-mono text-sm font-bold">
                        {step.number}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Code block */}
                  <div className="flex-1 w-full lg:w-auto">
                    <div className="relative rounded-xl border border-border bg-card overflow-hidden group-hover:border-primary/30 transition-colors">
                      {/* Terminal header */}
                      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/50">
                        <div className="w-3 h-3 rounded-full bg-destructive/70" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                        <div className="w-3 h-3 rounded-full bg-green-500/70" />
                        <span className="ml-2 text-xs text-muted-foreground font-mono">terminal</span>
                      </div>
                      <pre className="p-4 text-sm font-mono text-muted-foreground overflow-x-auto">
                        <code>{step.code}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute left-[7.5rem] top-full items-center justify-center h-12">
                    <ArrowRight className="w-5 h-5 text-primary/30 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
