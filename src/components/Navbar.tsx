import { Button } from "@/components/ui/button";
import { Github, Shield, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <nav className="container max-w-6xl mx-auto px-4 sm:px-6 py-4 rounded-2xl border border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-semibold hidden sm:block">DevGuard AI</span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </a>
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button variant="default" size="sm">
                <Github className="w-4 h-4" />
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-border">
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </a>
                <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </a>
                <a href="#docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Docs
                </a>
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <Button variant="ghost" size="sm" className="w-full justify-center">
                    Sign In
                  </Button>
                  <Button variant="default" size="sm" className="w-full justify-center">
                    <Github className="w-4 h-4" />
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
