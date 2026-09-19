# Team HQ — Sprint 0 資安審查

| 欄位 | 內容 |
|------|------|
| 日期 | 2026-09-19（Asia/Taipei） |
| 審查者 | 資安工程師 |
| 指派 | CTO｜Sprint 0 |
| 對齊 | PRD v1.3、C4 摘要、ADR-003／004、[資安專業標準](sand-workflow:skill-1789797133043)、[企業工程標準](sand-workflow:skill-1789797067738) |
| 範圍 | 私有 repo 顯示名、ingest token、密鑰邊界、bot 越權 |
| OpenAPI | **尚未產出**（本輪為設計期審查；OpenAPI 落地後須複審） |
| 方法 | STRIDE／信任邊界對照；僅列有證據項目 |

## 信任邊界（摘要）

| 邊界 | 行為者 | 信任假設（現況） |
|------|--------|------------------|
| B1 | mei／CTO → Web Client → Ops API | 全任務寫入；MVP 認證可簡化 |
| B2 | 職缺 bot → `POST /ingest` → Ops API | 僅改自己 `assigneeRole`；冪等 |
| B3 | Ops API → Task DB | 唯一真相庫 |
| B4 | GitHub | MVP **不連**；設定檔顯示名 only（ADR-004） |

越界紅線（架構）：職缺 bot 不得改他人任務；私鑰不進 repo；MVP 不做 GitHub 同步。

---

## 風險清單

### 高

| ID | 標題 | 證據 | 影響 | 必要緩解（開工即寫死） | 驗證（須紅燈可測） |
|----|------|------|------|------------------------|-------------------|
| **S-H1** | Ingest 身份未綁定角色 → 可偽造 `assigneeRole` | PRD §6.4 body 含 `assigneeRole`；ADR-003「僅改自己」但未規定 token→role 綁定；驗收 A3 | 任一 bot／竊取之 token 可改他人任務（越權寫入） | 每 bot **獨立** token（或 JWT claim `roleId`）；**伺服器以憑證覆蓋／忽略** body 的 `assigneeRole`；拒絕跨角色寫入 | 用 bot-A token 送 `assigneeRole=backend` → **403／401**，DB 不變 |
| **S-H2** | 公開預覽＋弱／假登入 = 全寫入暴露 | PRD §6.3「簡單 token／原型假登入」；交件須公開 https | 預覽 URL 被掃到即可冒充 mei／CTO 或任意 bot | 預覽環境：ingest 與 CRUD **強制** Bearer；禁止僅前端角色切換當授權；預覽勿用可猜測共用密鑰 | 無 Authorization → 全寫入 **401**；UI 假角色切換不可繞過 API |

### 中

| ID | 標題 | 證據 | 影響 | 必要緩解 | 驗證 |
|----|------|------|------|----------|------|
| **S-M1** | 私有 repo 完整路徑公開顯示 | PRD §2.2 寫 `lmybs112/ts-try-on-demo`、`ts-llm-chat-modal`（私有）；原型 `full` 顯示 repo 短名；ADR-004「僅顯示名」 | 資訊揭露：攻擊面盤點、社工；非程式碼外洩但提高風險 | UI／API 對未授權者只回 **顯示名**（如「試穿 demo」）；`owner/repo` 僅授權後可看；**禁止**深鏈需登入的私有 GitHub；標記 `visibility: private` 勿當可點連結 | 未登入／公開預覽 HTML 不含 `lmybs112/ts-try-on-demo` 等完整私有路徑（或整頁需 auth） |
| **S-M2** | Ingest token 生命週期未定 | ADR-003／PRD 未寫輪替、儲存、log 脫敏、共用 vs 分角色 | 一鑰失竊＝全 bot 失守；log／前端外洩 | 每 role 一密；只放環境變數／secret store；**零入庫**；log 遮罩 Authorization／token；可輪替 | CI／repo 無明文 token；單元測確認 log 無 raw secret |
| **S-M3** | 冪等鍵客戶端可控 | 冪等＝`source`+`sourceRef`（客戶端） | 在未修好 S-H1 時可覆寫他人 ingest；修好後仍可自撞／污染自己歷史 | `sourceRef` 建議含 bot 前綴；寫入時校驗 `sourceRef` 與憑證 role 一致；跨 role 同鍵 → 拒絕 | 跨 role 重放同一 `sourceRef` → 拒絕 |
| **S-M4** | 「假登入／角色切換」易變成 UI-only RBAC | PRD 允許原型假登入；A3／§6.3 行為須可測 | 前端隱藏按鈕 ≠ 授權 | 所有寫入以 **伺服器** 判定；前端角色僅 UX | 直接打 API（繞過 UI）仍受權限約束 |

