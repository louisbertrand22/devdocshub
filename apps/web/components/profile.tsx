"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page/page-header";
import { StatCard } from "@/components/page/stat-card";
import { Notice } from "@/components/page/notice";

type UserDetails = { id: string; email: string; username: string; role: string; created_at?: string };
type Stats = { docs?: number; collections?: number; notes?: number };

export default function Profile() {
  const { token, apiBase } = useAuth();
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    apiFetch<UserDetails>("/auth/me", {}, apiBase, token)
      .then((d) => {
        if (!cancelled) setDetails(d);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e?.message || "Impossible de charger le profil.");
      });
    return () => {
      cancelled = true;
    };
  }, [token, apiBase]);

  useEffect(() => {
    if (!token || !details?.id) return;
    let cancelled = false;
    Promise.all([
      apiFetch<number>("/docs/count", {}, apiBase, token).catch(() => undefined),
      apiFetch<number>("/collections/count/mine", {}, apiBase, token).catch(() => undefined),
      apiFetch<number>(`/notes/count/mine?uuid=${details.id}`, {}, apiBase, token).catch(() => undefined),
    ]).then(([docs, collections, notes]) => {
      if (!cancelled) setStats({ docs, collections, notes });
    });
    return () => {
      cancelled = true;
    };
  }, [token, apiBase, details?.id]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <PageHeader title="Mon profil" description="Tes informations et ton activité." />
      {!token ? (
        <Notice>
          <Link href="/auth">Connecte-toi</Link> pour voir ton profil.
        </Notice>
      ) : error ? (
        <Notice tone="danger">{error}</Notice>
      ) : !details ? (
        <div className="h-28 animate-pulse rounded-lg border border-border bg-surface" aria-label="Chargement du profil" />
      ) : (
        <>
          <section className="flex items-center gap-4 rounded-lg border border-border bg-surface p-5">
            <div className="grid size-14 shrink-0 place-items-center rounded-full bg-accent-subtle font-mono text-xl font-semibold text-accent ring-1 ring-accent-border">
              {(details.username || details.email)[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate">{details.username}</h2>
                <Badge variant={details.role === "admin" ? "accent" : "neutral"}>{details.role}</Badge>
              </div>
              <p className="truncate font-mono text-[13px] text-fg-muted">{details.email}</p>
              {details.created_at && (
                <p className="mt-1 font-mono text-[11px] text-fg-muted">membre depuis le {formatDate(details.created_at)}</p>
              )}
            </div>
          </section>
          <section aria-label="Activité" className="grid grid-cols-3 gap-3">
            <StatCard label="Docs" value={stats?.docs} loading={!stats} />
            <StatCard label="Mes notes" value={stats?.notes} loading={!stats} />
            <StatCard label="Mes collections" value={stats?.collections} loading={!stats} />
          </section>
        </>
      )}
    </div>
  );
}
