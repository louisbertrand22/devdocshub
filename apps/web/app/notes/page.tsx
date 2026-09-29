"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, StickyNote } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { useDocsStore } from "@/lib/docs-store";
import { filterNotes, type NoteItem } from "@/lib/list-filters";
import { excerpt, formatRelative } from "@/lib/format";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page/page-header";
import { Row, RowList, RowListSkeleton } from "@/components/page/row-list";
import { EmptyState } from "@/components/page/empty-state";
import { Notice } from "@/components/page/notice";

const ALL = "__all__";
type State = { status: "loading" } | { status: "error" } | { status: "ready"; notes: NoteItem[] };

export default function NotesPage() {
  return (
    <Suspense fallback={<RowListSkeleton rows={4} />}>
      <NotesView />
    </Suspense>
  );
}

function NotesView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const pinnedOnly = params.get("pinned") === "1";
  const docId = params.get("doc") ?? "";

  const { token, apiBase } = useAuth();
  const { docs, load } = useDocsStore();
  const [state, setState] = useState<State>({ status: "loading" });
  const [query, setQuery] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (token) void load(token, apiBase);
  }, [token, apiBase, load]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setState({ status: "loading" });
    apiFetch<NoteItem[]>("/notes", {}, apiBase, token)
      .then((notes) => {
        if (!cancelled) setState({ status: "ready", notes: Array.isArray(notes) ? notes : [] });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [token, apiBase, reload]);

  const docTitles = useMemo(() => new Map(docs.map((d) => [d.id, d.title])), [docs]);
  const sortedDocs = useMemo(() => [...docs].sort((a, b) => a.title.localeCompare(b.title, "fr")), [docs]);
  const view = useMemo(
    () => (state.status === "ready" ? filterNotes(state.notes, { query, pinnedOnly, docId }, (id) => docTitles.get(id)) : []),
    [state, query, pinnedOnly, docId, docTitles],
  );

  // Les filtres vivent dans l'URL : la sidebar et la page restent synchronisées
  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      const qs = next.toString();
      router.replace((qs ? `${pathname}?${qs}` : pathname) as Route, { scroll: false });
    },
    [params, pathname, router],
  );

  const filtering = query !== "" || pinnedOnly || docId !== "";
  const newNoteHref = (docId ? `/notes/new?doc=${docId}` : "/notes/new") as Route;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={pinnedOnly ? "Notes épinglées" : "Notes"}
        description="Tes notes, rattachées aux docs."
        actions={
          <Link href={newNoteHref} className={buttonVariants()}>
            <Plus /> Nouvelle note
          </Link>
        }
      />

      {!token ? (
        <Notice>
          <Link href="/auth">Connecte-toi</Link> pour voir les notes.
        </Notice>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrer les notes…"
                aria-label="Filtrer les notes"
                className="pl-9"
              />
            </div>
            <Select value={docId || ALL} onValueChange={(v) => setParam("doc", v === ALL ? null : v)}>
              <SelectTrigger className="sm:w-56" aria-label="Doc">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Tous les docs</SelectItem>
                {sortedDocs.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 whitespace-nowrap text-[13px] text-fg-muted">
              <Checkbox
                aria-label="Épinglées seulement"
                checked={pinnedOnly}
                onCheckedChange={(v) => setParam("pinned", v ? "1" : null)}
              />
              Épinglées seulement
            </label>
          </div>

          {state.status === "error" ? (
            <Notice tone="danger">
              Impossible de charger les notes.{" "}
              <button type="button" onClick={() => setReload((r) => r + 1)}>
                Réessayer
              </button>
            </Notice>
          ) : state.status === "loading" ? (
            <RowListSkeleton rows={4} />
          ) : view.length === 0 ? (
            filtering ? (
              <EmptyState
                icon={<Search />}
                title="Aucune note ne correspond"
                action={
                  <Button variant="outline" size="sm" onClick={() => { setQuery(""); router.replace("/notes"); }}>
                    Effacer les filtres
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={<StickyNote />}
                title="Aucune note pour l'instant"
                description="Ajoute une note depuis un doc ou ici."
                action={
                  <Link href="/notes/new" className={buttonVariants({ size: "sm" })}>
                    <Plus /> Nouvelle note
                  </Link>
                }
              />
            )
          ) : (
            <RowList>
              {view.map((n) => (
                <Row
                  key={n.id}
                  href={n.doc_id ? `/docs/${n.doc_id}` : undefined}
                  title={excerpt(n.content, 140) || "(note vide)"}
                  meta={
                    <>
                      {n.is_pinned && <span className="text-warning">★ épinglée</span>}
                      {n.doc_id && <span>{docTitles.get(n.doc_id) ?? "doc supprimé"}</span>}
                      <span>{formatRelative(n.updated_at ?? n.created_at)}</span>
                    </>
                  }
                />
              ))}
            </RowList>
          )}
        </>
      )}
    </div>
  );
}
