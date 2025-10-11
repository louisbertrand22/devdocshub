# COMPONENTS

## packages/ui

A shared component library with shadcn/ui primitives plus custom wrappers.

Suggested structure:
```
packages/ui/
├─ src/
│  ├─ components/
│  │  ├─ data-table.tsx
│  │  ├─ header.tsx
│  │  ├─ sidebar.tsx
│  │  ├─ page-shell.tsx
│  │  └─ forms/
│  │     ├─ doc-form.tsx
│  │     └─ collection-form.tsx
│  ├─ hooks/
│  │  └─ use-toast.ts
│  └─ index.ts
```

Export only via `index.ts` to keep imports clean.

## apps/web components

- `components/DevDocsHubApp.tsx` — dashboard shell (see canvas)
- `components/data-table.tsx` — generic table
- `components/auth-panel.tsx` — register/login
- `components/forms/*` — doc/note/collection forms