### 低

| ID | 標題 | 證據 | 緩解 |
|----|------|------|------|
| **S-L1** | `source=github` enum 保留 | PRD §6.5 | MVP 寫入 `github` → **400**＋測試；Phase 1.1 另開 ADR |
| **S-L2** | OpenAPI 未出，auth scheme 未鎖定 | CTO 指派「即將產出」 | OpenAPI 落地後 24h 內複審 `securitySchemes`／ingest 路徑 |
| **S-L3** | 依賴／CVE 尚未適用 | 正式碼／lockfile 未審 | 後端脚手架後接 dependency scan；高危 CVE 阻擋合主幹 |

---

## STRIDE（ingest／權限路徑）

| 威脅 | 對應 | 現況 |
|------|------|------|
| Spoofing | S-H1／H2 | 高：身份綁定未定 |
| Tampering | S-M3、blocked 無原因 | ADR 已要求 400；須測 |
| Repudiation | `updatedBy` | 須來自伺服器身份，非客戶端自填 |
| Information disclosure | S-M1 | 中：私有 repo 路徑 |
| DoS | 未審（MVP 可後補 rate limit） | 公開 ingest 建議後加 |
| Elevation of privilege | S-H1、A3 | 高：核心閘門 |

---

## 已對齊的正面控制（不阻擋）

- ADR-004：MVP 不連 GitHub；密鑰不進 repo — **正確**
- ADR-003／PRD A2：blocked 無 reason → 400 — **正確**
- PRD A3：bot 改他人任務須拒絕 — **須實作為伺服器強制，非文件口號**
- C4：單一 Task DB；前端不得直寫 DB — **正確**

---

## 放行建議

| 閘門 | 建議 | 條件 |
|------|------|------|
| **Sprint 0 開工（設計／實作）** | **條件放行** | 後端 OpenAPI 必須寫入 S-H1／H2 控制；單元／整合紅燈案例對齊 A3＋上表 |
| **公開 https 預覽給 mei** | **暫不放行** | 關閉 S-H1、S-H2；S-M1 至少達「公開頁無完整私有 `owner/repo`」；S-M2 零入庫可抽查 |
| **口頭放行** | **禁止** | 須本文件＋測試綠燈；OpenAPI 複審後更新本檔 |

### 給後端的最低 OpenAPI／實作 checklist

1. `securitySchemes`: Bearer（或等價）；ingest 與 CRUD 分開 audience 更佳  
2. Ingest：身份 → `roleId`；body `assigneeRole` 不得提升權限  
3. 拒絕：無 token、錯 token、跨 role、`source=github`（MVP）、blocked 無 reason  
4. 錯誤不洩漏其他 role 任務細節（403 vs 404 策略一致即可）  
5. 設定檔：`displayName` 與 `githubFullName`／`visibility` 分離；API 依授權回傳

### 複審觸發

- OpenAPI 初稿合併前  
- 首次公開預覽 URL 前  
- 任一 Phase 1.1 GitHub 同步 ADR

---

## 結論（給 CTO）

設計邊界清楚，**可開工**。最大風險是 **ingest／預覽認證把「可測的權限規則」做成客戶端信任**。高風險兩項未關前，**不建議**把可寫入的 Ops API 掛到公開預覽。

