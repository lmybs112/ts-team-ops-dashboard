# 系統與權限邊界（Boundaries）

| 欄位 | 內容 |
|------|------|
| 對齊 | PRD v1.3 §6、§11；ADR-004、ADR-005 |
| 日期 | 2026-09-19（Asia/Taipei） |

## 1. AuthZ（授權）

| 操作者 | 建立 Issue | 改任意欄位／指派 | 改狀態（含 blockedReason） | 範圍 |
|--------|------------|------------------|------------------------------|------|
| **mei** | ✓ | ✓ | ✓ | **全部**任務 |
| **CTO**（privileged principal） | ✓ | ✓ | ✓ | **全部**任務 |
| **職缺 bot** | 僅經 ingest 契約允許之建立／更新 | ✗（不可改指派給他人） | ✓ **僅** `assigneeRole`＝自己 | assignee-scoped |
| 未授權 | ✗ | ✗ | ✗ | 拒絕寫入 |

強制要點：

- AuthZ **在 Ops API 強制**；前端隱藏按鈕不算控制。
- MVP 認證可簡化（token／session／原型角色切換），但 **授權行為必須有自動化測試**（見 `nfr.md`）。
- 「辦公室裡的 CTO 貓」≠ 自動取得 privileged token；以請求 principal 為準。

## 2. 寫入路徑：手動 UI vs Bot ingest

| 路徑 | 入口 | `source` | 用途 |
|------|------|----------|------|
| **手動 UI** | Web Client → Ops API CRUD | `manual` | mei／CTO（及權限內 bot 若經 UI）改狀態、建任務 |
| **Bot ingest** | `POST /ingest` | `bot_report` | 職缺 bots 事件回報；冪等 |

兩路徑寫入 **同一 Task DB**。禁止第三條「暗門」寫入（腳本直連 DB、前端假寫 localStorage 當正式）。

```
mei/CTO ──UI──► Ops API CRUD ──► Task DB
bots ──POST /ingest──► Ops API ──► Task DB
```

## 3. Ingest vs 未來 GitHub sync

| 能力 | MVP | 說明 |
|------|-----|------|
| Manual UI | ✓ | |
| Bot ingest | ✓ | 冪等、AuthZ、blockedReason 規則見 ADR-004 |
| GitHub Issues／PR **同步** | ✗ | Phase 1.1；見 ADR-005 |
| GitHub **顯示名** | ✓ | 來自設定檔；非 live API |

`source` enum 可預留 `github`，但 MVP **不得寫入**該值，亦不得實作 webhook／polling sync。

## 4. 私有 Repo 與 Secrets

| 規則 | 說明 |
|------|------|
| Secrets 永不進 repo | DB URL、ingest token、未來 GH PAT／App private key → **僅 env／secret manager** |
| 私有 repo 名稱 | 可出現在設定檔顯示（`try-on`、`llm-chat`）；**不**假設使用者能從本平台 deep-link 開啟私有 GH |
| MVP 無 GH OAuth | 不把「開 GitHub」當完成路徑依賴 |
| Log | 禁止記錄 token、連線字串、PII 超量欄位 |

## 5. 信任與部署邊界（摘要）

- Bots 不可持有 Task DB 憑證。
- GitHub Pages **不可**作為正式寫入 backend。
- 公開 prototype https 由 CTO 佈署；仍須遵守 AuthZ（可為簡化 token，但規則可測）。

## 6. 越界檢查表（PR／設計審查）

- [ ] 是否引入第二資料源當列表真相？
- [ ] 是否實作了 GH sync／webhook？
- [ ] 職缺 bot token 能否改到他人 `assigneeRole`？
- [ ] secrets 是否出現在 git history／前端 bundle？
- [ ] 私有 repo 是否被做成必點 deep-link？
