# Refonte design & DA — DevDocsHub (`apps/web`)

- **Date :** 2026-09-29
- **Statut :** validé en brainstorming, en attente de relecture de la spec
- **Périmètre :** frontend `apps/web` uniquement — aucune modification de l'API

## 1. Objectif

Remplacer le style actuel (dégradés bleu/violet par défaut de Tailwind, couleurs hex en dur dans ~20 fichiers CSS, police système) par une direction artistique cohérente de type **« dev tool » / site de documentation**, inspirée de GitHub Docs et react.dev :

- **dark par défaut**, light mode de première classe ;
- **un seul accent : cyan** ;
- **Geist + Geist Mono**, le mono servant de marqueur « dev » (logo, métadonnées, groupes de nav) ;
- **layout de site de docs** : nav principale en haut, sidebar contextuelle, sommaire à droite.

**Critères de succès**

1. Plus aucune couleur hex ni `style={{…}}` de couleur dans le TSX ; toutes les couleurs passent par les tokens.
2. Toutes les pages rendent correctement en dark et light, desktop (1440px) et mobile (390px).
3. Aucun flash de thème au chargement.
4. Contrastes texte ≥ 4.5:1 (WCAG AA) dans les deux thèmes.
5. Les parcours existants (inscription, connexion, créer doc/note/collection, déconnexion) fonctionnent comme avant.

## 2. Constat de départ

- **Tailwind n'est pas installé** (ni dépendance, ni `postcss.config`, ni config). Les directives `@tailwind`/`@apply` de `styles/globals.css` et les classes utilitaires présentes dans **21 des 48 fichiers TSX** sont donc inertes.
- Le style réel vient de ~20 fichiers `*.css` / `*.module.css` (~3 800 lignes) avec couleurs codées en dur (`#3b82f6` ×19, `#8b5cf6` ×11…).
- `components/ui` (Button, Card, Dialog, Select, Tabs…) : primitives interactives sur Radix, styles en CSS modules ; `class-variance-authority` est déjà en dépendance et servira aux variantes Tailwind.
- `Shell` est chargé avec `dynamic(..., { ssr: false })` → toute l'app rend côté client.
- `<Toaster />` est rendu deux fois (`app/providers.tsx` et `components/layout/Shell.tsx`).
- `useTheme` part de `"light"` puis bascule dans un `useEffect` → flash de thème.
- La recherche du header est un `TODO` vide.

## 3. Décisions

| Sujet | Décision |
|---|---|
| Direction | Dev tool / docs (GitHub Docs, react.dev) |
| Thème | Dark par défaut ; light disponible ; préférence système **ignorée** |
| Accent | Cyan |
| Typo | Geist (texte) + Geist Mono (code, logo, méta, groupes de nav) |
| Layout | Site de docs : top nav + sidebar contextuelle + sommaire droit |
| Stack style | Tailwind v4 + tokens en variables CSS ; on garde et restyle `components/ui` |
| Recherche | Palette ⌘K côté client uniquement (pas de Meilisearch) |
| Livraison | 3 phases, 1 PR chacune |

## 4. Design tokens

### 4.1 Couleurs

Définies comme variables CSS sur `:root` (light) et `.dark` (dark), exposées à Tailwind via `@theme inline` (`bg-bg`, `text-fg-muted`, `border-border`, `bg-accent`…).

| Token | Dark (défaut) | Light | Usage |
|---|---|---|---|
| `bg` | `#0f1115` | `#ffffff` | fond de page |
| `surface` | `#161a20` | `#f6f8fa` | top bar, code, cartes |
| `surface-2` | `#1c2129` | `#eef1f4` | hover, code inline |
| `border` | `#262b33` | `#d8dee4` | toutes les bordures |
| `fg` | `#e6e8eb` | `#1f2328` | texte principal |
| `fg-muted` | `#8b93a1` | `#59636e` | méta, nav inactive |
| `accent` | `#5ccfe6` | `#0e7490` | liens, item actif, bouton primaire, focus |
| `accent-fg` | `#051418` | `#ffffff` | texte sur bouton primaire |
| `accent-subtle` | `rgb(92 207 230 / 0.10)` | `rgb(14 116 144 / 0.08)` | fond d'item actif, tags |
| `accent-border` | `rgb(92 207 230 / 0.35)` | `rgb(14 116 144 / 0.30)` | bordure de tags, soulignement de liens |
| `success` | `#3fb950` | `#1a7f37` | toasts, callouts |
| `warning` | `#d29922` | `#9a6700` | toasts, callouts |
| `danger` | `#f85149` | `#cf222e` | erreurs, actions destructives |

