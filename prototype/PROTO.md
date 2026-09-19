# Team HQ · 可點 Prototype（PRD v1.3 · Office ∥ Linear）

## 交付

| 類型 | 路徑 |
|------|------|
| 可點 html | `/workspace/team-progress-dashboard/office-v2/office-3d-cats.html` |
| View Office 截圖 | `office-3d-cats-office.png` |
| View Linear 截圖 | `office-3d-cats-linear.png` |
| 素材授權 | `ASSETS.md` |

**架構（v1.3）**：兩個可切換整頁視圖——**View Office**（整頁貓虛擬辦公室）∥ **View Linear**（整頁 Issues／Projects）。  
**禁止**把「左專案｜中辦公室｜右 Inbox」三欄合體當唯一總覽。  
公開 https 由 CTO／DevOps 佈；不以本機 URL 當交付。

---

## 視圖切換（驗收必測）

頂部永遠可見 **Office｜Linear** segmented control（另有設定；看板／矩陣灰態「即將推出」）。

| 切換 | 結果 |
|------|------|
| 點 **Office** | 整頁貓辦公室（滿版場景＋HUD 圖例／專案 pill＋底 dock）；點貓開右側抽屜詳情（非永久三欄） |
| 點 **Linear** | 整頁 Issues 表（左專案側欄｜主列表｜可開詳情）；側欄可切 Projects 卡片／詳情 |
| hash 路由 | `#view=office` / `#view=linear&panel=issues`；篩選反映在 query（project／status／agent／q） |
| ⌘K／Ctrl+K | 命令面板：跳視圖／專案／Agent／任務 |

---

## Filter State（跨視圖同源 · 切頁不丟）

單一來源：`projectId` · `agentId` · `status` · `query`（預設皆 all／空）。

1. Office⇄Linear⇄Settings 切換 **不重置** 篩選
2. Office 左上專案 pill 與 Linear 左欄專案列表寫同一 `projectId`
3. Linear 狀態段（全部／阻塞／…）寫 `status`，回 Office 仍生效
4. 頂欄 chip 可單項清除或「清除篩選」
5. 點貓／dock → `agentId`＋抽屜；Linear 點列同理

---

## View Office 操作路徑

1. 落地預設＝Office 整頁場景
2. 掃阻塞（紅標＋原因）→ 點專案 pill 篩工位高亮／淡化
3. 點貓或底 dock → 右側抽屜詳情（Esc／× 關閉）
4. 「在 Linear 看」→ 切 Linear，篩選保留

## View Linear 操作路徑

1. 頂部點 Linear → 整頁 Issues 表（無辦公室場景）
2. 左欄 Issues｜Projects；專案篩選同步頂欄 chip
3. 點列開右側詳情；Projects 面板點卡看摘要＋Agents＋Issues
4. 回 Office → 篩選仍在

## 四態

待處理灰／進行中藍／阻塞紅（最醒目）／完成綠。
