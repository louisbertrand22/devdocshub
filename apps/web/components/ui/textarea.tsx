import * as React from "react";
import styles from "./textarea.module.css";

export function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${styles.textarea} ${className}`} {...props} />;
}
export default Textarea;
