"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Folder, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { excerpt, formatRelative } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/page/page-header";
import { Row, RowList, RowListSkeleton } from "@/components/page/row-list";
import { EmptyState } from "@/components/page/empty-state";
import { Notice } from "@/components/page/notice";

type Collection = { id: string; name: string; description?: string | null; created_at?: string | null };
type State = { status: "loading" } | { status: "error" } | { status: "ready"; collections: Collection[] };

export default function CollectionsPage() {
  const { apiBase, token } = useAuth();
  const [state, setState] = useState<State>({ status: "loading" });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setState({ status: "loading" });
    apiFetch<Collection[]>("/collections/?size=100", {}, apiBase, token)
      .then((c) => {
        if (!cancelled) setState({ status: "ready", collections: Array.isArray(c) ? c : [] });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [token, apiBase, reload]);

  const newButton = (
    <Link href="/collections/add" className={buttonVariants()}>
      <Plus /> Nouvelle collection
    </Link>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Collections" description="Regroupe des docs par projet ou par thème." actions={newButton} />
      {!token ? (
        <Notice>
          <Link href="/auth">Connecte-toi</Link> pour voir les collections.
        </Notice>
      ) : state.status === "error" ? (
        <Notice tone="danger">
          Impossible de charger les collections.{" "}
          <button type="button" onClick={() => setReload((r) => r + 1)}>
            Réessayer
          </button>
        </Notice>
      ) : state.status === "loading" ? (
        <RowListSkeleton rows={3} />
      ) : state.collections.length === 0 ? (
        <EmptyState
          icon={<Folder />}
          title="Aucune collection"
          description="Crée une collection pour regrouper des docs."
          action={
            <Link href="/collections/add" className={buttonVariants({ size: "sm" })}>
              <Plus /> Nouvelle collection
            </Link>
          }
        />
      ) : (
        <RowList>
          {state.collections.map((c) => (
            <Row
              key={c.id}
              title={c.name}
              description={excerpt(c.description, 160) || undefined}
              meta={<span>créée {formatRelative(c.created_at)}</span>}
            />
          ))}
        </RowList>
      )}
    </div>
  );
}
