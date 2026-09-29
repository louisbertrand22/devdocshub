"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/markdown";
import { cn } from "@/lib/utils";

export function Toc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-64px 0px -70% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav
      aria-label="Sur cette page"
      className="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-52 shrink-0 self-start overflow-y-auto xl:block"
    >
      <p className="mb-2 font-mono text-[11px] text-fg-muted">Sur cette page</p>
      <ul className="flex flex-col border-l border-border">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l py-1 text-[13px] transition-colors",
                h.depth === 3 ? "pl-6" : "pl-3",
                active === h.id ? "border-accent text-accent" : "border-transparent text-fg-muted hover:text-fg",
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
