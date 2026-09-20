# Team HQ E2E P0 案例矩陣（對齊 PRD v1.3）

| 欄位 | 內容 |
|------|------|
| 狀態 | **進行中／已有腳本**（Playwright P0 smoke） |
| 對齊 | PRD v1.3 §1.4 S1–S11、§15、雙視圖 V1–V8 |
| 目標產物 | Playwright 腳本＋可跑指令＋失敗錄影／截圖 |
| 測試對象 | 優先公開 Pages `https://lmybs112.github.io/ts-team-ops-dashboard/prototype/`；次要本機 `pnpm --filter @team-hq/web dev`（`E2E_BASE_URL=http://localhost:3000`） |
| 現況 | `e2e/` 套件＋`pnpm test:e2e`（2026-09-21）；對齊 E2E-V01–V05、E2E-F01、狀態冒煙 |

## 規則
- 紅燈→綠燈；無失敗案例不得宣稱通過
- 不取代 QA 人工驗收；不代寫產品功能碼
- 失敗必留 trace／screenshot／video（`e2e/test-results/`、`e2e/playwright-report/`）

## P0（首批｜必自動化）

| E2E ID | PRD | 路徑 | 斷言摘要 | 腳本 |
|--------|-----|------|----------|------|
| E2E-V01 | S1,V1 | 桌面開頁 | 可見 `#tabOffice`／`#tabLinear`；兩者可切 | `p0-views.spec.ts` |
| E2E-V02 | S8,V2 | 切 Office | `#view-office` 為 active；整頁辦公室（非僅中欄） | `p0-views.spec.ts` |
| E2E-V03 | S9,V3 | 切 Linear | `#view-linear` 為 active；Issues／Projects 列表在 | `p0-views.spec.ts` |
| E2E-V04 | S11,V4 | Office→Linear ≤1 點 | 無 full reload；URL／狀態不丟 Filter | `p0-views.spec.ts` |
| E2E-V05 | S11,V5 | Linear→Office | Filter（project／agent）仍在 | `p0-views.spec.ts` |
| E2E-F01 | S3,P3 | 左欄點專案 | 篩選生效；切視圖後仍保留 | `p0-filters.spec.ts` |
| E2E-F02 | S3,P4 | 點「全部」 | 篩選還原 | （P1／未腳本） |
| E2E-O01 | S2,S4,D5 | Office 點貓／工位 | 開詳情／drawer；可見任務／狀態 | （P1／未腳本） |
| E2E-O02 | S5,D5b | 底 dock 切 Agent | 詳情／選中態同步 | （P1／未腳本） |
| E2E-O03 | D7 | Esc／關閉 | drawer 關閉；總覽仍在 | （P1／未腳本） |
| E2E-L01 | S4,S9 | Linear 點 Issue | 詳情側欄；不丟列表上下文 | （P1／未腳本） |
| E2E-L02 | S4,D6 | 改 status→blocked 無 reason | 不可存（或等價擋下） | （P1／未腳本） |
| E2E-L03 | S4 | 改 status 合法存檔 | 列表／Office 聚合同步 | （P1／未腳本） |
| E2E-M01 | S10,M1 | viewport ≤430 | 首屏專案掃讀（非完整 3D 首屏） | （P1／未腳本） |
| E2E-M02 | M2 | 點專案 | 下鑽成員／任務 | （P1／未腳本） |
| E2E-M03 | M3 | 開 sheet | 可看；權限內可改狀態 | （P1／未腳本） |
| E2E-X01 | V7 | 反例 | 合體三欄當唯一總覽 → **必須失敗／不存在** | （P1／未腳本） |
| Status smoke | S2 | Office／Linear | blocked legend／hotspot／`#statusSeg` blocked 可見 | `p0-status.spec.ts` |

## P1（次批｜冒煙／視覺）
- RWD 斷點 720／430 截圖基線
- 走動中點貓仍開側欄（V3）
- ⌘K 跳 Office／Linear／Project
- Project／Settings 可達並回雙視圖（V8）

## 交件 checklist
- [x] `pnpm test:e2e`（或 `pnpm --filter @team-hq/e2e test`）可跑
- [x] 案例 ID ↔ PRD 條目對照表（本檔＋`e2e/README.md`）
- [x] 失敗 artifact 路徑說明（`e2e/test-results/`、`e2e/playwright-report/`）
- [x] 公開 https Pages 為預設 `E2E_BASE_URL`；本機 server 見 `e2e/README.md`

## 阻礙
- ~~尚無公開 https（等 DevOps／CTO）~~ → Pages prototype 已上線，預設 baseURL 指向之
- ~~repo 尚無 Playwright 骨架／package.json~~ → `e2e/`＋根腳本 `test:e2e` 已落地
