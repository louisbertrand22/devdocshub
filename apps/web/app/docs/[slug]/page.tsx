"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { extractHeadings } from "@/lib/markdown";
import { formatRelative } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/page/empty-state";
import { Markdown } from "@/components/markdown";
import { Toc } from "@/components/toc";
import { DocNotes } from "@/components/doc-notes";

type DocDetail = { id: string; title: string; slug?: string; tech?: string; content?: string; created_at?: string | null };
type State = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; doc: DocDetail };

export default function DocViewPage() {
  const params = useParams();
  const id = params?.slug as string;
  const { apiBase, token } = useAuth();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ status: "error", message: "Connecte-toi pour lire ce document." });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    apiFetch<DocDetail>(`/docs/doc/${id}`, {}, apiBase, token)
      .then((doc) => {
        if (!cancelled) setState({ status: "ready", doc });
      })
      .catch((e: Error) => {
        if (cancelled) return;
        const notFound = /^(404|422)\b/.test(e?.message ?? "");
        setState({ status: "error", message: notFound ? "Document introuvable" : "Impossible de charger le document." });
      });
    return () => {
      cancelled = true;
    };
  }, [id, token, apiBase]);

  const headings = useMemo(
    () => (state.status === "ready" ? extractHeadings(state.doc.content ?? "") : []),
    [state],
  );

  if (state.status === "loading") {
    return (
      <div aria-label="Chargement du document" className="flex max-w-[72ch] flex-col gap-4">
        <div className="h-3 w-40 animate-pulse rounded bg-surface-2" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-surface-2" />
        {[92, 85, 60, 88].map((w) => (
          <div key={w} className="h-3 animate-pulse rounded bg-surface-2" style={{ width: `${w}%` }} />
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <EmptyState
        icon={<FileText />}
        title={state.message}
        description="Le lien est peut-être erroné, ou le doc a été supprimé."
        action={
          <Link href="/docs" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ArrowLeft /> Tous les docs
          </Link>
        }
      />
    );
  }

  const { doc } = state;
  const tech = (doc.tech ?? "").trim().toLowerCase();

  return (
    <div className="flex gap-12">
      <article className="min-w-0 max-w-[72ch] flex-1">
        <nav aria-label="Fil d'Ariane" className="font-mono text-xs text-fg-muted">
          <Link href="/docs" className="hover:text-fg">docs</Link>
          {tech && (
            <>
              {" / "}
              <Link href={`/docs?tech=${encodeURIComponent(tech)}` as Route} className="hover:text-fg">~/{tech}</Link>
            </>
          )}
        </nav>
        <h1 className="mt-3">{doc.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-fg-muted">
          <span>créé {formatRelative(doc.created_at)}</span>
          {doc.slug && <span>/{doc.slug}</span>}
        </div>
        <Markdown content={doc.content ?? ""} className="mt-8" />
        <DocNotes docId={doc.id} />
      </article>
      {headings.length > 0 && <Toc headings={headings} />}
    </div>
  );
}
