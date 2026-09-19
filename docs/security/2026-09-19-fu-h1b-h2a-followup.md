# 短 follow-up：FU-H1b＋FU-H2a（main 補看）

| 欄位 | 內容 |
|------|------|
| 日期 | 2026-09-19（Asia/Taipei） |
| 對照 | CTO 複審對照；**main＝PR #2 已合** |
| 已在 main | **FU-H1a** token 覆蓋／忽略 body `assigneeRole`；**FU-H2b** P16–P17 無 Bearer→401；P14／P15／P18 |
| 本檔 | 僅殘差 **FU-H1b**、**FU-H2a** |
| 公開寫入預覽 | **仍不放行** |

## 補看結論

| ID | main 現況 | 殘差 | 動作 |
|----|-----------|------|------|
| FU-H1a | 已寫死覆蓋／忽略＋P14／P15 | — | 無需再開 |
| FU-H2b | P16／P17 | — | 無需再開 |
| **FU-H1b** | 有「每 bot 獨立 token」 | 仍寫「單一 Bearer」可簡化；**未明示禁共用神鑰**；無測試 | 短補契約＋P19 |
| **FU-H2a** | 禁 body／query／UI 自稱；禁 UI-only | **未點名禁 `X-Role`／`X-Actor*` header** | 短補契約＋P20 |

S-H1／S-H2 主閘門維持「契約條件通過」；本 follow-up 為收口用詞與測試，不重開高風險 finding。

---

## FU-H1b — 禁共用神鑰

**缺口**：`permissions-and-errors.md` MVP 句仍可讀成「全系統一顆 Bearer」；未禁止一 token 對應多 role。

**契約補句（建議寫進 §2.2 S-H1 列）**：

> 禁止共用神鑰：不可用同一 opaque token（或同一組可解析為多 role 的密）代表多個職缺 bot。每 bot 一 token，或 JWT 僅含單一 `roleId`。運維輪替時舊 token 立即失效。

**測試**：

| ID | 案例 | 期望 |
|----|------|------|
| **P19** | 故意核發「可同時通過 frontend＋backend 驗證」的共用密，用其 ingest／PATCH 跨 role | **拒絕核發**（設定層）或任一跨 role 寫入 → **401／403**，DB 不變 |

---

## FU-H2a — 禁 X-Role／body 自報（header 收口）

**缺口**：已禁 body／UI；OpenAPI 有「不得信任 body／query／UI」，但未點名自訂 header。

**契約補句（OpenAPI `bearerAuth`＋§2.2 S-H2）**：

> 授權身分只來自 `Authorization: Bearer`。禁止以 `X-Role`／`X-Actor`／`X-Actor-Id`／`X-User-Id` 或任何非 Bearer 欄位自報身份；此類 header **忽略或不作為授權依據**（不得因帶 X-Role 就提權）。

**測試**：

| ID | 案例 | 期望 |
|----|------|------|
| **P20** | 無 Bearer（或 frontend token）＋`X-Role: cto`／`X-Actor: mei` 呼叫 `POST /issues` 或 `POST /ingest` | **401**（無／錯 Bearer）或仍為 frontend 權限（**不得**升成 mei／CTO）；DB 不變 |

---

## 建議 PR 範圍（後端文件，極小）

1. `docs/api/openapi.yaml` — bearerAuth／S-H2 段加 FU-H2a header 禁句；S-H1 段加 FU-H1b 禁神鑰句。  
2. `docs/api/permissions-and-errors.md` — §2.2 兩列各加一行；刪或改「單一 Bearer」為「每 actor 一 Bearer」；表加 P19／P20。  
3. 實作／TDD：P19／P20 紅燈後再綠。

## 放行

| 閘門 | 狀態 |
|------|------|
| 契約 S-H1／S-H2（PR #2） | 維持條件通過 |
| 本 FU 合入 | 建議下一個 docs PR |
| 公開可寫入預覽 | **不放行**（待實作 P14–P20 綠＋預覽營運） |
