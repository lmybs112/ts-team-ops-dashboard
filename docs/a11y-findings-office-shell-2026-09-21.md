# A11y Findings — Team HQ Office Shell（輕量掃描）

**日期：** 2026-09-21（Asia/Taipei）  
**範圍：** `AppShell`／`ViewSwitcher`／`FilterBar`／`OfficeView`／`layout`／`globals.css` 及殼層相關 button／nav（無 dialog／sheet 元件）  
**標準：** WCAG 2.2 AA；近 Google Accessibility（僅鍵盤可操作、焦點可見／順序／陷阱、對比）  
**方法：** 靜態讀碼 + CSS 變數／色票 **推估**對比（相對亮度公式）；**未**做實機鍵盤／讀屏腳本。

---

## TLDR

**有條件（Conditional Pass）** — 殼層以原生 `<button>`／`<a>`／`<select>`／`<input>` 為主，鍵盤路徑大致成立；**尚未**達可宣稱 AA 通過。

| 項目 | 數值 |
|------|------|
| Finding 總數 | **6**（Critical 0／Serious 3／Moderate 2／Minor 1） |
| 最嚴重 1–3 | **A11Y-OS-001** 視圖切換焦點環被裁切；**A11Y-OS-002** `done` 狀態 pill 文字對比不足；**A11Y-OS-003** 未選取卡片／控件邊框對比不足 |

**通過條件（建議）：** 補明確 `:focus-visible`（並避免裁切）、加深 `done` 綠或加深 pill 文字、提高未選取控件邊框對比；補 skip link 更佳。

---

## Finding 列表

### A11Y-OS-001 — ViewSwitcher 焦點指示被 `overflow: hidden` 裁切

- **嚴重度：** Serious  
- **WCAG：** 2.4.7 Focus Visible；2.4.11 Focus Appearance（WCAG 2.2 AA）  
- **位置：** `apps/web/app/globals.css`（`.view-switcher`）＋ `apps/web/src/components/ViewSwitcher.tsx`（`.seg` links）  
- **重現步驟（鍵盤）：**  
  1. 開啟 `/office`。  
  2. Tab 至「View Office」或「View Linear」。  
  3. 觀察連結周圍的焦點環是否完整可見。  
- **預期 vs 現況：**  
  - 預期：鍵盤焦點時有完整、可辨識的焦點指示（不被父層裁切）。  
  - 現況（靜態）：`.view-switcher { overflow: hidden; border-radius: 999px; }` 會裁切子元素 outline／box-shadow 焦點環；且全站無自訂 `:focus-visible`。  
- **建議修法：** 拿掉或改為不裁切焦點的 overflow 策略，並為 `.seg:focus-visible` 加內側 ring／高對比 outline。  
- **證據類型：** 靜態推估（結構＋CSS）；**建議實機 Tab 確認**瀏覽器預設 outline 裁切程度。

---

### A11Y-OS-002 — `done` 狀態 pill 白字對比不足

- **嚴重度：** Serious  
- **WCAG：** 1.4.3 Contrast (Minimum)  
- **位置：** `apps/web/src/lib/constants.ts`（`STATUS_COLOR.done = #16a34a`）＋ `OfficeView`／`LinearView` 的 `.status-pill`（`globals.css`：`color: #fff; font-size: 0.7rem`）  
- **重現步驟：**  
  1. 開啟 Office，找到狀態為 `done` 的 Agent 卡（或 Linear 列）。  
  2. 檢視 pill 上白色小字與綠色底。  
- **預期 vs 現況：**  
  - 預期：一般文字對比 ≥ 4.5:1（pill 約 0.7rem，非大字）。  
  - 現況（**推估**）：`#ffffff` on `#16a34a` ≈ **3.30:1** → AA 不合格。同組 `todo`／`doing`／`blocked` 推估分別約 4.83／5.17／4.83，勉強過線。  
- **建議修法：** 將 `done` 改為更深綠（例如 `#15803d` 等級）或改深色字＋淺底。

---

### A11Y-OS-003 — 未選取 Agent 卡／表單控件邊框對比不足（非文字）

- **嚴重度：** Serious  
- **WCAG：** 1.4.11 Non-text Contrast  
- **位置：** `globals.css` — `.agent-card`、`.filter-bar select`／`input`、`.btn-clear`、`.view-switcher` 使用 `--border: #e5e7eb` 於 `#fff`／`#fafafa`  
- **重現步驟：**  
  1. 開啟 `/office`，檢視未選取 Agent 卡外框。  
  2. 檢視 header 篩選 select／搜尋框／清除按鈕外框。  
- **預期 vs 現況：**  
  - 預期：辨識控件邊界的對比 ≥ 3:1。  
  - 現況（**推估**）：`#e5e7eb` vs `#ffffff` ≈ **1.24:1**；hover `#9ca3af` ≈ **2.54:1**，仍 < 3:1。選取態 `#111` 邊框則足夠。  
- **建議修法：** 將控件／卡片預設邊框改為 ≥ 3:1 的灰（例如 `#9ca3af` 再加深，或 `#6b7280`）。

---

### A11Y-OS-004 — 全站缺少明確 `:focus-visible` 樣式（依賴 UA）

