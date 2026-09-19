# Team HQ 架構文件包（Architecture Pack）

| 欄位 | 內容 |
|------|------|
| 產品 | Team HQ／團隊進度管理平台（`ts-team-ops-dashboard`） |
| 對齊 PRD | **v1.3**（Office ∥ Linear 雙視圖；定稿可開工） |
| Repo | https://github.com/lmybs112/ts-team-ops-dashboard |
| 本目錄 | `docs/architecture/` |
| 備份鏡像 | `/workspace/docs/architecture/` |
| 日期 | 2026-09-19（Asia/Taipei） |
| 讀者 | mei、CTO、前端、後端、QA、DevOps、系統架構 |

本包取代／升級既有薄摘要（`2026-09-19-team-hq-c4-summary.md`），作為 **工程開工的架構真相來源**。產品行為仍以 PRD v1.3 為準；本包鎖定 **系統邊界、容器切分、資料同源、AuthZ、ingest、NFR 與 ADR**。

---

## IcePanel landscape

IcePanel 已建立 **Context／Container** 物件，且 **ADR 001–004 狀態為 Accepted**（與本包 ADR 編號對照見下表）。本 markdown 包為可版本控管的正式交付；IcePanel 為視覺協作面。兩者衝突時：**以 PRD v1.3 ＋ 本包 ADR 為準**，並回寫 IcePanel。

| IcePanel（既有） | 本包 ADR | 主題 |
|------------------|----------|------|
| ADR-001 | [ADR-002](./adr/ADR-002-office-linear-dual-view.md) | Office ∥ Linear 雙視圖 |
| ADR-002 | [ADR-003](./adr/ADR-003-single-issue-store.md) | 單一 Issue 資料源 |
| ADR-003 | [ADR-004](./adr/ADR-004-ingest-idempotency-authz.md) | Ingest 冪等與 AuthZ |
| ADR-004 | [ADR-005](./adr/ADR-005-github-boundary-mvp.md) | GitHub MVP 邊界 |
| （CTO 補齊） | [ADR-001](./adr/ADR-001-tech-stack.md) | **技術棧／Filter 同源**（本包主 ADR） |

---

## 文件索引

| # | 文件 | 用途 |
|---|------|------|
| 1 | [README.md](./README.md) | 本索引、DoD、連結 |
| 2 | [c4-context.md](./c4-context.md) | C4 Context：人／系統／信任邊界 |
| 3 | [c4-container.md](./c4-container.md) | C4 Container：Web／Ops API／Task DB |
| 4 | [data-model-and-filter-state.md](./data-model-and-filter-state.md) | 實體、Filter State、Agent 聚合 |
| 5 | [boundaries.md](./boundaries.md) | AuthZ、ingest vs GitHub、私有 repo、寫入路徑 |
| 6 | [nfr.md](./nfr.md) | 可量測非功能需求與測試策略 |
| 7 | [adr/ADR-001-tech-stack.md](./adr/ADR-001-tech-stack.md) | SPA＋Ops API／ingest；Filter 同源 |
| 8 | [adr/ADR-002-office-linear-dual-view.md](./adr/ADR-002-office-linear-dual-view.md) | 雙整頁視圖；否決三欄合體 |
| 9 | [adr/ADR-003-single-issue-store.md](./adr/ADR-003-single-issue-store.md) | 單一資料源 |
| 10 | [adr/ADR-004-ingest-idempotency-authz.md](./adr/ADR-004-ingest-idempotency-authz.md) | 冪等鍵、blockedReason、角色邊界 |
| 11 | [adr/ADR-005-github-boundary-mvp.md](./adr/ADR-005-github-boundary-mvp.md) | MVP 無 GitHub 同步 |
| 12 | [2026-09-19-team-hq-architecture-baseline.md](./2026-09-19-team-hq-architecture-baseline.md) | CTO 一頁 handoff |

相關產品規格：`/workspace/docs/specs/2026-09-19-team-ops-dashboard-prd-v1.3.md`

---

## 架構 DoD 檢查清單（開工前）

- [ ] Context 圖角色齊全：mei、CTO bot、7 職缺 bots；外部 GitHub＝future
- [ ] Container 切分明確：Web Client、Ops API、Task DB；無「Pages 當 backend」
- [ ] Filter State（`projectId`／`agentId`／`status`／`query`）跨 Office∥Linear **不因切視圖重置**
- [ ] 單一 Issue store；Office／Linear／dock／⌘K 同源
- [ ] AuthZ：mei＋CTO 全寫；bots 僅 `assigneeRole`＝自己
- [ ] Ingest：`source`＋`sourceRef` 冪等；`blocked` 必填 `blockedReason`
- [ ] MVP **不實作** GitHub Issues／PR sync；私鑰／token **永不進 repo**
- [ ] NFR：Sentry（Web＋API）、結構化 log 無 PII／secrets、可測 authz
- [ ] ADR-001～005 狀態 Accepted；IcePanel 與本包對照已核對
- [ ] 測試策略對齊 TDD：domain／authz／idempotency 厚單元；API＋DB 整合；E2E 薄

---

## 越界紅線（摘要）

1. 不得把「左專案｜中辦公室｜右 Inbox」三欄合體當唯一總覽（PRD v1.3 已否決）。
2. 不得為 Office／Linear 各建真相庫，或切視圖重置 Filter。
3. 不得寫入 `blocked` 而無 `blockedReason`。
4. 職缺 bot 不得改他人任務。
5. MVP 不得做 GitHub sync；secrets 不得進 repo。

---

## 維護規則

- 變更系統邊界或寫入路徑 → 先改 ADR，再改 Context／Container／boundaries。
- 變更 Filter／實體 → 同步 `data-model-and-filter-state.md` 與 PRD（若行為變動）。
- 正式碼只落在 `lmybs112/ts-team-ops-dashboard`；本包不承載應用功能碼。
