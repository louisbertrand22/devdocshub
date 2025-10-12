import * as React from "react"
import styles from "./badge.module.css"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  return (
    <div 
      className={`${styles.badge} ${styles[variant]} ${className}`} 
      {...props} 
    />
  );
}

export { Badge }
