import { Button } from "@/components/ui/button";
import { Github, ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(174_72%_56%/0.1)_0%,transparent_60%)]" />

      <div className="container relative z-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-primary/20 bg-gradient-to-b from-card to-background p-8 sm:p-12 md:p-16 text-center overflow-hidden">
            {/* Inner glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[radial-gradient(ellipse_at_top,hsl(174_72%_56%/0.15)_0%,transparent_70%)]" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Start securing your code{" "}
                <span className="text-gradient">in 30 seconds</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                Connect your GitHub repo and get your first security review 
                on your next pull request. No credit card required.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button variant="hero" size="xl">
                  <Github className="w-5 h-5" />
                  Install GitHub App
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                Free for open source • No credit card required
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
