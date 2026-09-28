import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const accent = "border-accent-border bg-accent-subtle text-accent";
const neutral = "border-border bg-surface-2 text-fg-muted";
const danger = "border-danger/40 bg-danger/10 text-danger";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] leading-4",
  {
    variants: {
      variant: {
        accent,
        default: accent,
        neutral,
        secondary: neutral,
        outline: "border-border text-fg",
        success: "border-success/40 bg-success/10 text-success",
        warning: "border-warning/40 bg-warning/10 text-warning",
        danger,
        destructive: danger,
      },
    },
    defaultVariants: { variant: "accent" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
