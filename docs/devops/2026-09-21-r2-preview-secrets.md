# R-2 預覽密管準備（DevOps）

| 欄位 | 內容 |
|------|------|
| 日期 | 2026-09-21（Asia/Taipei） |
| 作者 | DevOps／SRE |
| 對齊 | [R-2 runbook](../security/2026-09-21-r2-public-write-preview-runbook.md) |
| 狀態 | **準備完成；公開可寫入尚未啟用**（待清單全綠＋CTO 明示） |

> 本文件只描述 **怎麼放密、怎麼輪替、怎麼驗**。  
> **不**等同放行公開寫入。無 GitHub Actions `workflow` scope 時，先用本機／平台 env（本文件）；有 CI 後再把同名 Secret 接到 pipeline。

---

## 1. Actor ↔ env 對照

| Actor | 種類 | 平台／本機 env | 備註 |
|-------|------|----------------|------|
| mei | human | `TOKEN_MEI` | 全權；獨立密 |
| CTO | human | `TOKEN_CTO` | 全權；**不可**與 bot 共用 |
| frontend | bot | `TOKEN_FRONTEND` | 僅 frontend 職缺 |
| backend | bot | `TOKEN_BACKEND` | 僅 backend |
| pm | bot | `TOKEN_PM` | 僅 pm |
| uiux | bot | `TOKEN_UIUX` | 僅 uiux |
| qa | bot | `TOKEN_QA` | 僅 qa |
| devops | bot | `TOKEN_DEVOPS` | 僅 devops |

硬性規則（摘自 runbook）：

- 每列 **一個** ≥128-bit 亂數（`openssl rand -hex 32`）。
- **禁止** `TOKEN_GOD`／`TOKEN_ALL`／`SHARED_BOT_TOKEN`／可猜字串（`preview`、role 名）。
- **禁止**把 `packages/api-contract` 的 `TEST_TOKENS`（`test-token-*`）用在公開預覽。
- 傳遞只經 `Authorization: Bearer`；不進 query／HTML／PR／log。

佔位檔：倉庫根目錄 [`.env.example`](../../.env.example)（可入庫）。真值只在未追蹤 `.env` 或平台 Secret。

---

## 2. 本機（開發／內網 stub）

```bash
# 1) 複製佔位
cp .env.example .env

# 2) 逐 actor 填入（範例：只示範產生方式，勿把輸出貼進 git／聊天）
openssl rand -hex 32   # → 貼進 TOKEN_MEI=
# …對 TOKEN_CTO、TOKEN_FRONTEND…TOKEN_DEVOPS 各做一次

# 3) 確認未被追蹤
git check-ignore -v .env
git ls-files --error-unmatch .env 2>/dev/null && echo 'FAIL: .env tracked' || echo 'OK: .env not tracked'
```

`.gitignore` 已含 `.env`／`.env.*`，並允許 `!.env.example`。

本機 stub **不是**「公開可寫入預覽」；可寫入 API 若只綁 localhost，仍屬 runbook 非範圍。

---

## 3. 平台預覽（Vercel／Fly／等）— 密管步驟

在 **預覽環境**（非 production，除非 CTO 另指示）設定與上表同名的 Secret／Env：

1. 在密管或本機產生 8 組 token（每 actor 一組）。
2. 於平台 UI／CLI 寫入 Secret；**不要**寫進 repo、Issue、PR 正文。
3. 部署或重載後，僅透過伺服器 process env 讀取（應用層對照 Bearer → actor）。
4. 確認平台 env **沒有**單一 bot 神鑰、沒有把 8 個值設成同一個字串。

建議命名空間：`preview`／`staging` 環境專用；與 production 密鑰隔離。

雙槽輪替（可選，窗口 ≤1h）：

| 現行 | 上一輪（可選） |
|------|----------------|
| `TOKEN_<ACTOR>` | `TOKEN_<ACTOR>_PREVIOUS` |

伺服器驗證：Bearer ∈ {CURRENT, PREVIOUS}；撤銷後 PREVIOUS 清空 → 舊密 401。

---

## 4. 輪替程序（操作票據只記 actor＋時間）

1. `openssl rand -hex 32` 產生新值。  
2. 寫入平台 Secret（必要時先寫入 `*_PREVIOUS`＝舊 CURRENT，再覆寫 CURRENT）。  
3. 重部署或熱載。  
4. 煙測：新 Bearer 寫入成功；舊 Bearer → 401。  
5. 刪除／清空 PREVIOUS 與舊 Secret；票據：**不記密值**。  
6. 疑似外洩 → **立刻**撤銷該 actor 全部預覽 token 並重發。

---

## 5. 放行前 DevOps 自檢（對照 runbook §4–§5）

| # | 檢查 | 結果欄（人工勾） |
|---|------|------------------|
| A | `.env.example` 僅空／佔位；`git ls-files` 無 `.env` | ☐ |
| B | 平台 8 密皆獨立、高熵；無神鑰 | ☐ |
| C | 預覽 URL 為公開 **https**（非 127.0.0.1） | ☐ |
| D | 無 Bearer → 寫入 401；錯 Bearer → 401 | ☐ |
| E | frontend token + 跨 role ingest → 403；資料不變 | ☐ |
| F | frontend token + `X-Role: cto` → 非升權 | ☐ |
| G | `git grep -E 'Bearer [A-Za-z0-9_-]{20,}'`（或 secret scan）無真密 | ☐ |
| H | R-1：`pnpm test` 於將部署 SHA 全綠 | ☐ |
| I | **CTO 明示**「允許此預覽 SHA 公開可寫入」 | ☐ |

A–H 全綠後，**等 I**；未獲 I 前不得對外宣稱可寫入預覽已開。

---

## 6. 與 CI 的關係

目前 GitHub Actions 推送 `.github/workflows/*` 仍可能缺 `workflow` OAuth scope。  
**密管不依賴 workflow**：平台 env／本機 `.env` 可先就緒。  
待 CI 可推送後，再把同名變數接到 Actions Secrets（若預覽改由 Actions 部署），並更新 [CI.md](../CI.md) 說明注入方式（仍禁止 log 出 token）。

---

## 7. 交件摘要（給 CTO）

| 項目 | 狀態 |
|------|------|
| `.env.example` | 已備（佔位，對齊 runbook §2） |
| 本文件 | 本機＋平台密管／輪替／自檢 |
| 真密寫入平台 | **未執行**（等部署目標＋CTO 放行節奏） |
| 公開可寫入預覽 | **未啟用** |

下一步（需 CTO／產品指定預覽宿主後）：在平台寫入 8 密 → 部署 → 跑 §5 煙測 → 呈清單請 CTO 明示放行。
