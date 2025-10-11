# ENV

The frontend reads environment variables via `apps/web/env.mjs`:

- `NEXT_PUBLIC_API_BASE` — API base URL (default `http://localhost:8000`)
- `NEXTAUTH_SECRET` — if enabling NextAuth (optional)
- `NEXT_PUBLIC_APP_NAME` — branding (default `DevDocsHub`)

Create `.env.local` in `apps/web/`:

```
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_APP_NAME=DevDocsHub
```
