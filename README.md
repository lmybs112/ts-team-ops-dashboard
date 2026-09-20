# ts-team-ops-dashboard

Team HQ — Office ∥ Linear 雙視圖進度管理平台（PRD v1.3）。

## 原型預覽

可點 Prototype（Office / Linear 整頁切換）：見 GitHub Pages，或本機開 `prototype/index.html`。

## 文件

- [PRD v1.3](docs/PRD.md)
- [Prototype 操作說明](prototype/PROTO.md)
- [權限與錯誤碼（P1–P20）](docs/api/permissions-and-errors.md)
- [OpenAPI](docs/api/openapi.yaml)
- [Sprint 0 TDD](docs/sprint-0.md)
- [Filter State 不變式](docs/architecture/data-model-and-filter-state.md)

## Monorepo

```
packages/domain        # 領域邏輯 + 單元測試
packages/api-contract  # Ops API 契約 + in-memory createOpsApi
apps/web               # Next.js Office ∥ Linear shell
prototype/             # 靜態原型
docs/                  # PRD / ADR / API
```

### 開發指令

```bash
pnpm install
pnpm test              # domain + api-contract + web unit tests
pnpm typecheck
pnpm lint

# Web app
pnpm --filter @team-hq/web dev     # http://localhost:3000
pnpm --filter @team-hq/web build
```

詳見 [apps/web/README.md](apps/web/README.md)。
