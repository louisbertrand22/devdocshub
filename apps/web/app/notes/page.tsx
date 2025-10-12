"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import "./page.css";

const ALL = "__ALL__";

const IconRefresh = (p: any) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
    <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14" />
  </svg>
);
const IconFunnel = (p: any) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <path d="M22 3H2l8 9v7l4 2v-9l8-9z" />
  </svg>
);
const IconX = (p: any) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

type Note = {
  id: string;
  title: string;
  content?: string;
  collection_id?: string | null;
  collection_name?: string | null;
  tags?: string[];
  pinned?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function NotesPage() {
  const { apiBase, token, user } = useAuth();
  const { toast } = useToast();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  // UI state (filtres/tri)
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "created_at" | "updated_at">("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [tagFilter, setTagFilter] = useState<string | "">("");
  const [collectionFilter, setCollectionFilter] = useState<string | "">("");
  const [pinnedOnly, setPinnedOnly] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      // prefer user.id (or user.uuid) if available
      const uuid = (user && (user.id || (user as any).uuid)) || undefined;
      const path = uuid ? `/notes/mine?uuid=${encodeURIComponent(uuid)}` : "/notes/mine";
      const res = await apiFetch('/notes', { signal: ctrl.signal }, apiBase, token);
      const raw: any[] = Array.isArray(res) ? res : res?.items || [];
      const normalized: Note[] = raw.map((n) => ({
        id: String(n.id),
        title: n.title ?? "(Sans titre)",
        content: n.content ?? "",
        collection_id: n.collection_id ?? n.collectionId ?? null,
        collection_name: n.collection?.name ?? n.collection_name ?? null,
        tags: Array.isArray(n.tags)
          ? n.tags.map(String)
          : typeof n.tags === "string" && n.tags.trim()
          ? n.tags.split(",").map((t: string) => t.trim())
          : [],
        pinned: Boolean(n.is_pinned ?? n.pinned ?? false),
        created_at: n.created_at ?? n.createdAt ?? n.created ?? null,
        updated_at: n.updated_at ?? n.updatedAt ?? n.updated ?? null,
      }));
      setNotes(normalized);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      toast({
        title: "Erreur de chargement",
        description: e?.message || "Impossible de charger les notes.",
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

  // Dérivés pour les filtres (tags/collections disponibles)
  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => (n.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [notes]);

  const allCollections = useMemo(() => {
    const map = new Map<string, string>();
    notes.forEach((n) => {
      if (n.collection_id) map.set(n.collection_id, n.collection_name || "Sans nom");
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [notes]);

  // Filtrer + Rechercher + Épinglées
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      if (pinnedOnly && !n.pinned) return false;
      if (tagFilter && !(n.tags || []).includes(tagFilter)) return false;
      if (collectionFilter && n.collection_id !== collectionFilter) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        (n.content || "").toLowerCase().includes(q) ||
        (n.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [notes, query, pinnedOnly, tagFilter, collectionFilter]);

  // Tri
  const view = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    const fn = (a: Note, b: Note) => {
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
    setTagFilter("");
    setCollectionFilter("");
    setPinnedOnly(false);
  };

  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString() : "—");

  return (
    <div className="space-y-6 container-left">
      {/* Header + actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
        <div className="flex gap-2">
          <Button onClick={load} variant="outline">
            <IconRefresh className="w-4 h-4 mr-2" /> Actualiser
          </Button>
          <Link href="/notes/new">
            <Button>Nouvelle note</Button>
          </Link>
        </div>
      </div>

      {/* Toolbar filtres */}
      <div className="rounded-xl border bg-background p-3 md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <IconFunnel className="w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher dans vos notes…"
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

            {/* Tag */}
            <Select value={tagFilter || ALL} onValueChange={(v: string) => setTagFilter(v === ALL ? "" : v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tous les tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Tous les tags</SelectItem>
                {allTags.map((t) => (
                  <SelectItem key={t} value={t}>
                    #{t}
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

            {/* Épinglées */}
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={pinnedOnly} onCheckedChange={(v) => setPinnedOnly(Boolean(v))} />
              Épinglées seulement
            </label>

            <Button variant="ghost" size="icon" onClick={clearFilters} title="Réinitialiser">
              <IconX className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Résumé rapide */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary">Total: {notes.length}</Badge>
          <Badge variant="outline">Affichées: {view.length}</Badge>
          {tagFilter && <Badge variant="outline">Tag: #{tagFilter}</Badge>}
          {collectionFilter && (
            <Badge variant="outline">
              Collection: {allCollections.find((c) => c.id === collectionFilter)?.name || collectionFilter}
            </Badge>
          )}
          {pinnedOnly && <Badge variant="outline">Épinglées</Badge>}
        </div>
      </div>

      {/* Cartes */}
      {loading ? (
        <div className="notes-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="note-card note-card--loading" />
          ))}
        </div>
      ) : view.length === 0 ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Aucune note ne correspond à ces critères.
        </div>
      ) : (
        <div className="notes-grid">
          {view.map((n) => (
            <article key={n.id} className="note-card">
              <header className="note-card__header">
                <h3 className="note-card__title">
                  {n.title || "(Sans titre)"}
                  {n.pinned && <span className="note-card__pin">★</span>}
                </h3>
                {n.collection_name && (
                  <span className="note-card__collection" title="Collection">
                    {n.collection_name}
                  </span>
                )}
              </header>

              {n.tags && n.tags.length > 0 && (
                <div className="note-card__tags">
                  {n.tags.slice(0, 5).map((t) => (
                    <span key={t} className="note-tag">
                      #{t}
                    </span>
                  ))}
                  {n.tags.length > 5 && <span className="note-tag note-tag--more">+{n.tags.length - 5}</span>}
                </div>
              )}

              <p className="note-card__excerpt">
                {n.content ? n.content : "—"}
              </p>

              <footer className="note-card__meta">
                <span className="note-date" title={`Créée le ${fmt(n.created_at)}`}>
                  Créée&nbsp;: {fmt(n.created_at)}
                </span>
                <span className="note-date" title={`Modifiée le ${fmt(n.updated_at)}`}>
                  Modifiée&nbsp;: {fmt(n.updated_at)}
                </span>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
