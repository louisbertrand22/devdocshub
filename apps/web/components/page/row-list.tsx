import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function RowList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ul className={cn("divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface", className)}>
      {children}
    </ul>
  );
}

export function Row({
  href,
  title,
  description,
  meta,
  aside,
}: {
  href?: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  aside?: ReactNode;
}) {
  const body = (
    <div className="flex items-start gap-4 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-fg">{title}</div>
        {description && <p className="mt-0.5 line-clamp-2 text-[13px] text-fg-muted">{description}</p>}
        {meta && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-fg-muted">{meta}</div>
        )}
      </div>
      {aside && <div className="flex shrink-0 items-center gap-2">{aside}</div>}
    </div>
  );
  return (
    <li>
      {href ? (
        <Link href={href as Route} className="block transition-colors hover:bg-surface-2 focus-visible:bg-surface-2">
          {body}
        </Link>
      ) : (
        body
      )}
    </li>
  );
}

export function RowListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-label="Chargement" className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex flex-col gap-2 px-4 py-4">
          <div className="h-3 w-1/3 animate-pulse rounded bg-surface-2" />
          <div className="h-2.5 w-2/3 animate-pulse rounded bg-surface-2" />
        </div>
      ))}
    </div>
  );
}
