# A11y 複驗 — Office Shell × PR #8

**日期：** 2026-09-21（Asia/Taipei）  
**基準：** `docs/a11y-findings-office-shell-2026-09-21.md`  
**程式：** `main` @ `e6d8917`（`fix(a11y): office shell Serious findings + skip link (#8)`，MERGED）  
**方法：** 靜態讀碼 + WCAG 相對亮度色票推估；對比契約測試通過。**未**做實機 Tab／讀屏。  
**產品碼：** 未修改。

---

## Serious（必驗）

| ID | 結果 | 證據 |
|----|------|------|
| **A11Y-OS-001** | **Closed** | `globals.css`：`.view-switcher` **無** `overflow: hidden`；pill 改由 `.seg` 子元素 `border-radius`。`.seg:focus-visible { outline: 2px solid #111; outline-offset: 2px; z-index: 1 }`。全域亦有 `:focus-visible` ring。 |
| **A11Y-OS-002** | **Closed** | `constants.ts`：`STATUS_COLOR.done` `#16a34a` → **`#15803d`**。推估 `#fff` on `#15803d` ≈ **5.02:1**（舊 3.30:1）≥ 4.5:1。`a11y-contrast.test.ts` 契約通過。 |
| **A11Y-OS-003** | **Closed** | `globals.css`：`--border` `#e5e7eb` → **`#6b7280`**。推估 `#6b7280` vs `#fff` ≈ **4.83:1**、vs `#fafafa` ≈ **4.63:1**（舊 ~1.24:1）≥ 3:1。`.agent-card:hover` 邊框加深為 `#4b5563`。 |

## 004–006（次要，PR 一併修）

| ID | 結果 | 證據 |
|----|------|------|
| **A11Y-OS-004** | **Closed** | 全域 `a/button/select/input/.agent-card/.seg/.btn-clear:focus-visible` → `outline: 2px solid var(--focus-ring)` + offset 2px。 |
| **A11Y-OS-005** | **Closed** | `AppShell.tsx`：skip link「跳到主要內容」→ `#main-content`；`<main id="main-content" tabIndex={-1}>`。 |
| **A11Y-OS-006** | **Closed** | `.agent-card.selected` 加 `background: #f3f4f6`（選取 ≠ 僅焦點 outline）。 |

---

## 總結

- **Serious 全關（靜態／色票）：** 是。  
- **可升為「殼層 Serious 已關」：** **是（有條件）** — 以 main 含 PR #8 為準；實機 Tab 仍建議抽樣確認焦點不被裁切、skip link 行為。  
- **殘餘風險：** ViewSwitcher ring 實際可見度、sticky header 焦點捲動、選取態 vs 焦點視覺區分，需實機鍵盤才能最終斷言；本複驗未覆蓋讀屏。

**對照測試：** `pnpm exec vitest run apps/web/src/lib/a11y-contrast.test.ts` → 2 passed。
