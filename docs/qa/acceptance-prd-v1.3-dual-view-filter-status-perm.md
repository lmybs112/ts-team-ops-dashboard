# QA 驗收報告 — PRD v1.3（雙視圖／Filter／四態／權限）

| 欄位 | 內容 |
|------|------|
| 文件狀態 | 完成 |
| 範圍 | `apps/web`＋`packages/domain`＋`packages/api-contract`（CTO 指派切片） |
| PRD | `/workspace/docs/specs/2026-09-19-team-ops-dashboard-prd-v1.3.md` |
| Repo | `/workspace/ts-team-ops-dashboard` |
| 驗收日 | 2026-09-21（Asia/Taipei, CST） |
| 執行者 | QA（不寫功能碼、不改測試） |
| 方法 | 靜態碼對齊 PRD＋既有 vitest；無新 e2e；未點 UI 寫碼 |

---

## A. 環境

| 項目 | 值 |
|------|-----|
| 開驗時 branch | `main`（與 `origin/main` 同步） |
| 結案時 branch | `test/e2e-p0-playwright`（追蹤 `origin/main`；**HEAD 與 main 同 commit**） |
| HEAD | `a5e4a44180a3530bdb7a870fd8292e9c51b7b00e` |
| Commit | `a5e4a44` — `docs(security): R-2 public writable preview runbook`（2026-09-21 05:25:43 +0800 CST） |
| 工作樹 | 本 QA **未改產品功能碼**。結案時另有他代理未追蹤 WIP：`e2e/`、`apps/web/public/office/`、`apps/web/src/lib/office-scene.ts(.test.ts)`——**未納入本驗收「已交付」判定**；本報告 e2e **未執行**（無結果可引用） |
| Node | `/usr/bin/node`；vitest via `node_modules/.bin/vitest`（PATH 上無 `pnpm`，改用 local bin） |

### 測試指令

```bash
cd /workspace/ts-team-ops-dashboard
export PATH="/workspace/ts-team-ops-dashboard/node_modules/.bin:$PATH"
vitest run packages/domain packages/api-contract apps/web/src --reporter=verbose
```

### 輸出摘要（最終重跑 05:26:54 CST）

- **10** test files passed；**71** tests passed；exit **0**
- 含他代理新增未追蹤之 `office-scene.test.ts`（7 cases）— 仍綠，但不代表 Office UI 已接上場景
- 首次跑（05:25:42 CST）為 9 files／64 tests（尚無 office-scene test）
- 完整 stdout：`docs/qa/evidence-vitest-domain-contract-web-2026-09-21.txt`

涵蓋套件測試（摘錄）：

| 套件 | 檔案 | 結果 |
|------|------|------|
| domain | `status.test.ts`（§6.1）、`aggregate.test.ts`（§6.2）、`filter.test.ts`（§N.3）、`permissions.test.ts`（§6.3）、`ingest.test.ts`（§6.4） | 全綠 |
| api-contract | `p1-p20.test.ts`（P1–P20 權限／ingest／未授權） | 全綠 |
| web | `react-filter-store.test.ts`、`filter-issues.test.ts`、`a11y-contrast.test.ts`；另 WIP `office-scene.test.ts` | 全綠 |

### Git 證據

開驗：
```text
On branch main
Your branch is up to date with 'origin/main'.
```

結案：
```text
## test/e2e-p0-playwright...origin/main
HEAD = a5e4a44 (= origin/main)
```

---

## B. 驗收表（逐條）

