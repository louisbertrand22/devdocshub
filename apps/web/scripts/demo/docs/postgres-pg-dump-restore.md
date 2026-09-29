---
title: Sauvegarder et restaurer avec pg_dump
slug: postgres-pg-dump-restore
tech: postgres
---

`pg_dump` exporte une base PostgreSQL sans l'arrêter ; `pg_restore` (ou `psql`) la réimporte. La sauvegarde est cohérente : elle reflète l'état de la base au démarrage de la commande.

## Format personnalisé ou SQL ?

| Format | Option | Restauration | Atout |
|---|---|---|---|
| SQL brut | `-Fp` (défaut) | `psql` | Lisible, modifiable à la main |
| Personnalisé | `-Fc` | `pg_restore` | Compressé, restauration sélective |
| Répertoire | `-Fd` | `pg_restore` | Export et import en parallèle (`-j`) |

Le format personnalisé est le bon choix par défaut.

## Sauvegarder une base

```bash
pg_dump -h localhost -U app -d app -Fc -f app_$(date +%F).dump
```

Pour éviter de taper le mot de passe, utilise un fichier `~/.pgpass` (permissions `600`) :

```text
localhost:5432:app:app:motdepasse
```

Dans un conteneur Docker :

```bash
docker compose exec -T db pg_dump -U app -d app -Fc > app.dump
```

L'option `-T` désactive le pseudo-terminal, indispensable pour rediriger la sortie binaire.

## Restaurer

Crée une base vide, puis restaure :

```bash
createdb -h localhost -U app app_restore
pg_restore -h localhost -U app -d app_restore --no-owner app.dump
```

- `--no-owner` évite les erreurs si les rôles d'origine n'existent pas sur le serveur cible.
- `--clean --if-exists` supprime les objets existants avant de les recréer, pour restaurer par-dessus une base existante.
- `-j 4` restaure avec quatre processus (formats personnalisé et répertoire).

Pour un dump SQL brut :

```bash
psql -h localhost -U app -d app_restore -f app.sql
```

## Restauration sélective

Liste le contenu du dump, puis ne restaure qu'une table :

```bash
pg_restore -l app.dump | less
pg_restore -h localhost -U app -d app_restore -t users app.dump
```

## Rôles et paramètres globaux

`pg_dump` ne sauvegarde qu'une base : les rôles et les tablespaces sont globaux. Exporte-les à part :

```bash
pg_dumpall -h localhost -U postgres --globals-only > globals.sql
```

## Automatiser

Une tâche planifiée simple, avec rotation sur 14 jours :

```bash
#!/usr/bin/env bash
set -euo pipefail
dest=/var/backups/postgres
mkdir -p "$dest"
pg_dump -h localhost -U app -d app -Fc -f "$dest/app_$(date +%F).dump"
find "$dest" -name 'app_*.dump' -mtime +14 -delete
```

## Vérifier ses sauvegardes

Une sauvegarde qui n'a jamais été restaurée n'est pas une sauvegarde. Restaure régulièrement dans une base de test et lance une requête de contrôle :

```bash
psql -h localhost -U app -d app_restore -c "SELECT count(*) FROM users;"
```