Les couleurs de statut restent distinctes de l'accent.

### 4.2 Typographie

- Polices via le paquet `geist` + `next/font` (auto-hébergées) : variables `--font-geist-sans`, `--font-geist-mono`, mappées sur `font-sans` / `font-mono`.
- Échelle : UI 13px · lecture 15px (line-height 1.7) · h3 16px · h2 20px · h1 28px, titres `tracking-tight`, poids 600–700.
- Mono utilisé pour : code, logo, fil d'Ariane, métadonnées, groupes de sidebar (`~/docker`), badges, raccourcis clavier.

### 4.3 Forme

- Rayons : 6px (boutons, inputs), 10px (cartes, dialogs).
- Séparation par bordures 1px ; ombres réservées aux overlays (menus, dialogs, ⌘K).
- Focus : anneau 2px `accent` avec offset, visible sur tous les éléments interactifs.

### 4.4 Mécanisme de thème

- Classe `dark` sur `<html>` ; Tailwind v4 `@custom-variant dark (&:where(.dark, .dark *));`.
- Script inline bloquant dans `<head>` (dans `app/layout.tsx`) : lit `localStorage.theme` ; si `"light"` → pas de classe, sinon → ajoute `dark`. Exécuté avant le premier paint.
- `hooks/useTheme.tsx` réécrit : état initial lu depuis la classe de `<html>`, `setTheme`/`toggleTheme` mettent à jour la classe + `localStorage`.
- `<html suppressHydrationWarning>` conservé.

## 5. Shell & navigation

### 5.1 Structure

`Shell` devient un **server component** ; les parties interactives sont des îlots client (`TopBar` menus, `ThemeToggle`, `CommandPalette`, `MobileNav`, `TocScrollSpy`). Suppression du `dynamic(..., { ssr: false })`.

Le layout est porté par des layouts de route :

- `app/layout.tsx` — `<html>`, polices, script de thème, `Providers`, `TopBar`, `Footer`.
- `app/docs/layout.tsx`, `app/notes/layout.tsx`, `app/collections/layout.tsx` — ajoutent la sidebar contextuelle de leur section.
- `app/auth` — pas de TopBar ni footer (route group `(bare)` ou condition dans le layout).

### 5.2 Top bar

Sticky, 56px, fond `surface`, bordure basse :

`devdocs`**`hub`** (Geist Mono, « hub » en accent) · **Dashboard · Docs · Notes · Collections** (actif = texte `fg` + soulignement accent) · espace · bouton **Rechercher… ⌘K** · toggle thème · 🔔 · **avatar**.

- **Menu avatar** (Radix DropdownMenu) : Mon profil · Utilisateurs (si `role === "admin"`) · Se déconnecter. Non connecté → bouton « Se connecter ».
- **Mobile < 768px** : liens de nav + sidebar contextuelle dans un tiroir ☰.

### 5.3 Sidebar contextuelle (240px)

- **Docs** : arbre groupé par `doc.tech` (`~/docker`, `~/nginx`…) depuis `GET /docs/all` ; doc courant = fond `accent-subtle` + bordure gauche accent.
- **Notes** : filtres Toutes / Épinglées / Par doc.
- **Collections** : liste des collections.
- Pas de sidebar sur Dashboard, Profil, Utilisateurs, pages statiques (contenu centré, largeur max).

### 5.4 Sommaire droit (200px)

Uniquement sur `/docs/[slug]`. Généré depuis les h2/h3 du markdown (ids slugifiés), section courante mise en évidence via `IntersectionObserver`. Masqué sous 1280px.

### 5.5 Palette ⌘K

