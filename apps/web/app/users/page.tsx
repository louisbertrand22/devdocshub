"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page/page-header";
import { Notice } from "@/components/page/notice";
import { RowListSkeleton } from "@/components/page/row-list";

type UserRow = { id: string; username: string; email: string; role: string; created_at?: string };
type State = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; users: UserRow[] };

export default function UsersPage() {
  const { apiBase, token, user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [state, setState] = useState<State>({ status: "loading" });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!token || !isAdmin) return;
    let cancelled = false;
    setState({ status: "loading" });
    apiFetch<UserRow[]>("/users/", {}, apiBase, token)
      .then((u) => {
        if (!cancelled) setState({ status: "ready", users: Array.isArray(u) ? u : [] });
      })
      .catch((e: Error) => {
        if (!cancelled) setState({ status: "error", message: e?.message || "Impossible de charger les utilisateurs." });
      });
    return () => {
      cancelled = true;
    };
  }, [token, apiBase, isAdmin, reload]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Utilisateurs"
        description="Comptes ayant accès à DevDocsHub."
        actions={
          isAdmin && (
            <Button variant="ghost" size="icon" aria-label="Actualiser" onClick={() => setReload((r) => r + 1)}>
              <RefreshCw />
            </Button>
          )
        }
      />
      {!token ? (
        <Notice>
          <Link href="/auth">Connecte-toi</Link> pour continuer.
        </Notice>
      ) : !user ? (
        <RowListSkeleton rows={3} />
      ) : !isAdmin ? (
        <Notice tone="warning">Réservé aux administrateurs.</Notice>
      ) : state.status === "error" ? (
        <Notice tone="danger">{state.message}</Notice>
      ) : state.status === "loading" ? (
        <RowListSkeleton rows={4} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-border font-mono text-[11px] text-fg-muted">
              <tr>
                <th className="px-4 py-2 font-normal">Nom</th>
                <th className="px-4 py-2 font-normal">Email</th>
                <th className="px-4 py-2 font-normal">Rôle</th>
                <th className="px-4 py-2 font-normal">Inscrit le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {state.users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-2">
                  <td className="px-4 py-2.5 font-medium">{u.username}</td>
                  <td className="px-4 py-2.5 font-mono text-fg-muted">{u.email}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant={u.role === "admin" ? "accent" : "neutral"}>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-fg-muted">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
