# ADR-004：Ingest 冪等性與 AuthZ

| 欄位 | 內容 |
|------|------|
| Status | **Accepted** |
| Date | 2026-09-19（Asia/Taipei） |
| Deciders | CTO／後端 |
| IcePanel 對照 | 既有 IcePanel ADR-003（Accepted；若有重複 ADR 以本文件＋listADRs 核對後標 rejected） |

## Context

職缺 bots 以事件回報任務進度；網路重試、重複投遞、錯誤 `assigneeRole`、缺 `blockedReason` 都是預期噪音。必須在 API 邊界一次定義：**誰能寫什麼**、**如何幂等**、**何時拒絕**。

## Decision

### 冪等

- 冪等鍵：**(source, sourceRef)**。
- 同一鍵重複 POST：不建立重複 Issue；回傳既有資源（200／更新語意與實作約定一致，但結果唯一）。
- `sourceRef` 空值時：不適用跨請求幂等（或僅允許 `manual` 路徑）；bot 路徑應 **要求** 非空 `sourceRef`。

### blockedReason

- `status = blocked` 時 **`blockedReason` 必填且非空白**。
- 否則 **HTTP 400**，**不寫入** DB。

### 角色邊界（AuthZ）

| Principal | Ingest／寫入範圍 |
|-----------|------------------|
| mei／CTO | 全 Issue |
| 職缺 bot | 僅 `assigneeRole` 等於自身 role；越權 → **403／401**（實作擇一但一致） |
| 非法 `projectSlug`／`assigneeRole` | **400** |

### 契約示意

```json
{
  "projectSlug": "marketing",
  "assigneeRole": "frontend",
  "title": "完成商品卡 hover 狀態",
  "status": "blocked",
  "source": "bot_report",
  "sourceRef": "agent:frontend:task-123",
  "blockedReason": "等設計 tokens"
}
```

審計：成功突變寫 `updatedAt`、`updatedBy`（bot id／token subject）。

## Alternatives considered

| 方案 | 結論 | 理由 |
|------|------|------|
| 僅前端擋 blockedReason | **Rejected** | bots 不經該 UI |
| 以 title 哈希當幂等鍵 | **Rejected** | 易誤傷合法同名任務 |
| Bot 可改任意指派「方便排程」 | **Rejected** | 違反 PRD §6.3；擴大爆炸半徑 |
| 完全無幂等、靠呼叫端保證 | **Rejected** | 分散系統重試必然重複 |

## Consequences

### 正向

- 重試安全；授權可測；blocked 資料品質有底線。

### 負向／成本

- Bot 端必須穩定產生 `sourceRef`。
- 需整合測試覆蓋：重複 ingest、缺 reason、越權三角。

### Migration

- 既有重複 IcePanel ADR 條目：保留一條 Accepted，重複標 Rejected 並指向本文件。
- 若日後支援 batch ingest，幂等鍵語意不變。

## 參照

- PRD v1.3 §6.3–6.4；`boundaries.md`；QA A1–A4
