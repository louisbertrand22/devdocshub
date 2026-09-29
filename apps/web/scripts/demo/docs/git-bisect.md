---
title: Trouver un bug avec git bisect
slug: git-bisect
tech: git
---

`git bisect` trouve le commit qui a introduit une régression par recherche dichotomique : sur 1 000 commits, une dizaine de tests suffisent. Il faut seulement connaître un commit « bon » et un commit « mauvais ».

## Session manuelle

```bash
git bisect start
git bisect bad                 # le commit courant a le bug
git bisect good v2.3.0         # cette version fonctionnait
```

Git se place au milieu de l'intervalle. Teste, puis indique le résultat :

```bash
git bisect good    # le bug n'est pas là
git bisect bad     # le bug est là
```

Répète jusqu'à ce que Git affiche :

```text
3f9c2a1 is the first bad commit
```

Termine la session pour revenir où tu étais :

```bash
git bisect reset
```

## Automatiser avec un script

Si un script peut détecter le bug, Git fait tout seul :

```bash
git bisect start HEAD v2.3.0
git bisect run npm test -- --run tests/profile.test.ts
```

Le script doit renvoyer :

| Code de sortie | Signification |
|---|---|
| `0` | Commit bon |
| `1` à `127` (sauf 125) | Commit mauvais |
| `125` | Commit impossible à tester, à ignorer |

Un script dédié permet de cibler précisément la régression :

```bash
#!/usr/bin/env bash
npm ci --silent || exit 125     # build impossible : on ignore ce commit
npm test -- --run tests/profile.test.ts
```

## Ignorer un commit

Quand un commit ne compile pas pour une raison sans rapport :

```bash
git bisect skip
```

## Termes personnalisés

Pour chercher un changement qui n'est pas un bug (par exemple l'arrivée d'une amélioration de performance), renomme les états :

```bash
git bisect start --term-old=lent --term-new=rapide
git bisect rapide
git bisect lent v1.0.0
```

## Garder une trace

```bash
git bisect log > bisect.log      # historique de la session
git bisect replay bisect.log     # la rejouer plus tard
```

## Conseils

- Écris le test qui reproduit le bug **avant** de lancer le bisect : il sert ensuite de test de non-régression.
- Travaille sur un arbre propre (`git stash` au besoin), sinon les changements locaux faussent les tests.
- Si l'historique contient beaucoup de merges, `git bisect start --first-parent` ne teste que la branche principale.