| ID | PRD 條文 | 結果 | 證據 | 備註 |
|----|----------|------|------|------|
| **S1** | 雙視圖可達：View Office／View Linear；切換控制清楚可見 | **Pass** | 路由：`apps/web/app/office/page.tsx` L1–4、`apps/web/app/linear/page.tsx` L1–4；根路徑 redirect `/office`：`app/page.tsx` L3–4；切換：`ViewSwitcher.tsx` L21–39（`View Office`／`View Linear` Link → `/office`／`/linear`）；殼層：`AppShell.tsx` L13–19 | Segmented 文案＋`aria-current`；頂欄永遠可見 |
| **S8** | View Office：整頁貓虛擬辦公室可掃 Agent／阻塞；點貓開詳情；非三欄中欄裝飾 | **Partial** | 整頁路由＋獨立 section：`OfficeView.tsx` L19–68（`aria-label="View Office"`）；7 Agent 卡＋`aggregateAgentStatus` L26–66；**非**三欄合體（`AppShell`＝header＋main） | **缺**：3D／半寫實貓場景、工位螢幕／文件意象、點貓詳情抽屜、底 dock（見 Finding-003） |
| **S9** | View Linear：整頁 Issues／Projects；列表／篩選／詳情；零重整 | **Partial** | 整頁：`LinearView.tsx` L17–69；列表＋共用 Filter：`filterIssues` L12–14；blockedReason 顯示 L46–48 | **缺**：詳情側欄、改狀態／指派、Projects 下鑽頁（見 Finding-002） |
| **S11** | 視圖切換＋同源；Filter 跨視圖保留；禁止唯一總覽＝三欄合體 | **Pass** | 切換控制＋同源 Filter：`ViewSwitcher`＋`FilterProvider`（`providers.tsx` L7–12 包全 app）；domain `createFilterStore.switchView` 不重置（`filter.ts` L34–36；`filter.test.ts` 「persists filters…」）；web 殼測試：`react-filter-store.test.ts` 「keeps … Office → Linear」L12–29 | 無「左專案｜中辦公室｜右 Inbox」唯一總覽結構 |
| **S3** | 篩選 → 同源過濾；零整頁重整；切 Office⇄Linear 後篩選仍在 | **Pass**（單元／架構） | domain：`filter.test.ts` L10–28、L39–44；web store：`react-filter-store.test.ts` L12–49；UI 共用 FilterBar：`FilterBar.tsx` L6–74；兩邊消費同 state：`OfficeView`／`LinearView` `useFilter()` | 客戶端 `Link`＋layout 級 `FilterProvider` → soft nav 應保留；**無**瀏覽器 e2e；硬重整會丟（無 URL sync，見 Finding-004） |
| **U4** | 快篩零整頁重整；切視圖不丟 Filter State | **Pass**（同 S3） | 同上；`switchView` 僅改 view id（`react-filter-store.ts` L50–52；測試 L52–65 clear 僅 `clear()`） | 建議級 URL 同步未做＝Minor 風險，非本條 Fail |
| **§N.3** | Filter State：`projectId`／`agentId`／`status`／`query`；切視圖不重置 | **Pass** | `packages/domain/src/filter.ts` L3–38；預設 `all`／空 query L10–15；web wrap：`react-filter-store.ts` L20–60 | Office 點 Agent 寫 `agentId`：`OfficeView.tsx` L40–41 |
| **§6.1** | 四態固定 `todo`／`doing`／`blocked`／`done`；blocked 必填 reason ≤120 | **Pass**（domain＋契約）；web **Partial**（只讀） | domain：`status.ts` L1–50；`status.test.ts` 全套；契約：`createOpsApi.ts` `validateBlocked` L113–125；P3／P4／P9；web 顯示四態＋色：`constants.ts` L24–37、`LinearView` status pill | web **無**改狀態表單／blockedReason 輸入／阻擋儲存 UI（Finding-002） |
| **§6.2** | 聚合優先序 blocked＞doing＞todo＞done；blocked 摘要 ≤40 | **Pass** | `aggregate.ts` L18–47；`aggregate.test.ts` 全套；Office 使用：`OfficeView.tsx` L28–31、L52–61 | 空任務→`done` 與 PRD「無任務可視為空閒／done」一致 |
| **§6.3** | mei／CTO 全權；職缺 bot 僅改自己 assignee；未授權拒絕寫入 | **Pass**（domain＋api-contract） | domain：`permissions.ts` L20–46；`permissions.test.ts`；契約 P1–P20：`p1-p20.test.ts`（mei 201、bot create 403、跨 assignee 403、無 Bearer 401 等） | web **未**接寫入／角色 UI（Finding-002）；CTO 以 human token 建模（見 Finding-005） |
| **§6.4** | ingest：blocked 缺 reason→400；非法 enum→400；冪等 source+sourceRef | **Pass** | domain：`ingest.ts` L50–120；`ingest.test.ts`；契約：`postIngest` L228–282；P7–P11／P14–P15 | github source→400 `SOURCE_NOT_ALLOWED`（MVP）有測 |
| **U1**（輔助） | ≤1 次點擊切 Office⇄Linear；控制永遠可見 | **Pass** | `AppShell` header 固定 `ViewSwitcher`；單 Link 點擊 | — |
| **防誤解 E** | 非三欄合體唯一總覽 | **Pass** | 架構為雙路由整頁＋共用殼；無合體三欄實作 | — |

