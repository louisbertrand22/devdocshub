import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";

export function SidebarLink({
  href,
  active = false,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href as Route}
      aria-current={active ? "page" : undefined}
      className={cn(
        "block truncate rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
        active
          ? "rounded-l-none border-l-2 border-accent bg-accent-subtle text-accent"
          : "text-fg-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      {children}
    </Link>
  );
}
