import { Github, Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="container px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-semibold">DevGuard AI</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6 sm:gap-8">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Social */}
          <a
            href="#"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-5 h-5" />
            <span>GitHub</span>
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DevGuard AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
