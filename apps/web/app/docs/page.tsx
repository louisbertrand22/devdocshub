"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileText, Plus, RefreshCw, Search } from "lucide-react";
import { useAuth } from "@/lib/store";
import { useDocsStore } from "@/lib/docs-store";
import { filterDocs, sortDocs, type DocSort } from "@/lib/list-filters";
import { excerpt, formatRelative } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page/page-header";
import { Row, RowList, RowListSkeleton } from "@/components/page/row-list";
import { EmptyState } from "@/components/page/empty-state";
import { Notice } from "@/components/page/notice";

const ALL = "__all__";

export default function DocsPage() {
  return (
    <Suspense fallback={<RowListSkeleton rows={5} />}>
      <DocsView />
    </Suspense>
  );
}

function DocsView() {
  const params = useSearchParams();
  const { token, apiBase } = useAuth();
  const { status, docs, load, invalidate } = useDocsStore();
  const [query, setQuery] = useState("");
  const [tech, setTech] = useState(params.get("tech") ?? "");
  const [sort, setSort] = useState<DocSort>("recent");

  useEffect(() => {
    if (token) void load(token, apiBase);
  }, [token, apiBase, load]);

  useEffect(() => setTech(params.get("tech") ?? ""), [params]);

  const techs = useMemo(
    () => [...new Set(docs.map((d) => (d.tech ?? "").trim().toLowerCase()).filter(Boolean))].sort(),
    [docs],
  );
  const view = useMemo(() => sortDocs(filterDocs(docs, { query, tech }), sort), [docs, query, tech, sort]);
  const filtering = query !== "" || tech !== "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Docs"
        description="Toute la documentation, rangée par techno."
        actions={
          <>
            <Button variant="ghost" size="icon" aria-label="Actualiser" onClick={invalidate} disabled={!token}>
              <RefreshCw />
            </Button>
            <Link href="/docs/new" className={buttonVariants()}>
              <Plus /> Nouveau doc
            </Link>
          </>
        }
      />

      {!token ? (
        <Notice>
          <Link href="/auth">Connecte-toi</Link> pour voir les docs.
        </Notice>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrer par titre, techno, contenu…"
                aria-label="Filtrer les docs"
                className="pl-9"
              />
            </div>
            <Select value={tech || ALL} onValueChange={(v) => setTech(v === ALL ? "" : v)}>
              <SelectTrigger className="sm:w-44" aria-label="Techno">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Toutes les technos</SelectItem>
                {techs.map((t) => (
                  <SelectItem key={t} value={t}>
                    ~/{t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as DocSort)}>
              <SelectTrigger className="sm:w-40" aria-label="Tri">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récents</SelectItem>
                <SelectItem value="oldest">Plus anciens</SelectItem>
                <SelectItem value="title">Titre A → Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === "error" ? (
            <Notice tone="danger">
              Impossible de charger les docs.{" "}
              <button type="button" onClick={invalidate}>
                Réessayer
              </button>
            </Notice>
          ) : status !== "ready" ? (
            <RowListSkeleton rows={5} />
          ) : view.length === 0 ? (
            filtering ? (
              <EmptyState
                icon={<Search />}
                title="Aucun résultat"
                description="Aucun doc ne correspond à ces filtres."
                action={
                  <Button variant="outline" size="sm" onClick={() => { setQuery(""); setTech(""); }}>
                    Effacer les filtres
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={<FileText />}
                title="Aucun doc pour l'instant"
                description="Crée le premier pour démarrer la base."
                action={
                  <Link href="/docs/new" className={buttonVariants({ size: "sm" })}>
                    <Plus /> Nouveau doc
                  </Link>
                }
              />
            )
          ) : (
            <>
              <p className="font-mono text-[11px] text-fg-muted">
                {view.length} / {docs.length} docs
              </p>
              <RowList>
                {view.map((d) => (
                  <Row
                    key={d.id}
                    href={`/docs/${d.id}`}
                    title={d.title}
                    description={excerpt(d.content, 140) || undefined}
                    meta={<span>{formatRelative(d.created_at)}</span>}
                    aside={d.tech ? <Badge variant="neutral">~/{d.tech.trim().toLowerCase()}</Badge> : undefined}
                  />
                ))}
              </RowList>
            </>
          )}
        </>
      )}
    </div>
  );
}
