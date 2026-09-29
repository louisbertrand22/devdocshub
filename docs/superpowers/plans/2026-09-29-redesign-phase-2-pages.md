# Refonte DA — Phase 2 (Pages) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrer toutes les pages cœur & compte (`/auth`, `/docs/[slug]`, `/docs`, `/notes`, `/collections`, formulaires, `/dashboard`, `/profile`, `/users`) vers la DA de la phase 1, et supprimer leurs CSS historiques.

**Architecture:** Des primitives de page partagées (`components/page/*` : en-tête, listes en lignes, état vide, bandeau, champ, compteur) + de la logique pure testée (`lib/format.ts`, `lib/markdown.ts`, `lib/list-filters.ts`, `lib/auth-validation.ts`). Chaque page garde ses appels API et sa logique métier, seul le rendu change. La page doc ajoute un rendu markdown maison (titres ancrés, blocs de code avec « Copier »), un sommaire droit et la section Notes. La liste des docs et la palette/sidebar partagent le store `useDocsStore` de la phase 1. Un script e2e committé (`scripts/flows.mjs`) sert de test navigateur : chaque tâche de page y ajoute d'abord ses assertions (RED), puis implémente (GREEN).

**Tech Stack:** Next 14.2 App Router (`typedRoutes`), React 18, Tailwind v4 + tokens (phase 1), Radix (Select, Tabs, Checkbox, Dialog), `react-markdown` 9, zustand, sonner. Tests : `node --test` (logique pure) + `playwright-core` sur `/usr/bin/chromium` (parcours).

**Spec:** `docs/superpowers/specs/2026-09-29-redesign-design.md` (§7 « Phase 2 — cœur & compte »). Phase 1 : `docs/superpowers/plans/2026-09-29-redesign-phase-1-foundation.md`.

**Branche :** `redesign/2-pages`, créée depuis `redesign/1-foundation` (PR #76 pas encore mergée). La PR de phase 2 cible `redesign/1-foundation` et sera reciblée sur `main` après le merge de #76.

## Global Constraints

- Tokens et typo de la phase 1 uniquement : `bg-bg`, `bg-surface`, `bg-surface-2`, `border-border`, `text-fg`, `text-fg-muted`, `accent*`, `success|warning|danger`, `font-sans` / `font-mono`. Aucune couleur hex ni `style={{…}}` de couleur dans le TSX créé ou modifié.
- Mono pour : fil d'Ariane, métadonnées (dates, auteur, techno), compteurs, badges.
- Colonne de lecture de la page doc ≈ 72 caractères (`max-w-[72ch]`) ; sommaire droit 200–210px, masqué sous 1280px (`xl:`).
- Listes = lignes bordées (pas de grille de cartes) ; action primaire en haut à droite ; état vide avec icône + CTA.
- Formulaires centrés `max-w-2xl` (≤ 672px, la spec dit 640 — accepté), labels au-dessus, erreurs inline en `danger`.
- Textes d'interface en français.
- Aucune modification de `services/api`.
- `useSearchParams` ⇒ composant enveloppé dans `<Suspense>` (sinon `next build` échoue au prérendu).

## Review Focus

1. **Doc au markdown inhabituel** (titres dupliqués, titres accentués, code inline dans un titre, `##` dans un bloc de code) → les ancres du sommaire correspondent exactement aux `id` des titres rendus, sans doublon. (Tests : Task 1 `markdown.test.ts`, Task 3 flows.)
2. **Dates de l'API sans fuseau** (`"2026-09-28T22:15:40.125917"`, UTC) → affichées comme UTC, pas décalées du fuseau local ; date invalide/absente → `—`. (Test : Task 1 `format.test.ts`.)
3. **Id de doc inconnu / supprimé dans l'URL** → « Document introuvable » avec lien retour, pas de spinner infini. (Test : Task 3 flows.)
4. **Filtres de notes pilotés par l'URL** (`/notes?pinned=1`, `/notes?doc=<id>`) → la sidebar, la case à cocher et la liste restent synchronisées, y compris après rechargement. (Test : Task 4 flows.)
5. **Utilisateur non admin sur `/users`** → message « Réservé aux administrateurs », pas un tableau vide ni une erreur 403 brute. (Test : Task 6 flows.)

**Limites connues (hors périmètre) :** `GET /notes` renvoie les notes de tous les utilisateurs (comportement existant conservé) ; `/docs/all` limité à 20 ; fuite de sessions SQLAlchemy (redémarrer `api` entre les passes de test via `API_RESTART_CMD`).

---

## File Structure

**Créés**

| Fichier | Responsabilité |
|---|---|
| `lib/format.ts` (+ test) | `parseApiDate`, `formatRelative`, `formatDate`, `excerpt` |
| `lib/markdown.ts` (+ test) | `slugify`, `slugifyHeading`, `createSlugger`, `extractHeadings`, `nodeText`, `languageFromClassName` |
| `lib/list-filters.ts` (+ test) | `matchesQuery`, `filterDocs`, `sortDocs`, `filterNotes`, type `NoteItem` |
| `lib/auth-validation.ts` (+ test) | `isEmail`, `passwordScore` (sortis de `auth-panel.tsx`) |
| `components/page/page-header.tsx` | En-tête de page (titre, description, actions, surtitre mono) |
| `components/page/row-list.tsx` | `RowList`, `Row`, `RowListSkeleton` |
| `components/page/empty-state.tsx` | État vide |
| `components/page/notice.tsx` | Bandeau (neutre / warning / danger) |
| `components/page/field.tsx` | Champ de formulaire (label, aide, erreur) |
| `components/page/stat-card.tsx` | Compteur mono |
| `components/markdown.tsx` | Rendu markdown (titres ancrés, `CodeBlock` avec Copier) |
| `components/toc.tsx` | Sommaire « Sur cette page » avec suivi du scroll |
| `components/doc-notes.tsx` | Section Notes d'un doc |
| `scripts/flows.mjs` | Parcours e2e navigateur (test de non-régression + tests des pages) |

**Modifiés** : `app/auth/page.tsx`, `components/auth-panel.tsx`, `app/docs/[slug]/page.tsx`, `app/docs/page.tsx`, `app/docs/new/page.tsx`, `components/forms/doc-form.tsx`, `app/notes/page.tsx`, `app/notes/new/page.tsx`, `app/notes/layout.tsx`, `components/layout/notes-sidebar.tsx`, `app/collections/page.tsx`, `app/collections/add/page.tsx`, `components/forms/collection-form.tsx`, `app/dashboard/page.tsx`, `components/dashboard.tsx`, `app/profile/page.tsx`, `components/profile.tsx`, `app/users/page.tsx`, `components/layout/PageWrapper.tsx`, `lib/docs-tree.ts` (type), `styles/globals.css` (prose), `types/lucide-react.d.ts`, `apps/web/package.json` (script `flows`, retrait `framer-motion`).

**Supprimés** : `app/auth/auth.module.css`, `components/auth-panel.module.css`, `app/docs/[slug]/doc-view.module.css`, `app/docs/page.css`, `app/notes/page.css`, `components/profile.css`, `components/data-table.tsx`, `components/forms/note-form.tsx` (inutilisé), dépendance `framer-motion`.

---

### Task 1: Logique pure des pages

**Files:**
- Create: `apps/web/lib/{format,markdown,list-filters,auth-validation}.ts` et leurs `.test.ts`

**Interfaces:**
- Consumes: `normalize(s)` de `lib/command-filter.ts` (phase 1).
- Produces:
  - `format.ts` : `parseApiDate(v: string | null | undefined): Date | null` · `formatRelative(v, now?: number): string` · `formatDate(v): string` · `excerpt(text: string | null | undefined, max?: number): string`
  - `markdown.ts` : `slugify(text): string` (peut renvoyer `""`) · `slugifyHeading(text): string` (jamais vide, défaut `"section"`) · `createSlugger(): { slug(text: string): string }` · `type Heading = { depth: 2 | 3; text: string; id: string }` · `extractHeadings(md: string): Heading[]` · `nodeText(node: unknown): string` · `languageFromClassName(c?: string): string | null`
  - `list-filters.ts` : `matchesQuery(fields, query): boolean` · `type DocSort = "recent" | "oldest" | "title"` · `filterDocs(docs, { query?, tech? })` · `sortDocs(docs, sort)` · `type NoteItem` · `filterNotes(notes, { query?, pinnedOnly?, docId? }, docTitle?)`
  - `auth-validation.ts` : `isEmail(v): boolean` · `passwordScore(pw): number` (0–5)

- [ ] **Step 1: Écrire les tests (qui échouent)**

`apps/web/lib/format.test.ts` :

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { excerpt, formatDate, formatRelative, parseApiDate } from "./format.ts";

const NOW = Date.parse("2026-09-29T12:00:00Z");

test("parseApiDate treats timezone-less API dates as UTC", () => {
  assert.equal(parseApiDate("2026-09-28T22:15:40.125917")?.toISOString(), "2026-09-28T22:15:40.125Z");
  assert.equal(parseApiDate("2026-09-28T22:15:40Z")?.toISOString(), "2026-09-28T22:15:40.000Z");
  assert.equal(parseApiDate("2026-09-28T22:15:40+02:00")?.toISOString(), "2026-09-28T20:15:40.000Z");
});

test("parseApiDate returns null for empty or invalid values", () => {
  assert.equal(parseApiDate(null), null);
  assert.equal(parseApiDate(""), null);
  assert.equal(parseApiDate("not a date"), null);
});

test("formatRelative buckets", () => {
  assert.equal(formatRelative("2026-09-29T11:59:30", NOW), "à l'instant");
  assert.equal(formatRelative("2026-09-29T11:45:00", NOW), "il y a 15 min");
  assert.equal(formatRelative("2026-09-29T09:00:00", NOW), "il y a 3 h");
  assert.equal(formatRelative("2026-09-28T09:00:00", NOW), "hier");
  assert.equal(formatRelative("2026-09-20T12:00:00", NOW), "il y a 9 j");
  assert.equal(formatRelative("2026-06-01T12:00:00", NOW), "1 juin 2026");
});

test("formatRelative: future dates read as now, missing dates as a dash", () => {
  assert.equal(formatRelative("2026-09-30T12:00:00", NOW), "à l'instant");
  assert.equal(formatRelative(undefined, NOW), "—");
});

test("formatDate uses a short French date", () => {
  assert.equal(formatDate("2026-09-12T10:00:00"), "12 sept. 2026");
  assert.equal(formatDate(null), "—");
});

test("excerpt strips markdown and collapses whitespace", () => {
  assert.equal(excerpt("## Intro\n\nUse `docker` **now**, see [docs](http://x).\n\n```bash\nrm -rf /\n```"), "Intro Use docker now, see docs.");
  assert.equal(excerpt(null), "");
});

test("excerpt truncates on a word boundary with an ellipsis", () => {
  assert.equal(excerpt("alpha beta gamma delta", 12), "alpha beta…");
});
```

`apps/web/lib/markdown.test.ts` :

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { createSlugger, extractHeadings, languageFromClassName, nodeText, slugify, slugifyHeading } from "./markdown.ts";

test("slugify lowercases, strips accents and punctuation", () => {
  assert.equal(slugify("Détails & Options (v2)"), "details-options-v2");
  assert.equal(slugify("  --Hello   World--  "), "hello-world");
  assert.equal(slugify("!!!"), "");
});

test("slugifyHeading never returns an empty id", () => {
  assert.equal(slugifyHeading("!!!"), "section");
});

test("createSlugger dedupes in order", () => {
  const s = createSlugger();
  assert.deepEqual([s.slug("Usage"), s.slug("Usage"), s.slug("Usage")], ["usage", "usage-2", "usage-3"]);
});

test("extractHeadings keeps h2/h3, strips inline markdown, ignores code fences", () => {
  const md = [
    "# Titre",
    "## Installation",
    "### Avec `docker`",
    "```bash",
    "## pas un titre",
    "```",
    "## **Détails** [lien](http://x)",
    "#### trop profond",
    "## Installation",
  ].join("\n");
  assert.deepEqual(extractHeadings(md), [
    { depth: 2, text: "Installation", id: "installation" },
    { depth: 3, text: "Avec docker", id: "avec-docker" },
    { depth: 2, text: "Détails lien", id: "details-lien" },
    { depth: 2, text: "Installation", id: "installation-2" },
  ]);
});

