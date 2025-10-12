import * as React from "react";
import styles from "./button.module.css";

type Variant = "primary" | "secondary" | "outline" | "default" | "ghost";
type Size = "sm" | "md" | "icon";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  return (
    <button 
      className={`${styles.button} ${styles[size]} ${styles[variant]} ${className}`} 
      {...props} 
    />
  );
}

export default Button;
