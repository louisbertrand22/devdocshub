"use client";

import { create } from "zustand";
import { apiFetch } from "./api";
import { createCache, type Cache } from "./docs-cache";
import type { DocSummary } from "./docs-tree";

// Liste des docs partagée par la sidebar, le tiroir mobile et la palette ⌘K :
// une seule requête /docs/all par minute au plus, invalidée après une création.
const TTL_MS = 60_000;

type Status = "idle" | "loading" | "ready" | "error";

type DocsState = {
  status: Status;
  docs: DocSummary[];
  /** Charge (ou sert depuis le cache) la liste pour ce token. */
  load: (token: string, apiBase: string, opts?: { force?: boolean }) => Promise<void>;
  /** À appeler après une création / suppression : recharge immédiatement. */
  invalidate: () => void;
};

let cache: Cache<DocSummary[]> | null = null;
let cacheKey: string | null = null;
let lastArgs: { token: string; apiBase: string } | null = null;

export const useDocsStore = create<DocsState>((set, get) => ({
  status: "idle",
  docs: [],
  load: async (token, apiBase, opts) => {
    const key = `${apiBase}|${token}`;
    if (key !== cacheKey) {
      cacheKey = key;
      cache = createCache(
        async () => {
          const data = await apiFetch<DocSummary[]>("/docs/all", {}, apiBase, token);
          return Array.isArray(data) ? data : [];
        },
        { ttlMs: TTL_MS },
      );
      set({ status: "loading", docs: [] });
    }
    lastArgs = { token, apiBase };
    const current = cache!;
    // Pas de squelette si on a déjà une liste : on la garde pendant le rechargement
    if (current.peek() === undefined) set({ status: "loading" });
    try {
      const docs = await current.get(opts);
      if (current === cache) set({ status: "ready", docs });
    } catch {
      if (current === cache) set(current.peek() ? { status: "ready" } : { status: "error" });
    }
  },
  invalidate: () => {
    cache?.invalidate();
    if (lastArgs) void get().load(lastArgs.token, lastArgs.apiBase, { force: true });
  },
}));
