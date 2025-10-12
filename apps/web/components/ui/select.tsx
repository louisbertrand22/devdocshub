"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import styles from "./select.module.css";

/* --- SVG inline (pas de lucide) --- */
function IconCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconChevronsUpDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polyline points="7 15 12 20 17 15" />
      <polyline points="7 9 12 4 17 9" />
    </svg>
  );
}
/* ---------------------------------- */

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
  className = "",
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={`${styles.trigger} ${className}`}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <IconChevronsUpDown className="ml-2 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className = "",
  children,
  position = "popper",
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
  position?: "item-aligned" | "popper";
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={`${styles.content} ${className}`}
        position={position}
        {...props}
      >
        <SelectPrimitive.Viewport className={styles.viewport}>
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectLabel({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>) {
  return <SelectPrimitive.Label className={`${styles.label} ${className}`} {...props} />;
}

export function SelectItem({
  className = "",
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={`${styles.item} ${className}`}
      {...props}
    >
      <span className={styles.itemIndicator}>
        <SelectPrimitive.ItemIndicator>
          <IconCheck />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export function SelectSeparator({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator className={`${styles.separator} ${className}`} {...props} />;
}

export function SelectScrollUpButton({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>) {
  return <SelectPrimitive.ScrollUpButton className={`${styles.scrollButton} ${className}`} {...props} />;
}

export function SelectScrollDownButton({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>) {
  return <SelectPrimitive.ScrollDownButton className={`${styles.scrollButton} ${className}`} {...props} />;
}
