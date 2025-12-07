import React, { useEffect, useState } from 'react'
import { HOLIDAY_SLOTS, WEEKDAY_SLOTS } from '../lib/constants'
import { getMoodFromXP, getMoodEmoji, getMoodLabel } from './Character'
import { PetDisplay, PetData } from './Pet'
import { tasksAPI, eventsAPI, scheduleAPI, focusAPI } from '../lib/api'

interface TaskItem {
  id: string
  title: string
  completed?: boolean
}

interface EventItem {
  id: string
  title: string
  start: string
  end: string
}

interface DashboardProps {
  onNavigate: (route: 'dashboard' | 'calendar' | 'tasks' | 'focus' | 'mood' | 'notes') => void
}

function TimeSliderCard() {
  const [minutes, setMinutes] = useState<number>(() => {
    const savedNew = localStorage.getItem('sleepTargetMin')
    const savedOld = localStorage.getItem('targetTimeMin')
    return savedNew ? Number(savedNew) : (savedOld ? Number(savedOld) : 23 * 60)
  })
  const [notify, setNotify] = useState<boolean>(() => {
    const savedNew = localStorage.getItem('sleepTargetNotify')
    const savedOld = localStorage.getItem('targetTimeNotify')
    if (savedNew != null) return savedNew === 'true'
    if (savedOld != null) return savedOld === 'true'
    return false
  })

  const trackRef = React.useRef<HTMLDivElement | null>(null)
  const timerIdsRef = React.useRef<number[]>([])

  const DEFAULT_QUOTES = React.useMemo(() => [
    '夜深了，世界慢下來，你也可以了。',
    '你已經做得很好，今天到這裡就好。',
    '把煩惱折好，放到明天的陽光裡。',
    '閉上眼之前，請先對自己溫柔。',
    '世界不會少了你一會兒，安心睡吧。',
    '疲憊值得被擁抱，休息是種勇氣。',
    '今天的你很棒，明天也會更好。',
    '願夢裡有微風，替你輕輕梳理心事。',
    '把心放輕，讓星光替你守夜。',
    '慢一點也沒關係，今晚先好好睡。',
    '你被需要，也被允許好好休息。',
    '晚安呀，願你在夢裡被溫柔接住。'
  ], [])

  const [customQuotes, setCustomQuotes] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('sleepCustomQuotes')
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })
  const [onlyMine, setOnlyMine] = useState<boolean>(() => localStorage.getItem('sleepQuotesOnlyMine') === 'true')
  const [newQuote, setNewQuote] = useState('')

  const QUOTES = React.useMemo(() => {
    const base = onlyMine && customQuotes.length ? customQuotes : DEFAULT_QUOTES.concat(customQuotes)
    return base
  }, [DEFAULT_QUOTES, customQuotes, onlyMine])

  const [quoteIdx, setQuoteIdx] = useState<number>(() => {
    const saved = localStorage.getItem('sleepQuoteIdx')
    if (saved) return Number(saved)
    // 基於日期的穩定隨機
    const seed = Number(new Date().toISOString().slice(0,10).replace(/-/g,''))
    return seed %  QUOTES.length
  })

  const quote = QUOTES[quoteIdx % QUOTES.length]

  const shuffleQuote = () => {
    setQuoteIdx(i => {
      const next = (i + 1) % QUOTES.length
      localStorage.setItem('sleepQuoteIdx', String(next))
      return next
    })
  }

  React.useEffect(() => {
    localStorage.setItem('sleepTargetMin', String(minutes))
  }, [minutes])

  React.useEffect(() => {
    localStorage.setItem('sleepTargetNotify', String(notify))
  }, [notify])

  const format = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  const scheduleNotification = React.useCallback(() => {
    if (!notify || typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    // clear old timers
    timerIdsRef.current.forEach(id => window.clearTimeout(id))
    timerIdsRef.current = []
    const now = new Date()
    const todayMin = now.getHours() * 60 + now.getMinutes()
    let deltaMin = minutes - todayMin
    if (deltaMin <= 0) deltaMin += 24 * 60
    const ms = deltaMin * 60 * 1000
    const scheduleAt = (offsetMin: number, label: string) => {
      let d = deltaMin - offsetMin
      if (d <= 0) d += 24 * 60
      const timeout = window.setTimeout(() => {
        try { new Notification(label, { body: `${quote}\n現在是 ${format((minutes - offsetMin + 24*60)%(24*60))}` }) } catch {}
      }, d * 60 * 1000)
      timerIdsRef.current.push(timeout)
    }
    // at target
    scheduleAt(0, '睡覺提醒')
    // pre reminders if enabled (loaded below)
    if (pre15) scheduleAt(15, '睡前15分鐘提醒')
    if (pre30) scheduleAt(30, '睡前30分鐘提醒')
  }, [minutes, notify, quote])

  React.useEffect(() => {
    scheduleNotification()
    return () => { timerIdsRef.current.forEach(id => window.clearTimeout(id)); timerIdsRef.current = [] }
  }, [scheduleNotification])

  // Pre-reminders
  const [pre15, setPre15] = useState<boolean>(() => localStorage.getItem('sleepPre15') === 'true')
  const [pre30, setPre30] = useState<boolean>(() => localStorage.getItem('sleepPre30') === 'true')
  React.useEffect(() => { localStorage.setItem('sleepPre15', String(pre15)); localStorage.setItem('sleepPre30', String(pre30)) }, [pre15, pre30])

  const setFromClientY = (clientY: number) => {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const y = clientY - rect.top
    const clamped = Math.max(0, Math.min(rect.height, y))
    const ratio = 1 - clamped / rect.height
    let mins = Math.round(ratio * 24 * 60)
    mins = Math.round(mins / 15) * 15
    mins = Math.max(0, Math.min(24 * 60 - 1, mins))
    setMinutes(mins)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    setFromClientY(e.clientY)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.buttons !== 1) return
    setFromClientY(e.clientY)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); setMinutes(m => Math.min(24 * 60 - 1, m + 15)) }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setMinutes(m => Math.max(0, m - 15)) }
  }

  const ratio = minutes / (24 * 60)
  const thumbTop = (1 - ratio) * 100

  return (
    <div className="glass-card time-slider-card" aria-label="目標睡覺時間">
      <div className="panel-header">
        <h3>🌙 目標睡覺時間</h3>
        <div className="ts-time-label">{format(minutes)}</div>
      </div>
      <div className="ts-body">
        <div
          ref={trackRef}
          className="ts-track"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={1439}
          aria-valuenow={minutes}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
        >
          <div className="ts-gradient" />
          <div className="ts-thumb" style={{ top: `${thumbTop}%` }} />
          <div className="ts-scale">
            <span>00</span>
            <span>06</span>
            <span>12</span>
            <span>18</span>
            <span>24</span>
          </div>
        </div>
        <div className="ts-controls">
          <button className="ts-btn" onClick={() => setMinutes(23 * 60)}>23:00 快選</button>
          {typeof Notification !== 'undefined' && Notification.permission !== 'granted' ? (
            <button className="ts-btn" onClick={() => Notification.requestPermission()}>啟用通知</button>
          ) : (
            <label className="ts-toggle"><input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} /> 睡覺提醒</label>
          )}
          <label className="ts-toggle"><input type="checkbox" checked={pre15} onChange={e => setPre15(e.target.checked)} /> 提前15分鐘</label>
          <label className="ts-toggle"><input type="checkbox" checked={pre30} onChange={e => setPre30(e.target.checked)} /> 提前30分鐘</label>
        </div>
      </div>
      <div className="ts-quote">
        <span className="ts-quote-mark">“</span>
        <span>{quote}</span>
        <button className="ts-quote-next" onClick={shuffleQuote} title="換一句">↻</button>
      </div>
      <div className="ts-quote-manage">
        <input
          className="ts-quote-input"
          type="text"
          value={newQuote}
          onChange={e => setNewQuote(e.target.value)}
          placeholder="寫下一句對自己溫柔的話…"
          maxLength={80}
        />
        <button
          className="ts-btn"
          onClick={() => {
            const q = newQuote.trim()
            if (!q) return
            const next = [...customQuotes, q]
            setCustomQuotes(next)
            localStorage.setItem('sleepCustomQuotes', JSON.stringify(next))
            setNewQuote('')
          }}
        >新增</button>
        <label className="ts-toggle" title="若沒有自訂小語，會自動使用內建小語">
          <input type="checkbox" checked={onlyMine} onChange={e => { setOnlyMine(e.target.checked); localStorage.setItem('sleepQuotesOnlyMine', String(e.target.checked)) }} /> 只用我的小語
        </label>
      </div>
    </div>
  )
}

