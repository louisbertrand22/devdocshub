"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "@/lib/utils";

/* --- SVG inline (pas de lucide) --- */
function IconCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
/* ---------------------------------- */

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  containerClassName?: string;
}

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, containerClassName, ...props }, ref) => (
  <span className={cn("inline-flex items-center", containerClassName)}>
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer grid size-4 shrink-0 place-items-center rounded-[4px] border border-border bg-bg transition-colors data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-fg disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="grid place-items-center">
        <IconCheck />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  </span>
));
Checkbox.displayName = "Checkbox";