test("nodeText flattens strings, numbers, arrays and element-like children", () => {
  const el = (children: unknown) => ({ props: { children } });
  assert.equal(nodeText(["Avec ", el("docker"), " ", 2, null, false]), "Avec docker 2");
  assert.equal(nodeText(el([el("a"), el(el("b"))])), "ab");
});

test("the heading text seen by the renderer produces the same ids as extractHeadings", () => {
  const s = createSlugger();
  const rendered = [nodeText(["Avec ", { props: { children: "docker" } }])].map((t) => s.slug(t));
  assert.deepEqual(rendered, [extractHeadings("## Avec `docker`")[0].id]);
});

test("languageFromClassName reads language-xxx", () => {
  assert.equal(languageFromClassName("language-bash"), "bash");
  assert.equal(languageFromClassName("hljs language-c++"), "c++");
  assert.equal(languageFromClassName(undefined), null);
});
```

`apps/web/lib/list-filters.test.ts` :

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { filterDocs, filterNotes, matchesQuery, sortDocs, type NoteItem } from "./list-filters.ts";

test("matchesQuery: every term, accent- and case-insensitive, over all fields", () => {
  assert.equal(matchesQuery(["Déployer Nginx", "nginx"], "deployer NGINX"), true);
  assert.equal(matchesQuery(["Déployer Nginx", null], "docker"), false);
  assert.equal(matchesQuery(["x"], "   "), true);
});

const docs = [
  { id: "1", title: "Volumes", tech: "Docker", content: "persist data", created_at: "2026-09-01T00:00:00" },
  { id: "2", title: "SSL", tech: "nginx", content: "certbot", created_at: "2026-09-10T00:00:00" },
  { id: "3", title: "compose", tech: " docker ", content: "services", created_at: null },
];

test("filterDocs by normalised tech and by query", () => {
  assert.deepEqual(filterDocs(docs, { tech: "docker" }).map((d) => d.id), ["1", "3"]);
  assert.deepEqual(filterDocs(docs, { query: "certbot" }).map((d) => d.id), ["2"]);
  assert.deepEqual(filterDocs(docs, {}).map((d) => d.id), ["1", "2", "3"]);
});

test("sortDocs recent / oldest / title (missing dates last for recent)", () => {
  assert.deepEqual(sortDocs(docs, "recent").map((d) => d.id), ["2", "1", "3"]);
  assert.deepEqual(sortDocs(docs, "oldest").map((d) => d.id), ["3", "1", "2"]);
  assert.deepEqual(sortDocs(docs, "title").map((d) => d.id), ["3", "2", "1"]);
  assert.deepEqual(docs.map((d) => d.id), ["1", "2", "3"], "input not mutated");
});

const notes: NoteItem[] = [
  { id: "a", content: "old pinned", doc_id: "d1", is_pinned: true, created_at: "2026-09-01T00:00:00" },
  { id: "b", content: "recent", doc_id: "d2", is_pinned: false, created_at: "2026-09-20T00:00:00" },
  { id: "c", content: "older", doc_id: "d1", is_pinned: false, created_at: "2026-09-05T00:00:00" },
];

test("filterNotes: pinned first, then most recent", () => {
  assert.deepEqual(filterNotes(notes, {}).map((n) => n.id), ["a", "b", "c"]);
});

test("filterNotes by pinned, by doc, and by doc title through the lookup", () => {
  assert.deepEqual(filterNotes(notes, { pinnedOnly: true }).map((n) => n.id), ["a"]);
  assert.deepEqual(filterNotes(notes, { docId: "d1" }).map((n) => n.id), ["a", "c"]);
  const title = (id: string) => ({ d1: "Docker Compose", d2: "Nginx" } as Record<string, string>)[id];
  assert.deepEqual(filterNotes(notes, { query: "nginx" }, title).map((n) => n.id), ["b"]);
});
```

`apps/web/lib/auth-validation.test.ts` :

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { isEmail, passwordScore } from "./auth-validation.ts";

test("isEmail", () => {
  assert.equal(isEmail("a@b.co"), true);
  assert.equal(isEmail("a@b"), false);
  assert.equal(isEmail("a b@c.de"), false);
});

