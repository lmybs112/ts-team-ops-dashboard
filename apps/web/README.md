# @team-hq/web

Next.js App Router shell: **View Office ∥ View Linear** with **shared Filter State**.

## Run

From monorepo root:

```bash
pnpm install
pnpm --filter @team-hq/web dev
```

Open http://localhost:3000 → redirects to `/office`. Switch to `/linear` via the header.

## Filter State

One `createFilterStore` instance (via `createReactFilterStore` + `FilterProvider`) lives above both routes. Switching Office⇄Linear does **not** reset `projectId` / `agentId` / `status` / `query`. Clear only via「清除篩選」.

## Tests

```bash
pnpm test
# includes apps/web/src/filters/react-filter-store.test.ts
# and apps/web/src/lib/filter-issues.test.ts
```

## Design notes

- Sober black / white / gray + status colors only
- In-memory `createOpsApi()` mock — no direct DB from UI
- Mobile polish deferred; basic layout should not break
