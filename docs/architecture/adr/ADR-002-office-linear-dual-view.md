# ADR-002：Office ∥ Linear 雙整頁視圖

| 欄位 | 內容 |
|------|------|
| Status | **Accepted** |
| Date | 2026-09-19（Asia/Taipei） |
| Deciders | mei／CTO（PRD v1.3 定案） |
| IcePanel 對照 | 既有 IcePanel ADR-001（Accepted） |

## Context

v1.2.x 曾出現「一頁三欄合體（左專案｜中辦公室｜右 Inbox）」作為唯一總覽的敘述。mei 糾偏：**貓辦公室與 Linear 是兩個可切換的整頁視圖／頁面**，不是同一頁裡的中欄裝飾。成功標準衡量整頁任務路徑與互動品質，而非「中央有沒有貓場景」。

## Decision

1. 提供兩個 **P0 整頁** 主視圖：
   - **`view-office`**：整頁貓虛擬辦公室（空間掃 Agent／阻塞）。
   - **`view-linear`**：整頁 Linear 式 Issues／Projects 作業台。
2. 頂部（或同等永遠可見位置）提供 **Office｜Linear** 切換；≤1 次點擊互換。
3. **否決**「三欄合體殼」作為 **唯一** 總覽架構。
4. View Linear **內部** 可有左專案＋主列表＋右詳情（Linear 頁自有布局）；**不得** 把 3D 辦公室嵌為其中欄。
5. View Office **內部** 可有輕量 HUD（chip、圖例、點貓抽屜、底 dock），主體必須是整頁辦公室。
6. 切換時 **Filter State 保留**（見資料模型文件／ADR-003）。

建議路由：`/office`、`/linear`、`/projects/:id`、`/settings`。

## Alternatives considered

| 方案 | 結論 | 理由 |
|------|------|------|
| 一頁三欄合體為唯一總覽 | **Rejected** | 違反 mei 原意；辦公室淪為中欄 widget；PRD v1.3 明確刪除／降級 |
| 只有 Office 或只有 Linear | **Rejected** | 無法同時滿足空間掃讀與 Linear 級列表作業 |
| Office 與 Linear 分屬兩產品／兩 repo | **Rejected** | 破壞同源與單一指揮窗口 |
| 三欄合體作「進階布局選項」且非預設 | **Deferred／非目標** | MVP 不投入；避免再混淆總覽定義 |

## Consequences

### 正向

- 產品敘事與驗收標準清晰（S1／S8／S9／S11、V1–V8）。
- 設計／前端不再把「換中欄皮」當完成。

### 負向／成本

- 需維護兩套整頁 IA 與切換殼；Filter 必須提升為跨路由狀態。
- 舊原型／文案若殘留三欄敘述，需主動淘汰以免誤導。

### Migration

- 文件與設計稿標註「三欄合體＝錯誤示例」。
- 既有 office-v2 原型可演進為 `view-office`，另建 `view-linear`；共享資料層先於視覺拋光。

## 參照

- PRD v1.3「產品架構定案」「防誤解」
- IcePanel ADR-001（對照）