### 計數（本表主列）

| 結果 | 數 |
|------|-----|
| Pass | 10 |
| Partial | 3（S8、S9、§6.1-web 顯示層） |
| Fail | 0（主列；完整路徑 S4 見 Findings） |
| Blocked | 0 |

> 註：成功標準 **S4**（詳情→改 Status／blockedReason→存檔）**不在本表「Pass」**——web 無寫入 UI，記為 Finding-002（Major），並納入放行條件。

---

## C. Findings（bug／缺口清單）

### Finding-001｜Minor｜P2｜api-contract 未呼叫 domain `authorize`／`validateStatusAndReason`

| 欄位 | 內容 |
|------|------|
| 可重現 | `rg authorize packages/api-contract/src` → 無命中；`createOpsApi.ts` 內嵌 `resolvePrincipal`＋`validateBlocked` |
| 期望 | 契約寫入路徑與 domain 單一真相對齊，降低漂移 |
| 實際 | domain 與 api-contract **雙份**權限／blocked 規則；目前測試各自綠 |
| 建議負責人 | 後端／契約（可選重構接 `@team-hq/domain`） |
| 相關 PRD | §6.1、§6.3、§6.4；產品架構「單一資料源」 |

### Finding-002｜Major｜P0｜apps/web 無狀態寫入／權限閘道 UI（S4 完成路徑不可驗）

| 欄位 | 內容 |
|------|------|
| 可重現 | `rg patchIssue\|postIssues\|authorize apps/web/src` → 僅 seed／顯示 `blockedReason`；`ops-client.ts` 僅 `listAllIssues()` |
| 期望 | Office 點貓或 Linear 點 Issue → 詳情 → 改 Status／填 blockedReason → 存檔；mei／CTO 全權、bot 僅自己；blocked 無 reason 擋存（PRD S4、§7.2） |
| 實際 | Linear／Office **唯讀列表／卡片**；權限僅能在 `packages/api-contract` P1–P20 契約測 |
| 建議負責人 | 前端（接 `createOpsApi` patch／post＋Bearer）；可複用 domain／契約規則 |
| 相關 PRD | S4、§6.1、§6.3、§7.2 |

### Finding-003｜Major｜P1｜View Office 非「整頁貓虛擬辦公室」（S8／設計準則）

> 結案時工作樹出現未追蹤 `office-scene.ts`／`public/office`（他代理 WIP）；**OfficeView.tsx 仍為 agent-grid 唯讀卡**，未改 Finding-003 結論。

| 欄位 | 內容 |
|------|------|
| 可重現 | 讀 `OfficeView.tsx`：agent-grid 按鈕卡＋縮寫頭像；無 3D／半寫實場景、無 dock、無詳情抽屜 |
| 期望 | 整頁貓辦公室；點貓開詳情；底 dock 快切；狀態可掃（S8、D2–D9） |
| 實際 | 功能殼級 Agent 網格；雙視圖路由正確但視覺／互動未達 Office Must |
| 建議負責人 | 前端／UI/UX |
| 相關 PRD | S8、S1 視覺、§4、設計準則 |

### Finding-004｜Minor｜P2｜Filter 未同步 URL；硬重整會丟篩選

| 欄位 | 內容 |
|------|------|
| 可重現 | Filter 僅記憶體 store（`FilterProvider`）；路由僅 `/office`／`/linear`，無 query 參數 |
| 期望 | PRD §N.3.6「建議 URL 同步 Filter（P0 建議）」；軟切換已保留 |
| 實際 | soft nav 同源 OK（單元＋架構）；F5／深鏈無篩選還原 |
| 建議負責人 | 前端 |
| 相關 PRD | §N.3、U4、S3 |

