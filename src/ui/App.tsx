import React, { useState, useEffect } from 'react'
import { CalendarView } from './CalendarView'
import { TasksView } from './TasksView'
import { FocusMode } from './FocusMode'
import { MoodDashboard } from './MoodDashboard'
import { DashboardView } from './DashboardView'
import { NotesView } from './NotesView'

type RouteType = 'dashboard' | 'calendar' | 'tasks' | 'focus' | 'mood' | 'notes'

export function App() {
  const [route, setRoute] = useState<RouteType>('dashboard')
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('highContrast')
      return saved === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('SW registered:', registration))
        .catch(error => console.log('SW registration failed:', error))
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }

    // 更新時鐘
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(clockTimer)
  }, [])

  // 同步高對比模式到 <html> 類別
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast)
    try {
      localStorage.setItem('highContrast', String(highContrast))
    } catch {}
  }, [highContrast])

  // 導航收納狀態（已改為抽屜）
  const [navCollapsed, setNavCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('navCollapsed') === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try { localStorage.setItem('navCollapsed', navCollapsed ? '1' : '0') } catch {}
  }, [navCollapsed])

  // 抽屜開關
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  useEffect(() => {
    // 開啟抽屜時禁止 body 滾動
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-TW', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-TW', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    })
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>FocusBuddy</h1>
        <div className="clock-display">
          <div className="clock-time">{formatTime(currentTime)}</div>
          <div className="clock-date">{formatDate(currentTime)}</div>
        </div>
        <button
          className="nav-toggle"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          title={drawerOpen ? '關閉選單' : '打開選單'}
        >
          ☰
        </button>

        {/* 原本的 topbar 按鈕列（保留，但不主要顯示） */}
        <nav className={`main-nav ${navCollapsed ? 'collapsed' : 'expanded'}`}>
          <button className={route === 'dashboard' ? 'active' : ''} onClick={() => setRoute('dashboard')} title="總覽">
            <span className="nav-ico">🏠</span>
            <span className="nav-label">總覽</span>
          </button>
          <button className={route === 'calendar' ? 'active' : ''} onClick={() => setRoute('calendar')} title="日曆">
            <span className="nav-ico">📅</span>
            <span className="nav-label">日曆</span>
          </button>
          <button className={route === 'tasks' ? 'active' : ''} onClick={() => setRoute('tasks')} title="代辦">
            <span className="nav-ico">✅</span>
            <span className="nav-label">代辦</span>
          </button>
          <button className={route === 'focus' ? 'active' : ''} onClick={() => setRoute('focus')} title="專注">
            <span className="nav-ico">🎮</span>
            <span className="nav-label">專注</span>
          </button>
          <button className={route === 'notes' ? 'active' : ''} onClick={() => setRoute('notes')} title="備忘錄">
            <span className="nav-ico">📝</span>
            <span className="nav-label">備忘錄</span>
          </button>
          <button className={route === 'mood' ? 'active' : ''} onClick={() => setRoute('mood')} title="心情">
            <span className="nav-ico">📊</span>
            <span className="nav-label">心情</span>
          </button>
        </nav>
        {notificationPermission !== 'granted' && (
          <button onClick={requestNotificationPermission} className="notify-btn">🔔 啟用通知</button>
        )}
        <button
          onClick={() => setHighContrast(v => !v)}
          className="notify-btn"
          aria-pressed={highContrast}
          title="切換高對比模式"
        >
          {highContrast ? '🌓 高對比：開' : '🌗 高對比：關'}
        </button>
      </header>

      <main className="content">
        {route === 'dashboard' && <DashboardView onNavigate={setRoute} />}
        {route === 'calendar' && <CalendarView />}
        {route === 'tasks' && <TasksView />}
        {route === 'focus' && <FocusMode />}
        {route === 'notes' && <NotesView />}
        {route === 'mood' && <MoodDashboard />}
      </main>

      {/* 抽屜側欄 + 遮罩 */}
      <div className={`drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`side-drawer ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen}>
        <div className="drawer-header">
          <h3>選單</h3>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="關閉選單">✕</button>
        </div>
        <nav className="drawer-nav">
          <button className={route === 'dashboard' ? 'active' : ''} onClick={() => { setRoute('dashboard'); setDrawerOpen(false) }}>
            <span className="nav-ico">🏠</span>
            <span className="nav-label">總覽</span>
          </button>
          <button className={route === 'calendar' ? 'active' : ''} onClick={() => { setRoute('calendar'); setDrawerOpen(false) }}>
            <span className="nav-ico">📅</span>
            <span className="nav-label">日曆</span>
          </button>
          <button className={route === 'tasks' ? 'active' : ''} onClick={() => { setRoute('tasks'); setDrawerOpen(false) }}>
            <span className="nav-ico">✅</span>
            <span className="nav-label">代辦</span>
          </button>
          <button className={route === 'focus' ? 'active' : ''} onClick={() => { setRoute('focus'); setDrawerOpen(false) }}>
            <span className="nav-ico">🎮</span>
            <span className="nav-label">專注</span>
          </button>
          <button className={route === 'notes' ? 'active' : ''} onClick={() => { setRoute('notes'); setDrawerOpen(false) }}>
            <span className="nav-ico">📝</span>
            <span className="nav-label">備忘錄</span>
          </button>
          <button className={route === 'mood' ? 'active' : ''} onClick={() => { setRoute('mood'); setDrawerOpen(false) }}>
            <span className="nav-ico">📊</span>
            <span className="nav-label">心情</span>
          </button>
        </nav>
      </aside>
    </div>
  )
}
