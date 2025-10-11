# apps/web/Dockerfile

FROM node:20-alpine AS base
WORKDIR /repo
RUN apk add --no-cache libc6-compat && corepack enable

# ---------- Builder ----------
FROM base AS builder
COPY . .

ARG NEXT_PUBLIC_API_BASE=http://localhost:8000
ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}

# 1) Install racine si lockfile présent (sinon install standard)
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; else pnpm install; fi

# 2) Si PAS de workspace pnpm, on installe aussi dans apps/web (sinon rien à faire, pnpm gère)
RUN if [ ! -f pnpm-workspace.yaml ]; then \
      cd apps/web && (pnpm install --frozen-lockfile || pnpm install); \
    fi

RUN if [ -f pnpm-workspace.yaml ]; then \
      pnpm --filter web... add -D typescript@5.6.3 @types/react@18.3.3 @types/react-dom@18.3.0 @types/node@20.14.10 ; \
    else \
      cd apps/web && pnpm add -D typescript@5.6.3 @types/react@18.3.3 @types/react-dom@18.3.0 @types/node@20.14.10 ; \
    fi

# 3) Build de l'app web (workspace OU fallback)
RUN (pnpm --filter web... build) || (cd apps/web && pnpm run build)

# 4) Prépare un dossier de runtime /out/web :
#    - avec node_modules (workspace => deploy, sinon copie locale)
#    - plus le .next et public buildés
RUN mkdir -p /out/web

# Si workspace présent, on utilise pnpm deploy (prune propre)
RUN if [ -f pnpm-workspace.yaml ]; then \
      pnpm --filter web... deploy --prod /out/web; \
    else \
      mkdir -p /out/web && cp -r apps/web/node_modules /out/web/node_modules && \
      cp apps/web/package.json /out/web/package.json; \
    fi

RUN mkdir -p /out/web/.next /out/web/public && \
    cp -r apps/web/.next /out/web/.next && \
    cp -r apps/web/public /out/web/public && \
    if [ -f apps/web/next.config.js ]; then cp apps/web/next.config.js /out/web/next.config.js; fi

# ---------- Runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /out/web /app

EXPOSE 3000
USER 1001
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]
