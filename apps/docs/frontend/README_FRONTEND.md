# DevDocsHub Frontend

Modern, type-safe frontend for the DevDocsHub API. Built with **Next.js + TypeScript + Tailwind + shadcn/ui + Zustand + Framer Motion** in a Turborepo-style monorepo.

- **Apps**: `apps/web` (Next.js app)
- **Packages**: `packages/ui` (shared component library), `packages/schemas` (zod types and API client)
- **API Base**: defaults to `http://localhost:8000`
- **Date**: 2025-10-11

## Quick Start

```bash
# at repo root
pnpm i
pnpm dev       # starts apps/web at http://localhost:3000
```

Make sure your backend is up at `http://localhost:8000`.

## Monorepo Layout

```
devdocshub/
├─ apps/
│  └─ web/                 # Next.js app
│     ├─ app/              # App Router pages
│     ├─ components/       # App-specific UI
│     ├─ lib/              # helpers (api, store, utils)
│     ├─ public/           # static assets
│     ├─ styles/           # globals.css, tailwind layers
│     ├─ env.mjs           # typed env loader (dotenv)
│     ├─ next.config.js
│     ├─ package.json
│     └─ tsconfig.json
├─ packages/
│  ├─ ui/                  # shadcn/ui + shared components
│  │  ├─ src/
│  │  ├─ index.ts
│  │  ├─ tailwind.config.ts
│  │  └─ package.json
│  └─ schemas/             # zod schemas + openapi client
│     ├─ src/
│     │  ├─ api/           # typed client (fetch wrapper)
│     │  ├─ zod/           # DTOs (Doc, Note, Collection, User, Auth)
│     │  └─ index.ts
│     └─ package.json
├─ docs/
│  └─ frontend/            # This documentation
├─ turbo.json
├─ package.json
├─ pnpm-workspace.yaml
├─ tsconfig.base.json
└─ .eslintrc.cjs
```

## Tech Decisions

- **Next.js** (streaming, RSC, file-based routing)
- **Zustand** for lightweight state
- **zod** for runtime validation + type inference
- **OpenAPI types** generated into `packages/schemas` (optional step)
- **shadcn/ui** for accessible components
- **Tailwind** for design system primitives
- **Framer Motion** for subtle motion

See also: `ENV.md`, `API_CONTRACT.md`, `COMPONENTS.md`, `DEPLOY.md`.
