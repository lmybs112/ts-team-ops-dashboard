# Team HQ Ops API — 權限與錯誤碼

| 欄位 | 內容 |
|------|------|
| 對齊 | PRD v1.3 §6、ADR-002／003、資安審查 S-H1／S-H2 |
| 契約 | [`openapi.yaml`](./openapi.yaml) |
| 狀態 | Sprint 0 文件；實作須有紅燈測試覆蓋本文件案例 |

---

## 1. 行為者（Actor）

| actorId | kind | 說明 |
|---------|------|------|
| `mei` | human | 產品擁有者；全權 |
| `cto` | human／bot | 指揮窗口；與 mei 同權 |
| `pm` / `uiux` / `frontend` / `backend` / `qa` / `devops` | bot | 職缺 bot；僅能動自己的任務 |

MVP 認證可簡化（內網／假登入／單一 Bearer），但 **授權規則必須可測**。Token 不得寫進 repo／本文件當真值。

---

## 2. 權限矩陣

| 操作 | mei / CTO | 職缺 bot（自己的 assigneeRole） | 職缺 bot（他人任務） | 未認證 |
|------|-----------|----------------------------------|----------------------|--------|
| `GET /issues`、`GET /issues/{id}` | ✓ | ✓ | ✓（讀可） | 401 |
| `POST /issues` | ✓ | 403（請用 `/ingest`） | 403 | 401 |
| `PATCH /issues/{id}` | ✓ | ✓（僅自己） | **403** | 401 |
| `DELETE /issues/{id}` | ✓ | 403 | 403 | 401 |
| `POST /ingest` | ✓（代送） | ✓（`assigneeRole` 必須＝自己） | **403** | 401 |

### 2.1 硬性規則（ADR-003）

1. **Bot 不可改他人**：目標 Issue 的 `assigneeRole ≠` token role → `403` `FORBIDDEN_ASSIGNEE`。
2. **Bot 不可改指派**：`PATCH` 若包含 `assigneeRole` 且呼叫者為職缺 bot → `403` `FORBIDDEN_OPERATION`（改指派僅 mei／CTO）。
3. **Blocked 必填原因**：寫入後 `status=blocked` 時，`blockedReason` 必須非空且 ≤120 字；否則 `400` `BLOCKED_REASON_REQUIRED`，**不寫入**。
4. **Ingest 冪等**：鍵 = `source` + `sourceRef`。相同鍵重送 → HTTP `200` + 既有 Issue，不重複建立；首次 → `201`。
5. **Ingest 身分綁定（S-H1）**：授權角色只來自 Bearer token。職缺 bot：body.`assigneeRole` 若存在且 ≠ token role → `403`；伺服器以 token role **覆蓋／忽略** body 自稱，**不得**把 body 當授權依據。
6. **禁止 GitHub sync（MVP）**：`source=github` 寫入 → `400` `SOURCE_NOT_ALLOWED`。不得實作 GitHub Issues／PR 同步。

### 2.2 資安硬性 S-H1／S-H2（條件放行）

| ID | 規則 | 契約要求 | 驗證 |
|----|------|----------|------|
| **S-H1** | token→role 綁定 | 每 bot 獨立 token（或 JWT `roleId`）；寫入授權只信 token；body `assigneeRole` 不可提權 | bot-A token + body `assigneeRole=backend` → **403**，DB 不變 |
| **S-H2** | 全寫入強制 Bearer；禁 UI-only RBAC | `POST`／`PATCH`／`DELETE`／`POST /ingest` 無 Authorization → **401**；前端角色切換不是授權 | 無 Bearer 打任一寫入 → 401；繞過 UI 直打 API 仍 401／403 |

**禁止**：只靠前端隱藏按鈕／下拉切角色當 RBAC（S-M4／S-H2）。

---

## 3. 錯誤碼一覽

