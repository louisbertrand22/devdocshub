"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/store";
import { useDocsStore } from "@/lib/docs-store";
import { useMounted } from "@/hooks/useMounted";
import { groupDocsByTech } from "@/lib/docs-tree";
import { SidebarLink } from "./sidebar-link";

export function DocsSidebar() {
  const pathname = usePathname();
  const mounted = useMounted();
  const { token, apiBase } = useAuth();
  const { status, docs, load } = useDocsStore();

  // Rechargement à chaque changement de route, servi par le cache (TTL 60 s)
  useEffect(() => {
    if (token) void load(token, apiBase);
  }, [token, apiBase, pathname, load]);

  const groups = useMemo(() => groupDocsByTech(docs), [docs]);

  return (
    <nav aria-label="Docs" className="flex flex-col gap-5">
      <div className="flex flex-col gap-0.5">
        <SidebarLink href="/docs" active={pathname === "/docs"}>Tous les docs</SidebarLink>
        <SidebarLink href="/docs/new" active={pathname === "/docs/new"}>+ Nouveau doc</SidebarLink>
      </div>

      {!mounted ? null : !token ? (
        <p className="px-2.5 text-[13px] text-fg-muted">
          <Link href="/auth" className="text-accent hover:underline">Connecte-toi</Link> pour voir les docs.
        </p>
      ) : status === "loading" || status === "idle" ? (
        <div className="flex flex-col gap-2 px-2.5" aria-label="Chargement des docs">
          {[70, 55, 80, 45, 65].map((w) => (
            <div key={w} className="h-3 animate-pulse rounded bg-surface-2" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : status === "error" ? (
        <p className="px-2.5 text-[13px] text-danger">Impossible de charger les docs.</p>
      ) : groups.length === 0 ? (
        <p className="px-2.5 text-[13px] text-fg-muted">Aucun doc pour l'instant.</p>
      ) : (
        groups.map((group) => (
          <div key={group.tech} className="flex flex-col gap-0.5">
            <div className="px-2.5 pb-1 font-mono text-[11px] text-fg-muted">~/{group.tech}</div>
            {group.docs.map((doc) => (
              <SidebarLink key={doc.id} href={`/docs/${doc.id}`} active={pathname === `/docs/${doc.id}`}>
                {doc.title}
              </SidebarLink>
            ))}
          </div>
        ))
      )}
    </nav>
  );
}
