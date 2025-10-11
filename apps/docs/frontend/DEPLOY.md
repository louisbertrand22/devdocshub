# DEPLOY

## Dev

```bash
pnpm i
pnpm dev # http://localhost:3000
```

## Build

```bash
pnpm build
pnpm start
```

## Docker (example)

`apps/web/Dockerfile`:

```
# Build
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN pnpm i --frozen-lockfile
RUN pnpm -w build

# Run
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/web/.next /app/apps/web/.next
COPY --from=build /app/apps/web/public /app/apps/web/public
COPY --from=build /app/apps/web/package.json /app/apps/web/package.json
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate && pnpm i --prod --filter web...
EXPOSE 3000
CMD ["pnpm","--filter","web","start"]
```

## Nginx

Point `location /` to the Next.js app and proxy `/api` if you choose to route through the frontend domain, or hit the API directly via `NEXT_PUBLIC_API_BASE`.
