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
        <nav>
          <button className={route === 'dashboard' ? 'active' : ''} onClick={() => setRoute('dashboard')}>🏠 總覽</button>
          <button className={route === 'calendar' ? 'active' : ''} onClick={() => setRoute('calendar')}>📅 日曆</button>
          <button className={route === 'tasks' ? 'active' : ''} onClick={() => setRoute('tasks')}>✅ 代辦</button>
          <button className={route === 'focus' ? 'active' : ''} onClick={() => setRoute('focus')}>🎮 專注</button>
          <button className={route === 'notes' ? 'active' : ''} onClick={() => setRoute('notes')}>📝 備忘錄</button>
          <button className={route === 'mood' ? 'active' : ''} onClick={() => setRoute('mood')}>📊 心情</button>
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
    </div>
  )
}
