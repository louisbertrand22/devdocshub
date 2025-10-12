import * as React from "react";
import styles from "./label.module.css";

export function Label({ className = "", ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`${styles.label} ${className}`} {...props} />;
}
export default Label;
