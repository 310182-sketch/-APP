import React, { useMemo, useState } from 'react'
import { eventsAPI } from '../lib/api'

interface EventItem {
  id: string
  title: string
  start: string // ISO datetime
  end: string // ISO datetime
  reminderMinutesBefore?: number
}

const hours = Array.from({ length: 16 }, (_, i) => i + 6) // 06:00 - 21:00

const DAY_START_MIN = 6 * 60
const DAY_END_MIN = 21 * 60
const PX_PER_MIN = 1 // 60px per hour, similar to Apple Calendar default scale

export function CalendarView() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10))
  const [events, setEvents] = useState<EventItem[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    startHour: '10',
    startMin: '00',
    endHour: '11',
    endMin: '00'
  })

  const load = async (d: string) => {
    try {
      const data = await eventsAPI.getEvents(d)
      setEvents(data.events || [])
    } catch (e) {
      console.error('載入事件失敗', e)
    }
  }

  const onAddEvent = async () => {
    if (!newEvent.title.trim()) {
      alert('請輸入事件標題')
      return
    }
    
    const start = `${date}T${newEvent.startHour.padStart(2, '0')}:${newEvent.startMin.padStart(2, '0')}`
    const end = `${date}T${newEvent.endHour.padStart(2, '0')}:${newEvent.endMin.padStart(2, '0')}`
    
    try {
      await eventsAPI.createEvent({ title: newEvent.title, start, end })
      
      // 重置表單
      setNewEvent({ title: '', startHour: '10', startMin: '00', endHour: '11', endMin: '00' })
      setShowAddForm(false)
      load(date)
    } catch (e) {
      console.error('新增事件失敗', e)
      alert('新增失敗')
    }
  }

  const onDeleteEvent = async (id: string) => {
    if (!confirm('確定要刪除此事件嗎？')) return
    try {
      await eventsAPI.deleteEvent(id)
      load(date)
    } catch (e) {
      console.error('刪除事件失敗', e)
    }
  }

  const onClickHour = (hour: number) => {
    setNewEvent({
      ...newEvent,
      startHour: hour.toString(),
      endHour: (hour + 1).toString()
    })
    setShowAddForm(true)
  }

  // Apple-style layout: compute absolute positions and simple columning for overlaps
  const positioned = useMemo(() => {
    type Positioned = EventItem & { top: number; height: number; col: number; cols: number }
    const items: Positioned[] = []
    const norm = events.map(e => {
      const s = new Date(e.start)
      const en = new Date(e.end)
      const sm = s.getHours() * 60 + s.getMinutes()
      const em = en.getHours() * 60 + en.getMinutes()
      const startMin = Math.max(DAY_START_MIN, sm)
      const endMin = Math.min(DAY_END_MIN, Math.max(sm + 15, em))
      return { e, startMin, endMin }
    }).sort((a,b) => a.startMin - b.startMin || a.endMin - b.endMin)

    let cluster: { active: { end: number; idx: number }[]; start: number; end: number } = { active: [], start: 0, end: 0 }
    let colPool: number[] = []

    const flushCluster = (startIdx: number, endIdx: number) => {
      if (endIdx <= startIdx) return
      // Determine max columns in cluster
      const slice = norm.slice(startIdx, endIdx)
      // Greedy column assignment
      const colEnds: number[] = []
      slice.forEach(({ e, startMin, endMin }) => {
        let col = 0
        while (colEnds[col] && colEnds[col] > startMin) col++
        colEnds[col] = endMin
        const top = (startMin - DAY_START_MIN) * PX_PER_MIN
        const height = (endMin - startMin) * PX_PER_MIN
        items.push({ ...e, top, height, col, cols: 0 })
      })
      const maxCols = colEnds.length
      // Write back max columns
      for (let i = items.length - slice.length; i < items.length; i++) {
        items[i].cols = maxCols
      }
    }

    // Build clusters of overlapping
    let startIdx = 0
    for (let i = 1; i <= norm.length; i++) {
      const prevEnd = norm[i-1]?.endMin ?? -1
      const currStart = norm[i]?.startMin ?? Infinity
      if (currStart >= prevEnd) {
        flushCluster(startIdx, i)
        startIdx = i
      }
    }
    return items
  }, [events])

  // 日期導航
  const goToDate = (offset: number) => {
    const d = new Date(date)
    d.setDate(d.getDate() + offset)
    setDate(d.toISOString().slice(0, 10))
  }

  const goToToday = () => {
    setDate(new Date().toISOString().slice(0, 10))
  }

  const isToday = date === new Date().toISOString().slice(0, 10)

  React.useEffect(() => { load(date) }, [date])

  return (
    <section>
      <h2 className="heading-2">📅 日曆</h2>
      
      {/* 日期導航 */}
      <div className="calendar-nav">
        <button onClick={() => goToDate(-1)} className="nav-btn">← 前一天</button>
        <div className="date-display">
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            style={{ color: '#1e293b', backgroundColor: '#fff' }} 
          />
          {!isToday && (
            <button onClick={goToToday} className="today-btn">回到今天</button>
          )}
        </div>
        <button onClick={() => goToDate(1)} className="nav-btn">後一天 →</button>
      </div>

      {/* 新增事件按鈕 */}
      <div className="row" style={{ marginBottom: '16px' }}>
        <button onClick={() => setShowAddForm(!showAddForm)} className="add-event-btn">
          {showAddForm ? '✕ 取消' : '+ 新增事件'}
        </button>
      </div>

      {/* 新增事件表單 */}
      {showAddForm && (
        <div className="add-event-form">
          <h4 style={{ color: '#1e293b', marginBottom: '12px' }}>新增事件到 {date}</h4>
          <div className="form-row">
            <label style={{ color: '#475569' }}>標題：</label>
            <input 
              type="text" 
              value={newEvent.title}
              onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="輸入事件標題..."
              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            />
          </div>
          <div className="form-row">
            <label style={{ color: '#475569' }}>開始時間：</label>
            <select 
              value={newEvent.startHour}
              onChange={e => setNewEvent({ ...newEvent, startHour: e.target.value })}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            >
              {hours.map(h => (
                <option key={h} value={h}>{h.toString().padStart(2, '0')}時</option>
              ))}
            </select>
            <span>:</span>
            <select 
              value={newEvent.startMin}
              onChange={e => setNewEvent({ ...newEvent, startMin: e.target.value })}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            >
              {['00', '15', '30', '45'].map(m => (
                <option key={m} value={m}>{m}分</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label style={{ color: '#475569' }}>結束時間：</label>
            <select 
              value={newEvent.endHour}
              onChange={e => setNewEvent({ ...newEvent, endHour: e.target.value })}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            >
              {hours.map(h => (
                <option key={h} value={h}>{h.toString().padStart(2, '0')}時</option>
              ))}
            </select>
            <span>:</span>
            <select 
              value={newEvent.endMin}
              onChange={e => setNewEvent({ ...newEvent, endMin: e.target.value })}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            >
              {['00', '15', '30', '45'].map(m => (
                <option key={m} value={m}>{m}分</option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button onClick={onAddEvent} className="save-btn">儲存事件</button>
            <button onClick={() => setShowAddForm(false)} className="cancel-btn">取消</button>
          </div>
        </div>
      )}

      {/* Apple-style day layout */}
      <div className="apple-cal">
        <div className="ac-body">
          <div className="ac-gutter">
            {hours.map(h => (
              <div key={h} className="ac-gutter-hour" style={{ height: 60 }}>
                <span>{String(h).padStart(2,'0')}:00</span>
              </div>
            ))}
          </div>
          <div className="ac-day" style={{ height: (DAY_END_MIN - DAY_START_MIN) * PX_PER_MIN }}>
            {/* hour lines */}
            {hours.map(h => (
              <div key={h} className="ac-hour-line" style={{ top: (h*60 - DAY_START_MIN) * PX_PER_MIN }} />
            ))}
            {/* events */}
            {positioned.map(ev => {
              const gap = 6
              const widthPct = Math.max(100 / ev.cols - 1.5, 100) // fallback if cols=0
              const safeCols = ev.cols || 1
              const w = (100 / safeCols)
              const leftPct = ev.col * w
              return (
                <div
                  key={ev.id}
                  className="ac-event"
                  style={{ 
                    top: ev.top, height: Math.max(ev.height, 22), 
                    left: `calc(${leftPct}% + 2px)`, width: `calc(${w}% - 8px)`
                  }}
                  onClick={() => onClickHour(new Date(ev.start).getHours())}
                >
                  <div className="ac-event-title">{ev.title}</div>
                  <div className="ac-event-time">
                    {new Date(ev.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(ev.end).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  </div>
                  <button className="ac-event-del" title="刪除事件" onClick={(e) => { e.stopPropagation(); onDeleteEvent(ev.id) }}>✕</button>
                </div>
              )
            })}
            {/* empty add click */}
            <div className="ac-click-catcher" onClick={(e) => {
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
              const y = e.clientY - rect.top
              const minFromStart = Math.floor(y / PX_PER_MIN) + DAY_START_MIN
              const hour = Math.floor(minFromStart / 60)
              onClickHour(hour)
            }} />
          </div>
        </div>
      </div>
      
      <p className="hint" style={{ color: '#64748b' }}>💡 點擊空白時段可快速新增事件；拖曳移動將在未來版本提供</p>
    </section>
  )
}
