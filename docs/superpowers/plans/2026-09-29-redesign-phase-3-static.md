# Refonte DA — Phase 3 (Pages statiques) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Passer les 8 pages statiques (`/about`, `/blog`, `/careers`, `/contact`, `/cookies`, `/licenses`, `/privacy`, `/terms`) sur un gabarit `ProsePage` commun, aux couleurs de la DA, puis retirer les alias de compatibilité façon shadcn du thème.

**Architecture:** Un composant serveur `ProsePage` (en-tête `PageHeader` + `<article className="prose">` à ~72 caractères). Le contenu des pages est conservé tel quel ; seules les classes changent. La conversion est mécanique (table de correspondance appliquée par un script jetable), complétée par quelques retouches manuelles (tags colorés → `Badge`, boutons sociaux, liens morts, liste des licences à jour). Deux petites classes de prose (`.card`, `.meta`) couvrent les encadrés et métadonnées.

**Tech Stack:** Next 14.2, Tailwind v4 + tokens (phases 1–2), `node --test`, `scripts/flows.mjs` (e2e), `scripts/screenshots.mjs`.

**Spec:** `docs/superpowers/specs/2026-09-29-redesign-design.md` (§7 « Phase 3 — pages statiques », §4.1 alias « retirés en phase 3 »).

