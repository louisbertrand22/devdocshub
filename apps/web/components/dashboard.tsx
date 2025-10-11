"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Folder, StickyNote, Users, Plus, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/store";
import { apiFetch } from "@/lib/api";

/**
 * Dashboard moderne avec salutation dynamique Bonjour/Bonsoir {username}
 * + Récupération LIVE des stats depuis l'API (avec fallback intelligent)
 */

export type DashboardStats = {
  docs?: number;
  collections?: number;
  notes?: number;
  users?: number;
};

export default function Dashboard({
  stats,
  endpoints,
  fetchOnMount = true,
}: {
  stats?: DashboardStats;
  /**
   * Personnalisez les endpoints si votre backend diffère
   * ex: { docs: "/stats/docs" }
   */
  endpoints?: Partial<Record<keyof DashboardStats, string>>;
  /**
   * Désactivez le fetch auto si vous voulez fournir les stats en props
   */
  fetchOnMount?: boolean;
}) {
  const { user, token, apiBase } = useAuth();
  const username = user?.name || user?.email?.split("@")?.[0] || "Utilisateur";

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour >= 18 || hour < 5 ? "Bonsoir" : "Bonjour";

  const [live, setLive] = React.useState<DashboardStats | null>(stats ?? null);
  const [loading, setLoading] = React.useState<boolean>(!stats && fetchOnMount);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!fetchOnMount) return;

    let abort = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const mergedEndpoints: Record<keyof DashboardStats, string[]> = {
          docs: [
            endpoints?.docs ?? "/docs/count",
          ],
          collections: [
            endpoints?.collections ?? "/collections/count",
          ],
          notes: [
            endpoints?.notes ?? "/notes/count",
          ],
          users: [
            endpoints?.users ?? "/users/count",
          ],
        };

        async function tryFetchCount(paths: string[]): Promise<number | undefined> {
          for (const p of paths) {
            try {
              const data: any = await apiFetch(p, {}, apiBase, token ?? null);
              // Heuristiques de formats possibles
              if (typeof data === "number") return data;
              if (typeof data?.count === "number") return data.count;
              if (Array.isArray(data)) return data.length; // fallback naïf si non paginé
              if (typeof data?.total === "number") return data.total;
              if (typeof data?.data?.total === "number") return data.data.total;
            } catch (e) {
              // essayer endpoint suivant
            }
          }
          return undefined;
        }

        const [docs, collections, notes, users] = await Promise.all([
          tryFetchCount(mergedEndpoints.docs),
          tryFetchCount(mergedEndpoints.collections),
          tryFetchCount(mergedEndpoints.notes),
          tryFetchCount(mergedEndpoints.users),
        ]);

        if (!abort) {
          setLive({ docs, collections, notes, users });
          setLoading(false);
        }
      } catch (e: any) {
        if (!abort) {
          setError(e?.message || "Impossible de charger les statistiques.");
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      abort = true;
    };
  }, [apiBase, token, endpoints, fetchOnMount]);

  const values = live ?? stats ?? {};

  return (
    <div className="space-y-6">
      {/* Hero greeting */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-50 via-white to-transparent p-6 md:p-8"
      >
        <div className="relative z-10">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {greeting} <span className="text-indigo-600">{username}</span>
          </h1>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            Bienvenue sur DevDocsHub. Retrouvez vos documents, notes et collections au même endroit.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Nouveau document
            </Button>
            <Button variant="outline" className="gap-2">
              <Folder className="h-4 w-4" /> Nouvelle collection
            </Button>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-200/40 blur-3xl" />
      </motion.section>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Stats cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Documents" value={values.docs} icon={<FileText className="h-4 w-4" />} loading={loading} />
        <StatCard title="Collections" value={values.collections} icon={<Folder className="h-4 w-4" />} loading={loading} />
        <StatCard title="Notes" value={values.notes} icon={<StickyNote className="h-4 w-4" />} loading={loading} />
        <StatCard title="Utilisateurs" value={values.users} icon={<Users className="h-4 w-4" />} loading={loading} />
      </section>

      {/* Quick links / activity placeholder */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Activité récente</CardTitle>
            <Button variant="outline" size="sm" className="gap-1">
              Voir tout <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Guide d'intégration API</span>
                </div>
                <span className="text-muted-foreground">il y a 2 h</span>
              </li>
              <li className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <Folder className="h-4 w-4" />
                  <span className="font-medium">Collection "Backend" mise à jour</span>
                </div>
                <span className="text-muted-foreground">hier</span>
              </li>
              <li className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <StickyNote className="h-4 w-4" />
                  <span className="font-medium">Note "Todo sprint"</span>
                </div>
                <span className="text-muted-foreground">il y a 3 j</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Raccourcis</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start gap-2">
              <Plus className="h-4 w-4" /> Importer un document
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Folder className="h-4 w-4" /> Parcourir les collections
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Users className="h-4 w-4" /> Gérer les membres
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon, loading }: { title: string; value?: number; icon: React.ReactNode; loading?: boolean }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="rounded-full border bg-muted p-2 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
        ) : (
          <div className="text-3xl font-bold tracking-tight">{value ?? "—"}</div>
        )}
        <p className="mt-1 text-xs text-muted-foreground">Total {title.toLowerCase()}</p>
      </CardContent>
    </Card>
  );
}
