---
title: Images Docker multi-étapes
slug: docker-images-multi-etapes
tech: docker
---

Un build multi-étapes utilise plusieurs `FROM` dans un même `Dockerfile` : une étape compile, une autre ne contient que le résultat. L'image finale est plus petite et n'embarque ni compilateur ni dépendances de build.

## Exemple : une application Go

```dockerfile
# Étape 1 : compilation
FROM golang:1.22 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/server ./cmd/server

# Étape 2 : image d'exécution minimale
FROM gcr.io/distroless/static-debian12
COPY --from=build /out/server /server
USER nonroot:nonroot
ENTRYPOINT ["/server"]
```

`COPY --from=build` copie uniquement le binaire depuis l'étape nommée `build`.

## Exemple : une application Node

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/index.js"]
```

L'étape `runtime` réinstalle uniquement les dépendances de production.

## Profiter du cache

Docker réutilise une couche tant que ses entrées n'ont pas changé. Copie d'abord les fichiers de dépendances, installe, puis copie le reste du code : modifier un fichier source n'invalide alors pas l'installation des dépendances.

Avec BuildKit (activé par défaut dans les versions récentes), un cache de paquets peut persister entre les builds :

```dockerfile
RUN --mount=type=cache,target=/root/.npm npm ci
```

## Construire une étape précise

```bash
docker build -t myapp .                    # image finale
docker build --target build -t myapp:build .   # s'arrête à l'étape build
```

Cibler une étape intermédiaire est utile pour lancer les tests dans l'environnement de compilation.

## Comparer les tailles

```bash
docker images myapp
docker history myapp
```

`docker history` montre la taille de chaque couche et aide à repérer ce qui alourdit l'image.

## Bonnes pratiques

- Ajoute un `.dockerignore` (`node_modules`, `.git`, fichiers de build locaux) pour réduire le contexte envoyé au démon.
- Épingle les versions des images de base (`node:20-alpine`, pas `node:latest`).
- Termine par un utilisateur non root (`USER node`, `USER nonroot`).
- Une seule responsabilité par image : l'application, pas la base de données.
- Nomme les étapes (`AS build`) plutôt que de les référencer par index.
