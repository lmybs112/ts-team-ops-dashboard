# CI 說明（Sprint 0）

本文件說明 Team Ops Dashboard 的 GitHub Actions 持續整合閘門。工作流程定義於 [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)。

## 設計原則

- **CI 綠燈後才部署**（應用程式階段）；目前仍為 prototype-only，CI 採漸進啟用。
- **公開 https 交付**：本機 `127.0.0.1` 僅供開發，不作為交付網址。
- **GitHub Pages 靜態原型獨立**：預覽仍為 <https://lmybs112.github.io/ts-team-ops-dashboard/prototype/>，與本 CI 閘門分離，不會被本 workflow 取代或破壞。

## 今日行為（尚無 `package.json`）

1. 觸發：`pull_request`、以及推送到 `main`。
2. Job：`lint-and-unit`。
3. 若倉庫根目錄**沒有** `package.json`：印出 Sprint 0 提示並 **成功結束（exit 0）**，不讓 main 因原型階段而變紅。

## 當 `package.json` 落地後

CI 會自動啟用以下閘門：

| 閘門 | npm script | 必要性 |
|------|------------|--------|
| Lint | `lint` | **必填** — 缺少則失敗 |
| Unit test | `test` 或 `test:unit` | **必填** — 至少其一 |
| Typecheck | `typecheck` 或 `tsc`（例如 `tsc --noEmit`） | 建議；有 script 才執行 |

套件管理器依 lockfile 優先順序偵測：`pnpm-lock.yaml` → `yarn.lock` → `npm`（有 `package-lock.json` 則 `npm ci`）。有 lockfile 時會啟用 actions/setup-node 的依賴快取。

### 建議的 `package.json` scripts 範例

```json
{
  "scripts": {
    "lint": "eslint .",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  }
}
```

（實際工具可依專案選擇；重點是腳本名稱符合上表。）

## E2E（延後）

Playwright / E2E **不在本 workflow 執行**。`ci.yml` 內保留註解 stub，待應用可透過公開 https 預覽後再開獨立 job。

## 相關連結

- Workflow：`.github/workflows/ci.yml`
- Pages 原型：<https://lmybs112.github.io/ts-team-ops-dashboard/prototype/>
- PRD：[`docs/PRD.md`](./PRD.md)
