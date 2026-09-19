# OpenAPI 複審 — S-H1／S-H2

| 欄位 | 內容 |
|------|------|
| 日期 | 2026-09-19（Asia/Taipei） |
| 審查者 | 資安工程師 |
| 指派 | CTO｜OpenAPI 合併後複審 |
| 標的 | `docs/api/openapi.yaml`、`docs/api/permissions-and-errors.md`（PR [#1](https://github.com/lmybs112/ts-team-ops-dashboard/pull/1)，MERGED） |
| 對照 | Sprint 0 審查 `docs/security/2026-09-19-team-hq-sprint0-security-review.md` |

## 結論（一句）

| 項目 | 契約狀態 | 公開預覽 |
|------|----------|----------|
| **S-H1** ingest 身分綁定 | **已寫死（可接受）** | 實作＋P10 綠燈前仍不可放行寫入預覽 |
| **S-H2** 弱／假登入＋公開預覽 | **部分寫死** | **仍不放行**；須關 follow-up 後再評 |

契約層可繼續後端／TDD。公開 https 可寫入預覽閘門 **維持暫不放行**。

---

## S-H1 — Ingest 身分未綁 role

### 已寫死（證據）

| 控制 | 位置 |
|------|------|
| Token role **必須**＝ body.`assigneeRole`，否則 403 | OpenAPI `POST /ingest` description；permissions §2.1 #5 |
| 冪等鍵撞到他人 Issue → 403 | OpenAPI ingest description |
| Bot 不可 PATCH 他人；不可改 `assigneeRole` | OpenAPI PATCH；permissions §2.1 #1–2 |
| 必測 P5／P6／P10 | permissions §4 |
| Bearer 須解析 `kind` + `actorId` | `components.securitySchemes.bearerAuth` |
| 全域 `security: bearerAuth`（`/health` 除外） | OpenAPI root |

→ **S-H1 契約閘門：通過（條件：實作不得弱化為「只信 body」）。**

### 殘差 → follow-up

| ID | 嚴重度 | 缺口 | 要求 |
|----|--------|------|------|
| **FU-H1a** | 中 | 現為「相等檢查」，非「伺服器覆蓋」 | Bot ingest：以 token `actorId` **覆寫／忽略** body.`assigneeRole`（相等檢查可保留作防呆） |
| **FU-H1b** | 中 | 「單一 Bearer」用語可被解讀成全 bot 共用一鑰 | 規範：**每 bot 一 token**（或 JWT claim 綁定單一 role）；共用神鑰＝S-H1 重開 |
| **FU-H1c** | 低 | mei／CTO 代送 ingest 未寫清 | 代送時以 body.`assigneeRole` 為準；audit `updatedBy`＝代送者 |

---

## S-H2 — 公開預覽＋弱／假登入

### 已寫死（證據）

| 控制 | 位置 |
|------|------|
| 預設需 Bearer | `security: - bearerAuth: []` |
| 未認證 → 401 `UNAUTHENTICATED` | 權限矩陣「未認證」欄；錯誤碼表 |
| 密鑰不進文件 | info.description；bearerAuth description |
| Bot 不得走 CRUD 建立 | POST /issues 403；P2 |

### 未寫死（S-H2 仍開）

| ID | 嚴重度 | 缺口 | 要求 |
|----|--------|------|------|
| **FU-H2a** | **高** | 「假登入／單一 Bearer」無規範邊界 | 假登入**僅能**換發 server 簽發／綁定的 Bearer（含 `kind`+`actorId`）。**禁止** `X-Role`／body／query 自報身份當授權 |
| **FU-H2b** | **高** | 無「缺 Authorization」專測 | 新增 **P0**：`POST/PATCH/DELETE /issues*`、`POST /ingest` 無 Authorization → **401**；DB 不變 |
| **FU-H2c** | 中 | 公開預覽未禁共用／可猜 token | 預覽環境：不可猜、可輪替；禁止全角色共用一密；旋轉 runbook 一句即可 |
| **FU-H2d** | 低 | UI 角色切換易變 UI-only RBAC | 文件一句：前端角色切換≠授權；所有寫入以伺服器 token 為準（對齊原 S-M4） |

→ **S-H2 契約閘門：未通過（公開寫入預覽仍擋）。** FU-H2a＋FU-H2b 關閉並測試綠後可再評。

---

## 其他（非阻擋本複審）

| 觀察 | 建議 |
|------|------|
| `team-hq-api-docs` 與 repo 副本可能漂移 | 以 **repo `docs/api/`** 為準 |
| ProjectSlug／RoleId 與早期 PRD 用詞需單一真相 | 產品／後端對齊 enum；資安只要求授權綁定一致 |
| OpenAPI 尚未含「私有 repo 顯示名」API | 仍依 Sprint 0 **S-M1**；有 projects 公開 API 時再審 |

---

## 放行建議（更新）

| 閘門 | 建議 |
|------|------|
| 後端／TDD 依契約開工 | **放行**（P1–P13＋本檔 FU 測試） |
| 公開 https **可寫入**預覽 | **仍不放行**（待 FU-H2a／H2b＋實作驗證） |
| S-H1 契約本身 | **接受**；FU-H1a／H1b 實作期關閉 |

## 請 CTO 轉交

1. **後端／TDD**：P0（無 token→401）＋P1–P13；實作 FU-H1a（token 覆蓋 assigneeRole）、FU-H1b（每 bot 一 token）。  
2. **文件（可同 PR）**：permissions 補 FU-H2a／H2d 規範句；OpenAPI info 刪除易誤解的「單一 Bearer＝共用神鑰」暗示。  
3. 複審觸發：上述合併後／首次公開寫入預覽前再叫資安。
