---
title: Nettoyer son historique avec le rebase interactif
slug: git-rebase-interactif
tech: git
---

`git rebase -i` réécrit une suite de commits avant de les partager : fusionner des commits de correction, reformuler des messages, réordonner ou supprimer. À réserver aux commits **pas encore poussés** ou à une branche personnelle.

## Lancer le rebase

Pour retravailler les trois derniers commits :

```bash
git rebase -i HEAD~3
```

Pour tout ce qui a été fait depuis la séparation d'avec `main` :

```bash
git rebase -i main
```

Git ouvre l'éditeur avec la liste des commits, du plus ancien au plus récent :

```text
pick 1a2b3c4 Ajoute la page de profil
pick 5d6e7f8 Corrige une faute
pick 9a0b1c2 Corrige le test du profil
```

## Les actions

| Action | Effet |
|---|---|
| `pick` | Garde le commit tel quel |
| `reword` | Garde le contenu, modifie le message |
| `edit` | S'arrête sur le commit pour le modifier |
| `squash` | Fusionne avec le commit précédent, combine les messages |
| `fixup` | Fusionne avec le commit précédent en gardant le message de celui-ci |
| `drop` | Supprime le commit |

Changer l'ordre des lignes réordonne les commits.

## Fusionner les corrections

```text
pick 1a2b3c4 Ajoute la page de profil
fixup 5d6e7f8 Corrige une faute
fixup 9a0b1c2 Corrige le test du profil
```

Résultat : un seul commit « Ajoute la page de profil ».

## Autosquash

Crée les commits de correction en désignant leur cible :

```bash
git commit --fixup=1a2b3c4
git rebase -i --autosquash main
```

Git place et marque automatiquement les `fixup!` au bon endroit. Pour l'activer par défaut :

```bash
git config --global rebase.autoSquash true
```

## Gérer un conflit

Si une étape échoue, Git s'arrête :

```bash
git status                 # fichiers en conflit
# … corriger les fichiers …
git add chemin/du/fichier
git rebase --continue
```

À tout moment, `git rebase --abort` revient à l'état d'avant le rebase.

## Récupérer après une erreur

Le rebase ne détruit rien immédiatement : l'ancien historique reste dans le reflog.

```bash
git reflog
git reset --hard HEAD@{5}   # l'entrée d'avant le rebase
```

## Pousser une branche réécrite

Une branche déjà poussée puis réécrite doit être poussée en force. Préfère la variante protégée, qui refuse d'écraser des commits que tu n'as pas vus :

```bash
git push --force-with-lease
```

Ne réécris jamais une branche partagée comme `main`.