- **嚴重度：** Moderate  
- **WCAG：** 2.4.7 Focus Visible；2.4.11 Focus Appearance  
- **位置：** `apps/web/app/globals.css`（全域）；影響 `ViewSwitcher`、`FilterBar`、`OfficeView` agent buttons、`btn-clear`  
- **重現步驟：**  
  1. 僅用鍵盤 Tab 遍歷 header → Agent 卡。  
  2. 在選取態 Agent 卡（inset `#111` 雙線）上確認焦點與「已選取」是否可區分。  
- **預期 vs 現況：**  
  - 預期：一致、高對比、面積足夠的焦點指示；選取態與焦點態可區分。  
  - 現況（靜態）：無 `outline: none`（UA 預設可能仍顯示），但也無專案級 `:focus-visible`；選取態視覺接近「框線強調」，易與焦點混淆。  
- **建議修法：** 統一 `:focus-visible { outline: 2px solid …; outline-offset: 2px; }`（或內側 ring），選取態改用背景／check 標記而非僅加深邊框。  
- **證據類型：** 靜態；**需實機**確認各瀏覽器 UA outline 是否足夠且未被樣式蓋過。

---

### A11Y-OS-005 — 無「跳到主要內容」連結

- **嚴重度：** Moderate  
- **WCAG：** 2.4.1 Bypass Blocks  
- **位置：** `apps/web/src/components/AppShell.tsx`／`apps/web/app/layout.tsx`（sticky header 含 nav＋多個篩選控件）  
- **重現步驟：**  
  1. 載入 `/office` 或 `/linear`。  
  2. 從頁首開始連續 Tab：需經過品牌區旁的視圖切換與整排 Filter 才能進 `main`。  
- **預期 vs 現況：**  
  - 預期：提供 skip link（或同等機制）一次跳到 `<main>`。  
  - 現況：有語意 `<header>`／`<main>`，但無 skip link；header 為 sticky，每頁重複控件多。  
- **建議修法：** 在 `body`／`AppShell` 最前加「跳到主要內容」連結，目標 `main`（可加 `id`／`tabIndex={-1}`）。

---

### A11Y-OS-006 — Agent 選取態主要靠邊框，焦點／選取易混淆（次要）

- **嚴重度：** Minor  
- **WCAG：** 1.4.1 Use of Color（部分）；2.4.7（與 OS-004 連動）  
- **位置：** `OfficeView.tsx`（`aria-pressed`＋`.agent-card.selected`）／`globals.css`  
- **重現步驟：**  
  1. Tab 到一張 Agent 卡並 Space 選取。  
  2. 再 Tab 離開／回來，比較「選取」與「焦點」外觀。  
- **預期 vs 現況：**  
  - 預期：選取有非僅顏色／非僅細邊框的明確狀態；與焦點分離。  
  - 現況：`aria-pressed` 已正確（輔助技術友善）；視覺上僅 `border-color`＋inset shadow。對比選取邊框本身足夠，但與焦點指示疊加時易混淆。  
- **建議修法：** 選取態加背景淡底或「已選」文字／圖示；焦點另用 outline。

---

## 正向觀察（非 finding）

- `layout.tsx`：`lang="zh-Hant"` 正確。  
- `AppShell`：`<header>`＋`<main>` 地標清楚。  
- `ViewSwitcher`：`<nav aria-label>`＋`aria-current="page"`。  
- `FilterBar`：`role="search"`＋各控件 `sr-only` 標籤；原生 `select`／`search`／`button` 鍵盤可操作。  
- `OfficeView`：Agent 為 `<button type="button">`＋`aria-pressed`；頭像 `aria-hidden`。  
- 狀態 pill 含文字（非僅色點），利於 1.4.1。  
- **未發現** dialog／sheet／modal；**無焦點陷阱實作需求**（目前 N/A）。  
- 正文／muted 文字對比（`#111`／`#6b7280` on `#fafafa`／`#fff`）推估達 AA。

---

## 無法靜態斷言、需實機掃讀的項目

| 項目 | 原因 |
|------|------|
| UA 預設 focus ring 是否在所有目標瀏覽器可見且面積／對比達 2.4.11 | 依賴瀏覽器與 OS 設定 |
| ViewSwitcher `overflow: hidden` 實際裁切程度 | 需 Tab + 截圖／DevTools |
| Sticky header 下焦點捲動是否把控件捲入視窗 | 需實機鍵盤 |
| 觸控／滑鼠 `:focus-visible` 行為是否符合預期 | 需實機 |
| 完整讀屏名稱／活區公告 | 本次範圍刻意不做 |

---

## 檔案對照

| 檔案 | 角色 |
|------|------|
| `apps/web/src/components/AppShell.tsx` | 殼層 header／main |
| `apps/web/src/components/ViewSwitcher.tsx` | 視圖 nav links |
| `apps/web/src/components/FilterBar.tsx` | 共用篩選 |
| `apps/web/src/components/OfficeView.tsx` | Agent 卡按鈕網格 |
| `apps/web/app/office/page.tsx` | Office 路由 |
| `apps/web/app/layout.tsx` | `lang`、root |
| `apps/web/app/globals.css` | 色票、焦點／邊框／overflow |
| `apps/web/src/lib/constants.ts` | `STATUS_COLOR` |
| `apps/web/src/components/LinearView.tsx` | 同色 pill（殼層狀態色連動，一併記錄） |

**產出路徑：** `docs/a11y-findings-office-shell-2026-09-21.md`  
**產品碼：** 未修改。