### Finding-005｜Minor｜P3｜CTO「bot」語意 vs domain `kind:"human"` 建模

| 欄位 | 內容 |
|------|------|
| 可重現 | `permissions.ts` `isFullAccess` 要求 `kind==="human"` 且 mei／cto；`{kind:"bot", roleId:"cto"}` 不會全權。契約 `TEST_TOKENS.cto` → human |
| 期望 | PRD「CTO bot…與 mei 同權」 |
| 實際 | MVP 以 human CTO token 滿足契約測；bot+cto 路徑未授全權 |
| 建議負責人 | domain／契約（文件化或擴充 `isFullAccess`） |
| 相關 PRD | §1.2、§6.3 |

### Finding-006｜Minor｜P3｜done 狀態色偏離 PRD 表（a11y 有意為之）

| 欄位 | 內容 |
|------|------|
| 可重現 | PRD `#16A34A` vs `constants.ts` `STATUS_COLOR.done = "#15803d"`；`a11y-contrast.test.ts` 要求白字對比 ≥4.5:1 |
| 期望 | 狀態色可掃＋可及性 |
| 實際 | 深於 PRD 表以通過對比；功能四態仍正確 |
| 建議負責人 | 設計／前端（PRD 表註記 a11y 覆寫即可） |
| 相關 PRD | §4.3 狀態色、S7 |

---

## D. 放行建議

### **Conditional Go**（針對本 CTO 切片：domain＋api-contract 規則可測；web 雙視圖／Filter 殼可過）

**風險說明（非感覺）：**

1. **Blocker = 0**。domain §6.1／§6.2／§6.3／§6.4 與 api-contract P1–P20（最終 vitest **71/71** 含 web／WIP office-scene）綠，權限與 ingest 400 行為有可重現契約證據。
2. **雙視圖＋Filter 同源**在架構與單元層 **Pass**（獨立 `/office`｜`/linear`、layout 級 `FilterProvider`、`switchView` 不重置）。未跑瀏覽器 e2e；硬重整丟 Filter＝Minor。
3. **Major 殘留**：web **無寫入／詳情路徑**（Finding-002）→ 產品 Must **S4** 尚未閉環；Office **非貓場景**（Finding-003）→ **S8** 視覺 Must 未閉環。若放行標準＝「整包 PRD Must」，應改 **No-Go**；若標準＝「本切片：規則引擎＋契約＋雙視圖殼」，則 **Conditional Go**，條件為：
   - 前端補齊 Issue 詳情＋改狀態／blockedReason＋權限閘道（接契約 API）；
   - Office 場景／詳情／dock 依設計排期，不阻塞契約合規宣稱。
4. **不取代**專職 E2E／視覺回歸；本報告僅靜態＋既有 vitest。

### 一句話

**Conditional Go：domain／契約四態・聚合・權限・ingest 可放行；web 雙視圖＋Filter 殼 Pass，但缺寫入 UI 與真 Office 場景故完整產品 Must 未閉環。**

---

## 附錄：關鍵檔案索引

| 主題 | 路徑 |
|------|------|
| 四態 | `packages/domain/src/status.ts` |
| 聚合 | `packages/domain/src/aggregate.ts` |
| Filter | `packages/domain/src/filter.ts` |
| 權限 | `packages/domain/src/permissions.ts` |
| Ingest | `packages/domain/src/ingest.ts` |
| 契約 API | `packages/api-contract/src/createOpsApi.ts` |
| P1–P20 | `packages/api-contract/src/p1-p20.test.ts` |
| 視圖切換 | `apps/web/src/components/ViewSwitcher.tsx` |
| Filter 殼 | `apps/web/src/filters/FilterProvider.tsx`、`react-filter-store.ts` |
| Office／Linear | `apps/web/src/components/OfficeView.tsx`、`LinearView.tsx` |
| 測試日誌 | `docs/qa/evidence-vitest-domain-contract-web-2026-09-21.txt` |
