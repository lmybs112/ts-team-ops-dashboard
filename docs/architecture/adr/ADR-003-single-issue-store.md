# ADR-003：單一 Issue 資料源（Single Issue Store）

| 欄位 | 內容 |
|------|------|
| Status | **Accepted** |
| Date | 2026-09-19（Asia/Taipei） |
| Deciders | CTO／產品（PRD v1.3 §A） |
| IcePanel 對照 | 既有 IcePanel ADR-002（Accepted） |

## Context

Office、Linear、Project 頁、dock、⌘K、未來 Board／Matrix 若各自快取或各寫各的「任務列表」，會出現：切視圖狀態不一致、聚合錯誤、改狀態只在一邊生效。PRD 要求對齊 Linear 思維的 **單一資料模型**。

## Decision

1. **唯一持久化 SoT**：Task DB 中的 Issue（及設定檔中的 Project／Role）為真相。
2. **所有 UI 表面**（Office、Linear、Project、Settings 相關任務、dock、⌘K、P1 Board／Matrix）**讀寫同一套** Project／Issue／Agent／Status。
3. Web Client 可有記憶體快取／樂觀更新，但必須可追溯至 API／DB；禁止「辦公室專用第二庫」。
4. Agent 主狀態與 Project 彙總 **由同一 Issue 集合導出**（聚合規則：`blocked > doing > todo > done`）。
5. 寫入僅經 Ops API（CRUD 或 ingest）；見 ADR-001／ADR-004。

## Alternatives considered

| 方案 | 結論 | 理由 |
|------|------|------|
| Office 場景狀態機獨立、Linear 另表 | **Rejected** | 雙真相；必漂 |
| GitHub Issues 為 SoT、本地僅投影 | **Rejected for MVP** | ADR-005；覆蓋不足 |
| 前端 localStorage 為正式 store | **Rejected** | 無法跨 bot／多端；無 AuthZ 強制點 |
| CQRS／雙寫事件溯源 | **Overkill** | MVP 無此規模需求 |

## Consequences

### 正向

- 切 Office⇄Linear 後列表／貓狀態一致；驗收路徑可自動化。
- 聚合與權限測試只需對準一模型。

### 負向／成本

- 所有視圖必須等 API 契約穩定；前端不得「先做假資料當正式」。
- 樂觀更新需處理衝突／回滾策略（可簡：失敗 toast＋重新 fetch）。

### Migration

- 若原型仍用 in-memory mock：標 `prototypeOnly`，接真 API 後刪除雙路徑。
- Schema 演進以 migration 管理；禁止各視圖私有欄位永久分叉。

## 參照

- `data-model-and-filter-state.md`
- PRD v1.3 §A
