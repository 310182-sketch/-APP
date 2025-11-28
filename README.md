# 🌿 FocusBuddy - 吉卜力風格專注工具

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React 18">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa" alt="PWA">
  <img src="https://img.shields.io/badge/Mobile-Optimized-4CAF50" alt="Mobile">
</p>

FocusBuddy 是一款結合「日曆 + 代辦 + 專注計時器 + 寵物養成」的生產力網站應用，採用宮崎駿吉卜力風格設計，讓專注變得更有趣！

---

## ✨ 功能特色

### 📊 總覽儀表板
- **即時時鐘**：顯示當前時間與日期
- **統計卡片**：專注時間、完成任務數、累積 XP、連續天數
- **快速專注**：一鍵進入專注模式
- **寵物小工具**：查看寵物狀態與等級

### 📅 日曆
- **Apple 風格日視圖**：直觀的時間軸設計
- **事件管理**：新增、編輯、刪除事件
- **時間區塊**：清楚顯示事件時間範圍

### ✅ 代辦事項
- **任務清單**：新增、完成、刪除任務
- **任務庫**：管理常用任務模板
- **優先級**：設定任務重要程度

### 🎮 專注模式
- **番茄鐘計時器**：預設 25 分鐘，可自訂時長
- **吉卜力風格場景**：
  - ☀️ 晴天 - 明亮草地
  - 🌧️ 雨天 - 雨滴動畫
  - ❄️ 雪天 - 飄雪效果
  - 🌙 夜晚 - 星空螢火蟲
- **環境音效**：雨聲、風聲、鳥鳴等自然音效
- **寵物陪伴**：專注時寵物會跟著你

### 🐾 寵物系統
- **多種寵物**：貓咪、狗狗、兔子、小鳥
- **角色自訂**：自訂顏色、配件
- **等級成長**：專注越久，寵物等級越高
- **商店系統**：用 XP 購買道具和裝飾
- **背包管理**：管理已購買的物品

### 📝 備忘錄
- **多色便條**：黃、藍、綠、粉、紫、橘 6 種顏色
- **標籤系統**：工作、學習、生活、重要、想法、待辦
- **搜尋功能**：快速找到筆記
- **置頂功能**：重要筆記置頂顯示

### 📊 心情追蹤
- **每日心情**：記錄每天的心情狀態
- **心情統計**：查看心情趨勢
- **XP 獎勵**：記錄心情獲得 XP

### 🎨 介面設計
- **吉卜力配色**：天空藍、草地綠、溫暖米色
- **玻璃擬態**：半透明毛玻璃效果
- **流暢動畫**：過渡動畫、微互動
- **高對比模式**：永久啟用，確保可讀性

---

## 📱 響應式設計

### 手機版 (≤480px)
- 底部固定導航欄
- 44px 觸控目標（iOS/Android 標準）
- iPhone 安全區域支援（瀏海、Home 指示器）
- 精簡頂部導航
- 側邊抽屜選單

### 平板版 (481-768px)
- 底部導航欄
- 3 欄網格佈局
- 優化的卡片間距

### 桌面版 (>768px)
- 頂部導航欄
- 多欄佈局
- 完整功能顯示

---

## 🛠 技術架構

### 前端
```
React 18 + TypeScript + Vite
├── src/
│   ├── ui/                    # UI 組件
│   │   ├── App.tsx           # 主應用
│   │   ├── DashboardView.tsx # 總覽
│   │   ├── CalendarView.tsx  # 日曆
│   │   ├── TasksView.tsx     # 代辦
│   │   ├── FocusMode.tsx     # 專注模式
│   │   ├── NotesView.tsx     # 備忘錄
│   │   ├── MoodDashboard.tsx # 心情
│   │   └── Character.tsx     # 寵物角色
│   ├── lib/                   # 工具函數
│   ├── styles.css            # 樣式
│   └── main.tsx              # 入口
```

### 後端
```
Fastify + SQLite
├── server/
│   ├── index.js              # 主程式
│   ├── db.js                 # 資料庫
│   ├── lib/
│   │   ├── store.js          # 資料存儲
│   │   └── errors.js         # 錯誤處理
│   └── routes/
│       ├── tasks.js          # 任務 API
│       ├── events.js         # 事件 API
│       ├── focus.js          # 專注 API
│       ├── reminders.js      # 提醒 API
│       └── schedule.js       # 排程 API
```

### PWA 支援
- `manifest.json` - 應用清單
- `sw.js` - Service Worker
- 可安裝到手機主畫面

---

## 🚀 快速開始

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
# 啟動前端開發伺服器
npm run dev

# 啟動後端 API（另開終端）
npm run server
```

打開瀏覽器訪問：
- **前端**：`http://localhost:5173`
- **API**：`http://localhost:3000`

### 建置生產版本
```bash
npm run build
```

### 預覽建置結果
```bash
npm run preview
```

---

## 📦 部署

### 靜態網站主機（僅前端）

將 `dist/` 目錄部署到：
- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [GitHub Pages](https://pages.github.com)
- [Cloudflare Pages](https://pages.cloudflare.com)

### 完整部署（含後端）

1. 部署後端 API 到 Node.js 主機
2. 設定環境變數指向 API 網址
3. 部署前端到靜態主機

---

## 📡 API 端點

### 任務 (Tasks)
| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/tasks?date=YYYY-MM-DD` | 取得任務列表 |
| POST | `/api/tasks` | 新增任務 |
| POST | `/api/tasks/:id/toggle` | 切換完成狀態 |
| DELETE | `/api/tasks/:id` | 刪除任務 |

### 日曆事件 (Events)
| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/calendar?date=YYYY-MM-DD` | 取得事件列表 |
| POST | `/api/events` | 新增事件 |
| DELETE | `/api/events/:id` | 刪除事件 |

### 專注 (Focus)
| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/focus/start` | 開始專注 |
| POST | `/api/focus/stop` | 結束專注（回傳 XP） |

### 提醒 (Reminders)
| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/reminders` | 取得提醒列表 |
| POST | `/api/reminders` | 新增提醒 |
| POST | `/api/reminders/:id/mark-sent` | 標記已發送 |

---

## 📊 效能

| 指標 | 數值 |
|------|------|
| CSS | 89.89 KB (gzip: 16.35 KB) |
| JS | 226.56 KB (gzip: 71.06 KB) |
| 首次載入 | < 2 秒 |
| Lighthouse 分數 | 90+ |

---

## 🎨 設計規範

### 色彩系統
```css
/* 主色調 */
--sky-blue: #87CEEB      /* 天空藍 */
--mint-green: #98D8C8    /* 薄荷綠 */
--grass-green: #C8E6C9   /* 草地綠 */
--forest-green: #2d5a45  /* 森林綠（文字） */

/* 強調色 */
--primary: #667eea       /* 主要紫 */
--accent-pink: #f472b6   /* 粉紅 */
--accent-orange: #fb923c /* 橘色 */
```

### 間距系統
```css
--radius-sm: 6px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 24px
```

### 動畫
```css
--transition-fast: 0.15s ease
--transition-normal: 0.25s ease
--transition-slow: 0.4s ease
```

---

## 📝 更新日誌

### v1.0.0 (2025-11-28)
- 🎉 正式發布
- ✨ 完整功能：總覽、日曆、代辦、專注、備忘錄、心情
- 🎮 寵物養成系統
- 📱 響應式手機版
- 🎨 高對比模式
- 🔔 PWA 支援

---

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

---

<p align="center">
  Made with 💚 by FocusBuddy Team
</p>