import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Plan badges
        free: "border-border bg-muted text-muted-foreground",
        pro: "border-primary/30 bg-primary/10 text-primary",
        // Status badges
        connected: "border-status-connected/30 bg-status-connected/10 text-status-connected",
        disconnected: "border-status-disconnected/30 bg-status-disconnected/10 text-status-disconnected",
        // Severity badges
        high: "border-severity-high/30 bg-severity-high/15 text-severity-high",
        medium: "border-severity-medium/30 bg-severity-medium/15 text-severity-medium",
        low: "border-severity-low/30 bg-severity-low/15 text-severity-low",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
