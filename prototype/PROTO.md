# Team HQ · 可點 Prototype（PRD v1.3 · Office ∥ Linear · Mobile RWD）

## 交付

| 類型 | 路徑 |
|------|------|
| 可點 html | `/workspace/team-progress-dashboard/office-v2/office-3d-cats.html` |
| 手機首屏（專案掃讀） | `office-3d-cats-mobile.png`（390×844） |
| 手機 bottom sheet（改狀態） | `office-3d-cats-mobile-sheet.png` |
| 手機 Linear 列表 | `office-3d-cats-mobile-linear.png` |
| View Office 截圖 | `office-3d-cats-office.png` |
| View Linear 截圖 | `office-3d-cats-linear.png` |
| 素材授權 | `ASSETS.md` |
| Repo 同步 | `/workspace/ts-team-ops-dashboard/prototype/`（`index.html`＋assets＋PROTO.md） |

**架構（v1.3）**：兩個可切換整頁視圖——**View Office**（整頁貓虛擬辦公室）∥ **View Linear**（整頁 Issues／Projects）。  
**禁止**把「左專案｜中辦公室｜右 Inbox」三欄合體當唯一總覽。  
**手機（§8）**：≤430 首屏＝**專案掃讀**，辦公室為次要入口；不以本機 URL 當交付。

---

## RWD 斷點

| 寬度 | 殼層 |
|------|------|
| **≤430** | 手機殼：專案卡片列表首屏；底 dock（專案｜Linear｜辦公室｜設定）；點專案開 bottom sheet（成員＋任務＋**狀態四態可改**） |
| **≤720** | 平板：頂部仍有 Office｜Linear；Linear 側欄改頂部 pills；Issues 改卡片列表（無橫向溢出） |
| **>900** | 桌面完整殼：頂部 Office｜Linear toggle；Office 整頁場景＋dock；Linear 左欄＋表＋詳情 |

驗收解析度：`390×844`、`768`（及桌面 >900）。

---

## 視圖切換（桌面 · 驗收必測）

頂部永遠可見 **Office｜Linear** segmented control（另有設定；看板／矩陣灰態「即將推出」）。

| 切換 | 結果 |
|------|------|
| 點 **Office** | 整頁貓辦公室（滿版場景＋HUD 圖例／專案 pill＋底 dock）；點貓開右側抽屜詳情（非永久三欄） |
| 點 **Linear** | 整頁 Issues 表（左專案側欄｜主列表｜可開詳情）；側欄可切 Projects 卡片／詳情 |
| hash 路由 | `#view=office` / `#view=linear&panel=issues`；篩選反映在 query（project／status／agent／q） |
| ⌘K／Ctrl+K | 命令面板：跳視圖／專案／Agent／任務 |

---

## 手機操作路徑（DoD）

1. 開啟 ≤430 → **專案掃讀**（全部＋6 專案；blocked／doing 一眼可見；紅框標阻塞專案）
2. 點專案 → **bottom sheet**：成員列表＋任務；每任務 **待處理／進行中／阻塞／完成** 可點切換（阻塞可填原因）
3. 底 dock **Linear** → Issues 卡片列表（狀態段＋專案 pills；無橫向溢出）
4. 底 dock **辦公室** → 簡化 Agent 列表（次要；不要求完整 3D 走動）
5. 觸控目標 ≥44px；底 dock 不蓋住可捲內容（shell 預留 padding）

---

## Filter State（跨視圖同源 · 切頁不丟）

單一來源：`projectId` · `agentId` · `status` · `query`（預設皆 all／空）。

1. Office⇄Linear⇄Settings 切換 **不重置** 篩選
2. 手機專案 sheet／Linear pills／桌面 pill 寫同一 `projectId`
3. Linear 狀態段寫 `status`，回 Office／專案掃讀仍生效
4. 頂欄 chip（桌面）可單項清除或「清除篩選」

---

## 四態

待處理灰／進行中藍／阻塞紅（最醒目）／完成綠。手機 sheet 可即時改狀態並回寫同一資料源。
