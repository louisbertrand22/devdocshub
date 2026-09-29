"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { excerpt, formatRelative } from "@/lib/format";
import { filterNotes, type NoteItem } from "@/lib/list-filters";
import { buttonVariants } from "@/components/ui/button";
import { Notice } from "@/components/page/notice";
import { Row, RowList, RowListSkeleton } from "@/components/page/row-list";

type State = { status: "loading" } | { status: "error" } | { status: "ready"; notes: NoteItem[] };

export function DocNotes({ docId }: { docId: string }) {
  const { token, apiBase } = useAuth();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setState({ status: "loading" });
    apiFetch<NoteItem[]>(`/notes/doc/${docId}/notes`, {}, apiBase, token)
      .then((notes) => {
        if (!cancelled) setState({ status: "ready", notes: filterNotes(Array.isArray(notes) ? notes : [], {}) });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [docId, token, apiBase]);

  return (
    <section aria-labelledby="doc-notes-title" className="mt-16 border-t border-border pt-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="doc-notes-title" className="text-base">
          Notes
          {state.status === "ready" && (
            <span className="ml-2 font-mono text-xs font-normal text-fg-muted">{state.notes.length}</span>
          )}
        </h2>
        <Link href={`/notes/new?doc=${docId}` as Route} className={buttonVariants({ variant: "outline", size: "sm" })}>
          <Plus /> Ajouter une note
        </Link>
      </div>
      {state.status === "loading" ? (
        <RowListSkeleton rows={2} />
      ) : state.status === "error" ? (
        <Notice tone="danger">Impossible de charger les notes.</Notice>
      ) : state.notes.length === 0 ? (
        <p className="text-[13px] text-fg-muted">Aucune note sur ce doc pour l'instant.</p>
      ) : (
        <RowList>
          {state.notes.map((n) => (
            <Row
              key={n.id}
              title={excerpt(n.content, 140) || "(note vide)"}
              meta={
                <>
                  {n.is_pinned && <span className="text-warning">★ épinglée</span>}
                  <span>{formatRelative(n.updated_at ?? n.created_at)}</span>
                </>
              }
            />
          ))}
        </RowList>
      )}
    </section>
  );
}
