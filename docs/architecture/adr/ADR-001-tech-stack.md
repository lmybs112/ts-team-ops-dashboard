# ADR-001：SPA（建議 Next.js App Router）＋ Ops API／ingest；Filter 同源

| 欄位 | 內容 |
|------|------|
| Status | **Accepted** |
| Date | 2026-09-19（Asia/Taipei） |
| Deciders | CTO（代 mei 定案） |
| 對齊 | PRD v1.3 §12、§N；本包主技術 ADR |

## Context

Team HQ 需要：

1. **兩個可切換的整頁視圖**（Office ∥ Linear），而非單一靜態原型頁。
2. **同源 Filter State** 與單一任務資料，支撐掃阻塞→篩選→改狀態路徑（≤3s 掃阻塞 UX）。
3. **Bot ingest** 與手動 UI 寫入同一 store；GitHub **不是** MVP SoT。
4. 可公開 https prototype，但正式環境必須有真實 API＋DB，不能把靜態託管誤當後端。

工程需在「可開工預設」與「避免過早鎖死語言細節」之間取得平衡：鎖 **拓撲與行為**，建議具體框架但不禁止同等方案。

## Decision

1. **Web Client**：採用 **Next.js App Router**（建議），或 **同等 React SPA＋typed API client**。必須支援雙全頁路由（例：`/office`、`/linear`）、共享 Filter State（提升至跨路由 store／URL）。
2. **Ops API**：獨立於靜態檔的後端服務，負責 Issues **CRUD**、**AuthZ**、**`POST /ingest`**。不以 GitHub API 作為列表／寫入真相。
3. **Task DB**：**單一**任務資料庫；Office／Linear／次頁皆經 API 讀寫此庫。
4. **託管**：GitHub Pages（或純靜態）**僅**適用於無寫入／假資料之 UI 原型。**Production／可驗收寫入** 必須 Proper hosting（Web＋API＋DB），**禁止 Pages-as-backend**。
5. **即時性（MVP）**：客戶端 **輪詢 15–30s** 或 **樂觀 UI**；SSE／WebSocket 列為可選後續，不阻擋 MVP。
6. **Filter 同源**：Filter State（`projectId`、`agentId`、`status`、`query`）為跨視圖單一來源；切換 Office⇄Linear **不得重置**（ADR-002／資料模型文件）。

## Alternatives considered

| 方案 | 結論 | 理由 |
|------|------|------|
| **純靜態 HTML 原型永久化** | **Reject（作為正式架構）** | 無法承載可測 AuthZ、ingest 冪等、多客戶端一致性；只可作早期視覺／點擊原型 |
| **BFF-only（後端只代理 GitHub）** | **Reject for MVP** | PRD 明確 GitHub 非 SoT；BFF-only 會把私有 repo／rate limit／auth 複雜度前置，並破壞 bot ingest 模型 |
| **以 GitHub Issues 同步為 SoT** | **Reject for MVP** | 見 ADR-005；進度來源含 bot 對話與手動指揮，GH Issues 覆蓋不足且私有 repo／權限成本高 |
| Next.js 以外的 React SPA | **Acceptable equivalent** | 若提供同等路由、typed client、可測性，可替代；須在 README 註明等價假設 |
| 伺服器長連線即時（SSE／WS）當日必做 | **Defer** | MVP 輪詢／樂觀更新足夠驗證任務路徑；即時通道可後加 |

## Consequences

### 正向

- 前後端契約清晰；AuthZ／冪等可在 API 層單點強制與測試。
- 雙視圖與 Filter 同源有明確承載（SPA 路由＋共享 store）。
- 原型與正式環境分離，避免「Pages 能點但不能寫」的假完成。

### 負向／成本

- 需同時維護 Web 與 API 部署（相對純靜態增加 DevOps）。
- 輪詢帶來短暫不一致窗口；需樂觀更新或明確「上次同步」UX。
- 框架建議（Next.js）若中途替換，須保持 ADR 拓撲不變並更新本文件 Alternatives。

### Migration

| 階段 | 動作 |
|------|------|
| 現在 | 依本 ADR 建 repo 骨架：Web 路由殼＋API stub＋DB schema；Filter store 先落地 |
| 原型期 | 允許靜態／mock 展示 Office 視覺；**標註非正式寫入** |
| 進正式 | 切斷任何「僅前端假資料」路徑；ingest＋CRUD 打真 DB |
| Phase 1.1 | 若引入 GitHub sync，另開 ADR；不得默認改寫 SoT |

## 參照

- PRD v1.3 §12 技術邊界
- `c4-container.md`、`data-model-and-filter-state.md`、`nfr.md`
