# FocusBuddy（MVP）

一個結合「日曆 + 代辦 + 專注小遊戲」的生產力網站原型。此版本為前端骨架（Vite+React），提供：
- 日曆簡版：以日視圖顯示與新增事件（未串後端）。
- 代辦清單：新增/完成切換（未持久化）。
- 專注模式：合成環境音、天氣切換、計時器與全螢幕嘗試。

## 開發環境
- Node.js 18+
- npm 或 pnpm

## 快速開始
```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 啟動後端 API（另開一個終端機）
npm run server

# 建置
npm run build

# 本機預覽建置產物
npm run preview
```

打開瀏覽器訪問 `http://localhost:5173`（前端），API 於 `http://localhost:3000`。

## 目錄結構
- `index.html`：入口頁面
- `src/main.tsx`：React 入口
- `src/ui/*`：功能頁面（`CalendarView`、`TasksView`、`FocusMode`）
- `src/styles.css`：簡易樣式
- `server/index.js`：Fastify 主程式
- `server/routes/*`：模組化路由（tasks / events / focus / reminders）
- `server/lib/store.js`：記憶體資料儲存與工具（可替換為資料庫）

## 下一步（建議）
- 串接後端 API（任務/事件/提醒/專注 session）。
- 改造日曆為可拖曳至時間格、支援提醒與重複規則。
- 以 Service Worker + Web Push 提供通知。
- 擴充專注小遊戲的音樂素材（免版稅）與角色成長系統。

## 後端 API（概要）
- Tasks：
	- `GET /api/tasks?date=YYYY-MM-DD&userId=demo`
	- `POST /api/tasks` body `{ title, dueDate?, priority?, userId? }`
	- `POST /api/tasks/:id/toggle`
	- `DELETE /api/tasks/:id`
- Calendar/Events：
	- `GET /api/calendar?date=YYYY-MM-DD&userId=demo`
	- `POST /api/events` body `{ title, start, end, taskId?, reminders?, userId? }`
	- `DELETE /api/events/:id`
- Focus：
	- `POST /api/focus/start` body `{ userId?, weather? }`
	- `POST /api/focus/stop` body `{ sessionId }`（回傳 `xpGained` 與角色升級）
- Reminders：
	- `GET /api/reminders`
	- `POST /api/reminders` body `{ eventId, minutesBefore?, channel? }`
	- `POST /api/reminders/:id/mark-sent`

> 註：目前為記憶體儲存，適合原型測試；正式環境建議接 PostgreSQL 或 SQLite，並以資料存取層替換 `server/lib/store.js`。

> 注意：專注模式中的音樂目前為合成音，避免版權問題。之後可替換為你授權的環境音檔或自行製作音樂。