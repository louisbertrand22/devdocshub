"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import styles from "./checkbox.module.css";

/* --- SVG inline (pas de lucide) --- */
function IconCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" {...props}>
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
>(({ className = "", containerClassName = "", ...props }, ref) => (
  <span className={`${styles.container} ${containerClassName}`}>
    <CheckboxPrimitive.Root
      ref={ref}
      className={`${styles.checkbox} ${className}`}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={styles.indicator}>
        <IconCheck />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  </span>
));
Checkbox.displayName = "Checkbox";