export function DashboardView({ onNavigate }: DashboardProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [schedule, setSchedule] = useState<Record<string, string>>({})
  const [weeklyXp, setWeeklyXp] = useState(0)
  const [pet, setPet] = useState<PetData | null>(null)
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const dayOfWeek = today.getDay()
  const isHoliday = dayOfWeek === 0 || dayOfWeek === 6
  const timeSlots = isHoliday ? HOLIDAY_SLOTS : WEEKDAY_SLOTS

  // 取得目前時段
  const getCurrentSlotIndex = () => {
    const now = new Date()
    const currentMins = now.getHours() * 60 + now.getMinutes()
    
    return timeSlots.findIndex(slot => {
      const [startH, startM] = slot.start.split(':').map(Number)
      const [endH, endM] = slot.end.split(':').map(Number)
      const start = startH * 60 + startM
      let end = endH * 60 + endM
      if (end < start) end += 24 * 60
      
      let cMins = currentMins
      if (start > end && cMins < start) cMins += 24 * 60
      
      return cMins >= start && cMins < end
    })
  }

  const loadData = async () => {
    try {
      // 載入任務
      const tasksData = await tasksAPI.getTasks()
      setTasks(tasksData.tasks || [])

      // 載入今日事件
      const dateStr = today.toISOString().slice(0, 10)
      const eventsData = await eventsAPI.getEvents(dateStr)
      setEvents(eventsData.events || [])

      // 載入排程
      const scheduleData = await scheduleAPI.getSchedule('demo')
      setSchedule(scheduleData.schedule || {})

      // 載入 XP
      const statsData = await focusAPI.getStats('demo')
      setWeeklyXp(statsData.weeklyXp || 0)

      // 載入寵物
      const savedPet = localStorage.getItem('myPet')
      if (savedPet) {
        setPet(JSON.parse(savedPet))
      }
    } catch (e) {
      console.error('載入資料失敗', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const currentSlotIdx = getCurrentSlotIndex()
  const mood = getMoodFromXP(weeklyXp)
  const pendingTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  // 取得今日已排程的時間格
  const scheduledSlots = timeSlots.map((slot, idx) => {
    const key = `${isHoliday ? 'h' : 'w'}-${idx}`
    return {
      ...slot,
      task: schedule[key] || null,
      isCurrent: idx === currentSlotIdx,
      isPast: idx < currentSlotIdx
    }
  }).filter(s => s.task && s.task !== '睡覺')

  // 取得接下來的任務
  const upcomingSlots = scheduledSlots.filter(s => !s.isPast)

  if (loading) {
    return <section><div className="loading-card">載入中...</div></section>
  }

  const currentTask = currentSlotIdx !== -1 ? schedule[`${isHoliday ? 'h' : 'w'}-${currentSlotIdx}`] : null

  return (
    <section className="dashboard-grid">
      {/* Header Area */}
      <div className="dashboard-header">
        <h2 className="heading-1">
          👋 早安，準備好開始了嗎？
        </h2>
      </div>

      {/* Top Row: Focus Hero & Pet */}
      <div className="hero-row">
        {/* Focus Hero Card */}
        <div className="glass-card focus-hero">
          <div className="hero-content">
            <div className="hero-label">🔥 目前專注</div>
            <div className="hero-task">
              {currentTask || '目前沒有排定任務'}
            </div>
            {currentSlotIdx !== -1 && (
              <div className="hero-time">
                {timeSlots[currentSlotIdx].start} - {timeSlots[currentSlotIdx].end}
              </div>
            )}
            <button className="hero-btn" onClick={() => onNavigate('focus')}>
              {currentTask ? '開始專注' : '前往專注模式'} →
            </button>
          </div>
        </div>

        {/* Pet Widget */}
        <div className="glass-card pet-widget" onClick={() => onNavigate('focus')}>
          {pet ? (
            <>
              <div className="pet-widget-header">
                <span className="pet-name">{pet.name}</span>
                <span className="pet-status-badge">Lv.{pet.level}</span>
              </div>
              <div className="pet-widget-display">
                <PetDisplay pet={pet} size={80} isAnimating={true} />
              </div>
              <div className="pet-widget-status">
                <div className="mini-stat">
                  <span>🍖 {Math.round(pet.stats.hunger)}%</span>
                </div>
                <div className="mini-stat">
                  <span>💖 {Math.round(pet.stats.happiness)}%</span>
                </div>
              </div>
            </>
          ) : (
            <div className="no-pet-widget">
              <div className="egg-icon">🥚</div>
              <p>還沒有寵物夥伴</p>
              <button className="adopt-btn">去領養</button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="stats-grid">
        <div className="glass-card stat-item mood-stat" onClick={() => onNavigate('mood')}>
          <div className="stat-icon">{getMoodEmoji(mood)}</div>
          <div className="stat-details">
            <div className="stat-label">本週心情</div>
            <div className="stat-value">{getMoodLabel(mood)}</div>
          </div>
        </div>

        <div className="glass-card stat-item task-stat" onClick={() => onNavigate('tasks')}>
          <div className="stat-icon">✅</div>
          <div className="stat-details">
            <div className="stat-label">待辦事項</div>
            <div className="stat-value">{pendingTasks.length} 個未完成</div>
          </div>
        </div>

        <div className="glass-card stat-item schedule-stat" onClick={() => onNavigate('calendar')}>
          <div className="stat-icon">📅</div>
          <div className="stat-details">
            <div className="stat-label">今日行程</div>
            <div className="stat-value">{scheduledSlots.length} 個時段</div>
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="content-split">
        {/* Left Column: Upcoming */}
        <div className="glass-card upcoming-panel">
          <div className="panel-header">
            <h3>📋 接下來的任務</h3>
          </div>
          <div className="panel-body">
            {upcomingSlots.length > 0 ? (
              <div className="upcoming-list">
                {upcomingSlots.slice(0, 4).map((slot, i) => (
                  <div key={i} className={`upcoming-item ${slot.isCurrent ? 'current' : ''}`}>
                    <div className="upcoming-time">{slot.start}</div>
                    <div className="upcoming-task">{slot.task}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-message">
                <p>接下來沒有排定任務了</p>
                <button className="text-btn" onClick={() => onNavigate('tasks')}>排定行程</button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Time Slider, Events & Tasks */}
        <div className="right-column">
          <TimeSliderCard />
          {/* Events */}
          <div className="glass-card events-panel">
            <div className="panel-header">
              <h3>📅 今日事件</h3>
            </div>
            <div className="panel-body">
              {events.length > 0 ? (
                <div className="events-list">
                  {events.map(ev => (
                    <div key={ev.id} className="event-item">
                      <div className="event-time">
                        {new Date(ev.start).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="event-title">{ev.title}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-message">
                  <p>今天沒有特別事件</p>
                </div>
              )}
            </div>
          </div>

          {/* Tasks Preview */}
          <div className="glass-card tasks-panel">
            <div className="panel-header">
              <h3>✏️ 待辦清單</h3>
              <button className="icon-btn" onClick={() => onNavigate('tasks')}>→</button>
            </div>
            <div className="panel-body">
              {pendingTasks.length > 0 ? (
                <ul className="tasks-list-mini">
                  {pendingTasks.slice(0, 3).map(task => (
                    <li key={task.id}>
                      <span className="check-circle"></span>
                      {task.title}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-message">
                  <p>太棒了！都完成了</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
