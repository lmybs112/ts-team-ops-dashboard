# OpenAPI S-H1／S-H2 複審結案

| 欄位 | 內容 |
|------|------|
| 日期 | 2026-09-19（Asia/Taipei） |
| 審查者 | 資安工程師 |
| 標的 | PR [#2](https://github.com/lmybs112/ts-team-ops-dashboard/pull/2) squash → `main` (`396aaa6`) |
| 文件 | `docs/api/openapi.yaml`、`docs/api/permissions-and-errors.md` |
| 前案 | `2026-09-19-openapi-sh1-sh2-rereview.md` |

## 結論

| Finding | 契約狀態 | 說明 |
|---------|----------|------|
| **S-H1** | **結案（契約通過）** | token→role 覆蓋／忽略 body；不符 → 403；P14／P15；每 bot 獨立 token |
| **S-H2** | **結案（契約通過）** | 寫入強制 Bearer → 401；禁 UI-only RBAC；P16–P18 |

**公開 https 可寫入預覽**：契約閘門已過；**實作閘門仍開**——須 P14–P18（及 P1–P13）紅→綠後，再請資安做執行期抽驗。在此之前預覽若上線，寫入 API 不得對未認證網際網路暴露。

---

## 對照 follow-up

| ID | 原要求 | PR #2 | 結果 |
|----|--------|-------|------|
| FU-H1a | token 覆寫／忽略 body role | OpenAPI ingest＋IngestRequest description；§2.1 #5；P14／P15 | **關閉** |
| FU-H1b | 每 bot 一 token | §2.2 S-H1「每 bot 獨立 token」 | **關閉**（契約） |
| FU-H1c | mei／CTO 代送可審核 | OpenAPI：代送可指定目標 role | **關閉**（低殘差可接受） |
| FU-H2a | 假登入≠自報身份；禁 UI-only | §2.2＋「禁止 UI-only RBAC」；P18 | **關閉** |
| FU-H2b | 無 Authorization → 401 | P16／P17；OpenAPI S-H2 | **關閉** |
| FU-H2c | 預覽 token 不可猜／可輪替／禁神鑰 | 未寫入本次 PR | **殘餘（營運）** — 見下 |
| FU-H2d | UI 切換≠授權 | 併入 S-H2／P18 | **關閉** |

---

## 殘餘 finding（不擋契約結案）

| ID | 等級 | 內容 | 何時關 |
|----|------|------|--------|
| **R-1** | 中（執行期） | 契約≠實作。須 TDD 紅燈 P14–P18 存在且實作後轉綠；抽驗：bot-A+偽 role→403；無 Bearer 寫入→401 | 後端＋TDD 合入後／寫入預覽前 |
| **R-2** | 低（營運） | 公開預覽環境：token 不可猜、可輪替、禁止全角色共用一密（原 FU-H2c） | DevOps 首次公開寫入預覽 checklist |

無新增高風險契約缺口。

---

## 放行建議（更新）

| 閘門 | 建議 |
|------|------|
| OpenAPI／permissions 契約（S-H1／S-H2） | **通過／結案** |
| 後端依契約＋P1–P18 實作 | **放行開工** |
| 公開可寫入預覽 | **仍待** R-1 綠燈＋建議處理 R-2 |

## 簽核

資安：契約層 S-H1／S-H2 **結案**。執行期與預覽營運殘差追蹤 R-1／R-2。
