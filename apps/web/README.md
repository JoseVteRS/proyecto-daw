# Web

Aplicación web creada con **TanStack Start** mediante:

```bash
pnpx @tanstack/cli@latest create
```

> TanStack Router aparece como dependencia porque TanStack Start lo utiliza internamente y el CLI lo instala por defecto.

## Comandos

Desde la raíz del monorepo:

```bash
pnpm dev:web
pnpm --filter web build
pnpm --filter web typecheck
```

Desde `apps/web`:

```bash
pnpm dev
pnpm build
pnpm typecheck
```