**Branche :** `redesign/3-static`, depuis `redesign/2-pages` (PR #77, non mergée). PR ciblant `redesign/2-pages`, à recibler sur `main` après les merges.

## Global Constraints

- Contenu textuel conservé (spec §7) — exceptions listées en Task 2, step 3.
- Tokens uniquement ; aucune classe de palette Tailwind (`slate-`, `blue-`, `purple-`, `green-`, `bg-white`…) ni alias shadcn (`text-muted-foreground`, `text-primary`, `bg-muted`…) dans les pages.
- Colonne de lecture ≈ 72ch, typo et liens de `.prose` (phase 2).
- Liens internes via `next/link` ; liens externes `target="_blank" rel="noopener noreferrer"`.

## Review Focus

1. **Toutes les pages statiques sont atteignables et rendues sans erreur** en dark/light, desktop/mobile (pas d'erreur JS, pas de débordement horizontal). (Test : Task 2, flows + captures.)
2. **Plus aucun lien mort `href="#"`** : un lien qui ne mène nulle part est pire que du texte. (Test : Task 2, flows.)
3. **Retrait des alias sans casse** : aucune page (y compris les pages des phases 1–2) n'utilise encore un alias supprimé ; sinon la couleur disparaît silencieusement. (Test : Task 3, test tokens + grep.)
4. **Liens externes** ouverts dans un nouvel onglet avec `rel="noopener noreferrer"`. (Test : Task 2, flows.)
5. **Liste des licences à jour** : pas de dépendance supprimée (Framer Motion), les principales dépendances actuelles présentes. (Test : Task 2, flows.)

---

### Task 1: Gabarit `ProsePage` et assertions e2e (RED)

**Files:**
- Create: `apps/web/components/page/prose-page.tsx`
- Modify: `apps/web/styles/globals.css` (classes `.card`, `.meta` dans `.prose`), `apps/web/scripts/flows.mjs`

**Interfaces:**
- Produces: `ProsePage({ title: string; description?: string; eyebrow?: string; children: ReactNode })` ; classes `.prose .card` (encadré), `.prose .meta` (ligne de métadonnées mono).

- [ ] **Step 1: Assertions e2e**

Dans `apps/web/scripts/flows.mjs`, ajouter avant `await section("clavier"` :

```js
await section("pages statiques", async () => {
  const pages = ["/about", "/blog", "/careers", "/contact", "/cookies", "/licenses", "/privacy", "/terms"];
  const legacy = /\b(?:slate|blue|purple|green|indigo|violet)-\d|bg-white|muted-foreground|text-primary|bg-muted\b|prose-slate|prose-invert/;
  for (const path of pages) {
    await p.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    const r = await p.evaluate((re) => {
      const legacyRe = new RegExp(re);
      const main = document.querySelector("main");
      const links = [...(main?.querySelectorAll("a") ?? [])];
      return {
        h1: document.querySelectorAll("main h1").length,
        prose: document.querySelectorAll("main article.prose").length,
        legacy: [...(main?.querySelectorAll("*") ?? [])].filter((el) => legacyRe.test(el.getAttribute("class") ?? "")).length,
        dead: links.filter((a) => a.getAttribute("href") === "#").length,
        unsafeExternal: links.filter((a) => /^https?:/.test(a.getAttribute("href") ?? "") && !(a.target === "_blank" && /noopener/.test(a.rel))).length,
      };
    }, legacy.source);
    check(`${path} : gabarit ProsePage, sans classes héritées ni liens morts`, r.h1 === 1 && r.prose === 1 && r.legacy === 0 && r.dead === 0 && r.unsafeExternal === 0, JSON.stringify(r));
  }
  await p.goto(`${BASE}/licenses`, { waitUntil: "networkidle" });
  const licenses = await p.locator("main article").innerText();
  check("/licenses : liste à jour", !licenses.includes("Framer Motion") && ["Next.js", "React", "Tailwind CSS", "Radix UI", "react-markdown", "remark-gfm", "Geist"].every((n) => licenses.includes(n)));
});
```

Run: `docker compose up -d --build web` puis `API_RESTART_CMD="cd <repo> && docker compose restart api" pnpm --filter web flows`.
Expected: FAIL sur les 8 pages (pas d'`article.prose`, classes héritées, 8 liens `#`) et sur `/licenses`.

- [ ] **Step 2: Gabarit et classes de prose**

`apps/web/components/page/prose-page.tsx` :

```tsx
import type { ReactNode } from "react";
import { PageHeader } from "@/components/page/page-header";

/** Gabarit des pages de contenu (à propos, mentions légales…). */
export function ProsePage({
  title,
  description,
  eyebrow,
  children,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <article className="prose max-w-[72ch]">{children}</article>
    </div>
  );
}
```

`apps/web/styles/globals.css` — à la fin du bloc `@layer components` de la prose, ajouter :

```css
  /* Encadrés et métadonnées dans les pages de contenu */
  .prose .card { @apply my-4 rounded-lg border border-border bg-surface p-5; }
  .prose .card > :first-child { @apply mt-0; }
  .prose .card > :last-child { @apply mb-0; }
  .prose .card h3 { @apply mb-1 mt-0 text-base; }
  .prose .meta { @apply my-1 font-mono text-xs text-fg-muted; }
  .prose .no-underline { text-decoration: none; }
```

- [ ] **Step 3: Build + commit**

Run: `pnpm --filter web test && pnpm --filter web build`. Expected: OK.

```bash
git add apps/web/components/page/prose-page.tsx apps/web/styles/globals.css apps/web/scripts/flows.mjs
git commit -m "feat(web): ProsePage template and static pages e2e checks"
```

---

### Task 2: Conversion des 8 pages

**Files:**
- Modify: `apps/web/app/{about,blog,careers,contact,cookies,licenses,privacy,terms}/page.tsx`

**Interfaces:**
- Consumes: `ProsePage`, `.card`, `.meta` (Task 1) ; `Badge` (phase 1) ; `buttonVariants` (phase 1).

- [ ] **Step 1: Conversion mécanique**

Script jetable (dans le workspace, pas commité), lancé depuis `apps/web` :

```python
import re, pathlib

PAGES = ["about", "blog", "careers", "contact", "cookies", "licenses", "privacy", "terms"]

# classe d'origine -> classe cible ("" = supprimer l'attribut, la prose s'en charge)
CLASS_MAP = {
    "text-2xl font-semibold mb-4": "", "text-2xl font-semibold mb-3": "",
    "text-xl font-semibold mb-2": "", "text-lg font-semibold mb-2": "",
    "text-muted-foreground leading-relaxed": "", "text-muted-foreground leading-relaxed mb-3": "",
    "text-muted-foreground leading-relaxed mb-4": "", "text-muted-foreground leading-relaxed mt-4": "",
    "text-muted-foreground leading-relaxed mt-3": "", "text-muted-foreground leading-relaxed text-lg": "text-[17px]",
    "text-muted-foreground": "", "text-muted-foreground mb-4": "",
    "list-disc list-inside space-y-2 text-muted-foreground ml-4": "",
    "list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3": "",
    "list-decimal list-inside space-y-2 text-muted-foreground ml-4": "",
    "text-primary hover:underline": "", "text-primary hover:underline font-medium": "",
    "text-primary hover:underline text-sm": "text-sm", "text-primary hover:underline inline-block mt-2": "",
    "border rounded-lg p-4": "card", "border rounded-lg p-6 bg-white dark:bg-slate-800": "card",
    "text-sm text-muted-foreground mb-2": "meta", "text-sm text-muted-foreground mb-3": "meta",
    "text-sm text-muted-foreground": "meta",
    "text-center text-muted-foreground": "text-center text-fg-muted",
    "px-2 py-1 bg-muted rounded": "",
    "border-b pb-8": "border-b border-border pb-8", "mt-8 pt-6 border-t": "mt-8 border-t border-border pt-6",
    "pt-6 border-t": "border-t border-border pt-6",
    "space-y-4": "", "space-y-6": "", "space-y-8": "", "space-y-6 mt-6": "",
}

for name in PAGES:
    path = pathlib.Path(f"app/{name}/page.tsx")
    src = path.read_text()
    # Gabarit : PageWrapper -> ProsePage, suppression du wrapper .prose historique
    src = src.replace('import { PageWrapper } from "@/components/layout/PageWrapper";',
                      'import { ProsePage } from "@/components/page/prose-page";')
    src = src.replace("<PageWrapper", "<ProsePage").replace("</PageWrapper>", "</ProsePage>")
    src = re.sub(r'\n(\s*)<div className="prose prose-slate max-w-none dark:prose-invert">\n', "\n\\1<>\n", src)
    src = re.sub(r"\n(\s*)</div>\n(\s*)</ProsePage>", "\n\\1</>\n\\2</ProsePage>", src)
    def swap(m):
        target = CLASS_MAP.get(m.group(1))
        if target is None:
            return m.group(0)
        return f' className="{target}"' if target else ""
    src = re.sub(r' className="([^"]*)"', swap, src)
    path.write_text(src)
    print(name, "restant:", sorted(set(re.findall(r'className="([^"]*)"', src))))
```

Expected : chaque page n'affiche plus comme classes « restantes » que les cas traités au step 2 (tags colorés, boutons sociaux, grilles/flex, `text-3xl mb-3`).

- [ ] **Step 2: Retouches manuelles**

1. **Tags colorés** (`px-3 py-1 bg-{blue,purple,green}-100 …`) → `<Badge variant="accent">` / `"neutral"` / `"success"` (import `import { Badge } from "@/components/ui/badge";`) ; le conteneur `flex flex-wrap gap-2 mb-4` devient `not-prose my-3 flex flex-wrap gap-2`.
2. **Boutons sociaux** (`/contact`, classe `inline-flex … hover:bg-slate-50 …`) → `className={cn(buttonVariants({ variant: "outline", size: "sm" }), "no-underline")}` (imports `buttonVariants`, `cn`) ; conteneur `flex flex-wrap gap-4` → `not-prose flex flex-wrap gap-2`.
3. **Icônes emoji** (`text-3xl mb-3`) → `mb-2 text-2xl`.
4. **Grilles** (`grid grid-cols-1 md:grid-cols-2 gap-6 mt-8`) : conservées.
5. **Liens internes** (`/careers`, `/contact`, `/cookies`) → `<Link href="…">` (import `Link from "next/link"`).
6. **Liens externes** : vérifier `target="_blank" rel="noopener noreferrer"` sur chacun (ajouter s'il manque).
7. **Surtitres** : `eyebrow` de `ProsePage` = `"légal"` pour `/cookies`, `/licenses`, `/privacy`, `/terms` ; `"devdocshub"` pour les 4 autres.

- [ ] **Step 3: Contenu — seules exceptions à « contenu conservé »**

1. **Liens morts `href="#"`** (8 : « Lire l'article → » du blog, « Postuler → » des offres) : remplacés par le texte `<span className="meta">Bientôt disponible</span>` — un lien qui ne mène nulle part est trompeur.
2. **`/licenses`** : retirer l'encadré **Framer Motion** (dépendance supprimée en phase 2) ; ajouter, sur le modèle des autres encadrés (nom, rôle + licence, lien GitHub), **Tailwind CSS** (`https://github.com/tailwindlabs/tailwindcss`, MIT), **remark-gfm** (`https://github.com/remarkjs/remark-gfm`, MIT) et **Geist** (`https://github.com/vercel/geist-font`, SIL Open Font License 1.1). Libellé de Radix : « Radix UI ».

- [ ] **Step 4: Vérifier (GREEN)**

```bash
grep -nE 'slate-|blue-|purple-|green-|bg-white|muted-foreground|text-primary|bg-muted|prose-slate|href="#"' apps/web/app/{about,blog,careers,contact,cookies,licenses,privacy,terms}/page.tsx || echo "OK"
```

Run: tests, build, `docker compose up -d --build web`, flows. Expected : `OK`, puis tous les checks PASS (dont les 9 nouveaux).
Captures des 8 pages (dark/light, desktop/mobile) : 32 captures sans échec, relues.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/{about,blog,careers,contact,cookies,licenses,privacy,terms}/page.tsx
git commit -m "feat(web): static pages on the ProsePage template"
```

---

### Task 3: Retrait des alias shadcn, vérification finale, PR

**Files:**
- Modify: `apps/web/styles/globals.css`, `apps/web/styles/tokens.test.ts`, tout fichier encore consommateur d'un alias (voir step 2)

- [ ] **Step 1: Test (RED)**

Ajouter à `apps/web/styles/tokens.test.ts` :

```ts
test("no shadcn compatibility aliases remain in the theme", () => {
  const aliases = ["background", "foreground", "muted", "muted-foreground", "primary", "primary-foreground", "destructive", "destructive-foreground"];
  for (const a of aliases) assert.ok(!css.includes(`--color-${a}:`), `--color-${a} still defined`);
});
```

Run: `pnpm --filter web test`. Expected: FAIL (`--color-background still defined`).

- [ ] **Step 2: Consommateurs restants, puis retrait**

```bash
grep -rnE '\b(bg|text|border|ring|from|to|via|fill|stroke)-(background|foreground|muted|muted-foreground|primary|primary-foreground|destructive|destructive-foreground)\b' apps/web/app apps/web/components apps/web/hooks
```

Remplacer chaque occurrence trouvée par le token équivalent : `background→bg`, `foreground→fg`, `muted→surface-2`, `muted-foreground→fg-muted`, `primary→fg` (ou `accent` si c'est un lien/action), `primary-foreground→bg`, `destructive→danger`, `destructive-foreground→white`. Puis supprimer, dans `globals.css`, le commentaire « Alias de compatibilité… » et les 8 lignes `--color-{alias}`.

Run: tests (PASS), build, grep ci-dessus (aucune occurrence).

- [ ] **Step 3: Vérification complète**

1. `pnpm --filter web test` / `pnpm --filter web build` / build Docker.
2. `pnpm --filter web flows` (avec `API_RESTART_CMD`) : tous PASS.
3. Captures de **toutes** les pages de l'app (phases 1–3) en dark/light, desktop/mobile : 0 échec, relues.

- [ ] **Step 4: Commit, push, PR**

```bash
git add apps/web/styles/globals.css apps/web/styles/tokens.test.ts <fichiers modifiés au step 2>
git commit -m "refactor(web): drop shadcn colour aliases"
git push -u origin redesign/3-static
gh pr create --base redesign/2-pages --title "Refonte DA — phase 3 : pages statiques" --body "…"
```

PR empilée sur #77 ; ne pas merger sans accord.
