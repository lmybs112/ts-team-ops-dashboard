# Team HQ 架構基線 Handoff（CTO）

| 欄位 | 內容 |
|------|------|
| 日期 | 2026-09-19（Asia/Taipei） |
| 產品 | Team HQ／`ts-team-ops-dashboard` |
| PRD | v1.3（定稿可開工） |
| Repo | https://github.com/lmybs112/ts-team-ops-dashboard |
| 本檔 | 一頁交接；細節見同目錄各文 |

## 一句話

**SPA（建議 Next.js）＋ Ops API／ingest＋單一 Task DB**；**Office ∥ Linear 雙整頁** 共享 Filter；**MVP 不同步 GitHub**；AuthZ 與幂等可測。

## IcePanel

Landscape 已存在：**Context／Container** 物件＋**ADR 001–004 Accepted**。本包將 CTO 主技術決策補為 **ADR-001（tech stack）**，並將產品／資料／ingest／GitHub 邊界編為 ADR-002–005（與 IcePanel 舊編號對照見 `README.md`）。視覺圖以 IcePanel 為協作面；**行為以 PRD v1.3＋本 markdown 包為準**。

## 檔案路徑清單（正式）

```
docs/architecture/README.md
docs/architecture/c4-context.md
docs/architecture/c4-container.md
docs/architecture/data-model-and-filter-state.md
docs/architecture/boundaries.md
docs/architecture/nfr.md
docs/architecture/2026-09-19-team-hq-architecture-baseline.md
docs/architecture/adr/ADR-001-tech-stack.md
docs/architecture/adr/ADR-002-office-linear-dual-view.md
docs/architecture/adr/ADR-003-single-issue-store.md
docs/architecture/adr/ADR-004-ingest-idempotency-authz.md
docs/architecture/adr/ADR-005-github-boundary-mvp.md
```

絕對路徑前綴：`/workspace/ts-team-ops-dashboard/`  
備份鏡像：`/workspace/docs/architecture/`（同相對結構）

## 開工指派（建議）

| 序 | 職缺 | 動作 |
|----|------|------|
| 1 | 後端 | OpenAPI：Issues CRUD＋`POST /ingest`；AuthZ／幂等測試先紅後綠 |
| 2 | 前端 | `/office`＋`/linear` 殼；Filter store；接 API；禁三欄唯一總覽 |
| 3 | DevOps | 非 Pages-as-backend 的 Web＋API＋DB；secrets 僅 env；Sentry |
| 4 | QA | 對齊 NFR＋PRD §15；flake＝bug |
| 5 | 架構 | IcePanel 與本包 ADR 對照核對；必要時補 component 圖 |

## 紅線（五條）

1. 三欄合體 ≠ 唯一總覽。  
2. 禁止雙真相庫；切視圖不重置 Filter。  
3. `blocked` 無 reason 不得寫入。  
4. 職缺 bot 不得改他人任務。  
5. MVP 無 GH sync；secrets 不進 repo。
