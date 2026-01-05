import { Shield } from "lucide-react";

export function DevGuardLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 border border-primary/20">
        <Shield className="h-4 w-4 text-primary" />
      </div>
      <span className="font-semibold text-foreground tracking-tight">
        DevGuard <span className="text-primary">AI</span>
      </span>
    </div>
  );
}