Radix Dialog ouvert par ⌘K / Ctrl+K ou le bouton de recherche. Filtre côté client sur titre + `tech` des docs (données de `/docs/all`, chargées à l'ouverture) + raccourcis de pages (« Nouvelle note », « Collections »…). Navigation ↑/↓, Entrée, Échap.

### 5.6 Footer

Une ligne fine en `fg-muted` : © · À propos · Confidentialité · CGU · Licences · GitHub. Remplace le footer 4 colonnes.

## 6. Composants UI (`components/ui`)

Même noms de fichiers et mêmes APIs publiques (props, variantes) ; styles migrés en utilitaires Tailwind, `*.module.css` supprimés.

- **Button** : variantes existantes conservées (`primary` · `secondary` · `outline` · `ghost`, `default` = alias de `primary`) + nouvelle `danger` ; tailles `sm` · `md` · `icon` inchangées. Aucun appel existant à modifier.
- **Input / Textarea / Select** : fond `bg`, bordure `border`, focus bordure + anneau accent.
- **Card** : `surface`, bordure 1px, rayon 10px, sans ombre.
- **Badge** : pastille mono ; variantes `accent`, `neutral`, `success`, `warning`, `danger`.
- **Tabs, Dialog, Checkbox, Separator, Label, Toaster** : restylés avec les tokens.
- **Nouveaux** : `dropdown-menu.tsx` (Radix, dépendance `@radix-ui/react-dropdown-menu`), `command-palette.tsx`.

## 7. Pages

### Phase 2 — cœur & compte

- **`/docs/[slug]`** : fil d'Ariane mono, h1, ligne méta mono (`updated 2d ago · @auteur · #tech`), contenu markdown en colonne ~72ch, blocs de code sur `surface` avec label de langage + bouton **Copier**, section **Notes** du doc en bas, sommaire à droite.
- **`/docs`, `/notes`, `/collections`** : listes en lignes bordées (titre, badge `tech`, date mono), action primaire en haut à droite, état vide avec icône + CTA.
- **`/docs/new`, `/notes/new`, `/collections/add`** : formulaire centré (max 640px), labels au-dessus, erreurs inline en `danger`.
- **`/dashboard`** : 3 compteurs mono (docs, notes, collections), « Docs récents », « Notes épinglées ».
- **`/profile`** : carte profil. **`/users`** : tableau au style des listes.
- **`/auth`** : carte centrée avec logo sur fond `bg`, sans shell.

### Phase 3 — pages statiques

Template `components/layout/ProsePage.tsx` (titre, chapeau, contenu prose) appliqué à `/about`, `/blog`, `/careers`, `/contact`, `/cookies`, `/licenses`, `/privacy`, `/terms`. Le contenu textuel existant est conservé.

## 8. Phases de livraison

| Phase | Branche | Contenu |
|---|---|---|
| 1 — Fondations | `redesign/1-foundation` | Tailwind v4 + PostCSS, tokens, Geist, script de thème + `useTheme`, `globals.css` réécrit, Shell SSR, TopBar, menu avatar, ⌘K, footer, sidebars contextuelles (coquille), `components/ui` restylé, suppression du `Toaster` en double et des CSS de layout |
| 2 — Pages | `redesign/2-pages` | Toutes les pages cœur & compte (§7), sommaire droit, bouton Copier, suppression des CSS de pages, suppression des couleurs/`style` inline |
| 3 — Statiques | `redesign/3-static` | `ProsePage` + 8 pages statiques |

Chaque phase part de `main` après merge de la précédente ; merge en squash (historique linéaire imposé sur `main`). Entre la phase 1 et la phase 2, les pages non encore migrées peuvent avoir un rendu imparfait mais restent fonctionnelles.

## 9. Vérification (par phase)

`apps/web` n'a pas de tests ; la refonte étant visuelle, pas de suite de tests unitaires ajoutée. Chaque PR doit passer :

1. `pnpm build` sans erreur TypeScript.
2. Stack Docker Compose + navigateur headless : captures de **chaque page touchée** en dark et light, 1440px et 390px, relues avant la PR et jointes à la PR.
3. Parcours manuels : inscription, connexion, créer un doc, ajouter une note, créer une collection, déconnexion.
4. Contraste des paires de tokens texte/fond ≥ 4.5:1 (script de vérification) ; navigation clavier complète (⌘K, menu avatar, formulaires) ; focus visible.
5. Rechargement dans chaque thème sans flash.

## 10. Hors périmètre

- Recherche Meilisearch / plein texte.
- PR #21, #19, #13.
- Nouvelles fonctionnalités et toute modification de l'API.
- Ajout d'un framework de tests frontend.

## 11. Risques

- **Tailwind v4 sur Next 14** : utiliser `@tailwindcss/postcss` ; vérifier le build Docker (`output: "standalone"`) dès la phase 1.
- **Classes Tailwind aujourd'hui inertes** dans 21 fichiers : elles vont s'activer en phase 1 et peuvent modifier le rendu de pages pas encore migrées — acceptable, corrigé en phase 2.
- **Review des PR** : les PR seront de l'utilisateur, qui ne peut pas s'auto-approuver ; merge via `--admin` sauf changement du ruleset.