| HTTP | code | 何時 | 寫入？ |
|------|------|------|--------|
| 400 | `BLOCKED_REASON_REQUIRED` | `status=blocked` 且缺／空／僅空白 `blockedReason` | 否 |
| 400 | `BLOCKED_REASON_TOO_LONG` | `blockedReason` > 120 | 否 |
| 400 | `INVALID_ENUM` | 非法 `projectSlug`／`assigneeRole`／`status`／`source` | 否 |
| 400 | `VALIDATION_FAILED` | 其他欄位驗證（標題空、長度等） | 否 |
| 400 | `IDEMPOTENCY_KEY_REQUIRED` | ingest 缺 `source` 或 `sourceRef` | 否 |
| 400 | `SOURCE_NOT_ALLOWED` | MVP 寫入 `github` 等未開放來源 | 否 |
| 401 | `UNAUTHENTICATED` | 缺／無效 token | 否 |
| 403 | `FORBIDDEN_ASSIGNEE` | bot 改他人任務；或 ingest／寫入 body.`assigneeRole` ≠ token role（S-H1 偽造） | 否 |
| 403 | `FORBIDDEN_OPERATION` | bot 打 CRUD 建立／刪除／改指派 | 否 |
| 404 | `ISSUE_NOT_FOUND` | id 不存在 | 否 |
| 409 | `IDEMPOTENCY_CONFLICT` | 同冪等鍵但 payload 與既有紀錄語意衝突（可選；建議實作時定義：title／status 等關鍵欄不同） | 否 |

錯誤 body 形狀：

```json
{
  "error": {
    "code": "BLOCKED_REASON_REQUIRED",
    "message": "status=blocked requires non-empty blockedReason (≤120 chars)",
    "details": { "field": "blockedReason" }
  }
}
```

---

## 4. 必測案例（給 TDD 紅燈）

| ID | 案例 | 期望 |
|----|------|------|
| P1 | mei `POST /issues` 合法 | 201 |
| P2 | frontend bot `POST /issues` | 403 `FORBIDDEN_OPERATION` |
| P3 | frontend bot `PATCH` 自己的 Issue → `blocked` + reason | 200 |
| P4 | frontend bot `PATCH` 自己的 Issue → `blocked` 無 reason | 400；DB 不變 |
| P5 | frontend bot `PATCH` backend 的 Issue | 403 `FORBIDDEN_ASSIGNEE`；DB 不變 |
| P6 | frontend bot `PATCH` 自己的 Issue 改 `assigneeRole=backend` | 403 |
| P7 | ingest 首次（合法） | 201；`idempotentReplay=false` |
| P8 | ingest 同 `source`+`sourceRef` 重送 | 200；同一 `issue.id`；`idempotentReplay=true` |
| P9 | ingest `blocked` 無 reason | 400；無列寫入 |
| P10 | ingest `assigneeRole` ≠ token role（S-H1） | 403 `FORBIDDEN_ASSIGNEE`；DB 不變 |
| P11 | ingest 非法 `projectSlug` | 400 `INVALID_ENUM` |
| P12 | CTO `DELETE` Issue | 204 |
| P13 | bot `DELETE` | 403 |
| P14 | **S-H1** frontend bot token + body `assigneeRole=backend` ingest | 403；DB 不變（不可偽造） |
| P15 | **S-H1** frontend bot token ingest 合法（body role＝token 或省略後由伺服器覆蓋為 token role） | 201／200；寫入 `assigneeRole=frontend` |
| P16 | **S-H2** 無 `Authorization` 呼叫 `POST /issues` | 401 `UNAUTHENTICATED` |
| P17 | **S-H2** 無 `Authorization` 呼叫 `POST /ingest`／`PATCH`／`DELETE` | 401 |
| P18 | **S-H2** 僅改 UI 假角色、仍用 frontend bot token 打他人任務 | 403（UI 切換無效；禁 UI-only RBAC） |

實作前由單元／TDD 職缺把 **P1–P18** 寫成失敗測試；後端實作僅在紅燈存在後進行。S-H1／S-H2 為資安條件放行硬性項。

---

## 5. 觀測建議（非本 Sprint 必交，但契約預留）

- 每個寫入請求記結構化 log：`actorId`、`operation`、`issueId`、`idempotencyKey`、`outcome`（ok／4xx）
- 指標：`ingest_idempotent_hit_total`、`forbidden_assignee_total`、`blocked_reason_rejected_total`

---

## 6. 明確不做（Sprint 0）

- GitHub Issues／PR 同步
- 真實密鑰／token 寫進範例
- 實作程式碼（等 TDD 紅燈／cloud agent）
