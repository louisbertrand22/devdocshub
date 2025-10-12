"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw, Plus, FileText, Search } from "lucide-react";
import "./page.css";

const ALL = "__ALL__";

// Custom SVG icon for X (close)
const IconX = (p: any) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

type Doc = {
  id: string;
  title: string;
  description?: string;
  content?: string;
  collection_id?: string | null;
  collection_name?: string | null;
  tags?: string[];
  created_at?: string | null;
  updated_at?: string | null;
  author?: string | null;
};

export default function DocsPage() {
  const router = useRouter();
  const { apiBase, token, user } = useAuth();
  const { toast } = useToast();

  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(false);

  // UI state (filtres/tri)
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "created_at" | "updated_at">("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [collectionFilter, setCollectionFilter] = useState<string | "">("");

  const abortRef = useRef<AbortController | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await apiFetch("/docs/all", { signal: ctrl.signal }, apiBase, token);
      const raw: any[] = Array.isArray(res) ? res : res?.items || [];
      const normalized: Doc[] = raw.map((d) => ({
        id: String(d.id),
        title: d.title ?? "(Sans titre)",
        description: d.description ?? "",
        content: d.content ?? "",
        collection_id: d.collection_id ?? d.collectionId ?? null,
        collection_name: d.collection?.name ?? d.collection_name ?? null,
        tags: Array.isArray(d.tags)
          ? d.tags.map(String)
          : typeof d.tags === "string" && d.tags.trim()
          ? d.tags.split(",").map((t: string) => t.trim())
          : [],
        created_at: d.created_at ?? d.createdAt ?? d.created ?? null,
        updated_at: d.updated_at ?? d.updatedAt ?? d.updated ?? null,
        author: d.author ?? d.user?.name ?? null,
      }));
      setDocs(normalized);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      toast({
        title: "Erreur de chargement",
        description: e?.message || "Impossible de charger les documents.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, apiBase]);

  // Collections disponibles
  const allCollections = useMemo(() => {
    const map = new Map<string, string>();
    docs.forEach((d) => {
      if (d.collection_id) map.set(d.collection_id, d.collection_name || "Sans nom");
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [docs]);

  // Filtrer + Rechercher
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs.filter((d) => {
      if (collectionFilter && d.collection_id !== collectionFilter) return false;
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        (d.description || "").toLowerCase().includes(q) ||
        (d.content || "").toLowerCase().includes(q) ||
        (d.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [docs, query, collectionFilter]);

  // Tri
  const view = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    const fn = (a: Doc, b: Doc) => {
      switch (sortBy) {
        case "title":
          return dir * a.title.localeCompare(b.title);
        case "created_at": {
          const aa = a.created_at ? +new Date(a.created_at) : 0;
          const bb = b.created_at ? +new Date(b.created_at) : 0;
          return dir * (aa - bb);
        }
        case "updated_at":
        default: {
          const aa = a.updated_at ? +new Date(a.updated_at) : 0;
          const bb = b.updated_at ? +new Date(b.updated_at) : 0;
          return dir * (aa - bb);
        }
      }
    };
    return [...filtered].sort(fn);
  }, [filtered, sortBy, sortDir]);

  const clearFilters = () => {
    setQuery("");
    setSortBy("updated_at");
    setSortDir("desc");
    setCollectionFilter("");
  };

  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString() : "—");

  return (
    <div className="space-y-6 container-left">
      {/* Header + actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
        <div className="flex gap-2">
          <Button onClick={load} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
          </Button>
          <Button onClick={() => router.push("/docs/new")}>
            <Plus className="w-4 h-4 mr-2" /> Nouveau document
          </Button>
        </div>
      </div>

      {/* Toolbar filtres */}
      <div className="rounded-xl border bg-background p-3 md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher dans vos documents…"
              className="flex-1"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Collection */}
            <Select value={collectionFilter || ALL} onValueChange={(v: string) => setCollectionFilter(v === ALL ? "" : v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Toutes les collections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Toutes les collections</SelectItem>
                {allCollections.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tri */}
            <Select value={sortBy} onValueChange={(v: "title" | "created_at" | "updated_at") => setSortBy(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated_at">Modifié le</SelectItem>
                <SelectItem value="created_at">Créé le</SelectItem>
                <SelectItem value="title">Titre</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortDir} onValueChange={(v: "asc" | "desc") => setSortDir(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Ordre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descendant</SelectItem>
                <SelectItem value="asc">Ascendant</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" onClick={clearFilters} title="Réinitialiser">
              <IconX className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Résumé rapide */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary">Total: {docs.length}</Badge>
          <Badge variant="outline">Affichés: {view.length}</Badge>
          {collectionFilter && (
            <Badge variant="outline">
              Collection: {allCollections.find((c) => c.id === collectionFilter)?.name || collectionFilter}
            </Badge>
          )}
        </div>
      </div>

      {/* Cartes */}
      {loading ? (
        <div className="docs-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="doc-card doc-card--loading" />
          ))}
        </div>
      ) : view.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            {docs.length === 0 
              ? "Aucun document. Créez-en un pour commencer !" 
              : "Aucun document ne correspond à ces critères."}
          </p>
        </div>
      ) : (
        <div className="docs-grid">
          {view.map((d) => (
            <article key={d.id} className="doc-card" onClick={() => router.push(`/docs/${d.id}`)}>
              <header className="doc-card__header">
                <h3 className="doc-card__title">{d.title || "(Sans titre)"}</h3>
                <FileText className="doc-card__icon w-5 h-5" />
              </header>

              {d.description && (
                <p className="doc-card__description">{d.description}</p>
              )}

              {d.collection_name && (
                <span className="doc-card__collection" title="Collection">
                  📁 {d.collection_name}
                </span>
              )}

              {d.tags && d.tags.length > 0 && (
                <div className="doc-card__tags">
                  {d.tags.slice(0, 5).map((t) => (
                    <span key={t} className="doc-tag">
                      #{t}
                    </span>
                  ))}
                  {d.tags.length > 5 && <span className="doc-tag doc-tag--more">+{d.tags.length - 5}</span>}
                </div>
              )}

              {d.author && (
                <div className="doc-card__author" title="Auteur">
                  ✍️ {d.author}
                </div>
              )}

              <footer className="doc-card__meta">
                <span className="doc-date" title={`Créé le ${fmt(d.created_at)}`}>
                  📅 {fmt(d.created_at)}
                </span>
                <span className="doc-date" title={`Modifié le ${fmt(d.updated_at)}`}>
                  🔄 {fmt(d.updated_at)}
                </span>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
