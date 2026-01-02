import { AlertTriangle, Clock, DollarSign, Users } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "No time for security reviews",
    description: "Small teams are shipping fast. Security reviews get deprioritized when you're racing to product-market fit.",
  },
  {
    icon: DollarSign,
    title: "Enterprise tools are expensive",
    description: "SAST tools cost $50k+/year. That's your entire runway spent on a tool that generates noise, not fixes.",
  },
  {
    icon: Users,
    title: "No dedicated security team",
    description: "Startups don't have AppSec engineers. Developers are left guessing about security best practices.",
  },
  {
    icon: AlertTriangle,
    title: "Vulnerabilities ship to production",
    description: "Without automated checks, SQL injection, XSS, and auth bugs make it to your users.",
  },
];

const Problem = () => {
  return (
    <section className="relative py-24 sm:py-32">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />

      <div className="container relative z-10 px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block text-primary font-mono text-sm uppercase tracking-wider mb-4">
            The Problem
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Why startups skip security
          </h2>
          <p className="text-lg text-muted-foreground">
            You know security matters. But when you're a small team moving fast, 
            it always falls to the bottom of the priority list.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="group relative p-6 sm:p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <problem.icon className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {problem.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;
