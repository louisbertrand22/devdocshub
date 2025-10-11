# CONTRIBUTING

- Use pnpm and Turborepo
- Keep UI primitives in `packages/ui`
- Keep API types and client in `packages/schemas`
- Prefer zod schemas, add `infer` types for DTOs
- One responsibility per component; keep forms small
- Write tests for data utilities in `apps/web/lib`

## Scripts

- `pnpm dev` – run web
- `pnpm build` – build all packages
- `pnpm lint` – eslint
- `pnpm test` – vitest (suggested)
