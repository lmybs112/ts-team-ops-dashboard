# 非功能需求（NFR）— Team HQ MVP

| 欄位 | 內容 |
|------|------|
| 對齊 | PRD v1.3 成功標準 S2、§6、§12、§15 |
| 日期 | 2026-09-19（Asia/Taipei） |

本文件要求 **可量測／可測試**。無法量測的形容詞不列入驗收。

## 1. 認證與授權（AuthN／AuthZ）

| ID | 需求 | 量測／驗收 |
|----|------|------------|
| NFR-A1 | MVP AuthN 可簡化（token／session／原型角色切換） | 仍能區分 mei／CTO／各 role bot principal |
| NFR-A2 | AuthZ **必須可強制且可測** | 自動化測試：mei／CTO 全寫成功；bot 改他人 → 拒絕；未授權 → 拒絕 |
| NFR-A3 | 授權在 Ops API 執行 | 繞過 UI 的直接 API 呼叫仍受同樣規則約束 |

## 2. 審計（Audit）

| ID | 需求 | 量測／驗收 |
|----|------|------------|
| NFR-U1 | 每次突變寫入 `updatedAt` | ISO-8601；UI 顯示 Asia/Taipei |
| NFR-U2 | 每次突變寫入 `updatedBy` | 對應 principal id／角色 |
| NFR-U3 | 拒絕寫入不產生部分更新 | blocked 缺 reason → 400 且列不變（測試前後 snapshot） |

## 3. 可觀測性（Observability）

| ID | 需求 | 量測／驗收 |
|----|------|------------|
| NFR-O1 | **Sentry**（或同等）掛載於 **Web Client 與 Ops API** | 故意錯誤可在專案中看見 event |
| NFR-O2 | API **結構化 log**（JSON 或等效鍵值） | 含 request id、route、status、latency；**無** token／連線字串 |
| NFR-O3 | Log／錯誤報告 **無 PII／secrets** | 審查 checklist；測試用假 token 不得出現於 log fixture 断言為「應紅線」 |

## 4. 效能（Performance）

| ID | 需求 | 目標 | 環境假設 |
|----|------|------|----------|
| NFR-P1 | Office 掃阻塞 UX | **≤ 3s** 指出 Project／Agent／Issue blocked（PRD S2） | 暖機後、本地或 staging、代表性資料量（≥7 agents、數十 Issues） |
| NFR-P2 | `GET` 列表 Issues | **p95 &lt; 300ms**（本地／同區 staging） | 無故意 sleep；含合理索引 |
| NFR-P3 | 視圖內篩選 | **零 full reload**；交互回饋體感 &lt; 100ms（客戶端 filter）或列出請求 p95 同上 | |
| NFR-P4 | 輪詢間隔 | 15–30s（若採輪詢） | 不造成明顯 UI jank |

未達標時：先量測再優化（索引、payload 瘦身、聚合快取）；不得以「場景很酷」抵銷。

## 5. 可用性（Availability）

| ID | 需求 | MVP 基準 |
|----|------|----------|
| NFR-V1 | 部署拓撲 | **單區域** OK |
| NFR-V2 | RPO／RTO | 不訂多區；DB 定期備份策略由 DevOps 最低限度提供即可 |
| NFR-V3 | 依賴 | GitHub 不可用 **不得** 影響 MVP 核心路徑（因無 sync） |

## 6. 安全性（Security）

| ID | 需求 |
|----|------|
| NFR-S1 | Secrets **僅** env／secret manager；**永不**進 git |
| NFR-S2 | 私有 repo **名稱**可在設定檔；無 GH PAT 則不得呼叫 GH API |
| NFR-S3 | 前端 bundle 不得嵌入 ingest 特權 token |
| NFR-S4 | CORS／HTTPS 依部署環境收斂；公開 prototype 仍須 AuthZ |

## 7. 測試策略（對齊 TDD）

| 層 | 厚度 | 覆蓋重點 |
|----|------|----------|
| **Unit（厚）** | 主戰場 | Domain：狀態機、`blockedReason`、Agent 聚合順序；**AuthZ** 矩陣；**ingest 幂等**（source＋sourceRef） |
| **Integration** | 中 | Ops API＋真實／測試 DB：CRUD、ingest、400／403、審計欄位 |
| **E2E（薄）** | 煙霧 | Office⇄Linear **Filter 保留**；更新 status 路徑（含 blocked 擋存）；不複製所有單元案例 |

規則：

- **flake = bug**：重試掩蓋不作為通過條件；修根因或隔離時間／網路依賴。
- 禁止「只靠手動點一次」當 AuthZ 完成定義。
- CI 應跑 unit＋integration；E2E 可 staging 夜間或 PR 標籤觸發，但 P0 路徑要穩定。

## 8. 對照 PRD 成功標準

| PRD | NFR 錨點 |
|-----|----------|
| S2 ≤3s 掃阻塞 | NFR-P1 |
| S3 篩選同源不重整 | NFR-P3＋資料模型不變式 |
| §6.3 權限 | NFR-A2 |
| §6.4 ingest | Unit／Integration 幂等與 400 |
| 交件可點 https | NFR-V1＋CTO 佈署；Sentry NFR-O1 |