test("passwordScore counts length, cases, digits and symbols", () => {
  assert.equal(passwordScore(""), 0);
  assert.equal(passwordScore("abcdefgh"), 2);
  assert.equal(passwordScore("Abcdefg1"), 4);
  assert.equal(passwordScore("Abcdef1!"), 5);
});
```

- [ ] **Step 2: Lancer pour vérifier l'échec**

Run: `pnpm --filter web test`
Expected: FAIL — `Cannot find module` pour `format.ts`, `markdown.ts`, `list-filters.ts`, `auth-validation.ts`.

- [ ] **Step 3: Implémenter**

`apps/web/lib/format.ts` :

```ts
/** L'API renvoie des dates UTC sans fuseau ("2026-09-28T22:15:40.125917"). */
export function parseApiDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const iso = /(?:[zZ]|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | null | undefined): string {
  const date = parseApiDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function formatRelative(value: string | null | undefined, now: number = Date.now()): string {
  const date = parseApiDate(value);
  if (!date) return "—";
  const seconds = Math.round((now - date.getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "hier";
  if (days < 30) return `il y a ${days} j`;
  return formatDate(value);
}

/** Texte brut d'un contenu markdown, tronqué proprement. */
export function excerpt(text: string | null | undefined, max = 160): string {
  const plain = (text ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(?:#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_~]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
```

`apps/web/lib/markdown.ts` :

```ts
export type Heading = { depth: 2 | 3; text: string; id: string };

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugifyHeading(text: string): string {
  return slugify(text) || "section";
}

/** Ids uniques dans l'ordre d'apparition (usage, usage-2, usage-3…). */
export function createSlugger() {
  const seen = new Map<string, number>();
  return {
    slug(text: string): string {
      const base = slugifyHeading(text);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return count === 0 ? base : `${base}-${count + 1}`;
    },
  };
}

function inlineMarkdownToText(s: string): string {
  return s
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__|~~|\*|_)(.+?)\1/g, "$2")
    .trim();
}

/** Titres h2/h3 hors blocs de code, avec les mêmes ids que le rendu. */
export function extractHeadings(markdown: string): Heading[] {
  const slugger = createSlugger();
  const headings: Heading[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*(?:```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = inlineMarkdownToText(match[2]);
    headings.push({ depth: match[1].length as 2 | 3, text, id: slugger.slug(text) });
  }
  return headings;
}

/** Texte d'un arbre React (children de react-markdown). */
export function nodeText(node: unknown): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (typeof node === "object" && "props" in node) {
    return nodeText((node as { props?: { children?: unknown } }).props?.children);
  }
  return "";
}

export function languageFromClassName(className?: string): string | null {
  const match = /language-([\w+#-]+)/.exec(className ?? "");
  return match ? match[1] : null;
}
```

`apps/web/lib/list-filters.ts` :

```ts
import { normalize } from "./command-filter.ts";
import { parseApiDate } from "./format.ts";

export function matchesQuery(fields: (string | null | undefined | false)[], query: string): boolean {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = normalize(fields.filter(Boolean).join(" "));
  return terms.every((t) => haystack.includes(t));
}

type Dated = { created_at?: string | null };
const time = (item: Dated) => parseApiDate(item.created_at)?.getTime();

/** Plus récent d'abord ; les éléments sans date passent en dernier. */
function compareRecent(a: Dated, b: Dated): number {
  const ta = time(a);
  const tb = time(b);
  if (ta === undefined && tb === undefined) return 0;
  if (ta === undefined) return 1;
  if (tb === undefined) return -1;
  return tb - ta;
}

export type DocSort = "recent" | "oldest" | "title";

export function filterDocs<T extends { title: string; tech?: string | null; content?: string | null }>(
  docs: T[],
  { query = "", tech = "" }: { query?: string; tech?: string },
): T[] {
  return docs.filter(
    (d) => (!tech || (d.tech ?? "").trim().toLowerCase() === tech) && matchesQuery([d.title, d.tech, d.content], query),
  );
}

export function sortDocs<T extends Dated & { title: string }>(docs: T[], sort: DocSort): T[] {
  const list = [...docs];
  if (sort === "title") return list.sort((a, b) => a.title.localeCompare(b.title, "fr", { sensitivity: "base" }));
  // Sans date : en dernier pour « récents », en premier pour « anciens »
  return list.sort((a, b) => (sort === "recent" ? compareRecent(a, b) : compareRecent(b, a)));
}

export type NoteItem = {
  id: string;
  content?: string | null;
  doc_id?: string | null;
  user_id?: string | null;
  is_pinned?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

/** Épinglées d'abord, puis les plus récentes. */
export function filterNotes<T extends NoteItem>(
  notes: T[],
  { query = "", pinnedOnly = false, docId = "" }: { query?: string; pinnedOnly?: boolean; docId?: string },
  docTitle?: (id: string) => string | undefined,
): T[] {
  return notes
    .filter(
      (n) =>
        (!pinnedOnly || n.is_pinned) &&
        (!docId || n.doc_id === docId) &&
        matchesQuery([n.content, n.doc_id ? docTitle?.(n.doc_id) : undefined], query),
    )
    .sort((a, b) => Number(Boolean(b.is_pinned)) - Number(Boolean(a.is_pinned)) || compareRecent(a, b));
}
```

`apps/web/lib/auth-validation.ts` :

```ts
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** 0..5 : longueur ≥ 8, majuscule, minuscule, chiffre, symbole. */
export function passwordScore(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}
```

- [ ] **Step 4: Lancer pour vérifier le succès**

Run: `pnpm --filter web test`
Expected: PASS — 60 tests existants + les nouveaux, 0 échec.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/format.ts apps/web/lib/format.test.ts apps/web/lib/markdown.ts apps/web/lib/markdown.test.ts apps/web/lib/list-filters.ts apps/web/lib/list-filters.test.ts apps/web/lib/auth-validation.ts apps/web/lib/auth-validation.test.ts
git commit -m "feat(web): page logic — dates, excerpts, markdown headings, list filters"
```

---

### Task 2: Primitives de page, prose, harnais e2e

**Files:**
- Create: `apps/web/components/page/{page-header,row-list,empty-state,notice,field,stat-card}.tsx`, `apps/web/scripts/flows.mjs`
- Modify: `apps/web/components/layout/PageWrapper.tsx`, `apps/web/styles/globals.css` (bloc prose), `apps/web/types/lucide-react.d.ts`, `apps/web/lib/docs-tree.ts` (type), `apps/web/package.json` (script `flows`)

**Interfaces:**
- Produces:
  - `PageHeader({ title: ReactNode; description?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode })`
  - `RowList({ children, className? })`, `Row({ href?: string; title: ReactNode; description?: ReactNode; meta?: ReactNode; aside?: ReactNode })`, `RowListSkeleton({ rows?: number })`
  - `EmptyState({ icon: ReactNode; title: string; description?: string; action?: ReactNode })`
  - `Notice({ tone?: "neutral" | "warning" | "danger"; children; className? })`
  - `Field({ label: ReactNode; htmlFor?: string; hint?: ReactNode; error?: string; required?: boolean; children })`
  - `StatCard({ label: string; value?: number; loading?: boolean })`
  - `DocSummary` gagne `content?: string`.
  - `pnpm --filter web flows` : parcours e2e ; env `BASE_URL` (déf. `http://localhost:3000`), `API_URL` (déf. `http://localhost:8000`), `API_RESTART_CMD` (commande shell lancée avant chaque section, ex. `cd ../.. && docker compose restart api`), `CHROMIUM_PATH`. Code de sortie 1 si un check échoue.

- [ ] **Step 1: Harnais e2e (baseline, doit passer sur l'app actuelle)**

`apps/web/scripts/flows.mjs` — reprend les parcours validés en phase 1 (sélecteurs de l'app actuelle ; chaque tâche suivante les met à jour **avant** de changer la page) :

```js
// Parcours e2e : `pnpm --filter web flows`. Échoue (code 1) si un check échoue.
import { chromium } from "playwright-core";
import { execSync } from "node:child_process";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:8000";
const RESTART = process.env.API_RESTART_CMD;
const stamp = Date.now().toString(36);
const email = `flow-${stamp}@test.dev`;
const password = "Flow12345!";
const docTitle = `Flow doc ${stamp}`;
const results = [];
const check = (name, ok, extra = "") => results.push({ name, ok, extra });

async function section(name, fn) {
  if (RESTART) {
    execSync(RESTART, { stdio: "ignore", shell: "/bin/bash" });
    for (let i = 0; i < 40; i++) {
      try { if ((await fetch(`${API}/docs`)).ok) break; } catch {}
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  try { await fn(); } catch (e) { check(`${name}: interrompu`, false, String(e).split("\n")[0]); }
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
await ctx.addInitScript(() => {
  window.__htmlClassLog = [];
  new MutationObserver(() => {
    const h = document.documentElement;
    if (h) window.__htmlClassLog.push({ dark: h.classList.contains("dark"), body: !!document.body });
  }).observe(document, { attributes: true, subtree: true, attributeFilter: ["class"], childList: true });
});
const p = await ctx.newPage();
const pageErrors = [];
p.on("pageerror", (e) => pageErrors.push(String(e).slice(0, 120)));
const avatar = p.locator('button[aria-label="Menu du compte"]');
const submitActiveTab = () => p.locator('[role="tabpanel"][data-state="active"] button').last().click();
let docId = null;

await section("auth", async () => {
  await p.goto(`${BASE}/auth`, { waitUntil: "networkidle" });
  await p.getByRole("tab", { name: "Créer un compte" }).click();
  await p.fill("#reg-name", `flow${stamp}`);
  await p.fill("#reg-email", email);
  await p.fill("#reg-password", password);
  await submitActiveTab();
  await p.waitForURL("**/dashboard", { timeout: 15000 });
  await avatar.waitFor({ timeout: 15000 });
  check("inscription → dashboard + avatar", true);

  await avatar.click();
  await p.getByRole("menuitem", { name: "Se déconnecter" }).click();
  await p.waitForURL("**/auth", { timeout: 10000 });
  check("déconnexion → /auth", true);

  await p.fill("#login-email", email);
  await p.fill("#login-password", password);
  await submitActiveTab();
  await p.waitForURL("**/dashboard", { timeout: 15000 });
  await avatar.waitFor({ timeout: 15000 });
  check("connexion → dashboard + avatar", true);
});

await section("docs", async () => {
  await p.goto(`${BASE}/docs/new`, { waitUntil: "networkidle" });
  await p.fill('input[placeholder="My guide"]', docTitle);
  await p.fill('input[placeholder="my-guide"]', `flow-doc-${stamp}`);
  await p.fill('input[placeholder="python, javascript, etc."]', "FlowTech");
  await p.fill('textarea[placeholder="# Intro..."]', "## Installation\nflow");
  await p.getByRole("button", { name: "Create" }).click();
  await p.waitForURL("**/docs", { timeout: 10000 });
  const sidebar = p.locator('aside nav[aria-label="Docs"]');
  await sidebar.getByText(docTitle).waitFor({ timeout: 10000 });
  check("doc créé visible dans la sidebar sans rechargement", true);
  await sidebar.getByText(docTitle).click();
  await p.waitForURL(/\/docs\/[0-9a-f-]{36}$/, { timeout: 10000 });
  docId = p.url().split("/").pop();
});

await section("notes", async () => {
  await p.goto(`${BASE}/notes/new`, { waitUntil: "networkidle" });
  await p.click("#doc_id");
  await p.getByRole("option", { name: new RegExp(docTitle) }).click();
  await p.locator("form textarea").first().fill("Note de test flow");
  await p.locator('form button[type="submit"]').click();
  await p.waitForURL("**/notes", { timeout: 10000 });
  check("note créée → /notes", true);
});

await section("collections", async () => {
  await p.goto(`${BASE}/collections/add`, { waitUntil: "networkidle" });
  await p.fill('input[placeholder="Knowledge Base"]', `Flow col ${stamp}`);
  await p.getByRole("button", { name: "Create collection" }).click();
  await p.waitForURL("**/collections", { timeout: 10000 });
  check("collection créée → /collections", true);
});

await section("clavier", async () => {
  await p.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  const order = [];
  for (let i = 0; i < 9; i++) {
    await p.keyboard.press("Tab");
    order.push(await p.evaluate(() => {
      const el = document.activeElement;
      return el?.getAttribute("aria-label") || el?.textContent?.trim().slice(0, 20) || el?.tagName;
    }));
  }
  check("ordre Tab de la top bar", order.join(" > ").includes("Menu du compte"), order.join(" > "));
  await p.keyboard.press("Control+k");
  await p.keyboard.type(docTitle);
  await p.getByRole("option", { name: docTitle }).waitFor({ timeout: 10000 });
  await p.keyboard.press("Enter");
  await p.waitForURL(/\/docs\/[0-9a-f-]{36}$/, { timeout: 10000 });
  check("⌘K + Entrée ouvre le doc", true);
});

await section("thème", async () => {
  for (const target of ["light", "dark"]) {
    const isDark = await p.evaluate(() => document.documentElement.classList.contains("dark"));
    if ((target === "light") === isDark) await p.locator('button[aria-label^="Passer en thème"]').click();
    await p.reload({ waitUntil: "networkidle" });
    const log = await p.evaluate(() => window.__htmlClassLog);
    const withBody = log.filter((e) => e.body);
    const wrong = withBody.filter((e) => e.dark !== (target === "dark")).length;
    const final = await p.evaluate(() => document.documentElement.classList.contains("dark"));
    check(`rechargement en ${target} sans flash`, final === (target === "dark") && withBody.length > 0 && wrong === 0, `${wrong} état(s) au mauvais thème`);
  }
});

check("aucune erreur JS", pageErrors.length === 0, pageErrors.join(" | "));
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.extra ? "  — " + r.extra : ""}`);
await browser.close();
process.exit(results.every((r) => r.ok) ? 0 : 1);
```

Dans `apps/web/package.json`, `scripts` : ajouter `"flows": "node scripts/flows.mjs"`.

- [ ] **Step 2: Lancer la baseline**

Run (stack Docker lancée et à jour : `docker compose up -d --build web`) :
`API_RESTART_CMD="cd ../.. && docker compose restart api" pnpm --filter web flows`
Expected: tous les checks `PASS`, code 0. C'est la référence de non-régression.

- [ ] **Step 3: Primitives de page**

`apps/web/components/page/page-header.tsx` :

```tsx
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1.5">
        {eyebrow && <div className="font-mono text-xs text-fg-muted">{eyebrow}</div>}
        <h1 className="break-words">{title}</h1>
        {description && <p className="text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
```

`apps/web/components/page/row-list.tsx` :

```tsx
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function RowList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ul className={cn("divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface", className)}>
      {children}
    </ul>
  );
}

export function Row({
  href,
  title,
  description,
  meta,
  aside,
}: {
  href?: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  aside?: ReactNode;
}) {
  const body = (
    <div className="flex items-start gap-4 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-fg">{title}</div>
        {description && <p className="mt-0.5 line-clamp-2 text-[13px] text-fg-muted">{description}</p>}
        {meta && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-fg-muted">{meta}</div>
        )}
      </div>
      {aside && <div className="flex shrink-0 items-center gap-2">{aside}</div>}
    </div>
  );
  return (
    <li>
      {href ? (
        <Link href={href as Route} className="block transition-colors hover:bg-surface-2 focus-visible:bg-surface-2">
          {body}
        </Link>
      ) : (
        body
      )}
    </li>
  );
}

export function RowListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-label="Chargement" className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex flex-col gap-2 px-4 py-4">
          <div className="h-3 w-1/3 animate-pulse rounded bg-surface-2" />
          <div className="h-2.5 w-2/3 animate-pulse rounded bg-surface-2" />
        </div>
      ))}
    </div>
  );
}
```

`apps/web/components/page/empty-state.tsx` :

```tsx
import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <div className="grid size-10 place-items-center rounded-full bg-surface-2 text-fg-muted [&_svg]:size-5">{icon}</div>
      <div>
        <p className="text-sm font-medium text-fg">{title}</p>
        {description && <p className="mt-1 text-[13px] text-fg-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
```

`apps/web/components/page/notice.tsx` :

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  neutral: "border-border bg-surface text-fg-muted",
  warning: "border-warning/40 bg-warning/10 text-warning",
  danger: "border-danger/40 bg-danger/10 text-danger",
} as const;

export function Notice({
  tone = "neutral",
  children,
  className,
}: {
  tone?: keyof typeof TONES;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("rounded-md border px-3 py-2 text-[13px] [&_a]:underline [&_button]:underline", TONES[tone], className)}
    >
      {children}
    </div>
  );
}
```

`apps/web/components/page/field.tsx` :

```tsx
import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden>*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <div className="text-xs text-fg-muted">{hint}</div>
      ) : null}
    </div>
  );
}
```

`apps/web/components/page/stat-card.tsx` :

```tsx
export function StatCard({ label, value, loading }: { label: string; value?: number; loading?: boolean }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface px-4 py-3">
      <span className="font-mono text-[11px] text-fg-muted">{label}</span>
      {loading ? (
        <span className="h-7 w-10 animate-pulse rounded bg-surface-2" aria-hidden />
      ) : (
        <span className="font-mono text-2xl font-semibold text-fg">{value ?? "—"}</span>
      )}
    </div>
  );
}
```

`apps/web/components/layout/PageWrapper.tsx` (utilisé par les pages statiques jusqu'à la phase 3) :

```tsx
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page/page-header";

interface PageWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageWrapper({ title, description, children, actions, className }: PageWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <PageHeader title={title} description={description} actions={actions} />
      <div>{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Prose, icônes, type `DocSummary`**

`styles/globals.css` — remplacer le bloc `@layer components { .prose … }` par :

```css
/* Contenu markdown (page doc) — les blocs de code sont rendus par <CodeBlock> */
@layer components {
  .prose { @apply max-w-none text-[15px] leading-7 text-fg; }
  .prose > :first-child { @apply mt-0; }
  .prose h1 { @apply mb-4 mt-10; }
  .prose h2 { @apply mb-3 mt-12 scroll-mt-20 border-b border-border pb-2; }
  .prose h3 { @apply mb-2 mt-8 scroll-mt-20 text-[17px]; }
  .prose p { @apply my-4; }
  .prose a { @apply text-accent underline decoration-accent-border underline-offset-2 hover:decoration-accent; }
  .prose strong { @apply font-semibold text-fg; }
  .prose ul { @apply my-4 list-disc pl-6; }
  .prose ol { @apply my-4 list-decimal pl-6; }
  .prose li { @apply my-1; }
  .prose li::marker { @apply text-fg-muted; }
  .prose :not(pre) > code { @apply rounded border border-border bg-surface-2 px-1 py-0.5 text-[0.88em]; }
  .prose blockquote { @apply my-5 border-l-2 border-accent pl-4 text-fg-muted; }
  .prose hr { @apply my-10 border-border; }
  .prose table { @apply my-5 w-full border-collapse text-sm; }
  .prose th { @apply border-b border-border px-3 py-2 text-left font-medium; }
  .prose td { @apply border-b border-border px-3 py-2; }
  .prose img { @apply my-5 rounded-lg border border-border; }
}
```

`types/lucide-react.d.ts` — ajouter avant `const _default` :

```ts
  export const Copy: React.ComponentType<any>;
  export const Check: React.ComponentType<any>;
  export const Star: React.ComponentType<any>;
  export const Inbox: React.ComponentType<any>;
  export const ArrowLeft: React.ComponentType<any>;
```

`lib/docs-tree.ts` — ajouter `content?: string;` au type `DocSummary`.

- [ ] **Step 5: Tests + build + baseline**

Run: `pnpm --filter web test && pnpm --filter web build`, puis `docker compose up -d --build web` et relancer `pnpm --filter web flows` (avec `API_RESTART_CMD`).
Expected: tout PASS (aucune page ne consomme encore les primitives, sauf `PageWrapper` dont le rendu est identique).

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/page apps/web/components/layout/PageWrapper.tsx apps/web/scripts/flows.mjs apps/web/package.json apps/web/styles/globals.css apps/web/types/lucide-react.d.ts apps/web/lib/docs-tree.ts
git commit -m "feat(web): page primitives, prose styles and e2e flows harness"
```

---

### Task 3: `/auth` et page doc

**Files:**
- Modify: `apps/web/app/auth/page.tsx`, `apps/web/components/auth-panel.tsx`, `apps/web/app/docs/[slug]/page.tsx`, `apps/web/scripts/flows.mjs`
- Create: `apps/web/components/markdown.tsx`, `apps/web/components/toc.tsx`, `apps/web/components/doc-notes.tsx`
- Delete: `apps/web/app/auth/auth.module.css`, `apps/web/components/auth-panel.module.css`, `apps/web/app/docs/[slug]/doc-view.module.css`

**Interfaces:**
- Consumes: `isEmail`, `passwordScore`, `extractHeadings`, `createSlugger`, `nodeText`, `languageFromClassName`, `formatRelative`, `excerpt`, `filterNotes`, `NoteItem` (Task 1) ; `Field`, `Notice`, `RowList`, `Row`, `RowListSkeleton` (Task 2) ; `Logo` (phase 1).
- Produces: `Markdown({ content: string; className?: string })`, `Toc({ headings: Heading[] })`, `DocNotes({ docId: string })`.

- [ ] **Step 1: Assertions e2e (RED)**

Dans `scripts/flows.mjs` :

1. Section `auth`, juste après le premier `p.goto(\`${BASE}/auth\`…)` :

```js
  const look = await p.evaluate(() => ({
    logo: document.body.innerText.includes("devdocshub"),
    emoji: document.body.innerText.includes("🧭"),
    gradient: [...document.querySelectorAll("body *")].some((el) => getComputedStyle(el).backgroundImage.includes("gradient")),
  }));
  check("/auth : logo devdocshub, sans emoji ni dégradé", look.logo && !look.emoji && !look.gradient, JSON.stringify(look));
```

2. Section `auth`, remplacer la connexion (`p.fill("#login-password"…` + `submitActiveTab()`) par une validation au clavier :

```js
  await p.fill("#login-email", email);
  await p.fill("#login-password", password);
  await p.press("#login-password", "Enter");
```

3. Section `docs` : le contenu du doc devient

```js
  await p.fill('textarea[placeholder="# Intro..."]', "## Installation\nflow\n\n### Détails `avancés`\n\n```bash\necho flow\n```\n\n## Installation\nbis");
```

et à la fin de la section (après `docId = …`) ajouter :

```js
  const toc = p.locator('nav[aria-label="Sur cette page"] a');
  const hrefs = await toc.evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  const idsExist = await p.evaluate((hs) => hs.every((h) => !!document.getElementById(h.slice(1))), hrefs);
  check("page doc : sommaire aligné sur les titres", JSON.stringify(hrefs) === JSON.stringify(["#installation", "#details-avances", "#installation-2"]) && idsExist, JSON.stringify(hrefs));
  const codeBlock = p.getByText("bash", { exact: true });
  await p.getByRole("button", { name: "Copier" }).click();
  const copied = await p.getByRole("button", { name: /Copié/ }).count();
  const clip = await p.evaluate(() => navigator.clipboard.readText());
  check("page doc : bloc de code avec langue + Copier", (await codeBlock.count()) > 0 && copied > 0 && clip === "echo flow", `clip=${JSON.stringify(clip)}`);
  const addNote = await p.getByRole("link", { name: /Ajouter une note/ }).getAttribute("href");
  check("page doc : section Notes avec lien d'ajout", addNote === `/notes/new?doc=${docId}`, addNote ?? "");
  await p.goto(`${BASE}/docs/00000000-0000-0000-0000-000000000000`, { waitUntil: "networkidle" });
  check("page doc : id inconnu → « Document introuvable »", (await p.getByText("Document introuvable").count()) > 0);
```

Run: build Docker + `pnpm --filter web flows` (avec `API_RESTART_CMD`).
Expected: FAIL sur `/auth : logo…` (emoji + dégradé), `sommaire`, `bloc de code`, `section Notes`, `id inconnu` ; la connexion par Entrée échoue (`waitForURL` timeout, pas de `<form>`).

- [ ] **Step 2: `/auth`**

`apps/web/app/auth/page.tsx` :

```tsx
import AuthPanel from "@/components/auth-panel";
import { Logo } from "@/components/layout/logo";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo />
          <p className="text-[13px] text-fg-muted">Tes docs, notes et collections techniques, au même endroit.</p>
        </div>
        <AuthPanel />
        <p className="text-center font-mono text-[11px] text-fg-muted">Première visite ? Crée un compte, c'est gratuit.</p>
      </div>
    </div>
  );
}
```

`apps/web/components/auth-panel.tsx` (logique d'inscription/connexion inchangée ; `<form>` pour valider avec Entrée ; suppression de l'appel `/auth/me` redondant avec `useAuthInit` et du faux lien « Réinitialiser ») :

```tsx
"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, LogOut, Mail, User as UserIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { isEmail, passwordScore } from "@/lib/auth-validation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Field } from "@/components/page/field";
import { Notice } from "@/components/page/notice";

function IconInput({
  icon,
  trailing,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { icon: ReactNode; trailing?: ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted [&_svg]:size-4">{icon}</span>
      <Input {...props} className={cn("pl-9", trailing && "pr-10", className)} />
      {trailing && <span className="absolute right-1 top-1/2 -translate-y-1/2">{trailing}</span>}
    </div>
  );
}

function PasswordToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-7"
      onClick={onToggle}
      aria-label={shown ? "Masquer le mot de passe" : "Afficher le mot de passe"}
    >
      {shown ? <EyeOff /> : <Eye />}
    </Button>
  );
}

function StrengthMeter({ score }: { score: number }) {
  const color = score >= 4 ? "bg-success" : score >= 3 ? "bg-accent" : "bg-warning";
  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <div className="flex flex-1 gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-full", i < score ? color : "bg-surface-2")} />
        ))}
      </div>
      <span className="font-mono text-[11px] text-fg-muted">force {score}/5</span>
    </div>
  );
}

async function loginRequest(apiBase: string, email: string, password: string): Promise<string> {
  const res = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }, apiBase, null);
  const tok = (res as any)?.access_token || (res as any)?.token || (res as any)?.accessToken;
  if (!tok) throw new Error("Jeton manquant dans la réponse");
  return tok;
}

export default function AuthPanel() {
  const { apiBase, setToken, setUser, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [registerData, setRegisterData] = useState({ email: "", password: "", username: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showPwLogin, setShowPwLogin] = useState(false);
  const [showPwRegister, setShowPwRegister] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [errors, setErrors] = useState<{ login?: string; register?: string } | null>(null);

  async function signIn(email: string, password: string, welcome: string) {
    const tok = await loginRequest(apiBase, email, password);
    setToken(tok);
    const me = await apiFetch("/auth/me", {}, apiBase, tok);
    setUser(me);
    toast({ title: welcome, description: `Bienvenue${me?.username ? ", " + me.username : ""} !` });
    router.push("/dashboard");
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setErrors(null);
    const { email, password, username } = registerData;
    if (!username.trim()) return setErrors({ register: "Le nom est requis." });
    if (!isEmail(email)) return setErrors({ register: "Email invalide." });
    if (passwordScore(password) < 3)
      return setErrors({ register: "Mot de passe trop faible (8 caractères min., mélangez chiffres, majuscules et symboles)." });
    setLoadingRegister(true);
    try {
      await apiFetch("/auth/register", { method: "POST", body: JSON.stringify(registerData) }, apiBase, null);
      await signIn(email, password, "Compte créé");
    } catch (err: any) {
      setErrors({ register: err?.message || "Échec de l'inscription." });
    } finally {
      setLoadingRegister(false);
    }
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setErrors(null);
    const { email, password } = loginData;
    if (!isEmail(email)) return setErrors({ login: "Email invalide." });
    if (!password) return setErrors({ login: "Mot de passe requis." });
    setLoadingLogin(true);
    try {
      await signIn(email, password, "Connecté");
    } catch (err: any) {
      setErrors({ login: err?.message || "Échec de la connexion." });
    } finally {
      setLoadingLogin(false);
    }
  }

  function doLogout() {
    setToken(null);
    setUser(null);
    toast({ title: "Déconnecté" });
  }

  if (user) {
    const name = user.username || user.email?.split("@")[0] || "Utilisateur";
    return (
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-subtle font-mono font-semibold text-accent ring-1 ring-accent-border">
            {name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{name}</p>
            {user.email && <p className="truncate font-mono text-xs text-fg-muted">{user.email}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => router.push("/dashboard")}>
            Aller au dashboard
          </Button>
          <Button variant="outline" onClick={doLogout}>
            <LogOut /> Se déconnecter
          </Button>
        </div>
      </div>
    );
  }

  const score = passwordScore(registerData.password);

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Se connecter</TabsTrigger>
        <TabsTrigger value="register">Créer un compte</TabsTrigger>
      </TabsList>

      <TabsContent value="login">
        <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
          <div>
            <h2 className="text-lg">Connexion</h2>
            <p className="text-[13px] text-fg-muted">Entre tes identifiants pour accéder à ton espace.</p>
          </div>
          {errors?.login && <Notice tone="danger">{errors.login}</Notice>}
          <Field label="Email" htmlFor="login-email">
            <IconInput
              id="login-email"
              type="email"
              icon={<Mail />}
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              placeholder="vous@exemple.com"
              autoComplete="email"
            />
          </Field>
          <Field label="Mot de passe" htmlFor="login-password">
            <IconInput
              id="login-password"
              type={showPwLogin ? "text" : "password"}
              icon={<Lock />}
              trailing={<PasswordToggle shown={showPwLogin} onToggle={() => setShowPwLogin((s) => !s)} />}
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Field>
          <Button type="submit" className="w-full" disabled={loadingLogin}>
            {loadingLogin && <Loader2 className="animate-spin" />} Se connecter
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="register">
        <form onSubmit={handleRegister} noValidate className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
          <div>
            <h2 className="text-lg">Créer un compte</h2>
            <p className="text-[13px] text-fg-muted">Rejoins DevDocsHub et organise ta documentation.</p>
          </div>
          {errors?.register && <Notice tone="danger">{errors.register}</Notice>}
          <Field label="Nom" htmlFor="reg-name">
            <IconInput
              id="reg-name"
              icon={<UserIcon />}
              value={registerData.username}
              onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
              placeholder="Ada Lovelace"
              autoComplete="name"
            />
          </Field>
          <Field label="Email" htmlFor="reg-email">
            <IconInput
              id="reg-email"
              type="email"
              icon={<Mail />}
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              placeholder="vous@exemple.com"
              autoComplete="email"
            />
          </Field>
          <Field label="Mot de passe" htmlFor="reg-password" hint={<StrengthMeter score={score} />}>
            <IconInput
              id="reg-password"
              type={showPwRegister ? "text" : "password"}
              icon={<Lock />}
              trailing={<PasswordToggle shown={showPwRegister} onToggle={() => setShowPwRegister((s) => !s)} />}
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              placeholder="Au moins 8 caractères"
              autoComplete="new-password"
            />
          </Field>
          <Button type="submit" className="w-full" disabled={loadingRegister}>
            {loadingRegister && <Loader2 className="animate-spin" />} Créer le compte
          </Button>
          <p className="text-center text-xs text-fg-muted">
            En t'inscrivant, tu acceptes les conditions d'utilisation et la politique de confidentialité.
          </p>
        </form>
      </TabsContent>
    </Tabs>
  );
}
```

- [ ] **Step 3: Rendu markdown, sommaire, notes du doc**

`apps/web/components/markdown.tsx` :

```tsx
"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy } from "lucide-react";
import { createSlugger, languageFromClassName, nodeText } from "@/lib/markdown";
import { cn } from "@/lib/utils";

export function Markdown({ content, className }: { content: string; className?: string }) {
  // Nouveau slugger à chaque rendu : même séquence d'ids que extractHeadings (sommaire)
  const slugger = createSlugger();
  return (
    <div className={cn("prose", className)}>
      <ReactMarkdown
        components={{
          h2: ({ node: _node, children, ...props }) => (
            <h2 id={slugger.slug(nodeText(children))} {...props}>
              {children}
            </h2>
          ),
          h3: ({ node: _node, children, ...props }) => (
            <h3 id={slugger.slug(nodeText(children))} {...props}>
              {children}
            </h3>
          ),
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ children }: { children?: ReactNode }) {
  const child = (Array.isArray(children) ? children[0] : children) as
    | ReactElement<{ className?: string; children?: ReactNode }>
    | undefined;
  const code = nodeText(child?.props?.children ?? children).replace(/\n$/, "");
  const language = languageFromClassName(child?.props?.className);
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 1500);
  }

  return (
    <div className="my-5 overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="font-mono text-[11px] text-fg-muted">{language ?? "code"}</span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded px-1.5 py-0.5 font-mono text-[11px] text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg [&_svg]:size-3.5"
        >
          {state === "copied" ? (
            <>
              <Check /> Copié
            </>
          ) : state === "failed" ? (
            "Échec de la copie"
          ) : (
            <>
              <Copy /> Copier
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-fg">
        <code>{code}</code>
      </pre>
    </div>
  );
}
```

`apps/web/components/toc.tsx` :

```tsx
"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/markdown";
import { cn } from "@/lib/utils";

export function Toc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-64px 0px -70% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav
      aria-label="Sur cette page"
      className="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-52 shrink-0 self-start overflow-y-auto xl:block"
    >
      <p className="mb-2 font-mono text-[11px] text-fg-muted">Sur cette page</p>
      <ul className="flex flex-col border-l border-border">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l py-1 text-[13px] transition-colors",
                h.depth === 3 ? "pl-6" : "pl-3",
                active === h.id ? "border-accent text-accent" : "border-transparent text-fg-muted hover:text-fg",
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

`apps/web/components/doc-notes.tsx` :

```tsx
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
```

- [ ] **Step 4: Page doc**

`apps/web/app/docs/[slug]/page.tsx` (le segment `slug` contient l'id du doc, comme avant) :

```tsx
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
```

(Le fil d'Ariane pointe vers `/docs?tech=…` : Task 4 fait lire ce paramètre à la liste.)

- [ ] **Step 5: Supprimer les CSS de ces pages, vérifier (GREEN)**

```bash
git rm apps/web/app/auth/auth.module.css apps/web/components/auth-panel.module.css "apps/web/app/docs/[slug]/doc-view.module.css"
```

Run: `pnpm --filter web test && pnpm --filter web build`, `docker compose up -d --build web`, puis `pnpm --filter web flows` (avec `API_RESTART_CMD`).
Expected: tous les checks PASS, dont les 6 nouveaux.

Puis captures (`pnpm --filter web screenshots`, `PAGES=/auth,/docs/<docId>`, avec `SHOT_EMAIL`/`SHOT_PASSWORD`) : les regarder en dark/light, desktop/mobile — sommaire masqué < 1280px, colonne ≈ 72ch, aucun débordement.

- [ ] **Step 6: Commit**

```bash
git add -A apps/web/app/auth apps/web/components/auth-panel.tsx "apps/web/app/docs/[slug]" apps/web/components/markdown.tsx apps/web/components/toc.tsx apps/web/components/doc-notes.tsx apps/web/scripts/flows.mjs
git commit -m "feat(web): redesign auth and doc pages (anchored headings, TOC, copy, notes)"
```

---

### Task 4: Listes Docs, Notes, Collections

**Files:**
- Modify: `apps/web/app/docs/page.tsx`, `apps/web/app/notes/page.tsx`, `apps/web/app/notes/layout.tsx`, `apps/web/components/layout/notes-sidebar.tsx`, `apps/web/app/collections/page.tsx`, `apps/web/scripts/flows.mjs`
- Delete: `apps/web/app/docs/page.css`, `apps/web/app/notes/page.css`

**Interfaces:**
- Consumes: `useDocsStore` (`status`, `docs`, `load`, `invalidate`), `filterDocs`, `sortDocs`, `DocSort`, `filterNotes`, `NoteItem`, `excerpt`, `formatRelative`, `PageHeader`, `Row*`, `EmptyState`, `Notice`.
- Produces: URL `/docs?tech=<t>` (préfiltre techno) ; URL `/notes?pinned=1&doc=<id>` (filtres de notes, source de vérité partagée page ↔ sidebar).

- [ ] **Step 1: Assertions e2e (RED)**

Dans `scripts/flows.mjs`, ajouter une section après `notes` :

```js
await section("listes", async () => {
  await p.goto(`${BASE}/docs`, { waitUntil: "networkidle" });
  const row = p.locator("main li", { hasText: docTitle });
  check("/docs : ligne du doc avec badge techno", (await row.count()) === 1 && (await row.getByText("~/flowtech").count()) === 1);
  await p.getByLabel("Filtrer les docs").fill("zzz-aucun-resultat");
  check("/docs : filtre sans résultat → état vide", (await p.getByText("Aucun résultat").count()) === 1);
  await p.goto(`${BASE}/docs?tech=flowtech`, { waitUntil: "networkidle" });
  const techRows = await p.locator("main ul > li").count();
  check("/docs?tech= préfiltre la techno", techRows >= 1 && (await p.locator("main li", { hasText: docTitle }).count()) === 1, `${techRows} lignes`);

  await p.goto(`${BASE}/notes?pinned=1`, { waitUntil: "networkidle" });
  const pinnedSidebar = await p.locator('aside nav[aria-label="Notes"] a[aria-current="page"]').innerText();
  const pinnedBox = await p.getByRole("checkbox", { name: "Épinglées seulement" }).getAttribute("data-state");
  check("/notes?pinned=1 : sidebar et case synchronisées", pinnedSidebar.includes("Épinglées") && pinnedBox === "checked", `${pinnedSidebar} / ${pinnedBox}`);
  await p.goto(`${BASE}/notes?doc=${docId}`, { waitUntil: "networkidle" });
  const noteRows = p.locator("main li", { hasText: "Note de test flow" });
  check("/notes?doc= : notes du doc, avec son titre", (await noteRows.count()) === 1 && (await noteRows.getByText(docTitle).count()) === 1);

  await p.goto(`${BASE}/collections`, { waitUntil: "networkidle" });
  check("/collections : ligne de la collection", (await p.locator("main li", { hasText: `Flow col ${stamp}` }).count()) === 1);
});
```

Cette section a besoin de la collection : déplacer la section `collections` **avant** la section `listes`.

Run: build Docker + flows. Expected: FAIL sur les 6 nouveaux checks (grilles de cartes, pas de `Filtrer les docs`, pas de paramètres d'URL).

- [ ] **Step 2: `/docs`**

`apps/web/app/docs/page.tsx` :

```tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileText, Plus, RefreshCw, Search } from "lucide-react";
import { useAuth } from "@/lib/store";
import { useDocsStore } from "@/lib/docs-store";
import { filterDocs, sortDocs, type DocSort } from "@/lib/list-filters";
import { excerpt, formatRelative } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page/page-header";
import { Row, RowList, RowListSkeleton } from "@/components/page/row-list";
import { EmptyState } from "@/components/page/empty-state";
import { Notice } from "@/components/page/notice";

const ALL = "__all__";

export default function DocsPage() {
  return (
    <Suspense fallback={<RowListSkeleton rows={5} />}>
      <DocsView />
    </Suspense>
  );
}

function DocsView() {
  const params = useSearchParams();
  const { token, apiBase } = useAuth();
  const { status, docs, load, invalidate } = useDocsStore();
  const [query, setQuery] = useState("");
  const [tech, setTech] = useState(params.get("tech") ?? "");
  const [sort, setSort] = useState<DocSort>("recent");

  useEffect(() => {
    if (token) void load(token, apiBase);
  }, [token, apiBase, load]);

  useEffect(() => setTech(params.get("tech") ?? ""), [params]);

  const techs = useMemo(
    () => [...new Set(docs.map((d) => (d.tech ?? "").trim().toLowerCase()).filter(Boolean))].sort(),
    [docs],
  );
  const view = useMemo(() => sortDocs(filterDocs(docs, { query, tech }), sort), [docs, query, tech, sort]);
  const filtering = query !== "" || tech !== "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Docs"
        description="Toute la documentation, rangée par techno."
        actions={
          <>
            <Button variant="ghost" size="icon" aria-label="Actualiser" onClick={invalidate} disabled={!token}>
              <RefreshCw />
            </Button>
            <Link href="/docs/new" className={buttonVariants()}>
              <Plus /> Nouveau doc
            </Link>
          </>
        }
      />

      {!token ? (
        <Notice>
          <Link href="/auth">Connecte-toi</Link> pour voir les docs.
        </Notice>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrer par titre, techno, contenu…"
                aria-label="Filtrer les docs"
                className="pl-9"
              />
            </div>
            <Select value={tech || ALL} onValueChange={(v) => setTech(v === ALL ? "" : v)}>
              <SelectTrigger className="sm:w-44" aria-label="Techno">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Toutes les technos</SelectItem>
                {techs.map((t) => (
                  <SelectItem key={t} value={t}>
                    ~/{t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as DocSort)}>
              <SelectTrigger className="sm:w-40" aria-label="Tri">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récents</SelectItem>
                <SelectItem value="oldest">Plus anciens</SelectItem>
                <SelectItem value="title">Titre A → Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === "error" ? (
            <Notice tone="danger">
              Impossible de charger les docs.{" "}
              <button type="button" onClick={invalidate}>
                Réessayer
              </button>
            </Notice>
          ) : status !== "ready" ? (
            <RowListSkeleton rows={5} />
          ) : view.length === 0 ? (
            filtering ? (
              <EmptyState
                icon={<Search />}
                title="Aucun résultat"
                description="Aucun doc ne correspond à ces filtres."
                action={
                  <Button variant="outline" size="sm" onClick={() => { setQuery(""); setTech(""); }}>
                    Effacer les filtres
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={<FileText />}
                title="Aucun doc pour l'instant"
                description="Crée le premier pour démarrer la base."
                action={
                  <Link href="/docs/new" className={buttonVariants({ size: "sm" })}>
                    <Plus /> Nouveau doc
                  </Link>
                }
              />
            )
          ) : (
            <>
              <p className="font-mono text-[11px] text-fg-muted">
                {view.length} / {docs.length} docs
              </p>
              <RowList>
                {view.map((d) => (
                  <Row
                    key={d.id}
                    href={`/docs/${d.id}`}
                    title={d.title}
                    description={excerpt(d.content, 140) || undefined}
                    meta={<span>{formatRelative(d.created_at)}</span>}
                    aside={d.tech ? <Badge variant="neutral">~/{d.tech.trim().toLowerCase()}</Badge> : undefined}
                  />
                ))}
              </RowList>
            </>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: `/notes` + sidebar**

`apps/web/app/notes/page.tsx` :

```tsx
"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, StickyNote } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { useDocsStore } from "@/lib/docs-store";
import { filterNotes, type NoteItem } from "@/lib/list-filters";
import { excerpt, formatRelative } from "@/lib/format";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page/page-header";
import { Row, RowList, RowListSkeleton } from "@/components/page/row-list";
import { EmptyState } from "@/components/page/empty-state";
import { Notice } from "@/components/page/notice";

const ALL = "__all__";
type State = { status: "loading" } | { status: "error" } | { status: "ready"; notes: NoteItem[] };

export default function NotesPage() {
  return (
    <Suspense fallback={<RowListSkeleton rows={4} />}>
      <NotesView />
    </Suspense>
  );
}

function NotesView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const pinnedOnly = params.get("pinned") === "1";
  const docId = params.get("doc") ?? "";

  const { token, apiBase } = useAuth();
  const { docs, load } = useDocsStore();
  const [state, setState] = useState<State>({ status: "loading" });
  const [query, setQuery] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (token) void load(token, apiBase);
  }, [token, apiBase, load]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setState({ status: "loading" });
    apiFetch<NoteItem[]>("/notes", {}, apiBase, token)
      .then((notes) => {
        if (!cancelled) setState({ status: "ready", notes: Array.isArray(notes) ? notes : [] });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [token, apiBase, reload]);

  const docTitles = useMemo(() => new Map(docs.map((d) => [d.id, d.title])), [docs]);
  const sortedDocs = useMemo(() => [...docs].sort((a, b) => a.title.localeCompare(b.title, "fr")), [docs]);
  const view = useMemo(
    () => (state.status === "ready" ? filterNotes(state.notes, { query, pinnedOnly, docId }, (id) => docTitles.get(id)) : []),
    [state, query, pinnedOnly, docId, docTitles],
  );

  // Les filtres vivent dans l'URL : la sidebar et la page restent synchronisées
  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      const qs = next.toString();
      router.replace((qs ? `${pathname}?${qs}` : pathname) as Route, { scroll: false });
    },
    [params, pathname, router],
  );

  const filtering = query !== "" || pinnedOnly || docId !== "";
  const newNoteHref = (docId ? `/notes/new?doc=${docId}` : "/notes/new") as Route;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={pinnedOnly ? "Notes épinglées" : "Notes"}
        description="Tes notes, rattachées aux docs."
        actions={
          <Link href={newNoteHref} className={buttonVariants()}>
            <Plus /> Nouvelle note
          </Link>
        }
      />

      {!token ? (
        <Notice>
          <Link href="/auth">Connecte-toi</Link> pour voir les notes.
        </Notice>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrer les notes…"
                aria-label="Filtrer les notes"
                className="pl-9"
              />
            </div>
            <Select value={docId || ALL} onValueChange={(v) => setParam("doc", v === ALL ? null : v)}>
              <SelectTrigger className="sm:w-56" aria-label="Doc">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Tous les docs</SelectItem>
                {sortedDocs.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 whitespace-nowrap text-[13px] text-fg-muted">
              <Checkbox
                aria-label="Épinglées seulement"
                checked={pinnedOnly}
                onCheckedChange={(v) => setParam("pinned", v ? "1" : null)}
              />
              Épinglées seulement
            </label>
          </div>

          {state.status === "error" ? (
            <Notice tone="danger">
              Impossible de charger les notes.{" "}
              <button type="button" onClick={() => setReload((r) => r + 1)}>
                Réessayer
              </button>
            </Notice>
          ) : state.status === "loading" ? (
            <RowListSkeleton rows={4} />
          ) : view.length === 0 ? (
            filtering ? (
              <EmptyState
                icon={<Search />}
                title="Aucune note ne correspond"
                action={
                  <Button variant="outline" size="sm" onClick={() => { setQuery(""); router.replace("/notes"); }}>
                    Effacer les filtres
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={<StickyNote />}
                title="Aucune note pour l'instant"
                description="Ajoute une note depuis un doc ou ici."
                action={
                  <Link href="/notes/new" className={buttonVariants({ size: "sm" })}>
                    <Plus /> Nouvelle note
                  </Link>
                }
              />
            )
          ) : (
            <RowList>
              {view.map((n) => (
                <Row
                  key={n.id}
                  href={n.doc_id ? `/docs/${n.doc_id}` : undefined}
                  title={excerpt(n.content, 140) || "(note vide)"}
                  meta={
                    <>
                      {n.is_pinned && <span className="text-warning">★ épinglée</span>}
                      {n.doc_id && <span>{docTitles.get(n.doc_id) ?? "doc supprimé"}</span>}
                      <span>{formatRelative(n.updated_at ?? n.created_at)}</span>
                    </>
                  }
                />
              ))}
            </RowList>
          )}
        </>
      )}
    </div>
  );
}
```

`apps/web/components/layout/notes-sidebar.tsx` :

```tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { SidebarLink } from "./sidebar-link";

export function NotesSidebar() {
  const pathname = usePathname();
  const pinned = useSearchParams().get("pinned") === "1";
  return (
    <nav aria-label="Notes" className="flex flex-col gap-0.5">
      <SidebarLink href="/notes" active={pathname === "/notes" && !pinned}>Toutes les notes</SidebarLink>
      <SidebarLink href="/notes?pinned=1" active={pathname === "/notes" && pinned}>★ Épinglées</SidebarLink>
      <SidebarLink href="/notes/new" active={pathname === "/notes/new"}>+ Nouvelle note</SidebarLink>
    </nav>
  );
}
```

`apps/web/app/notes/layout.tsx` :

```tsx
import { Suspense } from "react";
import { SectionLayout } from "@/components/layout/section-layout";
import { NotesSidebar } from "@/components/layout/notes-sidebar";

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <SectionLayout
      sidebar={
        <Suspense fallback={null}>
          <NotesSidebar />
        </Suspense>
      }
    >
      {children}
    </SectionLayout>
  );
}
```

- [ ] **Step 4: `/collections`**

`apps/web/app/collections/page.tsx` :

```tsx
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
    apiFetch<Collection[]>("/collections/", {}, apiBase, token)
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
```

- [ ] **Step 5: Supprimer les CSS, vérifier (GREEN)**

```bash
git rm apps/web/app/docs/page.css apps/web/app/notes/page.css
```

Run: `pnpm --filter web test && pnpm --filter web build` (le build doit passer : les `useSearchParams` sont sous `<Suspense>`), `docker compose up -d --build web`, flows.
Expected: tous les checks PASS. Captures `/docs`, `/notes`, `/notes?pinned=1`, `/collections` : lignes bordées, états vides, mobile sans débordement.

- [ ] **Step 6: Commit**

```bash
git add -A apps/web/app/docs/page.tsx apps/web/app/docs/page.css apps/web/app/notes apps/web/components/layout/notes-sidebar.tsx apps/web/app/collections/page.tsx apps/web/scripts/flows.mjs
git commit -m "feat(web): redesign docs, notes and collections lists (URL filters, empty states)"
```

---

### Task 5: Formulaires

**Files:**
- Modify: `apps/web/components/forms/doc-form.tsx`, `apps/web/app/docs/new/page.tsx`, `apps/web/app/notes/new/page.tsx`, `apps/web/components/forms/collection-form.tsx`, `apps/web/app/collections/add/page.tsx`, `apps/web/scripts/flows.mjs`
- Delete: `apps/web/components/forms/note-form.tsx` (aucun import — vérifier avec `grep -rn "note-form" apps/web/app apps/web/components`)

**Interfaces:**
- Consumes: `Field`, `Notice`, `PageHeader`, `slugify` (Task 1), `useDocsStore` (`docs`, `load`, `invalidate`).
- Produces: `DocForm({ onCreated?, onCancel? })` ; `CollectionForm({ onCreated? })` (inchangée côté appelant) ; ids de champs stables pour les tests : `doc-title`, `doc-slug`, `doc-tech`, `doc-content`, `doc-tags`, `doc_id` (note), `note-content`, `note-pinned`, `col-name`, `col-description`, `link-collection`, `link-doc`.

- [ ] **Step 1: Assertions e2e (RED)**

Dans `scripts/flows.mjs` :

1. Section `docs` — remplacer les `p.fill('input[placeholder=…]')` / `textarea[placeholder=…]` et le clic `Create` par :

```js
  await p.getByRole("button", { name: "Créer le doc" }).click();
  check("formulaire doc : erreurs inline si vide", (await p.getByText("Le titre est requis.").count()) === 1);
  await p.fill("#doc-title", docTitle);
  const autoSlug = await p.inputValue("#doc-slug");
  check("formulaire doc : slug proposé depuis le titre", autoSlug === `flow-doc-${stamp}`, autoSlug);
  await p.fill("#doc-tech", "FlowTech");
  await p.fill("#doc-content", "## Installation\nflow\n\n### Détails `avancés`\n\n```bash\necho flow\n```\n\n## Installation\nbis");
  await p.getByRole("button", { name: "Créer le doc" }).click();
```

2. Section `notes` — remplacer l'ouverture de `/notes/new` et le choix du doc par :

```js
  await p.goto(`${BASE}/notes/new?doc=${docId}`, { waitUntil: "networkidle" });
  const preselected = await p.locator("#doc_id").innerText();
  check("nouvelle note : doc présélectionné via ?doc=", preselected.includes(docTitle), preselected);
  await p.fill("#note-content", "Note de test flow");
  await p.getByLabel("Épingler cette note").click();
  await p.getByRole("button", { name: "Créer la note" }).click();
```

(puis `waitForURL("**/notes")` inchangé ; la note est donc épinglée, ce que la section `listes` exploite).

3. Section `collections` — remplacer le `fill` et le clic par :

```js
  await p.fill("#col-name", `Flow col ${stamp}`);
  await p.getByRole("button", { name: "Créer la collection" }).click();
```

4. Section `listes` — le check `/notes?pinned=1` vérifie aussi que la note y figure : ajouter `&& (await p.locator("main li", { hasText: "Note de test flow" }).count()) === 1` à sa condition.

Run: build Docker + flows. Expected: FAIL (boutons « Créer le doc », « Créer la note », « Créer la collection » introuvables, `#doc-title` absent, pas de présélection).

- [ ] **Step 2: Formulaire doc**

`apps/web/components/forms/doc-form.tsx` :

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { useDocsStore } from "@/lib/docs-store";
import { slugify } from "@/lib/markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Field } from "@/components/page/field";
import { Notice } from "@/components/page/notice";

type Errors = Partial<Record<"title" | "slug" | "tech" | "form", string>>;
const EMPTY = { title: "", slug: "", tech: "", content: "", tags: "" };

export default function DocForm({ onCreated, onCancel }: { onCreated?: () => void; onCancel?: () => void }) {
  const { apiBase, token } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function setTitle(title: string) {
    setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!form.title.trim()) e.title = "Le titre est requis.";
    if (!form.slug.trim()) e.slug = "Le slug est requis.";
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) e.slug = "Minuscules, chiffres et tirets uniquement.";
    if (!form.tech.trim()) e.tech = "La techno est requise.";
    return e;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        slug: form.slug,
        tech: form.tech.trim(),
        content: form.content,
      };
      if (form.tags.trim()) payload.tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      await apiFetch("/docs/add", { method: "POST", body: JSON.stringify(payload) }, apiBase, token);
      toast({ title: "Doc créé", variant: "success" });
      setForm(EMPTY);
      setSlugTouched(false);
      useDocsStore.getState().invalidate();
      onCreated?.();
    } catch (err: any) {
      setErrors({ form: err?.message || "Impossible de créer le doc." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6">
      {errors.form && <Notice tone="danger">{errors.form}</Notice>}
      <Field label="Titre" htmlFor="doc-title" required error={errors.title}>
        <Input id="doc-title" value={form.title} onChange={(e) => setTitle(e.target.value)} placeholder="Déployer avec Docker Compose" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Slug" htmlFor="doc-slug" required error={errors.slug} hint="Proposé à partir du titre.">
          <Input
            id="doc-slug"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm({ ...form, slug: e.target.value });
            }}
            placeholder="deployer-avec-docker-compose"
            className="font-mono"
          />
        </Field>
        <Field label="Techno" htmlFor="doc-tech" required error={errors.tech} hint="Sert à ranger le doc (~/docker…).">
          <Input id="doc-tech" value={form.tech} onChange={(e) => setForm({ ...form, tech: e.target.value })} placeholder="docker" />
        </Field>
      </div>
      <Field label="Contenu" htmlFor="doc-content" hint="Markdown. Les titres ## et ### alimentent le sommaire.">
        <Textarea
          id="doc-content"
          rows={14}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder={"## Introduction\n\n…"}
          className="font-mono text-[13px]"
        />
      </Field>
      <Field label="Tags" htmlFor="doc-tags" hint="Séparés par des virgules.">
        <Input id="doc-tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="backend, prod" />
      </Field>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Création…" : "Créer le doc"}
        </Button>
      </div>
    </form>
  );
}
```

`apps/web/app/docs/new/page.tsx` :

```tsx
"use client";

import { useRouter } from "next/navigation";
import DocForm from "@/components/forms/doc-form";
import { PageHeader } from "@/components/page/page-header";

export default function NewDocPage() {
  const router = useRouter();
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader eyebrow="docs / nouveau" title="Nouveau doc" description="Rédige en markdown ; il apparaîtra dans ~/techno." />
      <DocForm onCreated={() => router.push("/docs")} onCancel={() => router.push("/docs")} />
    </div>
  );
}
```

- [ ] **Step 3: Nouvelle note**

`apps/web/app/notes/new/page.tsx` (logique d'envoi inchangée ; docs depuis le store partagé ; `?doc=` présélectionne) :

```tsx
"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { useDocsStore } from "@/lib/docs-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Field } from "@/components/page/field";
import { Notice } from "@/components/page/notice";
import { PageHeader } from "@/components/page/page-header";

export default function NewNotePage() {
  return (
    <Suspense fallback={null}>
      <NewNoteForm />
    </Suspense>
  );
}

function NewNoteForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { apiBase, token, user } = useAuth();
  const { status, docs, load } = useDocsStore();
  const { toast } = useToast();
  const [form, setForm] = useState({ doc_id: params.get("doc") ?? "", content: "", is_pinned: false });
  const [errors, setErrors] = useState<{ doc?: string; content?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) void load(token, apiBase);
  }, [token, apiBase, load]);

  const sortedDocs = useMemo(() => [...docs].sort((a, b) => a.title.localeCompare(b.title, "fr")), [docs]);
  const backTo = form.doc_id ? `/docs/${form.doc_id}` : "/notes";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token || !user?.id) {
      setErrors({ form: "Tu dois être connecté pour créer une note." });
      return;
    }
    const next = {
      doc: form.doc_id ? undefined : "Choisis un doc.",
      content: form.content.trim() ? undefined : "Le contenu est requis.",
    };
    setErrors(next);
    if (next.doc || next.content) return;
    setSubmitting(true);
    try {
      const payload = { doc_id: form.doc_id, user_id: user.id, content: form.content, is_pinned: form.is_pinned };
      await apiFetch("/notes", { method: "POST", body: JSON.stringify(payload) }, apiBase, token);
      toast({ title: "Note créée", variant: "success" });
      router.push("/notes");
    } catch (err: any) {
      setErrors({ form: err?.message || "Impossible de créer la note." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader eyebrow="notes / nouvelle" title="Nouvelle note" description="Une note est toujours rattachée à un doc." />
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6">
        {errors.form && <Notice tone="danger">{errors.form}</Notice>}
        <Field label="Doc" htmlFor="doc_id" required error={errors.doc}>
          {status === "ready" && docs.length === 0 ? (
            <Notice>Aucun doc disponible : crée d'abord un doc.</Notice>
          ) : (
            <Select value={form.doc_id} onValueChange={(v) => setForm({ ...form, doc_id: v })} disabled={submitting}>
              <SelectTrigger id="doc_id">
                <SelectValue placeholder={status === "ready" ? "Choisir un doc" : "Chargement des docs…"} />
              </SelectTrigger>
              <SelectContent>
                {sortedDocs.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.title}
                    {d.tech ? ` · ~/${d.tech.trim().toLowerCase()}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>
        <Field label="Contenu" htmlFor="note-content" required error={errors.content}>
          <Textarea
            id="note-content"
            rows={8}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Ce qu'il faut retenir…"
            disabled={submitting}
          />
        </Field>
        <div className="flex items-center gap-2">
          <Checkbox
            id="note-pinned"
            checked={form.is_pinned}
            onCheckedChange={(v) => setForm({ ...form, is_pinned: Boolean(v) })}
            disabled={submitting}
          />
          <Label htmlFor="note-pinned" className="cursor-pointer font-normal">
            Épingler cette note
          </Label>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push(backTo as Route)} disabled={submitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Création…" : "Créer la note"}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Collections**

`apps/web/components/forms/collection-form.tsx` (même API ; la liaison doc ↔ collection passe par des listes au lieu d'UUID à saisir) :

```tsx
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { useDocsStore } from "@/lib/docs-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Field } from "@/components/page/field";
import { Notice } from "@/components/page/notice";

type Collection = { id: string; name: string };

export default function CollectionForm({ onCreated }: { onCreated?: () => void }) {
  const { apiBase, token } = useAuth();
  const { toast } = useToast();
  const { docs, load } = useDocsStore();
  const [form, setForm] = useState({ name: "", description: "" });
  const [link, setLink] = useState({ collection_id: "", doc_id: "" });
  const [collections, setCollections] = useState<Collection[]>([]);
  const [errors, setErrors] = useState<{ name?: string; create?: string; link?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (!token) return;
    void load(token, apiBase);
    apiFetch<Collection[]>("/collections/", {}, apiBase, token)
      .then((c) => setCollections(Array.isArray(c) ? c : []))
      .catch(() => setCollections([]));
  }, [token, apiBase, load]);

  const sortedDocs = useMemo(() => [...docs].sort((a, b) => a.title.localeCompare(b.title, "fr")), [docs]);

  async function createCollection(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setErrors({ name: "Le nom est requis." });
    setErrors({});
    setSubmitting(true);
    try {
      await apiFetch("/collections/", { method: "POST", body: JSON.stringify(form) }, apiBase, token);
      toast({ title: "Collection créée", variant: "success" });
      setForm({ name: "", description: "" });
      onCreated?.();
    } catch (err: any) {
      setErrors({ create: err?.message || "Impossible de créer la collection." });
    } finally {
      setSubmitting(false);
    }
  }

  async function linkDoc(e: FormEvent) {
    e.preventDefault();
    if (!link.collection_id || !link.doc_id) return setErrors({ link: "Choisis une collection et un doc." });
    setErrors({});
    setLinking(true);
    try {
      await apiFetch(`/collections/${link.collection_id}/docs`, { method: "POST", body: JSON.stringify({ doc_id: link.doc_id }) }, apiBase, token);
      toast({ title: "Doc ajouté à la collection", variant: "success" });
      setLink({ collection_id: "", doc_id: "" });
      onCreated?.();
    } catch (err: any) {
      setErrors({ link: err?.message || "Impossible d'ajouter le doc." });
    } finally {
      setLinking(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={createCollection} noValidate className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-base">Nouvelle collection</h2>
        {errors.create && <Notice tone="danger">{errors.create}</Notice>}
        <Field label="Nom" htmlFor="col-name" required error={errors.name}>
          <Input id="col-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Backend" />
        </Field>
        <Field label="Description" htmlFor="col-description">
          <Input
            id="col-description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Ce qu'on range ici"
          />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Création…" : "Créer la collection"}
          </Button>
        </div>
      </form>

      <form onSubmit={linkDoc} noValidate className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-base">Ajouter un doc à une collection</h2>
        {errors.link && <Notice tone="danger">{errors.link}</Notice>}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Collection" htmlFor="link-collection">
            <Select value={link.collection_id} onValueChange={(v) => setLink({ ...link, collection_id: v })}>
              <SelectTrigger id="link-collection">
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Doc" htmlFor="link-doc">
            <Select value={link.doc_id} onValueChange={(v) => setLink({ ...link, doc_id: v })}>
              <SelectTrigger id="link-doc">
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                {sortedDocs.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="secondary" disabled={linking}>
            {linking ? "Ajout…" : "Ajouter le doc"}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

`apps/web/app/collections/add/page.tsx` :

```tsx
"use client";

import { useRouter } from "next/navigation";
import CollectionForm from "@/components/forms/collection-form";
import { PageHeader } from "@/components/page/page-header";

export default function AddCollectionPage() {
  const router = useRouter();
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader eyebrow="collections / nouvelle" title="Nouvelle collection" description="Crée une collection, puis ajoutes-y des docs." />
      <CollectionForm onCreated={() => router.push("/collections")} />
    </div>
  );
}
```

- [ ] **Step 5: Supprimer le formulaire mort, vérifier (GREEN)**

```bash
grep -rn "note-form" apps/web/app apps/web/components || git rm apps/web/components/forms/note-form.tsx
```

Run: tests, build, `docker compose up -d --build web`, flows.
Expected: tous PASS. Captures `/docs/new`, `/notes/new`, `/collections/add` (dark/light, desktop/mobile) : formulaires centrés, erreurs lisibles.

- [ ] **Step 6: Commit**

```bash
git add -A apps/web/components/forms apps/web/app/docs/new apps/web/app/notes/new apps/web/app/collections/add apps/web/scripts/flows.mjs
git commit -m "feat(web): redesign forms (inline validation, auto slug, doc/collection pickers)"
```

---

### Task 6: Dashboard, profil, utilisateurs

**Files:**
- Modify: `apps/web/app/dashboard/page.tsx`, `apps/web/components/dashboard.tsx`, `apps/web/app/profile/page.tsx`, `apps/web/components/profile.tsx`, `apps/web/app/users/page.tsx`, `apps/web/scripts/flows.mjs`
- Delete: `apps/web/components/profile.css`, `apps/web/components/data-table.tsx`

**Interfaces:**
- Consumes: `StatCard`, `PageHeader`, `Row*`, `Notice`, `EmptyState`, `useDocsStore`, `sortDocs`, `filterNotes`, `NoteItem`, `formatRelative`, `formatDate`, `excerpt`, `Badge`.

- [ ] **Step 1: Assertions e2e (RED)**

Dans `scripts/flows.mjs`, nouvelle section en fin de parcours (avant `clavier`) :

```js
await section("tableau de bord", async () => {
  await p.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  const text = await p.locator("main").innerText();
  check("dashboard : 3 compteurs, sans faux contenu", ["Docs", "Notes", "Collections"].every((l) => text.includes(l)) && !text.includes("Guide d'intégration API") && !text.includes("Utilisateurs"));
  check("dashboard : doc récent listé", (await p.locator("main li", { hasText: docTitle }).count()) >= 1);
  check("dashboard : note épinglée listée", (await p.locator("main li", { hasText: "Note de test flow" }).count()) >= 1);
  await p.goto(`${BASE}/profile`, { waitUntil: "networkidle" });
  check("profil : email affiché", (await p.getByText(email).count()) >= 1);
  await p.goto(`${BASE}/users`, { waitUntil: "networkidle" });
  check("/users non admin → réservé aux administrateurs", (await p.getByText("Réservé aux administrateurs").count()) === 1);
});
```

Run: build Docker + flows. Expected: FAIL sur les 5 nouveaux checks.

- [ ] **Step 2: Dashboard**

`apps/web/app/dashboard/page.tsx` :

```tsx
import Dashboard from "@/components/dashboard";

export default function DashboardPage() {
  return <Dashboard />;
}
```

`apps/web/components/dashboard.tsx` :

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Plus, StickyNote } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { useDocsStore } from "@/lib/docs-store";
import { sortDocs, filterNotes, type NoteItem } from "@/lib/list-filters";
import { excerpt, formatRelative } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/page/page-header";
import { StatCard } from "@/components/page/stat-card";
import { Row, RowList, RowListSkeleton } from "@/components/page/row-list";
import { EmptyState } from "@/components/page/empty-state";
import { Notice } from "@/components/page/notice";

type Counts = { docs?: number; notes?: number; collections?: number };

async function count(path: string, apiBase: string, token: string): Promise<number | undefined> {
  try {
    const data: any = await apiFetch(path, {}, apiBase, token);
    if (typeof data === "number") return data;
    if (typeof data?.count === "number") return data.count;
    return undefined;
  } catch {
    return undefined;
  }
}

export default function Dashboard() {
  const { user, token, apiBase } = useAuth();
  const { status: docsStatus, docs, load } = useDocsStore();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [notes, setNotes] = useState<NoteItem[] | null>(null);

  const username = user?.username || user?.email?.split("@")[0] || "";
  const hour = new Date().getHours();
  const greeting = hour >= 18 || hour < 5 ? "Bonsoir" : "Bonjour";

  useEffect(() => {
    if (!token) return;
    void load(token, apiBase);
    let cancelled = false;
    Promise.all([
      count("/docs/count", apiBase, token),
      count("/notes/count", apiBase, token),
      count("/collections/count", apiBase, token),
    ]).then(([d, n, c]) => {
      if (!cancelled) setCounts({ docs: d, notes: n, collections: c });
    });
    apiFetch<NoteItem[]>("/notes", {}, apiBase, token)
      .then((all) => {
        if (!cancelled) setNotes(Array.isArray(all) ? all : []);
      })
      .catch(() => {
        if (!cancelled) setNotes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [token, apiBase, load]);

  const recentDocs = useMemo(() => sortDocs(docs, "recent").slice(0, 5), [docs]);
  const docTitles = useMemo(() => new Map(docs.map((d) => [d.id, d.title])), [docs]);
  const pinned = useMemo(
    () => (notes ? filterNotes(notes.filter((n) => !user?.id || n.user_id === user.id), { pinnedOnly: true }).slice(0, 5) : null),
    [notes, user?.id],
  );

  if (!token) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Dashboard" />
        <Notice>
          <Link href="/auth">Connecte-toi</Link> pour voir ton espace.
        </Notice>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="~/dashboard"
        title={username ? `${greeting}, ${username}` : greeting}
        description="Tes docs, tes notes et tes collections en un coup d'œil."
        actions={
          <>
            <Link href="/notes/new" className={buttonVariants({ variant: "outline" })}>
              <Plus /> Nouvelle note
            </Link>
            <Link href="/docs/new" className={buttonVariants()}>
              <Plus /> Nouveau doc
            </Link>
          </>
        }
      />

      <section aria-label="Compteurs" className="grid grid-cols-3 gap-3">
        <StatCard label="Docs" value={counts?.docs} loading={!counts} />
        <StatCard label="Notes" value={counts?.notes} loading={!counts} />
        <StatCard label="Collections" value={counts?.collections} loading={!counts} />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="recent-docs" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="recent-docs" className="text-base">Docs récents</h2>
            <Link href="/docs" className="font-mono text-xs text-fg-muted hover:text-fg">tout voir →</Link>
          </div>
          {docsStatus === "error" ? (
            <Notice tone="danger">Impossible de charger les docs.</Notice>
          ) : docsStatus !== "ready" ? (
            <RowListSkeleton rows={3} />
          ) : recentDocs.length === 0 ? (
            <EmptyState icon={<FileText />} title="Aucun doc" description="Crée ton premier doc." />
          ) : (
            <RowList>
              {recentDocs.map((d) => (
                <Row
                  key={d.id}
                  href={`/docs/${d.id}`}
                  title={d.title}
                  meta={<span>{formatRelative(d.created_at)}</span>}
                  aside={d.tech ? <Badge variant="neutral">~/{d.tech.trim().toLowerCase()}</Badge> : undefined}
                />
              ))}
            </RowList>
          )}
        </section>

        <section aria-labelledby="pinned-notes" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="pinned-notes" className="text-base">Notes épinglées</h2>
            <Link href="/notes?pinned=1" className="font-mono text-xs text-fg-muted hover:text-fg">tout voir →</Link>
          </div>
          {pinned === null ? (
            <RowListSkeleton rows={3} />
          ) : pinned.length === 0 ? (
            <EmptyState icon={<StickyNote />} title="Aucune note épinglée" description="Épingle une note pour la retrouver ici." />
          ) : (
            <RowList>
              {pinned.map((n) => (
                <Row
                  key={n.id}
                  href={n.doc_id ? `/docs/${n.doc_id}` : undefined}
                  title={excerpt(n.content, 100) || "(note vide)"}
                  meta={
                    <>
                      {n.doc_id && <span>{docTitles.get(n.doc_id) ?? "doc supprimé"}</span>}
                      <span>{formatRelative(n.updated_at ?? n.created_at)}</span>
                    </>
                  }
                />
              ))}
            </RowList>
          )}
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Profil**

`apps/web/app/profile/page.tsx` :

```tsx
import Profile from "@/components/profile";

export default function ProfilePage() {
  return <Profile />;
}
```

`apps/web/components/profile.tsx` (mêmes appels API qu'avant) :

```tsx
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
```

- [ ] **Step 4: Utilisateurs**

`apps/web/app/users/page.tsx` :

```tsx
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
```

- [ ] **Step 5: Supprimer les restes, vérifier (GREEN)**

```bash
git rm apps/web/components/profile.css apps/web/components/data-table.tsx
grep -rn "data-table\|profile.css" apps/web/app apps/web/components || echo "OK"
```

Run: tests, build, `docker compose up -d --build web`, flows.
Expected: tous PASS. Captures `/dashboard`, `/profile`, `/users`.

- [ ] **Step 6: Commit**

```bash
git add -A apps/web/app/dashboard apps/web/components/dashboard.tsx apps/web/app/profile apps/web/components/profile.tsx apps/web/components/profile.css apps/web/app/users apps/web/components/data-table.tsx apps/web/scripts/flows.mjs
git commit -m "feat(web): redesign dashboard, profile and users pages"
```

---

### Task 7: Nettoyage, vérification complète, PR

**Files:**
- Modify: `apps/web/package.json` (retrait `framer-motion`), `pnpm-lock.yaml`

- [ ] **Step 1: Plus de framer-motion ni de couleurs en dur dans les pages**

```bash
grep -rn "framer-motion" apps/web/app apps/web/components || pnpm --filter web remove framer-motion
grep -rnE "#[0-9a-fA-F]{3,6}\b|rgba?\(|style=\{\{[^}]*color" apps/web/app/{auth,dashboard,docs,notes,collections,profile,users} apps/web/components/{auth-panel,dashboard,profile,markdown,toc,doc-notes}.tsx apps/web/components/page apps/web/components/forms || echo "OK: aucune couleur en dur"
ls apps/web/app/**/*.css apps/web/components/*.css 2>/dev/null || echo "OK: plus de CSS de page"
```

Expected: `OK` sur les trois lignes (les pages statiques de la phase 3 ne sont pas dans cette liste).

- [ ] **Step 2: Vérification complète**

Run :
1. `pnpm --filter web test` → tout PASS.
2. `pnpm --filter web build` → OK.
3. `docker compose up -d --build web`.
4. `API_RESTART_CMD="cd ../.. && docker compose restart api" pnpm --filter web flows` → tous PASS.
5. Captures de toutes les pages de la phase (une page par invocation, API redémarrée entre chaque) : `/auth`, `/dashboard`, `/docs`, `/docs/<id>`, `/docs/new`, `/notes`, `/notes?pinned=1`, `/notes/new`, `/collections`, `/collections/add`, `/profile`, `/users` → 0 échec (erreur JS, thème, débordement, timeout). Regarder chaque planche dark/light desktop/mobile.

- [ ] **Step 3: Commit + push + PR**

```bash
git add apps/web/package.json pnpm-lock.yaml
git commit -m "chore(web): drop framer-motion"
git push -u origin redesign/2-pages
gh pr create --base redesign/1-foundation --title "Refonte DA — phase 2 : pages" --body "…"
```

Corps de PR : résumé par page, vérifications (tests, build, flows, captures), limites connues, et la mention « PR empilée sur #76 : sera reciblée sur `main` après le merge de #76 ». Ne pas merger sans accord.
