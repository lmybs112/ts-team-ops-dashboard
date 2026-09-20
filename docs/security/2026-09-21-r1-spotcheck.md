# R-1 抽驗報告（P14–P20＋domain）

| 欄位 | 內容 |
|------|------|
| 日期 | 2026-09-21 03:04 CST（Asia/Taipei） |
| 審查者 | 資安工程師 |
| 標的 | `main` @ `a86ee77`（PR #6 TDD green） |
| 指令 | `pnpm test`（vitest run） |
| 結果 | **通過** — 6 files／**53 passed (53)** |

## 執行證據

```
 ✓ packages/domain/src/status.test.ts (8 tests)
 ✓ packages/domain/src/ingest.test.ts (7 tests)
 ✓ packages/domain/src/aggregate.test.ts (6 tests)
 ✓ packages/domain/src/permissions.test.ts (7 tests)
 ✓ packages/domain/src/filter.test.ts (5 tests)
 ✓ packages/api-contract/src/p1-p20.test.ts (20 tests)

 Test Files  6 passed (6)
      Tests  53 passed (53)
```

（本機複跑兩次皆 53/53 綠。）

## P14–P20 抽驗

| ID | 意圖 | 測試斷言（摘要） | 結果 |
|----|------|------------------|------|
| P14 | S-H1 偽造 assigneeRole | frontend token + `assigneeRole=backend` ingest → 403 `FORBIDDEN_ASSIGNEE`；snapshot 不變 | ✓ |
| P15 | S-H1 合法覆蓋 | frontend ingest → 201/200；寫入 `assigneeRole=frontend` | ✓ |
| P16 | S-H2 無 Bearer POST /issues | 401 `UNAUTHENTICATED`；DB 不變 | ✓ |
| P17 | S-H2 無 Bearer ingest／PATCH／DELETE | 皆 401；DB 不變 | ✓ |
| P18 | 禁 UI-only RBAC | frontend token + `X-Ui-Role: cto` 打他人 → 403；DB 不變 | ✓ |
| P19 | FU-H1b 禁神鑰 | 共用神鑰拒絕核發 **或** 跨 role 寫入 401/403；DB 不變 | ✓ |
| P20 | FU-H2a 禁 X-Role 升權 | 無 Bearer／frontend + `X-Role: cto` → 401/403；**不得** 201；DB 不變 | ✓ |

## Domain 權限抽驗

`packages/domain/src/permissions.test.ts`（7）：mei／CTO 全開；bot 僅自己；跨 role → `FORBIDDEN_ASSIGNEE`；未認證 → `UNAUTHENTICATED`；bot 禁 create／delete／reassign。**通過。**

另：ingest／status／aggregate／filter 共 26 測皆綠（領域不變量一併抽到）。

## R-1 結論

| 閘門 | 建議 |
|------|------|
| **R-1**（P14–P20＋domain 綠燈抽驗） | **通過／結案** |
| 公開可寫入預覽 | 契約＋R-1 已過；若預覽暴露寫入 API，仍須完成 **R-2**（token 不可猜／可輪替／禁神鑰於部署）後再由 CTO 放行 |

無失敗案例；無新增高風險 finding。
