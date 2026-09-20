# R-2 Runbook：公開可寫入預覽放行

| 欄位 | 內容 |
|------|------|
| 日期 | 2026-09-21（Asia/Taipei） |
| 作者 | 資安工程師（主筆；可與 DevOps 對齊執行） |
| 對齊 | S-H1／S-H2、FU-H1b／FU-H2a、R-1（53 綠）、DevOps「公開 https＋密不進庫」 |
| 範圍 | **公開 https、且 API 允許寫入** 的預覽環境 |
| 非範圍 | 唯讀靜態預覽；本機／內網 stub |

> **預設不放行。** 下列全部勾選後，由 **CTO** 明示放行；資安／DevOps 抽驗可擋。

---

## 1. 硬性條件（缺一不可）

### 1.1 Token 不可猜

| 要求 | 作法 |
|------|------|
| 熵 | 每憑證 ≥ 128 bit 密碼學亂數（例：`openssl rand -hex 32`）；**禁止** `preview`／`test`／role 名當密 |
| 綁定 | opaque 或 JWT；JWT 僅含**單一** `roleId`／`actorId`（FU-H1b） |
| 傳遞 | 只經 `Authorization: Bearer`；禁 query／fragment／localStorage 明文分享到公開頻道 |
| 驗證 | 無 Bearer → 401（P16／P17）；錯 Bearer → 401 |

### 1.2 可輪替

| 要求 | 作法 |
|------|------|
| 雙槽 | 支援 `CURRENT`＋可選 `PREVIOUS`（輪替窗口 ≤ 1h）或即時失效 |
| 程序 | 1) 核發新 token 寫入密管／平台 env 2) 重部署或熱載 3) 撤銷舊值 4) 記時間／操作者（無密值） |
| 洩漏 | 疑似外洩 → **立刻**撤銷該 actor 全部預覽 token 並重發 |
| 驗證 | 舊 token 寫入 → 401；新 token 行為符合其 role |

### 1.3 禁神鑰（FU-H1b）

| 要求 | 作法 |
|------|------|
| 一 actor 一密 | mei／CTO／每職缺 bot **各別** env（例 `TOKEN_FRONTEND`…）；**禁止** `TOKEN_ALL`／共用 `BOT_TOKEN` |
| 核發閘 | 設定層拒絕「一密多 role」；對齊 P19 |
| 驗證 | 共用密無法核發，或跨 role 寫入 → 401／403 |

### 1.4 環境變數零入庫

| 要求 | 作法 |
|------|------|
| Git | `.env`／`.env.*` ignore；僅 `.env.example` 佔位符（無真值） |
| CI／平台 | Secrets／Env 注入；log／artifact／PR 正文禁印 token |
| 文件 | OpenAPI／README／runbook **無**真 token |
| 掃描 | 合入前：`git grep`／secret scan 無高熵 Bearer；歷史誤入 → rotate＋purge |
| 驗證 | `git ls-files` 無 `.env`；example 僅 `changeme`／空 |

### 1.5 既有閘門（沿用，不重開）

| ID | 條件 |
|----|------|
| R-1 | `pnpm test` 53／53 綠（含 P14–P20）仍為放行前置 |
| S-H2 | 寫入強制 Bearer；禁 UI-only RBAC |
| FU-H2a | `X-Role`／`X-Actor*` 不提權（P20） |
| DevOps | 預覽為**公開 https**；主分支紅不部署 |

---

## 2. 建議 env 形狀（示例名，非真值）

```bash
# .env.example — 可入庫；值必須是佔位符
TOKEN_MEI=
TOKEN_CTO=
TOKEN_FRONTEND=
TOKEN_BACKEND=
TOKEN_PM=
TOKEN_UIUX=
TOKEN_QA=
TOKEN_DEVOPS=
# 禁止：TOKEN_GOD / SHARED_BOT_TOKEN / PREVIEW_PASSWORD=preview
```

平台（Vercel／Fly／等）→ 對應 Secret；本地只用未追蹤 `.env`。

---

## 3. 輪替速查（DevOps）

1. 密管生成新值（每需輪替的 actor）。  
2. 更新預覽 Secret；部署或重載。  
3. 煙測：新 Bearer `POST /ingest` 或健康寫入；舊 Bearer 預期 401。  
4. 刪除／覆蓋舊 Secret；票據只記 actor＋時間，**不記密值**。

---

## 4. 放行前煙測（資安或 DevOps，5 分鐘）

| # | 動作 | 期望 |
|---|------|------|
| 1 | 無 `Authorization` 打任一寫入 | 401 |
| 2 | frontend token + body `assigneeRole=backend` ingest | 403；資料不變 |
| 3 | frontend token + `X-Role: cto` 建 Issue | 非 201；不升權 |
| 4 | 確認平台 env **無**單一 bot 神鑰 | 每 role 分密 |
| 5 | `git grep -E 'Bearer [A-Za-z0-9_-]{20,}'`（或等價）於 repo | 無真密 |

---

## 5. 放行／不放行清單

### ✅ 可放行（須全部成立）

- [ ] R-1：`pnpm test` 53 綠（或後續等價全集）於將部署的 SHA  
- [ ] 預覽 URL 為公開 **https**（非 localhost）  
- [ ] 每 actor 獨立、不可猜 token（§1.1–1.3）  
- [ ] 輪替程序已寫入／演練（§1.2、§3）  
- [ ] 真密只在平台 Secret；repo／PR／log／docs 零真值（§1.4）  
- [ ] `.env.example` 僅佔位；`.gitignore` 含 `.env`  
- [ ] §4 煙測 1–5 通過  
- [ ] **CTO 明示**「允許此預覽 SHA 公開可寫入」

### ❌ 不放行（任一即擋）

- [ ] 共用神鑰／一密多 role  
- [ ] 可猜密（`preview`、role 名、短字串）  
- [ ] 真 token 進 git／CI log／預覽頁 HTML／Issue 評論  
- [ ] 無 Bearer 可寫入，或 `X-Role` 可升權  
- [ ] 無法輪替或舊 token 撤不掉  
- [ ] R-1 紅燈或未在部署 SHA 複跑  
- [ ] 僅 HTTP／需 VPN 卻號稱「公開預覽交 mei」且寫入已開  
- [ ] 無 CTO 明示放行

---

## 6. 簽核與殘差

| 角色 | 責任 |
|------|------|
| 資安 | 本 runbook；抽驗 §4；建議放行／阻擋 |
| DevOps | 密管、env、https 預覽、輪替執行 |
| CTO | **唯一**公開可寫入放行決策 |

**R-2 文件交付：完成。** 實際「預覽可寫入」仍待清單全綠＋CTO 放行後，R-2 執行期才結案。
