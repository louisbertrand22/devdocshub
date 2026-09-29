"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText, Plus, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { useDocsStore } from "@/lib/docs-store";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { PageHeader } from "@/components/page/page-header";
import { RowList, RowListSkeleton } from "@/components/page/row-list";
import { EmptyState } from "@/components/page/empty-state";
import { Notice } from "@/components/page/notice";

type Collection = { id: string; name: string; description?: string | null };
type DocMini = { id: string; slug: string; title: string; tech?: string | null };
type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; collection: Collection; docs: DocMini[] };

export default function CollectionPage() {
  const id = useParams()?.id as string;
  const { apiBase, token } = useAuth();
  const { docs: allDocs, load } = useDocsStore();
  const { toast } = useToast();
  const [state, setState] = useState<State>({ status: "loading" });
  const [reload, setReload] = useState(0);
  const [docId, setDocId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!token) return;
    void load(token, apiBase);
    let cancelled = false;
    Promise.all([
      apiFetch<Collection>(`/collections/${id}`, {}, apiBase, token),
      apiFetch<DocMini[]>(`/collections/${id}/docs`, {}, apiBase, token),
    ])
      .then(([collection, docs]) => {
        if (!cancelled) setState({ status: "ready", collection, docs: Array.isArray(docs) ? docs : [] });
      })
      .catch((e: Error) => {
        if (cancelled) return;
        const notFound = /^(404|422)\b/.test(e?.message ?? "");
        setState({ status: "error", message: notFound ? "Collection introuvable" : "Impossible de charger la collection." });
      });
    return () => {
      cancelled = true;
    };
  }, [id, token, apiBase, load, reload]);

  const inCollection = useMemo(() => new Set(state.status === "ready" ? state.docs.map((d) => d.id) : []), [state]);
  const addable = useMemo(
    () => allDocs.filter((d) => !inCollection.has(d.id)).sort((a, b) => a.title.localeCompare(b.title, "fr")),
    [allDocs, inCollection],
  );

  async function addDoc(e: FormEvent) {
    e.preventDefault();
    if (!docId) return setError("Choisis un doc.");
    setError(undefined);
    setBusy(true);
    try {
      await apiFetch(`/collections/${id}/docs`, { method: "POST", body: JSON.stringify({ doc_id: docId }) }, apiBase, token);
      toast({ title: "Doc ajouté à la collection", variant: "success" });
      setDocId("");
      setReload((r) => r + 1);
    } catch {
      setError("Impossible d'ajouter le doc.");
    } finally {
      setBusy(false);
    }
  }

  async function removeDoc(doc: DocMini) {
    setBusy(true);
    try {
      await apiFetch(`/collections/${id}/docs/${doc.id}`, { method: "DELETE" }, apiBase, token);
      toast({ title: `« ${doc.title} » retiré de la collection` });
      setReload((r) => r + 1);
    } catch {
      toast({ title: "Impossible de retirer le doc", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  const back = (
    <Link href="/collections" className={buttonVariants({ variant: "ghost", size: "sm" })}>
      <ArrowLeft /> Collections
    </Link>
  );

  if (!token) {
    return (
      <Notice>
        <Link href="/auth">Connecte-toi</Link> pour voir cette collection.
      </Notice>
    );
  }
  if (state.status === "loading") return <RowListSkeleton rows={3} />;
  if (state.status === "error") {
    return <EmptyState icon={<FileText />} title={state.message} action={back} />;
  }

  const { collection, docs } = state;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="collections"
        title={collection.name}
        description={collection.description || `${docs.length} doc${docs.length > 1 ? "s" : ""}`}
        actions={back}
      />

      <form onSubmit={addDoc} noValidate className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center">
        <label htmlFor="add-doc" className="text-sm font-medium sm:shrink-0">
          Ajouter un doc
        </label>
        <div className="min-w-0 flex-1">
          <Select value={docId} onValueChange={setDocId} disabled={busy || addable.length === 0}>
            <SelectTrigger id="add-doc" aria-invalid={!!error}>
              <SelectValue placeholder={addable.length === 0 ? "Tous les docs sont déjà dans la collection" : "Choisir un doc"} />
            </SelectTrigger>
            <SelectContent>
              {addable.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.title}
                  {d.tech ? ` · ~/${d.tech.trim().toLowerCase()}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={busy || !docId}>
          <Plus /> Ajouter
        </Button>
      </form>
      {error && <Notice tone="danger">{error}</Notice>}

      {docs.length === 0 ? (
        <EmptyState icon={<FileText />} title="Collection vide" description="Ajoute des docs avec le sélecteur ci-dessus." />
      ) : (
        <RowList>
          {docs.map((d) => (
            <li key={d.id} className="flex items-center gap-2 pr-3">
              <Link href={`/docs/${d.id}` as Route} className="min-w-0 flex-1 px-4 py-3 transition-colors hover:bg-surface-2 focus-visible:bg-surface-2">
                <span className="block truncate text-sm font-medium text-fg">{d.title}</span>
              </Link>
              {d.tech && <Badge variant="neutral">~/{d.tech.trim().toLowerCase()}</Badge>}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Retirer « ${d.title} » de la collection`}
                onClick={() => removeDoc(d)}
                disabled={busy}
              >
                <X />
              </Button>
            </li>
          ))}
        </RowList>
      )}
    </div>
  );
}
