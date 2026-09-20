# ADR-006：Task DB 選 SQLite（MVP 可部署）

| 欄位 | 內容 |
|------|------|
| Status | **Accepted** |
| Date | 2026-09-21（Asia/Taipei） |
| Deciders | 後端（CTO 指派：真 Ops API＋Task DB） |
| 對齊 | ADR-001／ADR-003、OpenAPI、P1–P20 |

## Context

需要可本地啟動、可部署的 Ops API，Issue 為單一真相庫。Postgres 與 SQLite 皆可；須寫 ADR 說明選擇。

## Decision

MVP 採用 **SQLite**（`better-sqlite3` 檔案庫）作為 Task DB：

1. 零外部服務即可 `pnpm --filter @team-hq/api start`。
2. Schema 簡單（issues 單表 + 冪等唯一索引），與 OpenAPI Issue 對齊。
3. 行為層仍走 `@team-hq/api-contract` 的 `createOpsApi`（與單元測同一規則）。

## Alternatives

| 方案 | 結論 | 理由 |
|------|------|------|
| Postgres 立即上 | Defer | 需連線字串／遷移／本機 Docker；MVP 驗證契約與 AuthZ 不依賴它 |
| 僅記憶體 | Reject | 不符「可部署／持久化」DoD |
| ORM 重型棧 | Defer | 單表 CRUD；先薄 repository，日後可換 Postgres driver |

## Consequences

- 單機／單寫入夠用；多實例水平擴展需改 Postgres（另開 ADR）。
- 備份＝複製 sqlite 檔；遷移可後補。
