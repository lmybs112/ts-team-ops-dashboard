# 資料模型與 Filter State

| 欄位 | 內容 |
|------|------|
| 對齊 | PRD v1.3 §A、§N.3、§6 |
| 相關 ADR | ADR-002、ADR-003 |
| 日期 | 2026-09-19（Asia/Taipei） |

## 1. 核心實體

對齊 Linear 思維；**全產品單一資料源**（見 ADR-003）。

| 實體 | Linear 類比 | 定義 |
|------|-------------|------|
| **Project** | Project | 固定 6 專案＋UI「全部」；slug 寫死於設定檔 |
| **Issue** | Issue | 任務單元；必屬一 Project、一 Agent、一 Status |
| **Agent／Role** | Assignee | 7 職缺 bot；Office 視覺＝一貓／工位 |
| **Status** | Workflow state | 固定四態：`todo` \| `doing` \| `blocked` \| `done`（不可自訂） |

### 1.1 Project（設定檔，MVP）

| slug | 顯示名建議 | 備註 |
|------|------------|------|
| `marketing` | 行銷／智慧選物 | |
| `iframe` | iframe 容器 | |
| `carousel` | 商品輪播 | |
| `try-on` | 試穿 demo | 私有 GH；僅顯示名 |
| `llm-chat` | LLM 聊天 modal | 私有 GH；僅顯示名 |
| `team-ops` | 本平台自身 | |

「全部」＝不過濾（`projectId = all | null`），非實體列。

### 1.2 Agent／Role（roleId）

`cto`｜`pm`｜`uiux`｜`frontend`｜`backend`｜`qa`｜`devops`

一職缺＝一 Agent＝一工位；MVP 不做動態加人。

### 1.3 Issue 最小欄位

| 欄位 | 必填 | 說明 |
|------|------|------|
| `id` | ✓ | 系統產生 |
| `title` | ✓ | 短標題 |
| `projectSlug` | ✓ | 六專案之一 |
| `assigneeRole` | ✓ | 七職缺之一 |
| `status` | ✓ | 四態 |
| `blockedReason` | 條件 | `blocked` 必填；建議 ≤120 字 |
| `source` | ✓ | `manual` \| `bot_report`（`github` 保留 enum，MVP 不寫入） |
| `sourceRef` | | 可空；與 `source` 組成冪等鍵（ingest） |
| `updatedAt` | ✓ | ISO；顯示 Asia/Taipei |
| `updatedBy` | ✓ | 操作者識別 |

## 2. Agent 聚合主狀態

對某 `roleId` 下 Issues（若有專案篩選則僅該專案）取 **最差優先**：

```
blocked > doing > todo > done
```

規則：

1. 任一 `blocked` → 主狀態 **blocked**（摘要最近更新之 `blockedReason`，UI ≤40 字）
2. else 任一 `doing` → **doing**
3. else 任一 `todo` → **todo**
4. else → **done**（無任務可視為空閒／done，文案由設計定）

Project 列彙總建議同樣最差優先，並顯示 blocked／doing 計數。

## 3. Filter State（跨視圖硬性）

全域 Filter State，**Office ∥ Linear ∥ Project ∥ Board（P1）共用**：

| 鍵 | 型別／語意 | 預設 |
|----|------------|------|
| `projectId` | slug 或 `all` | `all` |
| `agentId` | roleId 或 `all` | `all` |
| `status` | 四態之一或 `all` | `all` |
| `query` | 字串（⌘K／搜尋） | `""` |

### 3.1 不變式（Invariants）

1. **同源**：所有表面讀寫同一 Filter State 實例（記憶體 store＋建議 URL sync）。
2. **切視圖不重置**：Office⇄Linear⇄Project⇄Board **不得**清空篩選（除非使用者明確「清除篩選」）。
3. **進入 Project 頁** → 寫入該 `projectId`；返回保留。
4. **Office 點貓** → 設 `agentId` 並開詳情；切到 Linear 時列表已篩該 Agent。
5. **零整頁重整**：視圖內改篩選不得 full reload。
6. URL 同步 Filter 為 P0 建議（可分享／重整恢復）。

### 3.2 反例（不合格）

| 反例 | 為何不合格 |
|------|------------|
| Office／Linear 各維護一份 filter | 違反同源；切換後「篩選消失」 |
| 路由切換時 remount 重置為 all | 違反 S3／S11／N.3 |
| 僅用 local component state 無提升 | 無法跨整頁視圖共享 |

## 4. 讀寫面與同源

```
                    ┌──────────── Filter State ────────────┐
                    │ projectId · agentId · status · query │
                    └───────────────┬──────────────────────┘
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
   View Office               View Linear                 Project / ⌘K / dock
   （空間掃 Agent）           （Issues／Projects）         （寫入／讀取同一 state）
          │                         │
          └────────────┬────────────┘
                       ▼
                 Ops API → Task DB
              （唯一 Issue SoT）
```

## 5. 狀態變更與審計

- 任一突變寫入 `updatedAt`、`updatedBy`。
- `blocked` 無／空 `blockedReason` → **拒絕寫入**（API 400；UI 擋存）。
