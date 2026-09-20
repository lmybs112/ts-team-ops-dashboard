# @team-hq/api — 可部署 Ops API

對齊 `docs/api/openapi.yaml` 與 `@team-hq/api-contract`（P1–P20）：Bearer、S-H1／S-H2、FU-H1b／FU-H2a。

## 啟動

```bash
# monorepo root
pnpm install
OPS_ALLOW_TEST_TOKENS=1 pnpm --filter @team-hq/api start
# http://127.0.0.1:8787/v1/health
```

測試 token（僅本機／測試，非密鑰）：見 `TEST_TOKENS`（`test-token-mei`、`test-token-frontend`、…）。

## 持久化

SQLite（`OPS_DB_PATH`）。決策見 [ADR-006](../../docs/architecture/adr/ADR-006-task-db-sqlite.md)。

## 禁止

真實密鑰入庫、GitHub sync、新增 CI workflow。
