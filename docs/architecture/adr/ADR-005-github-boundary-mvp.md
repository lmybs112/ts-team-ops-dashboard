# ADR-005：GitHub 邊界（MVP 不同步）

| 欄位 | 內容 |
|------|------|
| Status | **Accepted** |
| Date | 2026-09-19（Asia/Taipei） |
| Deciders | mei／CTO（PRD 非目標） |
| IcePanel 對照 | 既有 IcePanel ADR-004（Accepted） |

## Context

進度目前散落在 GitHub、bot 對話與口頭回報。將 GitHub Issues／PR 自動同步進 Team HQ 看似「少打字」，但 MVP 要先證明 **指揮窗口＋ingest＋雙視圖路徑**。此外清單含 **私有 repo**，同步會立刻拉高憑證、權限與 deep-link 假設成本。

## Decision

1. **MVP 不實作** GitHub Issues／PR 自動同步（無 webhook、無輪詢 GH、無「從 GH import 當 SoT」）。
2. 專案與（可選）repo 顯示名來自 **設定檔**；私有 repo **仍出現在列表**。
3. **不**把「在本平台一鍵開啟私有 GitHub」當 MVP 完成路徑依賴。
4. `source` enum 可預留 `github`，但 MVP **不得寫入**。
5. Phase 1.1 若要做 sync：另開 ADR，明確 SoT 衝突策略（GH vs Team HQ）、憑證存放、私有 repo 行為。

## Alternatives considered

| 方案 | 結論 | 理由 |
|------|------|------|
| MVP 即雙向 sync GH Issues | **Rejected** | 範圍膨脹；私有 repo／Auth；與 bot ingest 衝突未定義 |
| 以 GH 為唯讀投影、Team HQ 仍可寫 | **Deferred** | 可作 Phase 1.1 候選，但非現在 |
| 設定檔都不寫 GH 名 | **Rejected** | 使用者需要辨識專案對應關係 |

## Consequences

### 正向

- MVP 聚焦可驗收任務路徑；無 PAT 進 repo 的資安債。
- 私有 repo 僅名稱暴露於設定，風險可控。

### 負向／成本

- 使用者需經 UI 或 bot ingest 維護狀態，不會「自動跟 GH 一致」。
- 日後 sync 需處理歷史資料與重複 Issue。

### Migration

- 文件與程式註解標 `// Phase 1.1 — GitHub sync out of scope`。
- 憑證規範預先寫入 `boundaries.md`／`nfr.md`，避免臨時把 secret 塞進 repo。

## 參照

- PRD v1.3 §6.4、§11；`boundaries.md`
