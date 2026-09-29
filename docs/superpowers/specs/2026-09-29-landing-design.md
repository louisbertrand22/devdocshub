# Landing page — DevDocsHub (`apps/web`, route `/`)

- **Date :** 2026-09-29
- **Statut :** validé en brainstorming (maquettes « hero B » + page complète), en attente de relecture de la spec
- **Périmètre :** `apps/web` + un stack Docker de démonstration jetable ; aucune modification de l'API

## 1. Objectif

Une **vitrine publique** qui convainc des développeurs qui ne connaissent pas DevDocsHub de **créer un compte**.

- Affichée à `/` pour les **visiteurs non connectés** uniquement ; un utilisateur connecté arrive directement sur `/dashboard`.
- Ne présente **que des fonctionnalités réelles** de l'app (pas de témoignages, chiffres ou tarifs inventés).
- La capture d'écran du hero montre **de la vraie documentation technique**, pas des données de test.

**Critères de succès**

1. `/` non connecté : landing complète, rendue côté serveur (titre présent dans le HTML sans JS).
2. `/` connecté : redirection vers `/dashboard` sans que la landing soit visible.
3. « Créer un compte » ouvre directement l'onglet d'inscription de `/auth`.
4. Captures du hero générées par une commande reproductible, à partir de guides réels, sur une base qui ne contient que ces guides.
5. Rendu correct en dark/light, desktop/mobile ; aucune erreur JS ; aucun débordement horizontal.

## 2. Contenu (validé sur maquette)

1. **Barre** : logo `devdocs`**`hub`** · ancres « Fonctionnalités », « Comment ça marche » · « Se connecter » · bouton « Créer un compte ».
2. **Hero (mise en page B, deux colonnes)** — à gauche : pastille mono `docs · notes · collections`, titre « Ta documentation technique, *enfin au même endroit.* » (fin en accent), sous-titre « Rédige tes docs en markdown, annote-les, range-les par techno et retrouve n'importe quoi en une touche. », boutons « Créer un compte gratuit » / « Se connecter », mention mono « gratuit · sans carte bancaire » ; à droite : capture de l'app dans un cadre de fenêtre, débordant du bord droit.
3. **Fonctionnalités** (`~/fonctionnalités`, « Pensé pour la doc que tu écris vraiment ») — 4 cartes, chacune avec un mini-visuel mono reproduisant le rendu réel : *Markdown avec sommaire* · *Tout retrouver avec ⌘K* · *Rangé par techno* · *Notes et collections*.
4. **Comment ça marche** (`~/comment-ça-marche`, « Trois gestes, c'est tout ») — 01 Écris · 02 Annote · 03 Retrouve.
5. **Appel final** — « Commence ta base de docs maintenant. », « Gratuit, sans carte bancaire. Thème sombre ou clair. », mêmes boutons.
6. **Footer** existant (`components/layout/footer.tsx`).

« Gratuit » est exact : l'app n'a pas de paiement.

## 3. Route, rendu, habillage

- `app/page.tsx` : remplace la redirection serveur vers `/dashboard` par la landing (composant serveur), avec `metadata` propres (titre, description, Open Graph utilisant `/landing/hero-dark.png`).
- **Rendu serveur** : `SiteChrome` traite `/` comme `/auth` — ni barre de l'app, ni montage différé (le contenu doit être dans le HTML initial) ; la landing inclut sa propre barre et le footer.
- **Utilisateurs connectés** : le token vit dans `localStorage` (invisible au serveur).
  - Le script inline de `<head>` (celui du thème) vérifie aussi `location.pathname === "/"` et pose `data-authed` sur `<html>` si un token est présent ; une règle CSS masque alors le contenu de la landing (pas de flash).
  - Un îlot client (`LandingRedirect`) fait `router.replace("/dashboard")` si un token est présent.
  - Si le token est invalide, le dashboard purge le token (comportement existant) et l'utilisateur est renvoyé vers `/auth`.
- **Inscription directe** : `/auth?mode=register` ouvre l'onglet « Créer un compte » (`auth-panel.tsx` lit le paramètre, sous `<Suspense>`).

## 4. Composants

`apps/web/components/landing/` — composants serveur, tokens uniquement, aucun appel API :

| Composant | Rôle |
|---|---|
| `landing-nav.tsx` | Barre de la landing |
| `hero.tsx` | Hero B + images dark/light |
| `features.tsx` | 4 fonctionnalités + mini-visuels |
| `steps.tsx` | « Trois gestes » |
| `final-cta.tsx` | Appel final |
| `landing-redirect.tsx` | Îlot client : redirection des connectés |

Images : `public/landing/hero-dark.png` et `hero-light.png`, affichées selon le thème (`dark:block hidden` / `dark:hidden`) via `next/image` (dimensions fixes, `priority`).

## 5. Contenu démo et capture

**Contrainte** : les docs n'ont pas de propriétaire côté API (`/docs/all` renvoie toute la base). Un compte démo ne suffit pas : il faut **une base dédiée**.

- `docker-compose.demo.yml` (projet `devdocshub-demo`) : Postgres sans port exposé, API sur **:8100**, web sur **:3100** construit avec `NEXT_PUBLIC_API_BASE=http://localhost:8100`. Aucun impact sur le stack habituel.
- `apps/web/scripts/demo/docs/*.md` : **10 guides réels**, avec en-tête `title`, `slug`, `tech` :

| Techno | Guide |
|---|---|
| `docker` | Docker Compose en pratique · Images multi-étapes |
| `nginx` | Reverse proxy et TLS avec Let's Encrypt |
| `postgres` | Sauvegarder et restaurer avec pg_dump |
| `git` | Rebase interactif · Trouver un bug avec git bisect |
| `python` | Environnements virtuels et pyproject.toml |
| `linux` | Écrire un service systemd · Clés et config SSH |
| `http` | Déboguer une API avec curl |

  Contenu exact et vérifiable (commandes fonctionnelles), 60–120 lignes, au moins deux titres `##` chacun.
- `pnpm --filter web landing:capture` : démarre le stack démo sur une base vide → crée `demo@devdocshub.dev` → importe les guides → ajoute quelques notes (dont épinglées) et une collection → ouvre « Reverse proxy et TLS avec Let's Encrypt » (1440×900) en dark puis light → écrit les deux PNG → `down -v`.

## 6. Vérification

- **Unitaire (`node --test`)** : parsing des en-têtes de guides ; validité de chaque guide (champs requis, slug unique, techno en minuscules, ≥ 2 titres `##`) ; décision de masquage/redirection selon la valeur de token.
- **E2E (`flows.mjs`)**, section « landing », écrite d'abord (RED) : non connecté → un `h1`, CTA vers `/auth?mode=register` qui ouvre l'onglet inscription, ancres fonctionnelles, image du hero chargée dans le thème courant ; connecté → arrivée sur `/dashboard` sans landing visible ; HTML serveur de `/` contient le titre.
- **Captures** : `/` dark/light × desktop/mobile, 0 erreur JS / mauvais thème / débordement, relues.
- **Pipeline** : `landing:capture` exécuté ; images relues puis commitées.

## 7. Livraison

Branche `feat/landing`, PR vers `main`, indépendante de #79. Pas de merge sans accord.

## 8. Hors périmètre

Pages marketing supplémentaires, tarifs, analytics, formulaire de contact, internationalisation, propriété des docs côté API.
