# ts-team-ops-dashboard

Team HQ — Office ∥ Linear 雙視圖進度管理平台（PRD v1.3）。

## 原型預覽

可點 Prototype（Office / Linear 整頁切換）：見 GitHub Pages，或本機開 `prototype/index.html`。

## 文件

- [PRD v1.3](docs/PRD.md)
- [Prototype 操作說明](prototype/PROTO.md)
- [權限與錯誤碼（P1–P20）](docs/api/permissions-and-errors.md)
- [OpenAPI](docs/api/openapi.yaml)
- [Sprint 0 TDD RED](docs/sprint-0.md)

## Monorepo（Sprint 0）

```
packages/domain        # 領域 stubs + 紅燈單元測試
packages/api-contract  # 契約 stubs + P1–P20 紅燈測試
apps/web               # Next.js placeholder
prototype/             # 靜態原型
docs/                  # PRD / ADR / API
```

### 開發指令

```bash
pnpm install
pnpm test          # expect RED（Sprint 0 門檻）
pnpm typecheck
pnpm lint
```

詳見 [docs/sprint-0.md](docs/sprint-0.md)。綠燈實作不在本階段範圍。

## 專案狀態

Sprint 0：TDD 紅燈 scaffold（domain 五優先 + P1–P20）。實作待紅燈存在後進行。
