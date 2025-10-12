import * as React from "react";
import styles from "./input.module.css";

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${styles.input} ${className}`} {...props} />;
}
export default Input;
