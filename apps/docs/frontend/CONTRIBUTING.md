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

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:

- **CI Pipeline**: Runs on every push and pull request
  - Frontend: TypeScript type checking and Next.js build
  - Backend: pytest with coverage reporting
  - Docker: Build validation for both services
  - Integration: Full stack testing with Docker Compose

- **Pull Request Checks**: All tests must pass before merging
- **Documentation**: See `/docs/CICD.md` for detailed workflow information

Before submitting a PR, ensure your changes pass locally:

```bash
# Frontend checks
pnpm --filter web exec tsc --noEmit
pnpm build

# Backend checks
cd services/api
PYTHONPATH=. python -m pytest -v
```
