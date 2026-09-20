# Team HQ E2E（P0 Playwright）

對齊 PRD v1.3 S1／S3／S11 與 `docs/e2e/team-hq-p0-matrix.md`（E2E-V01–V05、E2E-F01、狀態冒煙）。

## 安裝

```bash
# 從 monorepo 根目錄
pnpm install
pnpm exec playwright install chromium
# 若只裝 e2e 套件內的 CLI：
pnpm --filter @team-hq/e2e exec playwright install chromium
```

## 執行

```bash
# 預設打公開 Pages prototype
pnpm test:e2e

# 或指定 base URL
E2E_BASE_URL=https://lmybs112.github.io/ts-team-ops-dashboard/prototype/ pnpm test:e2e

# 本機 apps/web（需先 pnpm --filter @team-hq/web dev）
E2E_BASE_URL=http://localhost:3000 pnpm test:e2e
```

等同：`pnpm --filter @team-hq/e2e test`

## 環境變數

| 變數 | 預設 | 說明 |
|------|------|------|
| `E2E_BASE_URL` | `https://lmybs112.github.io/ts-team-ops-dashboard/prototype/` | 測試目標 |
| `CI` | — | 設為真時啟用 retry、限制 workers |
| `PLAYWRIGHT_OUTPUT_DIR` | `e2e/test-results` | 失敗產物目錄（可改到暫存路徑） |

## 失敗產物

| 路徑 | 內容 |
|------|------|
| `e2e/test-results/` | 失敗截圖、錄影、trace（`outputDir`） |
| `e2e/playwright-report/` | HTML 報告 |

檢視報告：`pnpm --filter @team-hq/e2e report` 或開啟 `e2e/playwright-report/index.html`。

重播 trace：`pnpm exec playwright show-trace e2e/test-results/**/trace.zip`

## 案例對照

| Spec | Matrix ID | PRD |
|------|-----------|-----|
| views Office/Linear | E2E-V01–V05 | S1, S8, S9, S11 |
| filter 跨視圖保留 | E2E-F01（＋V04/V05） | S3, S11 |
| blocked／狀態可見 | status smoke | S2／狀態 chips |

Prototype 選擇器：`#tabOffice`／`#tabLinear`、`#view-office`／`#view-linear`、`#officePills`、`#statusSeg`。  
本機 web：`data-testid`（`filter-project` 等）與「View Office」／「View Linear」連結。

## 規則

- 紅燈→綠燈；產品 bug 導致失敗時保留斷言，不為綠燈削弱測試。
- 不取代人工 QA；不代寫產品功能碼。
