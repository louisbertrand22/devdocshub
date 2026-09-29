---
title: Docker Compose en pratique
slug: docker-compose-en-pratique
tech: docker
---

Docker Compose décrit une application multi-conteneurs dans un fichier `compose.yaml` et la pilote avec quelques commandes. Depuis Compose V2, la commande est `docker compose` (sans tiret), intégrée au CLI Docker.

## Un premier fichier

```yaml
services:
  web:
    build: .
    ports:
      - "8080:8000"
    environment:
      DATABASE_URL: postgresql://app:secret@db:5432/app
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      retries: 10

volumes:
  pgdata:
```

Les services se joignent par leur nom : depuis `web`, la base est accessible à l'hôte `db`.

## Les commandes du quotidien

```bash
docker compose up -d          # démarre en arrière-plan
docker compose ps             # état des services
docker compose logs -f web    # suit les logs d'un service
docker compose exec db psql -U app   # ouvre un shell dans un conteneur
docker compose down           # arrête et supprime les conteneurs
docker compose down -v        # … et les volumes (données perdues)
```

Après une modification du `Dockerfile`, reconstruis l'image :

```bash
docker compose up -d --build web
```

## Attendre qu'un service soit prêt

`depends_on` seul garantit l'ordre de démarrage, pas que la base accepte des connexions. Avec `condition: service_healthy`, Compose attend que le `healthcheck` de `db` réussisse avant de lancer `web`.

## Variables et fichier .env

Compose lit automatiquement un fichier `.env` placé à côté de `compose.yaml` pour interpoler les variables :

```yaml
services:
  web:
    image: "myapp:${APP_TAG:-latest}"
```

Pour injecter des variables dans le conteneur lui-même, utilise `env_file` :

```yaml
services:
  web:
    env_file: .env.web
```

Ne commite pas les fichiers contenant des secrets ; fournis plutôt un `.env.example`.

## Surcharger pour le développement

Compose fusionne automatiquement `compose.override.yaml` s'il existe. Pratique pour monter le code source en développement sans toucher au fichier principal :

```yaml
services:
  web:
    volumes:
      - ./src:/app/src
    command: ["python", "-m", "app", "--reload"]
```

Pour une autre combinaison explicite :

```bash
docker compose -f compose.yaml -f compose.prod.yaml up -d
```

## Profils

Un service marqué d'un profil ne démarre que si ce profil est demandé :

```yaml
services:
  adminer:
    image: adminer
    profiles: ["tools"]
```

```bash
docker compose --profile tools up -d
```

## Pièges fréquents

- Un port déjà utilisé sur l'hôte fait échouer `up` : change la partie gauche de `"8080:8000"`.
- `down -v` efface les volumes nommés : garde-le pour repartir d'une base vide.
- Le nom du projet (préfixe des conteneurs et volumes) vient du dossier ; fixe-le avec `-p` ou `name:` en tête de fichier.
