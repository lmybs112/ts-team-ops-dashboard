# Sprint 0 — TDD RED scaffold

| 欄位 | 內容 |
|------|------|
| 目標 | 建立 monorepo + Vitest **紅燈**測試：domain 五優先 + P1–P20 |
| 狀態 | 本 PR **只交紅燈**；實作邏輯使測試轉綠 = 後續 sprint |
| 對齊 | PRD v1.3 §6.1–§6.4、§N.3；`docs/api/permissions-and-errors.md` §4 |

## 怎麼跑

```bash
pnpm install
pnpm test          # expect RED
pnpm typecheck
pnpm lint
```

等同腳本：`pnpm test:unit` → 同 `pnpm test`。

## 套件結構

```
packages/domain        # status / aggregate / filter / permissions / ingest stubs
packages/api-contract  # createOpsApi() 故意未實作 + P1–P20
apps/web               # Next.js placeholder only（不要求完整 build）
prototype/             # 既有原型（保留）
docs/                  # PRD / OpenAPI / 權限契約（保留）
```

## 測試檔路徑

### Domain 五優先（PRD）

| 檔案 | 覆蓋 |
|------|------|
| `packages/domain/src/status.test.ts` | §6.1 Status + blockedReason |
| `packages/domain/src/aggregate.test.ts` | §6.2 Agent aggregate |
| `packages/domain/src/permissions.test.ts` | §6.3 Permissions |
| `packages/domain/src/filter.test.ts` | §N.3 Filter State |
| `packages/domain/src/ingest.test.ts` | §6.4 Ingest contract |

### P1–P20（permissions-and-errors.md §4）

| 檔案 | 覆蓋 |
|------|------|
| `packages/api-contract/src/p1-p20.test.ts` | P1–P20（含 S-H1 P10/P14/P15、S-H2 P16–P18、FU-H1b P19、FU-H2a P20） |

## 預期紅燈

- Domain stubs 丟 `not implemented` → 斷言失敗／未捕獲例外
- `createOpsApi()` 寫入一律 `500 NOT_IMPLEMENTED`（god-token stub 錯誤地核發）→ P1–P20 狀態碼斷言失敗
- **本 PR 不做綠燈實作**

## 明確不做

- 不加 `.github/workflows/*`（workflow scope 不可用）
- 不加 E2E / Playwright
- 不實作真實權限／狀態機讓測試通過
