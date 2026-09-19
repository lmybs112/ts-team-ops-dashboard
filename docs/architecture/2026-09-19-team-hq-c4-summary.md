# Team HQ 架構摘要（C4／ADR）

| 欄位 | 內容 |
|------|------|
| 日期 | 2026-09-19（Asia/Taipei） |
| 對齊 | PRD v1.3（定稿可開工） |
| 來源 | IcePanel landscape（系統架構師） |
| 狀態 | 首批邊界＋ADR 已寫入；可開工 |

## 系統邊界（Context）

| 物件 | 類型 | 說明 |
|------|------|------|
| mei | actor | 指揮窗口擁有者；全任務寫入權 |
| CTO bot | actor | 拆解／指派；與 mei 同權 |
| 職缺 bots | actor | 7 職缺；僅改自己 assigneeRole；走 ingest |
| **Team HQ** | system | 產品本體（`lmybs112/ts-team-ops-dashboard`） |
| GitHub | system（external／future） | MVP 不同步；僅設定檔顯示名 |

## 容器（Container）

| 容器 | 責任 |
|------|------|
| **Web Client** | SPA：View Office ∥ View Linear；共享 Filter State |
| **Ops API** | Issues CRUD、權限閘門、bot ingest（冪等） |
| **Task DB** | 唯一持久化（Project／Issue／Agent 聚合） |

## 關鍵連線

- mei／CTO → Web Client（uses UI）
- Web Client → Ops API（HTTPS／JSON）
- 職缺 bots → Ops API（`POST /ingest`）
- Ops API → Task DB（SQL）
- Ops API → GitHub（**future**：Issues／PR sync）

## ADR（IcePanel）

| # | 標題 | 狀態 |
|---|------|------|
| 001 | Office∥Linear 雙視圖（否決三欄合體） | accepted |
| 002 | 單一 Issue 資料源 | accepted |
| 003 | Ingest 冪等與權限 | accepted（以 #3 為準；#4 為重複應 rejected） |
| 004 | GitHub 邊界（MVP 不同步） | accepted |

## 越界紅線（給前後端／ingest）

1. 不得把「左專案｜中辦公室｜右 Inbox」當唯一總覽。
2. Office／Linear 不得各建真相庫；Filter 切視圖不得重置。
3. `blocked` 無 `blockedReason` 不得寫入。
4. 職缺 bot 不得改他人任務。
5. MVP 不得實作 GitHub Issues／PR 同步；私鑰不進 repo。

## 風險

| 風險 | 緩解 |
|------|------|
| IcePanel 偶發逾時／重複 ADR | 以本摘要＋IcePanel listADRs 核對；重複標 rejected |
| 原型三欄殘留誤導實作 | PRD v1.3＋ADR-001 為準；設計／前端開工前對齊 |
| 即時性未定案 | MVP 輪詢 15–30s 或樂觀更新；SSE 加分（未另開 ADR） |

## 下一步（建議 CTO 指派）

1. 後端：依 ADR-002／003 出 OpenAPI（Issues＋ingest）＋權限測試案例。
2. 前端：雙路由殼＋共享 Filter；辦公室畫布不越權寫 DB。
3. 資安：私有 repo 顯示名、ingest token、密鑰邊界審查。
4. 架構：IcePanel context／container 圖手動排版（API 未建 diagram 物件）；需要再補 component 層。
