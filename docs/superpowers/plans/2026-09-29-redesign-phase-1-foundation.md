# Refonte DA — Phase 1 (Fondations) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Installer Tailwind v4 + les tokens de la nouvelle DA (dark par défaut, accent cyan, Geist), et remplacer le shell de l'app par un layout « site de docs » (top bar, sidebar contextuelle, menu avatar, palette ⌘K, footer fin), avec `components/ui` restylé.

**Architecture:** Les couleurs sont des variables CSS (`:root` = light, `.dark` = dark) exposées à Tailwind via `@theme inline`. `<html>` est rendu avec la classe `dark` côté serveur ; un script inline dans `<head>` la retire avant le premier paint si l'utilisateur a choisi le light. Le `Shell` chargé en `ssr: false` est remplacé par un `SiteChrome` client (dépend de `usePathname`) qui entoure des pages **rendues côté serveur** ; les sections Docs/Notes/Collections ont un `layout.tsx` qui fournit leur sidebar. La logique pure (thème, nav, groupement des docs, filtre ⌘K, contraste) vit dans `lib/*.ts` sans import, testée avec le runner natif de Node.

**Tech Stack:** Next 14.2 (App Router, `typedRoutes`), React 18, Tailwind CSS v4 (`@tailwindcss/postcss`), `class-variance-authority` + `tailwind-merge`, Radix (Dialog, DropdownMenu, Select, Tabs, Checkbox, Separator), `geist` (next/font), `lucide-react`, zustand, sonner. Tests : `node --test` (Node ≥ 23, type stripping natif — Node 25 en local). Captures : `playwright-core` + `/usr/bin/chromium`.

**Spec:** `docs/superpowers/specs/2026-09-29-redesign-design.md`

## Global Constraints

- Dark par défaut ; light disponible ; la préférence système est **ignorée** (spec §3, §4.4).
- Tokens (valeurs exactes, spec §4.1) — dark / light : `bg #0f1115 / #ffffff` · `surface #161a20 / #f6f8fa` · `surface-2 #1c2129 / #eef1f4` · `border #262b33 / #d8dee4` · `fg #e6e8eb / #1f2328` · `fg-muted #8b93a1 / #59636e` · `accent #5ccfe6 / #0e7490` · `accent-fg #051418 / #ffffff` · `accent-subtle rgb(92 207 230 / 0.10) / rgb(14 116 144 / 0.08)` · `accent-border rgb(92 207 230 / 0.35) / rgb(14 116 144 / 0.30)` · `success #3fb950 / #1a7f37` · `warning #d29922 / #9a6700` · `danger #f85149 / #cf222e`.
- Aucune couleur hex ni `style={{…}}` de couleur dans le TSX **créé ou modifié** par cette phase ; toutes les couleurs passent par les tokens.
- Typo : Geist (texte) + Geist Mono (code, logo, fil d'Ariane, méta, groupes de sidebar, badges, raccourcis) via le paquet `geist` + `next/font`.
- Rayons : 6px (boutons, inputs) · 10px (cartes, dialogs, menus). Ombres uniquement sur les overlays.
- Contraste texte/fond ≥ 4.5:1 dans les deux thèmes.
- `components/ui` : mêmes fichiers, mêmes exports, mêmes props/variantes qu'aujourd'hui (on ajoute, on ne retire rien).
- Aucune modification de `services/api`.
- Textes d'interface en français (comme l'existant).
- `main` exige un historique linéaire → merge de la PR en squash.

## Review Focus

