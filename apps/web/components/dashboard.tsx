"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Plus, StickyNote } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { useDocsStore } from "@/lib/docs-store";
import { sortDocs, filterNotes, type NoteItem } from "@/lib/list-filters";
import { excerpt, formatRelative } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/page/page-header";
import { StatCard } from "@/components/page/stat-card";
import { Row, RowList, RowListSkeleton } from "@/components/page/row-list";
import { EmptyState } from "@/components/page/empty-state";
import { Notice } from "@/components/page/notice";

type Counts = { docs?: number; notes?: number; collections?: number };

async function count(path: string, apiBase: string, token: string): Promise<number | undefined> {
  try {
    const data: any = await apiFetch(path, {}, apiBase, token);
    if (typeof data === "number") return data;
    if (typeof data?.count === "number") return data.count;
    return undefined;
  } catch {
    return undefined;
  }
}

export default function Dashboard() {
  const { user, token, apiBase } = useAuth();
  const { status: docsStatus, docs, load } = useDocsStore();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [notes, setNotes] = useState<NoteItem[] | null>(null);

  const username = user?.username || user?.email?.split("@")[0] || "";
  const hour = new Date().getHours();
  const greeting = hour >= 18 || hour < 5 ? "Bonsoir" : "Bonjour";

  useEffect(() => {
    if (!token) return;
    void load(token, apiBase);
    let cancelled = false;
    Promise.all([
      count("/docs/count", apiBase, token),
      count("/notes/count", apiBase, token),
      count("/collections/count", apiBase, token),
    ]).then(([d, n, c]) => {
      if (!cancelled) setCounts({ docs: d, notes: n, collections: c });
    });
    apiFetch<NoteItem[]>("/notes", {}, apiBase, token)
      .then((all) => {
        if (!cancelled) setNotes(Array.isArray(all) ? all : []);
      })
      .catch(() => {
        if (!cancelled) setNotes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [token, apiBase, load]);

  const recentDocs = useMemo(() => sortDocs(docs, "recent").slice(0, 5), [docs]);
  const docTitles = useMemo(() => new Map(docs.map((d) => [d.id, d.title])), [docs]);
  const pinned = useMemo(
    () => (notes ? filterNotes(notes.filter((n) => !user?.id || n.user_id === user.id), { pinnedOnly: true }).slice(0, 5) : null),
    [notes, user?.id],
  );

  if (!token) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Dashboard" />
        <Notice>
          <Link href="/auth">Connecte-toi</Link> pour voir ton espace.
        </Notice>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="~/dashboard"
        title={username ? `${greeting}, ${username}` : greeting}
        description="Tes docs, tes notes et tes collections en un coup d'œil."
        actions={
          <>
            <Link href="/notes/new" className={buttonVariants({ variant: "outline" })}>
              <Plus /> Nouvelle note
            </Link>
            <Link href="/docs/new" className={buttonVariants()}>
              <Plus /> Nouveau doc
            </Link>
          </>
        }
      />

      <section aria-label="Compteurs" className="grid grid-cols-3 gap-3">
        <StatCard label="Docs" value={counts?.docs} loading={!counts} />
        <StatCard label="Notes" value={counts?.notes} loading={!counts} />
        <StatCard label="Collections" value={counts?.collections} loading={!counts} />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="recent-docs" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="recent-docs" className="text-base">Docs récents</h2>
            <Link href="/docs" className="font-mono text-xs text-fg-muted hover:text-fg">tout voir →</Link>
          </div>
          {docsStatus === "error" ? (
            <Notice tone="danger">Impossible de charger les docs.</Notice>
          ) : docsStatus !== "ready" ? (
            <RowListSkeleton rows={3} />
          ) : recentDocs.length === 0 ? (
            <EmptyState icon={<FileText />} title="Aucun doc" description="Crée ton premier doc." />
          ) : (
            <RowList>
              {recentDocs.map((d) => (
                <Row
                  key={d.id}
                  href={`/docs/${d.id}`}
                  title={d.title}
                  meta={<span>{formatRelative(d.created_at)}</span>}
                  aside={d.tech ? <Badge variant="neutral">~/{d.tech.trim().toLowerCase()}</Badge> : undefined}
                />
              ))}
            </RowList>
          )}
        </section>

        <section aria-labelledby="pinned-notes" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="pinned-notes" className="text-base">Notes épinglées</h2>
            <Link href="/notes?pinned=1" className="font-mono text-xs text-fg-muted hover:text-fg">tout voir →</Link>
          </div>
          {pinned === null ? (
            <RowListSkeleton rows={3} />
          ) : pinned.length === 0 ? (
            <EmptyState icon={<StickyNote />} title="Aucune note épinglée" description="Épingle une note pour la retrouver ici." />
          ) : (
            <RowList>
              {pinned.map((n) => (
                <Row
                  key={n.id}
                  href={n.doc_id ? `/docs/${n.doc_id}` : undefined}
                  title={excerpt(n.content, 100) || "(note vide)"}
                  meta={
                    <>
                      {n.doc_id && <span>{docTitles.get(n.doc_id) ?? "doc supprimé"}</span>}
                      <span>{formatRelative(n.updated_at ?? n.created_at)}</span>
                    </>
                  }
                />
              ))}
            </RowList>
          )}
        </section>
      </div>
    </div>
  );
}
