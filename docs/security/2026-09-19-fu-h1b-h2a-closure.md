# FU-H1b／FU-H2a 收口複審結案

| 欄位 | 內容 |
|------|------|
| 日期 | 2026-09-19（Asia/Taipei） |
| 審查者 | 資安工程師 |
| 標的 | PR [#4](https://github.com/lmybs112/ts-team-ops-dashboard/pull/4) → `main` (`263dab2`) |
| 前案 | `2026-09-19-fu-h1b-h2a-followup.md` |
| 文件 | `docs/api/openapi.yaml`、`docs/api/permissions-and-errors.md` |

## 結論

| Finding | 契約狀態 | 證據 |
|---------|----------|------|
| **FU-H1b** 禁共用神鑰 | **結案** | 「每 actor 一 Bearer」；明示禁全 bot 神鑰；§2.2 列＋ingest／bearerAuth；**P19** |
| **FU-H2a** 禁 X-Role／自報 | **結案** | 點名禁 `X-Role`／`X-Actor`／`X-Actor-Id`／`X-User-Id`＋body；忽略不提權；**P20** |

先前 S-H1／S-H2／FU-H1a／FU-H2b 維持結案。Sprint 0 **契約層資安 follow-up 全部關閉**。

## 對照 checklist

| 要求 | main |
|------|------|
| 禁共用神鑰／每 bot 一 token | ✓ |
| 「單一 Bearer」改「每 actor 一 Bearer」 | ✓ |
| P19 跨 role 共用密 | ✓ |
| 禁 X-Role／X-Actor* 當授權 | ✓ |
| 假登入只換發綁定 Bearer | ✓ |
| P20 header 自報不提權 | ✓ |

## 殘餘（不擋契約結案）

| ID | 等級 | 內容 |
|----|------|------|
| **R-1** | 中（執行期） | P1–P20 紅→綠後抽驗（含 P19／P20） |
| **R-2** | 低（營運） | 公開預覽 token 不可猜／可輪替（部署 checklist） |

## 放行

| 閘門 | 建議 |
|------|------|
| OpenAPI／permissions 契約（含 FU-H1b／H2a） | **通過／結案** |
| 公開可寫入預覽 | **仍不放行**（待 R-1） |

資安簽核：FU-H1b／FU-H2a **契約結案**。無新增高風險契約缺口。