1. **Utilisateur déconnecté sur `/docs`** → la sidebar affiche « Connecte-toi pour voir les docs » avec un lien `/auth`, jamais une erreur 401 ni un squelette infini. (Test : Task 8, passe de captures sans token.)
2. **Token invalide/expiré dans `localStorage`** → `loadUser` le purge ; la top bar doit retomber sur « Se connecter » et ne pas rester bloquée sur le placeholder d'avatar. (Test : Task 8, passe de captures avec `SHOT_TOKEN=invalid`.)
3. **`localStorage` inaccessible** (navigation privée stricte, cookies bloqués) → le script de thème ne doit pas planter la page et doit appliquer le dark. (Test : Task 2, cas « getItem throws ».)
4. **Docs aux `tech` hétérogènes** (`"Docker"`, `" docker "`, `""`) **et titres accentués** → un seul groupe `docker`, un groupe `autre` pour les vides ; la recherche ⌘K trouve « créer » en tapant `creer`. (Tests : Task 4.)
5. **API en erreur** (ex. 500 quand le pool SQLAlchemy de l'API est saturé — bug existant constaté) → sidebar et palette affichent un message d'erreur / une liste vide, sans casser la page. (Test : Task 8, passe de captures avec l'API arrêtée.)

**Limites connues (hors périmètre, à signaler dans la PR) :** `GET /docs/all` appelle `get_all_docs()` avec `size=20` par défaut → la sidebar et la palette ne voient que 20 docs ; l'API fuit des sessions SQLAlchemy (`next(get_session())` jamais fermé) et renvoie des 500 après ~15 requêtes — redémarrer `api` pendant la vérif.

---

## File Structure

**Créés**

| Fichier | Responsabilité |
|---|---|
| `apps/web/postcss.config.js` | Branche `@tailwindcss/postcss` |
| `apps/web/lib/contrast.ts` (+ `.test.ts`) | Calcul de ratio de contraste WCAG |
| `apps/web/styles/tokens.test.ts` | Vérifie que les tokens de `globals.css` respectent AA |
| `apps/web/lib/theme.ts` (+ `.test.ts`) | Clé de stockage, `resolveTheme`, script d'init anti-flash |
| `apps/web/lib/nav.ts` (+ `.test.ts`) | Nav principale, `isActivePath`, `isSectionPath` |
| `apps/web/lib/docs-tree.ts` (+ `.test.ts`) | Type `DocSummary`, `groupDocsByTech` |
| `apps/web/lib/command-filter.ts` (+ `.test.ts`) | Type `Command`, `filterCommands`, `isCommandPaletteShortcut` |
| `apps/web/hooks/useMounted.ts` | Garde anti-mismatch d'hydratation |
| `apps/web/components/ui/dropdown-menu.tsx` | Menu Radix stylé |
| `apps/web/components/command-palette.tsx` | Palette ⌘K |
| `apps/web/components/layout/sidebar-slot.tsx` | Contexte qui expose la sidebar de section au tiroir mobile |
| `apps/web/components/layout/logo.tsx` | Logo `devdocs`**`hub`** |
| `apps/web/components/layout/sidebar-link.tsx` | Lien de sidebar (état actif) |
| `apps/web/components/layout/footer.tsx` | Footer une ligne |
| `apps/web/components/layout/mobile-nav.tsx` | Tiroir ☰ mobile |
| `apps/web/components/layout/top-bar.tsx` | Top bar |
| `apps/web/components/layout/site-chrome.tsx` | Assemble top bar / contenu / footer selon la route |
| `apps/web/components/layout/section-layout.tsx` | Grille sidebar + contenu d'une section |
| `apps/web/components/layout/docs-sidebar.tsx` | Arbre des docs par `tech` |
| `apps/web/components/layout/notes-sidebar.tsx` | Liens Notes (coquille) |
| `apps/web/components/layout/collections-sidebar.tsx` | Liens Collections (coquille) |
| `apps/web/app/docs/layout.tsx`, `app/notes/layout.tsx`, `app/collections/layout.tsx` | Branchent la sidebar de section |
| `apps/web/scripts/screenshots.mjs` | Captures dark/light × desktop/mobile |

**Modifiés** : `apps/web/package.json`, `tsconfig.json`, `next.config.js`, `styles/globals.css` (réécrit), `app/layout.tsx`, `app/providers.tsx`, `hooks/useTheme.tsx` (réécrit), `lib/utils.ts`, `lib/store.ts` (type `User`), `types/lucide-react.d.ts`, `components/layout/PageWrapper.tsx`, tous les `components/ui/*.tsx`, `pnpm-lock.yaml`, `.gitignore` (racine).

**Supprimés** : `components/layout/{Shell,AppHeader,AppSidebar,AppFooter}.{tsx,css}`, `components/layout/PageWrapper.css`, `components/ui/*.module.css`, `hooks/useAuth.tsx` (second système d'auth en contexte, qui ne vidait pas le store zustand à la déconnexion).

**Hors phase 1 (noté pour la phase 2) :** sommaire droit, filtres Notes (épinglées / par doc), liste des collections dans la sidebar (aucune page de détail de collection n'existe encore), migration des CSS de pages (`app/**/page.css`, `*.module.css` hors `ui`).

---

### Task 1: Tailwind v4, dépendances et tokens

**Files:**
- Create: `apps/web/postcss.config.js`, `apps/web/lib/contrast.ts`, `apps/web/lib/contrast.test.ts`, `apps/web/styles/tokens.test.ts`
- Modify: `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/next.config.js`, `apps/web/styles/globals.css` (réécriture complète), `pnpm-lock.yaml`

**Interfaces:**
- Produces: utilitaires Tailwind `bg-bg`, `bg-surface`, `bg-surface-2`, `border-border`, `text-fg`, `text-fg-muted`, `bg-accent`/`text-accent`, `text-accent-fg`, `bg-accent-subtle`, `border-accent-border`, `text-success|warning|danger` (et `bg-*`, `border-*`, opacités `/NN`) ; `font-sans`, `font-mono` ; `rounded-md` = 6px, `rounded-lg` = 10px. Alias de compatibilité pour les classes façon shadcn déjà présentes dans les pages (`text-muted-foreground`, `text-primary`, `bg-muted`, `bg-background`, `text-destructive`…). Script `pnpm --filter web test`.
- `lib/contrast.ts` : `hexToRgb(hex: string): [number, number, number]`, `relativeLuminance(hex: string): number`, `contrastRatio(a: string, b: string): number`.

- [ ] **Step 1: Installer les dépendances**

Depuis la racine du repo :

```bash
pnpm install
pnpm --filter web add tailwind-merge geist @radix-ui/react-dialog @radix-ui/react-dropdown-menu
pnpm --filter web add -D tailwindcss@^4 @tailwindcss/postcss@^4 postcss playwright-core
```

Expected: `apps/web/package.json` et `pnpm-lock.yaml` modifiés, pas d'erreur.

- [ ] **Step 2: Config PostCSS, Next, TypeScript et script de test**

`apps/web/postcss.config.js` :

```js
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

`apps/web/next.config.js` — ajouter `transpilePackages` :

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["geist"],
  experimental: { typedRoutes: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};
module.exports = nextConfig;
```

`apps/web/tsconfig.json` — dans `compilerOptions`, ajouter après `"noEmit": true,` :

```json
    "allowImportingTsExtensions": true,
```

(Les tests importent les modules avec l'extension `.ts`, requis par Node ; `noEmit` est déjà actif donc c'est autorisé.)

`apps/web/package.json` — dans `scripts`, ajouter :

```json
    "test": "node --test \"lib/**/*.test.ts\" \"styles/**/*.test.ts\"",
    "screenshots": "node scripts/screenshots.mjs"
```

- [ ] **Step 3: Écrire les tests de contraste (qui échouent)**

`apps/web/lib/contrast.test.ts` :

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { contrastRatio, hexToRgb } from "./contrast.ts";

test("hexToRgb parses 6-digit hex with or without #", () => {
  assert.deepEqual(hexToRgb("#0f1115"), [15, 17, 21]);
  assert.deepEqual(hexToRgb("FFFFFF"), [255, 255, 255]);
});

test("hexToRgb rejects anything that is not 6-digit hex", () => {
  assert.throws(() => hexToRgb("#fff"), /Invalid hex colour/);
  assert.throws(() => hexToRgb("rgb(0 0 0)"), /Invalid hex colour/);
});

test("contrastRatio: black on white is 21, same colour is 1", () => {
  assert.equal(Math.round(contrastRatio("#000000", "#ffffff") * 100) / 100, 21);
  assert.equal(contrastRatio("#5ccfe6", "#5ccfe6"), 1);
});

test("contrastRatio is symmetric", () => {
  assert.equal(contrastRatio("#0e7490", "#ffffff"), contrastRatio("#ffffff", "#0e7490"));
});
```

`apps/web/styles/tokens.test.ts` :

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { contrastRatio } from "../lib/contrast.ts";

const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

function block(selector: RegExp): Record<string, string> {
  const match = css.match(selector);
  assert.ok(match, `block ${selector} not found in globals.css`);
  const vars: Record<string, string> = {};
  for (const [, name, value] of match[1].matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    vars[name] = value.trim();
  }
  return vars;
}

const themes = {
  light: block(/(?:^|\n):root\s*\{([^}]*)\}/),
  dark: block(/(?:^|\n)\.dark\s*\{([^}]*)\}/),
};

const REQUIRED = [
  "bg", "surface", "surface-2", "border", "fg", "fg-muted",
  "accent", "accent-fg", "accent-subtle", "accent-border",
  "success", "warning", "danger",
];

// [texte, fond] — toutes les paires texte/fond utilisées par l'UI
const PAIRS: [string, string][] = [
  ["fg", "bg"], ["fg", "surface"], ["fg", "surface-2"],
  ["fg-muted", "bg"], ["fg-muted", "surface"], ["fg-muted", "surface-2"],
  ["accent", "bg"], ["accent", "surface"], ["accent-fg", "accent"],
  ["success", "bg"], ["warning", "bg"], ["danger", "bg"], ["danger", "surface"],
];

for (const [name, vars] of Object.entries(themes)) {
  test(`${name}: defines every token`, () => {
    for (const token of REQUIRED) assert.ok(vars[token], `--${token} missing in ${name}`);
  });

  for (const [fg, bg] of PAIRS) {
    test(`${name}: ${fg} on ${bg} meets WCAG AA (4.5:1)`, () => {
      const ratio = contrastRatio(vars[fg], vars[bg]);
      assert.ok(ratio >= 4.5, `${fg} on ${bg} = ${ratio.toFixed(2)}:1`);
    });
  }
}
```

- [ ] **Step 4: Lancer les tests pour vérifier qu'ils échouent**

Run: `pnpm --filter web test`
Expected: FAIL — `Cannot find module '.../lib/contrast.ts'` et `block /(?:^|\n):root.../ not found in globals.css`.

- [ ] **Step 5: Implémenter `lib/contrast.ts`**

```ts
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`Invalid hex colour: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

function channel(value: number): number {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
```

- [ ] **Step 6: Réécrire `styles/globals.css`**

Remplacer **tout** le fichier (l'ancien utilise la syntaxe Tailwind v3 `@tailwind`/`@apply btn`, incompatible v4) :

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

/* ---------------------------------------
   Tokens — light (appliqué si <html> n'a pas .dark)
---------------------------------------- */
:root {
  --bg: #ffffff;
  --surface: #f6f8fa;
  --surface-2: #eef1f4;
  --border: #d8dee4;
  --fg: #1f2328;
  --fg-muted: #59636e;
  --accent: #0e7490;
  --accent-fg: #ffffff;
  --accent-subtle: rgb(14 116 144 / 0.08);
  --accent-border: rgb(14 116 144 / 0.30);
  --success: #1a7f37;
  --warning: #9a6700;
  --danger: #cf222e;
  color-scheme: light;
}

/* ---------------------------------------
   Tokens — dark (défaut)
---------------------------------------- */
.dark {
  --bg: #0f1115;
  --surface: #161a20;
  --surface-2: #1c2129;
  --border: #262b33;
  --fg: #e6e8eb;
  --fg-muted: #8b93a1;
  --accent: #5ccfe6;
  --accent-fg: #051418;
  --accent-subtle: rgb(92 207 230 / 0.10);
  --accent-border: rgb(92 207 230 / 0.35);
  --success: #3fb950;
  --warning: #d29922;
  --danger: #f85149;
  color-scheme: dark;
}

@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-border: var(--border);
  --color-fg: var(--fg);
  --color-fg-muted: var(--fg-muted);
  --color-accent: var(--accent);
  --color-accent-fg: var(--accent-fg);
  --color-accent-subtle: var(--accent-subtle);
  --color-accent-border: var(--accent-border);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);

  /* Alias de compatibilité : classes façon shadcn déjà utilisées dans les pages
     (text-muted-foreground ×116, text-primary ×25…). Retirés en phase 3. */
  --color-background: var(--bg);
  --color-foreground: var(--fg);
  --color-muted: var(--surface-2);
  --color-muted-foreground: var(--fg-muted);
  --color-primary: var(--fg);
  --color-primary-foreground: var(--bg);
  --color-destructive: var(--danger);
  --color-destructive-foreground: #ffffff;

  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace;

  --radius-md: 6px;
  --radius-lg: 10px;
}

@layer base {
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    @apply bg-bg font-sans text-fg;
    font-size: 15px;
    line-height: 1.6;
  }

  h1 { @apply text-[28px] font-bold leading-tight tracking-tight; }
  h2 { @apply text-xl font-semibold tracking-tight; }
  h3 { @apply text-base font-semibold; }

  code, kbd, pre, samp { @apply font-mono; }

  ::selection { background-color: var(--accent-border); }

  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  * {
    scrollbar-color: var(--border) transparent;
    scrollbar-width: thin;
  }
}

/* Contenu markdown (en attendant la refonte de la page doc en phase 2) */
@layer components {
  .prose { @apply max-w-none; }
  .prose h1, .prose h2, .prose h3 { @apply mb-3 mt-8; }
  .prose p { @apply my-4 text-fg; }
  .prose a { @apply text-accent underline decoration-accent-border underline-offset-2; }
  .prose ul { @apply my-4 list-disc pl-6; }
  .prose ol { @apply my-4 list-decimal pl-6; }
  .prose :not(pre) > code { @apply rounded border border-border bg-surface-2 px-1 py-0.5 text-[0.9em]; }
  .prose pre { @apply my-4 overflow-x-auto rounded-lg border border-border bg-surface p-4 text-[13px]; }
  .prose blockquote { @apply border-l-2 border-accent pl-4 text-fg-muted; }
}
```

- [ ] **Step 7: Lancer les tests pour vérifier qu'ils passent**

Run: `pnpm --filter web test`
Expected: PASS — 4 tests `contrast` + 2 × (1 + 13) tests `tokens`, 0 échec.

- [ ] **Step 8: Vérifier que le build passe**

Run: `pnpm --filter web build`
Expected: `✓ Compiled successfully`, aucune erreur TypeScript ni CSS. Si Tailwind signale une classe inconnue dans un `@apply`, corriger la classe dans `globals.css` (ne pas contourner).

- [ ] **Step 9: Commit**

```bash
git add apps/web/package.json pnpm-lock.yaml apps/web/postcss.config.js apps/web/next.config.js apps/web/tsconfig.json apps/web/styles/globals.css apps/web/styles/tokens.test.ts apps/web/lib/contrast.ts apps/web/lib/contrast.test.ts
git commit -m "feat(web): install Tailwind v4 and design tokens"
```

---

### Task 2: Thème dark par défaut sans flash + polices Geist

**Files:**
- Create: `apps/web/lib/theme.ts`, `apps/web/lib/theme.test.ts`
- Modify: `apps/web/hooks/useTheme.tsx` (réécriture), `apps/web/app/layout.tsx`

**Interfaces:**
- Consumes: tokens `.dark` / `:root` de Task 1.
- Produces:
  - `lib/theme.ts` : `type Theme = "dark" | "light"`, `THEME_STORAGE_KEY = "theme"`, `resolveTheme(stored: string | null | undefined): Theme`, `themeInitScript: string`.
  - `hooks/useTheme.tsx` : `useTheme(): { theme: Theme; toggleTheme: () => void; setTheme: (t: Theme) => void; mounted: boolean }` (même forme de retour qu'avant).
  - `<html>` porte `GeistSans.variable` (`--font-geist-sans`) et `GeistMono.variable` (`--font-geist-mono`).

- [ ] **Step 1: Écrire les tests (qui échouent)**

`apps/web/lib/theme.test.ts` :

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { THEME_STORAGE_KEY, resolveTheme, themeInitScript } from "./theme.ts";

test("resolveTheme: only an explicit 'light' gives light", () => {
  assert.equal(resolveTheme("light"), "light");
  assert.equal(resolveTheme("dark"), "dark");
  assert.equal(resolveTheme(null), "dark");
  assert.equal(resolveTheme(undefined), "dark");
  assert.equal(resolveTheme("system"), "dark");
  assert.equal(resolveTheme(""), "dark");
});

/** Exécute le script d'init contre un faux document ; renvoie true si .dark est posé. */
function runInitScript(stored: string | null, opts: { storageThrows?: boolean } = {}): boolean {
  const classes = new Set<string>(["dark"]); // le serveur rend <html class="dark">
  const documentElement = {
    classList: {
      toggle(name: string, force: boolean) { if (force) classes.add(name); else classes.delete(name); },
      add(name: string) { classes.add(name); },
    },
  };
  const localStorage = {
    getItem(key: string) {
      if (opts.storageThrows) throw new Error("SecurityError");
      return key === THEME_STORAGE_KEY ? stored : null;
    },
  };
  new Function("document", "localStorage", themeInitScript)({ documentElement }, localStorage);
  return classes.has("dark");
}

test("init script keeps dark when nothing is stored", () => {
  assert.equal(runInitScript(null), true);
});

test("init script removes dark when light is stored", () => {
  assert.equal(runInitScript("light"), false);
});

test("init script keeps dark for dark or unknown values", () => {
  assert.equal(runInitScript("dark"), true);
  assert.equal(runInitScript("system"), true);
});

test("init script falls back to dark when localStorage throws", () => {
  assert.equal(runInitScript("light", { storageThrows: true }), true);
});
```

- [ ] **Step 2: Lancer pour vérifier l'échec**

Run: `pnpm --filter web test`
Expected: FAIL — `Cannot find module '.../lib/theme.ts'`.

- [ ] **Step 3: Implémenter `lib/theme.ts`**

```ts
export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "theme";

/** Dark par défaut : seul un choix explicite "light" donne le thème clair. */
export function resolveTheme(stored: string | null | undefined): Theme {
  return stored === "light" ? "light" : "dark";
}

/**
 * Script inline exécuté dans <head> avant le premier paint.
 * Le serveur rend <html class="dark"> ; on ne retire la classe que si
 * l'utilisateur a explicitement choisi le light.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});document.documentElement.classList.toggle("dark",t!=="light");}catch(e){document.documentElement.classList.add("dark");}})();`;
```

- [ ] **Step 4: Lancer pour vérifier le succès**

Run: `pnpm --filter web test`
Expected: PASS (les 5 tests `theme` + ceux de Task 1).

- [ ] **Step 5: Réécrire `hooks/useTheme.tsx`**

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

function readTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // stockage indisponible : le choix vaut pour la session en cours
  }
}

export function useTheme() {
  // "dark" = valeur rendue par le serveur ; corrigée après montage
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeState(readTheme());
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(readTheme() === "dark" ? "light" : "dark");
  }, [setTheme]);

  return { theme, toggleTheme, setTheme, mounted };
}
```

- [ ] **Step 6: Brancher polices et script dans `app/layout.tsx`**

Remplacer le fichier (le `Shell` reste chargé comme avant jusqu'à Task 6) :

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Providers from "./providers";
import { themeInitScript } from "@/lib/theme";
import "@/styles/globals.css";

// Remplacé par SiteChrome (rendu serveur) en Task 6
const AppShell = dynamic(() => import("@/components/layout/Shell"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "DevDocsHub",
  description: "Documentation & notes techniques centralisées",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers>
          <AppShell>{children as any}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Vérifier build + absence de flash**

Run: `pnpm --filter web build && pnpm --filter web start` (en arrière-plan), puis :

```bash
curl -s localhost:3000/dashboard | grep -o '<html[^>]*>'
curl -s localhost:3000/dashboard | grep -c 'localStorage.getItem("theme")'
```

Expected: `<html lang="fr" class="dark __variable_… __variable_…">` et `1`. Arrêter le serveur.

- [ ] **Step 8: Commit**

```bash
git add apps/web/lib/theme.ts apps/web/lib/theme.test.ts apps/web/hooks/useTheme.tsx apps/web/app/layout.tsx
git commit -m "feat(web): dark-by-default theme without flash, Geist fonts"
```

---

### Task 3: Restyle de `components/ui` + DropdownMenu

**Files:**
- Modify: `apps/web/lib/utils.ts`, `apps/web/components/ui/{button,badge,card,input,textarea,label,select,checkbox,tabs,separator,dialog,toaster,use-toast}.tsx`
- Create: `apps/web/components/ui/dropdown-menu.tsx`
- Delete: `apps/web/components/ui/*.module.css` (13 fichiers)

**Interfaces:**
- Consumes: utilitaires de tokens (Task 1).
- Produces:
  - `cn(...inputs: (string | false | null | undefined)[]): string` — désormais passé par `tailwind-merge` (la dernière classe gagne en cas de conflit).
  - `Button` : props inchangées + variante `danger` ; devient `forwardRef<HTMLButtonElement>`. Export additionnel `buttonVariants`.
  - `Badge` : variantes existantes (`default`, `secondary`, `destructive`, `outline`) + `accent`, `neutral`, `success`, `warning`, `danger`.
  - `dropdown-menu.tsx` : `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent` (props Radix + `align` défaut `"end"`, `sideOffset` défaut `6`), `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`.
  - Tous les autres exports et props inchangés.

- [ ] **Step 1: `lib/utils.ts`**

```ts
import { twMerge } from "tailwind-merge";

export function cn(...inputs: (string | false | null | undefined)[]) {
  return twMerge(inputs.filter(Boolean).join(" "));
}
```

- [ ] **Step 2: `components/ui/button.tsx`**

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg hover:bg-accent/90",
        default: "bg-accent text-accent-fg hover:bg-accent/90",
        secondary: "border border-border bg-surface text-fg hover:bg-surface-2",
        outline: "border border-border bg-transparent text-fg hover:bg-surface-2",
        ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg",
        danger: "bg-danger text-white hover:bg-danger/90",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-9 px-4 text-sm",
        icon: "size-8",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
export default Button;
```

- [ ] **Step 3: `components/ui/badge.tsx`**

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const accent = "border-accent-border bg-accent-subtle text-accent";
const neutral = "border-border bg-surface-2 text-fg-muted";
const danger = "border-danger/40 bg-danger/10 text-danger";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] leading-4",
  {
    variants: {
      variant: {
        accent,
        default: accent,
        neutral,
        secondary: neutral,
        outline: "border-border text-fg",
        success: "border-success/40 bg-success/10 text-success",
        warning: "border-warning/40 bg-warning/10 text-warning",
        danger,
        destructive: danger,
      },
    },
    defaultVariants: { variant: "accent" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
```

- [ ] **Step 4: `card.tsx`, `input.tsx`, `textarea.tsx`, `label.tsx`**

`components/ui/card.tsx` :

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-border bg-surface text-fg", className)} {...props} />;
}
export default Card;

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-base font-semibold tracking-tight", className)} {...props} />;
}
```

`components/ui/input.tsx` :

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export const fieldClasses =
  "w-full rounded-md border border-border bg-bg px-3 text-sm text-fg placeholder:text-fg-muted transition-colors focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldClasses, "h-9", className)} {...props} />
  ),
);
Input.displayName = "Input";
export default Input;
```

`components/ui/textarea.tsx` :

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { fieldClasses } from "./input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldClasses, "min-h-24 py-2 leading-relaxed", className)} {...props} />
));
Textarea.displayName = "Textarea";
export default Textarea;
```

`components/ui/label.tsx` :

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-[13px] font-medium text-fg", className)} {...props} />;
}
export default Label;
```

- [ ] **Step 5: `select.tsx`, `checkbox.tsx`, `tabs.tsx`, `separator.tsx`**

Dans ces quatre fichiers, **seules les chaînes de classes changent** : supprimer l'import `styles from "./*.module.css"`, ajouter `import { cn } from "@/lib/utils";`, et remplacer chaque `` `${styles.x} ${className}` `` par `cn("<classes ci-dessous>", className)`. Les défauts `className = ""` deviennent `className`.

`select.tsx` :

| Élément | Classes |
|---|---|
| `SelectTrigger` | `flex h-9 w-full items-center justify-between rounded-md border border-border bg-bg px-3 text-sm text-fg transition-colors focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-fg-muted` |
| `SelectContent` (Content) | `z-50 max-h-80 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-surface text-fg shadow-xl data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1` — et ajouter `sideOffset={4}` avant `{...props}` |
| Viewport | `p-1 w-full min-w-[var(--radix-select-trigger-width)]` |
| `SelectLabel` | `px-2 py-1.5 font-mono text-[11px] text-fg-muted` |
| `SelectItem` | `relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none data-[highlighted]:bg-surface-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50` |
| indicateur d'item (`<span>`) | `absolute left-2 inline-flex size-4 items-center justify-center text-accent` |
| `SelectSeparator` | `-mx-1 my-1 h-px bg-border` |
| `SelectScrollUpButton` / `Down` | `flex h-6 cursor-default items-center justify-center text-fg-muted` |

Dans `SelectTrigger`, l'icône garde `className="ml-2 opacity-50"`.

`checkbox.tsx` :

| Élément | Classes |
|---|---|
| `<span>` conteneur | `cn("inline-flex items-center", containerClassName)` |
| Root | `peer grid size-4 shrink-0 place-items-center rounded-[4px] border border-border bg-bg transition-colors data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-fg disabled:cursor-not-allowed disabled:opacity-50` |
| Indicator | `grid place-items-center` |

et `IconCheck` passe à `width="12" height="12"`.

`tabs.tsx` :

| Élément | Classes |
|---|---|
| `TabsList` | `inline-flex items-center gap-1 border-b border-border` |
| `TabsTrigger` | `-mb-px border-b-2 border-transparent px-3 py-2 text-[13px] font-medium text-fg-muted transition-colors hover:text-fg data-[state=active]:border-accent data-[state=active]:text-fg` |
| `TabsContent` | `mt-4 focus-visible:outline-none` |

`separator.tsx` : `cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className)`.

- [ ] **Step 6: `dialog.tsx` (dialog maison, API inchangée)**

Même méthode : retirer l'import du module CSS, importer `cn`, remplacer les classes :

| Élément | Classes |
|---|---|
| overlay (`<div aria-hidden …>`) | `fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm` |
| content | `cn("w-full max-w-lg rounded-lg border border-border bg-surface p-6 text-fg shadow-2xl outline-none", className)` |
| `DialogHeader` | `cn("mb-4 flex flex-col gap-1.5", className)` |
| `DialogTitle` | `cn("text-lg font-semibold tracking-tight", className)` |
| `DialogDescription` | `cn("text-sm text-fg-muted", className)` |

- [ ] **Step 7: `toaster.tsx` et `use-toast.tsx`**

`components/ui/toaster.tsx` :

```tsx
"use client";

import * as React from "react";
import { Toaster as SonnerToaster } from "sonner";

// Toaster global, rendu une seule fois (app/providers.tsx)
export function Toaster() {
  return (
    <SonnerToaster
      closeButton
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "!rounded-lg !border !border-border !bg-surface !text-fg !shadow-xl !font-sans",
          description: "!text-fg-muted",
          closeButton: "!border-border !bg-surface !text-fg-muted",
        },
      }}
    />
  );
}

export default Toaster;
```

`components/ui/use-toast.tsx` — remplacer uniquement `variantClasses` et le tableau de classes du conteneur dans `renderToast` :

```tsx
  const variantClasses: Record<Variant, string> = {
    default: "border-l-border",
    destructive: "border-l-danger",
    success: "border-l-success",
    warning: "border-l-warning",
    info: "border-l-accent",
  };

  return (
    <div
      className={[
        "flex w-[356px] max-w-full items-start gap-3 rounded-lg border border-l-4 border-border bg-surface p-3 text-fg shadow-xl",
        variantClasses[variant || "default"],
      ].join(" ")}
    >
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold leading-5">{title}</div>}
        {description && (
          <div className="mt-0.5 text-sm leading-5 text-fg-muted">{description}</div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
```

- [ ] **Step 8: Créer `components/ui/dropdown-menu.tsx`**

```tsx
"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, align = "end", sideOffset = 6, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-52 overflow-hidden rounded-lg border border-border bg-surface p-1 text-fg shadow-xl",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none data-[highlighted]:bg-surface-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:text-fg-muted",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-[13px]", className)} {...props} />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
```

- [ ] **Step 9: Supprimer les modules CSS et vérifier qu'il ne reste aucune référence**

```bash
git rm apps/web/components/ui/*.module.css
grep -rn "module.css" apps/web/components/ui || echo "OK: plus de module CSS dans ui"
```

Expected: `OK: plus de module CSS dans ui`.

- [ ] **Step 10: Build + tests**

Run: `pnpm --filter web test && pnpm --filter web build`
Expected: tests PASS ; build OK sans erreur TypeScript. (Une erreur du type « Property 'danger' does not exist » ailleurs signifierait un appel non prévu : lire l'appelant, adapter le type, pas l'appel.)

- [ ] **Step 11: Commit**

```bash
git add -A apps/web/lib/utils.ts apps/web/components/ui
git commit -m "feat(web): restyle ui components with tokens, add DropdownMenu"
```

---

### Task 4: Logique pure — nav, arbre des docs, filtre ⌘K

**Files:**
- Create: `apps/web/lib/nav.ts`, `apps/web/lib/nav.test.ts`, `apps/web/lib/docs-tree.ts`, `apps/web/lib/docs-tree.test.ts`, `apps/web/lib/command-filter.ts`, `apps/web/lib/command-filter.test.ts`

**Interfaces:**
- Produces:
  - `lib/nav.ts` : `MAIN_NAV: readonly { href: "/dashboard" | "/docs" | "/notes" | "/collections"; label: string }[]` (tuple `as const`), `isActivePath(pathname: string | null, href: string): boolean`, `isSectionPath(pathname: string | null): boolean`.
  - `lib/docs-tree.ts` : `type DocSummary = { id: string; title: string; tech: string; slug?: string; created_at?: string }`, `type TechGroup = { tech: string; docs: DocSummary[] }`, `groupDocsByTech(docs: DocSummary[]): TechGroup[]`.
  - `lib/command-filter.ts` : `type Command = { id: string; label: string; href: string; group: "Pages" | "Docs"; keywords?: string }`, `normalize(s: string): string`, `filterCommands(items: Command[], query: string): Command[]`, `isCommandPaletteShortcut(e: { key: string; metaKey: boolean; ctrlKey: boolean; altKey: boolean; shiftKey: boolean }): boolean`.

- [ ] **Step 1: Écrire les tests (qui échouent)**

`apps/web/lib/nav.test.ts` :

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { MAIN_NAV, isActivePath, isSectionPath } from "./nav.ts";

test("MAIN_NAV lists the four sections in order", () => {
  assert.deepEqual(MAIN_NAV.map((i) => i.href), ["/dashboard", "/docs", "/notes", "/collections"]);
});

test("isActivePath matches the route and its children only", () => {
  assert.equal(isActivePath("/docs", "/docs"), true);
  assert.equal(isActivePath("/docs/abc-123", "/docs"), true);
  assert.equal(isActivePath("/docsearch", "/docs"), false);
  assert.equal(isActivePath("/", "/docs"), false);
  assert.equal(isActivePath(null, "/docs"), false);
});

test("isSectionPath is true only under docs, notes, collections", () => {
  assert.equal(isSectionPath("/docs"), true);
  assert.equal(isSectionPath("/notes/new"), true);
  assert.equal(isSectionPath("/collections/add"), true);
  assert.equal(isSectionPath("/dashboard"), false);
  assert.equal(isSectionPath("/documents"), false);
  assert.equal(isSectionPath(null), false);
});
```

`apps/web/lib/docs-tree.test.ts` :

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { groupDocsByTech, type DocSummary } from "./docs-tree.ts";

const doc = (id: string, title: string, tech: string): DocSummary => ({ id, title, tech });

test("groups by tech, groups sorted alphabetically, docs sorted by title", () => {
  const groups = groupDocsByTech([
    doc("1", "Volumes", "docker"),
    doc("2", "SSL", "nginx"),
    doc("3", "Compose", "docker"),
  ]);
  assert.deepEqual(
    groups.map((g) => [g.tech, g.docs.map((d) => d.title)]),
    [["docker", ["Compose", "Volumes"]], ["nginx", ["SSL"]]],
  );
});

test("normalises tech case and whitespace into one group", () => {
  const groups = groupDocsByTech([doc("1", "A", "Docker"), doc("2", "B", " docker ")]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].tech, "docker");
  assert.equal(groups[0].docs.length, 2);
});

test("docs without tech go to an 'autre' group", () => {
  const groups = groupDocsByTech([doc("1", "A", ""), doc("2", "B", "   ")]);
  assert.deepEqual(groups.map((g) => g.tech), ["autre"]);
});

test("title sort ignores case and accents", () => {
  const groups = groupDocsByTech([doc("1", "zsh", "shell"), doc("2", "Éditeur", "shell"), doc("3", "bash", "shell")]);
  assert.deepEqual(groups[0].docs.map((d) => d.title), ["bash", "Éditeur", "zsh"]);
});

test("empty input gives no groups and input is not mutated", () => {
  assert.deepEqual(groupDocsByTech([]), []);
  const input = [doc("1", "B", "x"), doc("2", "A", "x")];
  groupDocsByTech(input);
  assert.deepEqual(input.map((d) => d.id), ["1", "2"]);
});
```

`apps/web/lib/command-filter.test.ts` :

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { filterCommands, isCommandPaletteShortcut, type Command } from "./command-filter.ts";

const cmd = (id: string, label: string, keywords?: string): Command => ({
  id, label, href: `/${id}`, group: "Docs", keywords,
});

const items = [
  cmd("a", "Installer Nginx", "nginx"),
  cmd("b", "Docker Compose", "docker"),
  cmd("c", "Créer une note"),
  cmd("d", "Compose avancé", "docker"),
];

test("empty or blank query returns every item in original order", () => {
  assert.deepEqual(filterCommands(items, "").map((c) => c.id), ["a", "b", "c", "d"]);
  assert.deepEqual(filterCommands(items, "   ").map((c) => c.id), ["a", "b", "c", "d"]);
});

test("matching is case- and accent-insensitive", () => {
  assert.deepEqual(filterCommands(items, "CREER").map((c) => c.id), ["c"]);
  assert.deepEqual(filterCommands(items, "avance").map((c) => c.id), ["d"]);
});

test("every term must match (label or keywords)", () => {
  assert.deepEqual(filterCommands(items, "docker compose").map((c) => c.id), ["b", "d"]);
  assert.deepEqual(filterCommands(items, "docker nginx").map((c) => c.id), []);
});

test("keywords are searchable", () => {
  assert.deepEqual(filterCommands(items, "nginx").map((c) => c.id), ["a"]);
});

test("label prefix ranks before label substring, ties keep original order", () => {
  assert.deepEqual(filterCommands(items, "compose").map((c) => c.id), ["d", "b"]);
});

test("isCommandPaletteShortcut: Cmd+K or Ctrl+K only", () => {
  const e = (key: string, mods: Partial<Record<"metaKey" | "ctrlKey" | "altKey" | "shiftKey", boolean>> = {}) => ({
    key, metaKey: false, ctrlKey: false, altKey: false, shiftKey: false, ...mods,
  });
  assert.equal(isCommandPaletteShortcut(e("k", { metaKey: true })), true);
  assert.equal(isCommandPaletteShortcut(e("K", { ctrlKey: true })), true);
  assert.equal(isCommandPaletteShortcut(e("k")), false);
  assert.equal(isCommandPaletteShortcut(e("k", { metaKey: true, altKey: true })), false);
  assert.equal(isCommandPaletteShortcut(e("k", { ctrlKey: true, shiftKey: true })), false);
  assert.equal(isCommandPaletteShortcut(e("j", { metaKey: true })), false);
});
```

- [ ] **Step 2: Lancer pour vérifier l'échec**

Run: `pnpm --filter web test`
Expected: FAIL — `Cannot find module` pour `nav.ts`, `docs-tree.ts`, `command-filter.ts`.

- [ ] **Step 3: Implémenter les trois modules**

`apps/web/lib/nav.ts` :

```ts
export const MAIN_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/docs", label: "Docs" },
  { href: "/notes", label: "Notes" },
  { href: "/collections", label: "Collections" },
] as const;

const SECTION_PREFIXES = ["/docs", "/notes", "/collections"] as const;

export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Routes qui ont une sidebar de section (et gèrent leur propre largeur). */
export function isSectionPath(pathname: string | null): boolean {
  return SECTION_PREFIXES.some((prefix) => isActivePath(pathname, prefix));
}
```

`apps/web/lib/docs-tree.ts` :

```ts
export type DocSummary = {
  id: string;
  title: string;
  tech: string;
  slug?: string;
  created_at?: string;
};

export type TechGroup = { tech: string; docs: DocSummary[] };

const FALLBACK_TECH = "autre";

export function groupDocsByTech(docs: DocSummary[]): TechGroup[] {
  const groups = new Map<string, DocSummary[]>();
  for (const doc of docs) {
    const tech = (doc.tech ?? "").trim().toLowerCase() || FALLBACK_TECH;
    const list = groups.get(tech);
    if (list) list.push(doc);
    else groups.set(tech, [doc]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "fr"))
    .map(([tech, list]) => ({
      tech,
      docs: [...list].sort((x, y) => x.title.localeCompare(y.title, "fr", { sensitivity: "base" })),
    }));
}
```

`apps/web/lib/command-filter.ts` :

```ts
export type Command = {
  id: string;
  label: string;
  href: string;
  group: "Pages" | "Docs";
  keywords?: string;
};

export function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function filterCommands(items: Command[], query: string): Command[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return items;

  const matches: { item: Command; score: number; index: number }[] = [];
  items.forEach((item, index) => {
    const label = normalize(item.label);
    const haystack = `${label} ${normalize(item.keywords ?? "")}`;
    if (!terms.every((t) => haystack.includes(t))) return;
    const score = label.startsWith(terms[0]) ? 0 : label.includes(terms[0]) ? 1 : 2;
    matches.push({ item, score, index });
  });

  return matches.sort((a, b) => a.score - b.score || a.index - b.index).map((m) => m.item);
}

export function isCommandPaletteShortcut(e: {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
}): boolean {
  return (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k";
}
```

- [ ] **Step 4: Lancer pour vérifier le succès**

Run: `pnpm --filter web test`
Expected: PASS — tous les tests (`contrast`, `tokens`, `theme`, `nav`, `docs-tree`, `command-filter`).

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/nav.ts apps/web/lib/nav.test.ts apps/web/lib/docs-tree.ts apps/web/lib/docs-tree.test.ts apps/web/lib/command-filter.ts apps/web/lib/command-filter.test.ts
git commit -m "feat(web): nav, docs tree and command filter logic with tests"
```

---

### Task 5: Palette ⌘K

**Files:**
- Create: `apps/web/hooks/useMounted.ts`, `apps/web/components/command-palette.tsx`
- Modify: `apps/web/types/lucide-react.d.ts` (déclarer `Bell`, `Menu`, `X`)

**Interfaces:**
- Consumes: `filterCommands`, `Command` (Task 4) ; `DocSummary` (Task 4) ; `useAuth` de `@/lib/store` (`token`, `apiBase`) ; `apiFetch` de `@/lib/api`.
- Produces:
  - `useMounted(): boolean` — `false` au rendu serveur et au premier rendu client, `true` ensuite.
  - `CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void })`.

- [ ] **Step 1: Déclarer les icônes manquantes**

Dans `apps/web/types/lucide-react.d.ts`, ajouter avant `const _default` :

```ts
  export const Bell: React.ComponentType<any>;
  export const Menu: React.ComponentType<any>;
  export const X: React.ComponentType<any>;
```

- [ ] **Step 2: `hooks/useMounted.ts`**

```ts
"use client";

import { useEffect, useState } from "react";

/**
 * Le store d'auth lit localStorage dès l'import côté client, donc le premier rendu
 * client diffère du rendu serveur. Tout rendu qui dépend de `token`/`user`
 * attend `mounted` pour éviter un mismatch d'hydratation.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
```

- [ ] **Step 3: `components/command-palette.tsx`**

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { filterCommands, type Command } from "@/lib/command-filter";
import type { DocSummary } from "@/lib/docs-tree";
import { cn } from "@/lib/utils";

const PAGE_COMMANDS: Command[] = [
  { id: "page-dashboard", label: "Dashboard", href: "/dashboard", group: "Pages" },
  { id: "page-docs", label: "Docs", href: "/docs", group: "Pages" },
  { id: "page-doc-new", label: "Nouveau doc", href: "/docs/new", group: "Pages", keywords: "créer ajouter" },
  { id: "page-notes", label: "Notes", href: "/notes", group: "Pages" },
  { id: "page-note-new", label: "Nouvelle note", href: "/notes/new", group: "Pages", keywords: "créer ajouter" },
  { id: "page-collections", label: "Collections", href: "/collections", group: "Pages" },
  { id: "page-collection-new", label: "Nouvelle collection", href: "/collections/add", group: "Pages", keywords: "créer ajouter" },
  { id: "page-profile", label: "Mon profil", href: "/profile", group: "Pages", keywords: "compte" },
];

const MAX_RESULTS = 50;

function docToCommand(doc: DocSummary): Command {
  return { id: `doc-${doc.id}`, label: doc.title, href: `/docs/${doc.id}`, group: "Docs", keywords: doc.tech };
}

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function CommandPalette({ open, onOpenChange }: Props) {
  const router = useRouter();
  const { token, apiBase } = useAuth();
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<DocSummary[]>([]);
  const [active, setActive] = useState(0);

  // Docs chargés à chaque ouverture ; erreur API → palette limitée aux pages
  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    if (!token) {
      setDocs([]);
      return;
    }
    let cancelled = false;
    apiFetch<DocSummary[]>("/docs/all", {}, apiBase, token)
      .then((data) => { if (!cancelled) setDocs(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setDocs([]); });
    return () => { cancelled = true; };
  }, [open, token, apiBase]);

  const results = useMemo(
    () => filterCommands([...PAGE_COMMANDS, ...docs.map(docToCommand)], query).slice(0, MAX_RESULTS),
    [docs, query],
  );

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    document.getElementById(`cmd-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function run(item: Command) {
    onOpenChange(false);
    router.push(item.href as Route);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      run(results[active]);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[12vh] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-surface text-fg shadow-2xl"
        >
          <Dialog.Title className="sr-only">Rechercher</Dialog.Title>
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-fg-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Rechercher un doc, une page…"
              role="combobox"
              aria-expanded="true"
              aria-controls="cmd-list"
              aria-activedescendant={results[active] ? `cmd-${active}` : undefined}
              className="h-12 w-full bg-transparent text-sm text-fg placeholder:text-fg-muted focus:outline-none"
            />
            <kbd className="rounded border border-border px-1.5 font-mono text-[11px] text-fg-muted">Échap</kbd>
          </div>
          <ul id="cmd-list" role="listbox" className="max-h-80 overflow-y-auto p-1">
            {results.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-fg-muted">
                Aucun résultat pour « {query} »
              </li>
            )}
            {results.map((item, i) => (
              <li key={item.id} role="presentation">
                {(i === 0 || results[i - 1].group !== item.group) && (
                  <div className="px-2 pb-1 pt-2 font-mono text-[11px] text-fg-muted">{item.group}</div>
                )}
                <div
                  id={`cmd-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => run(item)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-2 text-[13px]",
                    i === active ? "bg-accent-subtle text-accent" : "text-fg",
                  )}
                >
                  <span className="truncate">{item.label}</span>
                  {item.group === "Docs" && item.keywords && (
                    <span className="shrink-0 font-mono text-[11px] text-fg-muted">~/{item.keywords}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [ ] **Step 4: Build**

Run: `pnpm --filter web build`
Expected: OK. (La palette n'est pas encore montée ; elle l'est en Task 6.)

- [ ] **Step 5: Commit**

```bash
git add apps/web/hooks/useMounted.ts apps/web/components/command-palette.tsx apps/web/types/lucide-react.d.ts
git commit -m "feat(web): add command palette"
```

---

### Task 6: Nouveau shell (top bar, menu avatar, tiroir mobile, footer) rendu serveur

**Files:**
- Create: `apps/web/components/layout/{sidebar-slot,logo,sidebar-link,footer,mobile-nav,top-bar,site-chrome}.tsx`
- Modify: `apps/web/app/layout.tsx`, `apps/web/app/providers.tsx`, `apps/web/lib/store.ts`, `apps/web/components/layout/PageWrapper.tsx`, `.gitignore` (racine)
- Delete: `apps/web/components/layout/{Shell,AppHeader,AppSidebar,AppFooter}.{tsx,css}`, `apps/web/components/layout/PageWrapper.css`, `apps/web/hooks/useAuth.tsx`

**Interfaces:**
- Consumes: `MAIN_NAV`, `isActivePath`, `isSectionPath`, `isCommandPaletteShortcut` (Task 4) ; `CommandPalette`, `useMounted` (Task 5) ; `DropdownMenu*`, `Button` (Task 3) ; `useTheme` (Task 2) ; `useAuth` (`@/lib/store`) ; `useAuthInit` (`@/hooks/useAuthInit`).
- Produces:
  - `SidebarSlotProvider({ children })`, `useSidebarSlot(): React.ReactNode`, `useRegisterSidebar(node: React.ReactNode): void`.
  - `Logo()`, `SidebarLink({ href: string; active?: boolean; children })`, `Footer()`, `MobileNav()`, `TopBar()`, `SiteChrome({ children })`.
  - `lib/store.ts` : `User` gagne `role?: string`.

- [ ] **Step 1: `lib/store.ts` — ajouter le rôle au type `User`**

```ts
type User = { id?: string; email?: string; username?: string; name?: string; role?: string } | null;
```

(`/auth/me` renvoie déjà `{ id, email, username, role }`.)

- [ ] **Step 2: `components/layout/sidebar-slot.tsx`**

```tsx
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Deux contextes : les sections n'écoutent que le setter (stable), donc
// enregistrer une sidebar ne les re-rend pas (pas de boucle).
const SlotValue = createContext<ReactNode>(null);
const SlotSetter = createContext<((node: ReactNode) => void) | null>(null);

export function SidebarSlotProvider({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<ReactNode>(null);
  return (
    <SlotSetter.Provider value={setNode}>
      <SlotValue.Provider value={node}>{children}</SlotValue.Provider>
    </SlotSetter.Provider>
  );
}

/** Sidebar de la section courante, pour le tiroir mobile. */
export function useSidebarSlot() {
  return useContext(SlotValue);
}

export function useRegisterSidebar(node: ReactNode) {
  const setNode = useContext(SlotSetter);
  useEffect(() => {
    setNode?.(node);
    return () => setNode?.(null);
  }, [setNode, node]);
}
```

- [ ] **Step 3: `logo.tsx`, `sidebar-link.tsx`, `footer.tsx`**

`components/layout/logo.tsx` :

```tsx
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/dashboard" className="font-mono text-[15px] font-bold tracking-tight text-fg">
      devdocs<span className="text-accent">hub</span>
    </Link>
  );
}
```

`components/layout/sidebar-link.tsx` :

```tsx
import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";

export function SidebarLink({
  href,
  active = false,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href as Route}
      aria-current={active ? "page" : undefined}
      className={cn(
        "block truncate rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
        active
          ? "rounded-l-none border-l-2 border-accent bg-accent-subtle text-accent"
          : "text-fg-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      {children}
    </Link>
  );
}
```

`components/layout/footer.tsx` :

```tsx
import Link from "next/link";

const LINKS = [
  { href: "/about", label: "À propos" },
  { href: "/privacy", label: "Confidentialité" },
  { href: "/terms", label: "CGU" },
  { href: "/licenses", label: "Licences" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-4 font-mono text-xs text-fg-muted md:px-8">
        <span>© {new Date().getFullYear()} devdocshub</span>
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="transition-colors hover:text-fg">
            {link.label}
          </Link>
        ))}
        <a
          href="https://github.com/louisbertrand22/devdocshub"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-fg"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: `components/layout/mobile-nav.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { SidebarLink } from "./sidebar-link";
import { useSidebarSlot } from "./sidebar-slot";
import { MAIN_NAV, isActivePath } from "@/lib/nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const sectionSidebar = useSidebarSlot();

  // Fermer après navigation
  useEffect(() => setOpen(false), [pathname]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Ouvrir le menu">
          <Menu />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 md:hidden" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col gap-6 overflow-y-auto border-r border-border bg-bg p-4 md:hidden"
        >
          <Dialog.Title className="sr-only">Menu</Dialog.Title>
          <div className="flex items-center justify-between">
            <Logo />
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Fermer le menu">
                <X />
              </Button>
            </Dialog.Close>
          </div>
          <nav aria-label="Navigation principale" className="flex flex-col gap-0.5">
            {MAIN_NAV.map((item) => (
              <SidebarLink key={item.href} href={item.href} active={isActivePath(pathname, item.href)}>
                {item.label}
              </SidebarLink>
            ))}
          </nav>
          {sectionSidebar && <div className="border-t border-border pt-4">{sectionSidebar}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [ ] **Step 5: `components/layout/top-bar.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogIn, LogOut, Moon, Search, Sun, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandPalette } from "@/components/command-palette";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { useAuth } from "@/lib/store";
import { useTheme } from "@/hooks/useTheme";
import { useMounted } from "@/hooks/useMounted";
import { MAIN_NAV, isActivePath } from "@/lib/nav";
import { isCommandPaletteShortcut } from "@/lib/command-filter";
import { cn } from "@/lib/utils";

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useMounted();
  const { user, token, setToken } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const onKey = (e: KeyboardEvent) => {
      if (isCommandPaletteShortcut(e)) {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const username = user?.username || user?.name || user?.email?.split("@")[0] || "Utilisateur";

  function logout() {
    setToken(null);
    router.push("/auth");
  }

  // Avant montage, ou token présent mais profil pas encore chargé : réserver la place
  const authPending = !mounted || (token && !user);

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1440px] items-center gap-4 px-4 md:px-8">
        <MobileNav />
        <Logo />

        <nav aria-label="Navigation principale" className="hidden h-full items-center gap-1 md:flex">
          {MAIN_NAV.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-full items-center px-2.5 text-[13px] transition-colors",
                  active
                    ? "text-fg after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:bg-accent"
                    : "text-fg-muted hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Rechercher"
            className="flex h-8 w-8 items-center justify-center gap-2 rounded-md border border-border bg-bg text-[13px] text-fg-muted transition-colors hover:border-fg-muted sm:w-56 sm:justify-between sm:px-2.5"
          >
            <span className="flex items-center gap-2">
              <Search className="size-4" />
              <span className="hidden sm:inline">Rechercher…</span>
            </span>
            <kbd className="hidden rounded border border-border px-1.5 font-mono text-[11px] sm:inline">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre"}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>

          {mounted && user && (
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell />
            </Button>
          )}

          {authPending ? (
            <div className="size-8" aria-hidden />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Menu du compte"
                  className="grid size-8 place-items-center rounded-full bg-accent-subtle font-mono text-[13px] font-semibold text-accent ring-1 ring-accent-border"
                >
                  {username[0].toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>
                  <div className="font-medium">{username}</div>
                  {user.email && <div className="font-mono text-[11px] text-fg-muted">{user.email}</div>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push("/profile")}>
                  <User /> Mon profil
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem onSelect={() => router.push("/users")}>
                    <Users /> Utilisateurs
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout}>
                  <LogOut /> Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => router.push("/auth")}>
              <LogIn /> Se connecter
            </Button>
          )}
        </div>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}
```

- [ ] **Step 6: `components/layout/site-chrome.tsx`**

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useAuthInit } from "@/hooks/useAuthInit";
import { isSectionPath } from "@/lib/nav";
import { SidebarSlotProvider } from "./sidebar-slot";
import { TopBar } from "./top-bar";
import { Footer } from "./footer";

/**
 * Enveloppe commune. Client (dépend de la route), mais les pages passées en
 * `children` restent rendues côté serveur.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useAuthInit();

  if (pathname === "/auth") return <main>{children}</main>;

  return (
    <SidebarSlotProvider>
      <TopBar />
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
        <main className="flex-1">
          {isSectionPath(pathname) ? (
            children
          ) : (
            <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">{children}</div>
          )}
        </main>
        <Footer />
      </div>
    </SidebarSlotProvider>
  );
}
```

- [ ] **Step 7: Brancher `SiteChrome`, un seul `Toaster`**

`apps/web/app/providers.tsx` :

```tsx
"use client";

import React from "react";
import { Toaster } from "@/components/ui/toaster";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
```

`apps/web/app/layout.tsx` — retirer l'import `dynamic` et `AppShell`, importer `SiteChrome`, et remplacer le `<body>` :

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Providers from "./providers";
import { SiteChrome } from "@/components/layout/site-chrome";
import { themeInitScript } from "@/lib/theme";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "DevDocsHub",
  description: "Documentation & notes techniques centralisées",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 8: `PageWrapper.tsx` en utilitaires**

```tsx
import { cn } from "@/lib/utils";

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
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1>{title}</h1>
          {description && <p className="text-fg-muted">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      <div>{children}</div>
    </div>
  );
}
```

- [ ] **Step 9: Supprimer l'ancien shell et le second système d'auth**

```bash
cd apps/web
git rm components/layout/Shell.tsx components/layout/Shell.css \
       components/layout/AppHeader.tsx components/layout/AppHeader.css \
       components/layout/AppSidebar.tsx components/layout/AppSidebar.css \
       components/layout/AppFooter.tsx components/layout/AppFooter.css \
       components/layout/PageWrapper.css hooks/useAuth.tsx
grep -rnE "layout/(Shell|AppHeader|AppSidebar|AppFooter)|PageWrapper.css|hooks/useAuth\"" app components hooks lib || echo "OK: plus de référence"
cd ../..
printf '\n# captures de vérification visuelle\napps/web/screenshots/\n' >> .gitignore
```

Expected: `OK: plus de référence`.

- [ ] **Step 10: Build + tests**

Run: `pnpm --filter web test && pnpm --filter web build`
Expected: PASS, build OK. Dans la sortie du build, `/dashboard`, `/docs`… ne doivent plus apparaître comme rendus uniquement client à cause du shell (le `ssr: false` a disparu).

- [ ] **Step 11: Vérif rapide dans le navigateur**

Run: `pnpm --filter web dev` (arrière-plan) puis ouvrir `http://localhost:3000/dashboard`.
Expected : top bar graphite avec `devdocshub`, nav (Dashboard souligné cyan), « Rechercher… ⌘K », toggle soleil, bouton « Se connecter » (non connecté) ; ⌘K / Ctrl+K ouvre la palette, Échap la ferme ; footer d'une ligne ; `/auth` sans top bar ; à 390px, ☰ ouvre le tiroir.

- [ ] **Step 12: Commit**

```bash
git add -A apps/web .gitignore
git commit -m "feat(web): server-rendered docs-style shell with top bar, avatar menu and cmd+k"
```

---

### Task 7: Sidebars de section

**Files:**
- Create: `apps/web/components/layout/{section-layout,docs-sidebar,notes-sidebar,collections-sidebar}.tsx`, `apps/web/app/docs/layout.tsx`, `apps/web/app/notes/layout.tsx`, `apps/web/app/collections/layout.tsx`

**Interfaces:**
- Consumes: `useRegisterSidebar` (Task 6), `SidebarLink` (Task 6), `groupDocsByTech`, `DocSummary` (Task 4), `useMounted` (Task 5), `useAuth` (`token`, `apiBase`), `apiFetch`.
- Produces: `SectionLayout({ sidebar: React.ReactNode; children })`, `DocsSidebar()`, `NotesSidebar()`, `CollectionsSidebar()`.

- [ ] **Step 1: `components/layout/section-layout.tsx`**

```tsx
"use client";

import { useRegisterSidebar } from "./sidebar-slot";

export function SectionLayout({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  // Rend la sidebar disponible pour le tiroir mobile
  useRegisterSidebar(sidebar);

  return (
    <div className="mx-auto flex w-full max-w-[1440px]">
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-border px-3 py-6 md:block">
        {sidebar}
      </aside>
      <div className="min-w-0 flex-1 px-4 py-8 md:px-10 md:py-10">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: `components/layout/docs-sidebar.tsx`**

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { useMounted } from "@/hooks/useMounted";
import { groupDocsByTech, type DocSummary } from "@/lib/docs-tree";
import { SidebarLink } from "./sidebar-link";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; docs: DocSummary[] };

export function DocsSidebar() {
  const pathname = usePathname();
  const mounted = useMounted();
  const { token, apiBase } = useAuth();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setState({ status: "loading" });
    apiFetch<DocSummary[]>("/docs/all", {}, apiBase, token)
      .then((docs) => { if (!cancelled) setState({ status: "ready", docs: Array.isArray(docs) ? docs : [] }); })
      .catch(() => { if (!cancelled) setState({ status: "error" }); });
    return () => { cancelled = true; };
  }, [token, apiBase]);

  const groups = useMemo(
    () => (state.status === "ready" ? groupDocsByTech(state.docs) : []),
    [state],
  );

  return (
    <nav aria-label="Docs" className="flex flex-col gap-5">
      <div className="flex flex-col gap-0.5">
        <SidebarLink href="/docs" active={pathname === "/docs"}>Tous les docs</SidebarLink>
        <SidebarLink href="/docs/new" active={pathname === "/docs/new"}>+ Nouveau doc</SidebarLink>
      </div>

      {!mounted ? null : !token ? (
        <p className="px-2.5 text-[13px] text-fg-muted">
          <Link href="/auth" className="text-accent hover:underline">Connecte-toi</Link> pour voir les docs.
        </p>
      ) : state.status === "loading" ? (
        <div className="flex flex-col gap-2 px-2.5" aria-label="Chargement des docs">
          {[70, 55, 80, 45, 65].map((w) => (
            <div key={w} className="h-3 animate-pulse rounded bg-surface-2" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : state.status === "error" ? (
        <p className="px-2.5 text-[13px] text-danger">Impossible de charger les docs.</p>
      ) : groups.length === 0 ? (
        <p className="px-2.5 text-[13px] text-fg-muted">Aucun doc pour l'instant.</p>
      ) : (
        groups.map((group) => (
          <div key={group.tech} className="flex flex-col gap-0.5">
            <div className="px-2.5 pb-1 font-mono text-[11px] text-fg-muted">~/{group.tech}</div>
            {group.docs.map((doc) => (
              <SidebarLink key={doc.id} href={`/docs/${doc.id}`} active={pathname === `/docs/${doc.id}`}>
                {doc.title}
              </SidebarLink>
            ))}
          </div>
        ))
      )}
    </nav>
  );
}
```

(Le `style={{ width }}` des squelettes est une largeur, pas une couleur : autorisé par les contraintes.)

- [ ] **Step 3: `notes-sidebar.tsx` et `collections-sidebar.tsx` (coquilles)**

`components/layout/notes-sidebar.tsx` :

```tsx
"use client";

import { usePathname } from "next/navigation";
import { SidebarLink } from "./sidebar-link";

// Filtres « épinglées » / « par doc » : phase 2
export function NotesSidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Notes" className="flex flex-col gap-0.5">
      <SidebarLink href="/notes" active={pathname === "/notes"}>Toutes les notes</SidebarLink>
      <SidebarLink href="/notes/new" active={pathname === "/notes/new"}>+ Nouvelle note</SidebarLink>
    </nav>
  );
}
```

`components/layout/collections-sidebar.tsx` :

```tsx
"use client";

import { usePathname } from "next/navigation";
import { SidebarLink } from "./sidebar-link";

// Liste des collections : quand une page de détail de collection existera
export function CollectionsSidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Collections" className="flex flex-col gap-0.5">
      <SidebarLink href="/collections" active={pathname === "/collections"}>Toutes les collections</SidebarLink>
      <SidebarLink href="/collections/add" active={pathname === "/collections/add"}>+ Nouvelle collection</SidebarLink>
    </nav>
  );
}
```

- [ ] **Step 4: Layouts de section**

`apps/web/app/docs/layout.tsx` :

```tsx
import { SectionLayout } from "@/components/layout/section-layout";
import { DocsSidebar } from "@/components/layout/docs-sidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <SectionLayout sidebar={<DocsSidebar />}>{children}</SectionLayout>;
}
```

`apps/web/app/notes/layout.tsx` :

```tsx
import { SectionLayout } from "@/components/layout/section-layout";
import { NotesSidebar } from "@/components/layout/notes-sidebar";

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return <SectionLayout sidebar={<NotesSidebar />}>{children}</SectionLayout>;
}
```

`apps/web/app/collections/layout.tsx` :

```tsx
import { SectionLayout } from "@/components/layout/section-layout";
import { CollectionsSidebar } from "@/components/layout/collections-sidebar";

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return <SectionLayout sidebar={<CollectionsSidebar />}>{children}</SectionLayout>;
}
```

- [ ] **Step 5: Build + tests**

Run: `pnpm --filter web test && pnpm --filter web build`
Expected: PASS, build OK.

- [ ] **Step 6: Vérif navigateur**

Avec `pnpm --filter web dev` et l'API lancée (`docker compose up -d db search api`), se connecter, créer deux docs de `tech` différentes via `/docs/new`, puis ouvrir `/docs/<id>` : sidebar groupée `~/…`, doc courant surligné cyan ; à 390px le ☰ affiche la nav **et** l'arbre des docs ; aller sur `/dashboard` puis ouvrir ☰ : plus d'arbre (slot vidé).

- [ ] **Step 7: Commit**

```bash
git add apps/web/components/layout/section-layout.tsx apps/web/components/layout/docs-sidebar.tsx apps/web/components/layout/notes-sidebar.tsx apps/web/components/layout/collections-sidebar.tsx apps/web/app/docs/layout.tsx apps/web/app/notes/layout.tsx apps/web/app/collections/layout.tsx
git commit -m "feat(web): contextual section sidebars with docs tree"
```

---

### Task 8: Vérification complète, build Docker, PR

**Files:**
- Create: `apps/web/scripts/screenshots.mjs`

**Interfaces:**
- Consumes: l'app complète (Tasks 1–7).
- Produces: `pnpm --filter web screenshots` — variables : `BASE_URL` (déf. `http://localhost:3000`), `API_URL` (déf. `http://localhost:8000`), `SHOT_EMAIL`/`SHOT_PASSWORD` (login réel) ou `SHOT_TOKEN` (token brut injecté tel quel), `PAGES` (liste séparée par virgules), `OUT_DIR` (déf. `screenshots`), `CHROMIUM_PATH` (déf. `/usr/bin/chromium`). Sort en code 1 si le thème appliqué ne correspond pas au thème stocké.

- [ ] **Step 1: `apps/web/scripts/screenshots.mjs`**

```js
// Captures dark/light × desktop/mobile + contrôle du thème appliqué.
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:8000";
const OUT = process.env.OUT_DIR ?? "screenshots";
const EXECUTABLE = process.env.CHROMIUM_PATH ?? "/usr/bin/chromium";
const PAGES = (process.env.PAGES ?? "/dashboard,/docs,/docs/new,/notes,/collections,/profile,/auth").split(",");
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
const THEMES = ["dark", "light"];

async function getToken() {
  if (process.env.SHOT_TOKEN) return process.env.SHOT_TOKEN;
  const { SHOT_EMAIL: email, SHOT_PASSWORD: password } = process.env;
  if (!email || !password) return null;
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`login failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

const token = await getToken();
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: EXECUTABLE });
let failures = 0;

try {
  for (const theme of THEMES) {
    for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
      const context = await browser.newContext({ viewport });
      await context.addInitScript(([t, tok]) => {
        localStorage.setItem("theme", t);
        if (tok) localStorage.setItem("ddh_token", tok);
      }, [theme, token]);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

      for (const path of PAGES) {
        await page.goto(BASE + path, { waitUntil: "networkidle" });
        const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
        if (isDark !== (theme === "dark")) {
          failures++;
          console.error(`THEME MISMATCH ${path} (${theme}/${vpName}): html.dark=${isDark}`);
        }
        const file = `${OUT}/${path.replaceAll("/", "_").replace(/^_/, "") || "root"}.${theme}.${vpName}.png`;
        await page.screenshot({ path: file, fullPage: true });
        console.log(file);
      }
      if (errors.length) console.log(`console errors (${theme}/${vpName}):\n  ${errors.join("\n  ")}`);
      await context.close();
    }
  }
} finally {
  await browser.close();
}
process.exit(failures ? 1 : 0);
```

- [ ] **Step 2: Tests + build locaux**

Run: `pnpm --filter web test && pnpm --filter web build`
Expected: tous les tests PASS, build OK.

- [ ] **Step 3: Build Docker de l'image web**

```bash
docker compose build web && docker compose up -d
docker compose restart api   # contourne la fuite de sessions de l'API
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/dashboard
```

Expected: build OK (Tailwind v4 / oxide fonctionne sous alpine), `200`.

- [ ] **Step 4: Captures — connecté**

```bash
cd apps/web
SHOT_EMAIL=smoke@test.dev SHOT_PASSWORD='Smoke12345!' OUT_DIR=screenshots/signed-in pnpm screenshots
```

Expected: 28 fichiers PNG, code de sortie 0 (aucun `THEME MISMATCH`). Ouvrir et regarder **chaque** capture : top bar, soulignement cyan de la section active, avatar, sidebar Docs groupée, footer ; en mobile ☰ visible, pas de débordement horizontal. Noter toute erreur console (les pages non migrées peuvent avoir un rendu imparfait — attendu, phase 2 — mais aucune erreur JS).

- [ ] **Step 5: Captures — Review Focus 1, 2, 5**

```bash
# 1. déconnecté : sidebar Docs = « Connecte-toi pour voir les docs », top bar = « Se connecter »
PAGES=/docs,/dashboard OUT_DIR=screenshots/signed-out pnpm screenshots
# 2. token invalide : doit retomber sur « Se connecter », pas un placeholder vide
SHOT_TOKEN=invalid PAGES=/docs,/dashboard OUT_DIR=screenshots/bad-token pnpm screenshots
# 5. API arrêtée : sidebar = « Impossible de charger les docs. », page intacte
docker compose stop api
SHOT_TOKEN=invalid PAGES=/docs OUT_DIR=screenshots/api-down pnpm screenshots
docker compose start api
```

Expected : pour chaque dossier, regarder les captures et confirmer le comportement indiqué en commentaire. Pour l'API arrêtée avec `SHOT_TOKEN=invalid` : `loadUser` échoue (réseau) et purge le token → sidebar « Connecte-toi » ; relancer aussi avec un token **valide** récupéré avant l'arrêt (`SHOT_TOKEN=<token>`) pour voir « Impossible de charger les docs. ».

- [ ] **Step 6: Parcours manuels + clavier (navigateur réel)**

Sur `http://localhost:3000` :
1. Inscription → redirection dashboard, avatar visible.
2. Déconnexion via le menu avatar → `/auth`, top bar sans avatar ; recharger `/docs` → sidebar « Connecte-toi ».
3. Connexion → créer un doc (`/docs/new`), il apparaît dans la sidebar sous `~/<tech>` ; ajouter une note ; créer une collection (`/collections/add`).
4. Clavier : Tab depuis le haut atteint logo → nav → Rechercher → thème → avatar, anneau cyan visible ; ⌘K/Ctrl+K ouvre la palette, ↑/↓ + Entrée ouvre un doc, Échap ferme ; Entrée/Espace sur l'avatar ouvre le menu, flèches pour naviguer.
5. Toggle thème → recharger → pas de flash de l'autre thème (dans les deux sens).

Expected : tout fonctionne ; noter tout écart dans la PR.

- [ ] **Step 7: Push et PR**

```bash
git push -u origin redesign/1-foundation
gh pr create --base main --title "Refonte DA — phase 1 : fondations (Tailwind v4, tokens, shell docs)" --body "$(cat <<'EOF'
## Résumé
- Tailwind v4 + tokens CSS (dark par défaut, accent cyan, Geist / Geist Mono), contrastes AA testés
- Thème sans flash (script inline dans <head>), préférence système ignorée
- Nouveau shell rendu serveur : top bar, menu avatar, palette ⌘K, tiroir mobile, footer une ligne
- Sidebars de section (arbre des docs par tech), `components/ui` restylé + DropdownMenu
- Supprime l'ancien shell, les CSS de layout/ui, le Toaster en double et le second système d'auth (`hooks/useAuth`)

Spec : `docs/superpowers/specs/2026-09-29-redesign-design.md`
Plan : `docs/superpowers/plans/2026-09-29-redesign-phase-1-foundation.md`

## Vérification
- `pnpm --filter web test` / `pnpm --filter web build` : OK
- Build Docker `web` : OK
- Captures dark/light × desktop/mobile : (joindre)
- Parcours manuels : inscription, connexion, doc, note, collection, déconnexion

## Limites connues (hors périmètre)
- Les pages elles-mêmes ne sont pas encore migrées (phase 2) : rendu imparfait attendu
- `GET /docs/all` limité à 20 docs (défaut `size=20` côté API)
- L'API fuit des sessions SQLAlchemy (`next(get_session())`) → 500 après ~15 requêtes

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Joindre à la PR une sélection de captures (dashboard + doc, dark/light, desktop/mobile). **Ne pas merger** sans accord de l'utilisateur (merge en squash, `--admin` nécessaire tant que le ruleset n'est pas modifié).
