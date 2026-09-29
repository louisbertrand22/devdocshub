import * as React from "react";
import { cn } from "@/lib/utils";

export const fieldClasses =
  "w-full rounded-md border border-border bg-bg px-3 text-sm text-fg placeholder:text-fg-muted transition-colors focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldClasses, "h-9", className)} {...props} />
  ),
);
Input.displayName = "Input";
export default Input;
