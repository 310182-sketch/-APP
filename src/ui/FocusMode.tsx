import React, { useEffect, useRef, useState } from 'react'
import { HOLIDAY_SLOTS, WEEKDAY_SLOTS, TIME_PERIODS } from '../lib/constants'
import { 
  Character, 
  NPC, 
  CharacterCustomizer,
  CharacterAppearance,
  MoodState,
  getMoodFromXP,
  getMoodEmoji,
  getMoodLabel,
  DEFAULT_APPEARANCE,
  DEFAULT_NPC_APPEARANCES
} from './Character'
import { PetPanel, PetDisplay, PetData, getPetMood } from './Pet'

type WeatherKey = 'sunny'|'cloudy'|'rain'|'storm'
const WEATHER: {key: WeatherKey, label: string}[] = [
  { key: 'sunny', label: '大晴天' },
  { key: 'cloudy', label: '多雲' },
  { key: 'rain', label: '雨天' },
  { key: 'storm', label: '暴雷雨' }
]

const WEATHER_WEIGHTS: Record<WeatherKey, number> = {
  sunny: 0.4,   // 40%
  cloudy: 0.3,  // 30%
  rain: 0.2,    // 20%
  storm: 0.1    // 10%
}

function pickWeightedWeather(): WeatherKey {
  const r = Math.random()
  let acc = 0
  for (const k of ['sunny','cloudy','rain','storm'] as WeatherKey[]) {
    acc += WEATHER_WEIGHTS[k]
    if (r <= acc) return k
  }
  return 'sunny'
}

const getMinutes = (timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

export function FocusMode() {
  const [running, setRunning] = useState(false)
  const [weather, setWeather] = useState<WeatherKey>('sunny')
  const [seconds, setSeconds] = useState(() => {
    try {
      const saved = localStorage.getItem('focusMinutes')
      const m = saved ? parseInt(saved) : 25
      return (isNaN(m) ? 25 : m) * 60
    } catch { return 25 * 60 }
  })
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [lastXp, setLastXp] = useState<number | null>(null)
  const [totalXp, setTotalXp] = useState(0)
  const [isHoliday, setIsHoliday] = useState(false)
  const [timeSlots, setTimeSlots] = useState(HOLIDAY_SLOTS)
  const [timeMode, setTimeMode] = useState<'auto'|'preference'>('auto')
  const [weatherMode, setWeatherMode] = useState<'auto'|'preference'>('auto')
  const [currentTimeOfDay, setCurrentTimeOfDay] = useState('morning')
  const [isRestTime, setIsRestTime] = useState(false)
  const [allowFreeFocus, setAllowFreeFocus] = useState(false)
  const [currentTask, setCurrentTask] = useState<string | null>(null)
  const [nextTaskInfo, setNextTaskInfo] = useState<string | null>(null)
  // Hub 分頁
  const [activeTab, setActiveTab] = useState<'play'|'pet'|'character'|'progress'|'schedule'|'shop'|'bag'>(() => {
    try { return (localStorage.getItem('focusHubTab') as any) || 'play' } catch { return 'play' }
  })
  const [focusMinutes, setFocusMinutes] = useState<number>((): number => {
    try {
      const saved = localStorage.getItem('focusMinutes')
      const m = saved ? parseInt(saved) : 25
      return isNaN(m) ? 25 : m
    } catch { return 25 }
  })
  const [solidBg, setSolidBg] = useState<boolean>(() => {
    try { return localStorage.getItem('focusSolidBg') === '1' } catch { return false }
  })
  
  // 寵物系統
  const [focusXpForPet, setFocusXpForPet] = useState(0)
  const [showPetPanel, setShowPetPanel] = useState(true)
  const [pet, setPet] = useState<PetData | null>(() => {
    const saved = localStorage.getItem('myPet')
    return saved ? JSON.parse(saved) : null
  })
  
  // 角色系統
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [playerAppearance, setPlayerAppearance] = useState<CharacterAppearance>(() => {
    const saved = localStorage.getItem('playerAppearance')
    return saved ? JSON.parse(saved) : DEFAULT_APPEARANCE
  })
  const [npcCount, setNpcCount] = useState(() => {
    const saved = localStorage.getItem('npcCount')
    return saved ? parseInt(saved) : 2
  })
  const [npcAppearances, setNpcAppearances] = useState<CharacterAppearance[]>(() => {
    const saved = localStorage.getItem('npcAppearances')
    return saved ? JSON.parse(saved) : DEFAULT_NPC_APPEARANCES
  })
  
  const [schedule, setSchedule] = useState<Record<string, string>>({})
  // 歷史與角色/商店
  const [history, setHistory] = useState<{ sessions: any[]; streakDays: number; totalCompleted: number }>({ sessions: [], streakDays: 0, totalCompleted: 0 })
  const [character, setCharacter] = useState<{ id: string | null; userId?: string; xp: number; level: number; unlockedItems: string[] }>({ id: null, xp: 0, level: 1, unlockedItems: [] })
  const userId = 'demo'
  
  const audioCtxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const oscRef = useRef<OscillatorNode | null>(null)

  // 計算心情狀態
  const mood: MoodState = getMoodFromXP(totalXp)
  
  // 監聽寵物變化
  useEffect(() => {
    const checkPet = () => {
      const saved = localStorage.getItem('myPet')
      if (saved) {
        setPet(JSON.parse(saved))
      }
    }
    window.addEventListener('storage', checkPet)
    const interval = setInterval(checkPet, 1000)
    return () => {
      window.removeEventListener('storage', checkPet)
      clearInterval(interval)
    }
  }, [])

  // 儲存角色設定
  useEffect(() => {
    localStorage.setItem('playerAppearance', JSON.stringify(playerAppearance))
  }, [playerAppearance])

  useEffect(() => {
    localStorage.setItem('npcCount', npcCount.toString())
  }, [npcCount])

  useEffect(() => {
    localStorage.setItem('npcAppearances', JSON.stringify(npcAppearances))
  }, [npcAppearances])

  // 讀取排程
  const loadSchedule = async () => {
    try {
      const res = await fetch('/api/schedule?userId=demo')
      const data = await res.json()
      setSchedule(data.schedule || {})
    } catch { setSchedule({}) }
  }

  // 讀取總 XP
  const loadTotalXp = async () => {
    try {
      const res = await fetch('/api/focus/stats?userId=demo')
      const data = await res.json()
      setTotalXp(data.weeklyXp || 0)
    } catch { setTotalXp(0) }
  }

  useEffect(() => { 
    loadSchedule()
    loadTotalXp()
    loadHistory()
    loadCharacter()
  }, [])

  // 持久化分頁
  useEffect(() => {
    try { localStorage.setItem('focusHubTab', activeTab) } catch {}
  }, [activeTab])

  // 持久化時長、未開始時同步秒數
  useEffect(() => {
    try { localStorage.setItem('focusMinutes', String(focusMinutes)) } catch {}
    if (!running) setSeconds(focusMinutes * 60)
  }, [focusMinutes, running])

  // 持久化純色背景設定
  useEffect(() => {
    try { localStorage.setItem('focusSolidBg', solidBg ? '1' : '0') } catch {}
  }, [solidBg])

  const loadHistory = async () => {
    try {
      const res = await fetch(`/api/focus/history?userId=${userId}&limit=30`)
      const data = await res.json()
      setHistory({ sessions: data.sessions || [], streakDays: data.streakDays || 0, totalCompleted: data.totalCompleted || 0 })
    } catch {}
  }

  const loadCharacter = async () => {
    try {
      const res = await fetch(`/api/character?userId=${userId}`)
      const data = await res.json()
      setCharacter(data)
    } catch {}
  }

  useEffect(() => {
    setTimeSlots(isHoliday ? HOLIDAY_SLOTS : WEEKDAY_SLOTS)
  }, [isHoliday])

  useEffect(() => {
    if (timeMode === 'auto') {
      const now = new Date()
      const hour = now.getHours()
      if (hour >= 6 && hour < 12) setCurrentTimeOfDay('morning')
      else if (hour >= 12 && hour < 17) setCurrentTimeOfDay('afternoon')
      else if (hour >= 17 && hour < 21) setCurrentTimeOfDay('evening')
      else setCurrentTimeOfDay('night')
    }
  }, [timeMode])

  // 每個時間格的天氣：Auto 依機率、偏好則固定為使用者選擇
  const weatherForSlot = (slotIdx: number): WeatherKey => {
    if (weatherMode === 'preference') return weather
    // Auto: 隨機依權重（時間格為背景的一部分）
    return pickWeightedWeather()
  }

  // 核心邏輯：檢查時間格、任務、休息與提醒
  useEffect(() => {
    const checkStatus = () => {
      const now = new Date()
      const currentMins = now.getHours() * 60 + now.getMinutes()
      
      // 1. 找出目前所在的 Slot
      const currentSlotIdx = timeSlots.findIndex(slot => {
        const start = getMinutes(slot.start)
        let end = getMinutes(slot.end)
        if (end < start) end += 24 * 60 // 跨午夜處理
        
        // 簡單處理跨午夜的 currentMins
        let cMins = currentMins
        if (start > end && cMins < start) cMins += 24 * 60 

        return cMins >= start && cMins < end
      })

      if (currentSlotIdx !== -1) {
        const key = `${isHoliday ? 'h' : 'w'}-${currentSlotIdx}`
        const task = schedule[key]
        
        if (!task || task === '睡覺') {
          setIsRestTime(true)
          setCurrentTask(null)
          if (running) stop()
        } else {
          setIsRestTime(false)
          setCurrentTask(task)
        }
      } else {
        // 不在任何 Slot 內 -> 休息時間
        setIsRestTime(true)
        setCurrentTask(null)
        if (running) stop()
      }

      // 2. 提醒邏輯 (簡化版：檢查下一個 Slot)
      const nextSlotIdx = timeSlots.findIndex(slot => {
        const start = getMinutes(slot.start)
        return start > currentMins
      })

      if (nextSlotIdx !== -1) {
        const nextSlot = timeSlots[nextSlotIdx]
        const nextStart = getMinutes(nextSlot.start)
        const diff = nextStart - currentMins
        
        const key = `${isHoliday ? 'h' : 'w'}-${nextSlotIdx}`
        const nextTask = schedule[key]

        if (nextTask && nextTask !== '睡覺') {
          // 檢查是否連續
          const prevSlot = timeSlots[nextSlotIdx - 1]
          let isContinuous = false
          if (prevSlot) {
            const prevEnd = getMinutes(prevSlot.end)
            if (prevEnd === nextStart) isContinuous = true
          }

          if (isContinuous) {
            if (diff === 0) {
               notify(`任務開始：${nextTask}`, `時間到了！開始執行 ${nextTask}`)
            }
          } else {
            if (diff === 10) {
               notify(`準備提醒：${nextTask}`, `還有 10 分鐘開始 ${nextTask}`)
            } else if (diff === 0) {
               notify(`任務開始：${nextTask}`, `時間到了！開始執行 ${nextTask}`)
            }
          }
          setNextTaskInfo(`${nextSlot.start} ${nextTask} (${isContinuous ? '連續' : '休息後'})`)
        } else {
          setNextTaskInfo(null)
        }
      }
    }

    const timer = setInterval(checkStatus, 10000) // 每 10 秒檢查一次
    checkStatus()
    return () => clearInterval(timer)
  }, [timeSlots, isHoliday, running, schedule])

  const notify = (title: string, body: string) => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') {
      new Notification(title, { body })
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(p => {
        if (p === 'granted') new Notification(title, { body })
      })
    }
  }

  useEffect(() => {
    let timer: number | undefined
    if (running) {
      timer = window.setInterval(() => setSeconds((s: number) => s - 1), 1000)
    }
    return () => { if (timer) window.clearInterval(timer) }
  }, [running])

  useEffect(() => {
    if (seconds <= 0) {
      stop()
      setSeconds(focusMinutes * 60)
    }
  }, [seconds, focusMinutes])

  const initAudio = async () => {
    if (!audioCtxRef.current) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const gain = ctx.createGain()
      gain.gain.value = 0.0
      gain.connect(ctx.destination)
      audioCtxRef.current = ctx
      gainRef.current = gain
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      // 依天氣變化音色：晴(較亮)、多雲(中)、雨(較低且可加雜訊)、暴雷雨(更低頻)
      osc.frequency.value = weather === 'storm' ? 120 : weather === 'rain' ? 180 : weather === 'cloudy' ? 300 : 440
      osc.connect(gain)
      osc.start()
      oscRef.current = osc
      fadeIn()
    }
  }

  const fadeIn = () => {
    const gain = gainRef.current
    const ctx = audioCtxRef.current
    if (!gain || !ctx) return
    const now = ctx.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(gain.gain.value, now)
    gain.gain.linearRampToValueAtTime(0.08, now + 2)
  }
  const fadeOut = () => {
    const gain = gainRef.current
    const ctx = audioCtxRef.current
    if (!gain || !ctx) return
    const now = ctx.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(gain.gain.value, now)
    gain.gain.linearRampToValueAtTime(0.0, now + 1.2)
  }

  const start = async () => {
    if (isRestTime && !allowFreeFocus) {
      alert('現在是休息時間或未排定任務。若要自由專注，請勾選「自由專注」。')
      return
    }
    setSeconds(focusMinutes * 60)
    await initAudio()
    try {
      const res = await fetch('/api/focus/start', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'demo', weather })
      })
      const data = await res.json()
      setSessionId(data.session?.id || null)
    } catch {}
    setRunning(true)
    try { await document.documentElement.requestFullscreen?.() } catch {}
  }
  const stop = async () => {
    if (running && seconds > 0 && !isRestTime) {
      const confirmExit = confirm('專注還沒完成，要中途結束嗎？')
      if (!confirmExit) return
    }
    setRunning(false)
    fadeOut()
    try { oscRef.current?.stop(); oscRef.current?.disconnect(); oscRef.current = null } catch {}
    try { document.exitFullscreen?.() } catch {}
    if (sessionId) {
      try {
        const res = await fetch('/api/focus/stop', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        })
        const data = await res.json()
        if (data.session?.xpGained != null) {
          setLastXp(data.session.xpGained)
          // 餵食寵物！
          setFocusXpForPet(data.session.xpGained)
          alert(`專注完成！獲得 ${data.session.xpGained} XP，已餵食你的寵物！🍖`)
          // 重新載入統計/角色/歷史
          loadTotalXp()
          loadHistory()
          loadCharacter()
        }
      } catch {}
      setSessionId(null)
    }
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2,'0')
  const ss = String(seconds % 60).padStart(2,'0')
  const currentBg = TIME_PERIODS.find(p => p.key === currentTimeOfDay)?.color || '#fff'

  // XP 進度條計算 (最大 2500)
  const xpProgress = Math.min((totalXp / 2500) * 100, 100)

  // 成就（簡化：根據 XP 與寵物等級）
  const achievements: string[] = []
  if (totalXp >= 100) achievements.push('初入狀態：一週 100 XP')
  if (totalXp >= 500) achievements.push('穩定專注：一週 500 XP')
  if (totalXp >= 1500) achievements.push('專注達人：一週 1500 XP')
  if (pet?.level && pet.level >= 5) achievements.push('萌寵成長 Lv.5')
  if (pet?.level && pet.level >= 10) achievements.push('萌寵成長 Lv.10')
  if (history.streakDays >= 3) achievements.push(`連續專注 ${history.streakDays} 天`)
  if (history.totalCompleted >= 50) achievements.push('累積完成 50 次專注')

  // 商店/背包（簡化版）
  const SHOP_ITEMS: { id: string; name: string; icon: string; requireLevel?: number }[] = [
    { id: 'bow', name: '蝴蝶結', icon: '🎀', requireLevel: 2 },
    { id: 'hat', name: '小帽子', icon: '🎩', requireLevel: 3 },
    { id: 'scarf', name: '圍巾', icon: '🧣', requireLevel: 4 },
    { id: 'ball', name: '玩具球', icon: '⚽', requireLevel: 2 },
    { id: 'bell', name: '鈴鐺', icon: '🔔', requireLevel: 5 }
  ]

  const unlocked = new Set(character.unlockedItems || [])
  const unlockItem = async (itemId: string) => {
    if (unlocked.has(itemId)) return
    const item = SHOP_ITEMS.find(i => i.id === itemId)
    if (item?.requireLevel && character.level < item.requireLevel) {
      alert(`需要角色等級 Lv.${item.requireLevel} 才能解鎖`)
      return
    }
    try {
      const res = await fetch('/api/character/unlock', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, item: itemId })
      })
      const data = await res.json()
      setCharacter(data.character)
      alert(`已解鎖：${item?.name}`)
    } catch {}
  }

  const applyToPet = (itemId: string) => {
    if (!pet) { alert('請先領養寵物') ; return }
    if (!unlocked.has(itemId)) { alert('請先在商店解鎖此物品') ; return }
    setPet(prev => {
      if (!prev) return prev
      const set = new Set(prev.accessories || [])
      set.add(itemId)
      const updated = { ...prev, accessories: Array.from(set) }
      localStorage.setItem('myPet', JSON.stringify(updated))
      return updated
    })
    alert('已套用到寵物！')
  }

  return (
    <section className="focus-hub">
      <h2>專注小遊戲</h2>

      {/* 分頁列 */}
      <div className="tabbar glass-card">
        {[
          { key: 'play', label: '計時' },
          { key: 'pet', label: '寵物' },
          { key: 'character', label: '角色' },
          { key: 'progress', label: '進度' },
          { key: 'schedule', label: '行程' },
          { key: 'shop', label: '商店' },
          { key: 'bag', label: '背包' }
        ].map(t => (
          <button
            key={t.key}
            className={`tab-btn ${activeTab === (t.key as any) ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key as any)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 計時頁 */}
      {activeTab === 'play' && (
        <div className="tab-content">
          <div className="row">
            <label>
              天氣模式：
              <select value={weatherMode} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setWeatherMode(e.target.value as any)}>
                <option value="auto">Auto</option>
                <option value="preference">個人偏好</option>
              </select>
            </label>
            {weatherMode === 'preference' && (
              <label>
                天氣：
                <select value={weather} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setWeather(e.target.value as WeatherKey)}>
                  {WEATHER.map(w => <option key={w.key} value={w.key}>{w.label}</option>)}
                </select>
              </label>
            )}
            <label>
              模式：
              <select value={isHoliday ? 'holiday' : 'weekday'} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setIsHoliday(e.target.value === 'holiday')}>
                <option value="weekday">平日</option>
                <option value="holiday">假日</option>
              </select>
            </label>
            <label>
              時間：
              <select value={timeMode} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimeMode(e.target.value as any)}>
                <option value="auto">自動</option>
                <option value="preference">手動偏好</option>
              </select>
            </label>
            <label>
              時長：
              <select value={focusMinutes} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFocusMinutes(parseInt(e.target.value))}>
                {[5, 15, 25, 45, 90].map(m => <option key={m} value={m}>{m} 分</option>)}
              </select>
            </label>
            <label>
              自訂：
              <input type="number" min={1} max={180} value={focusMinutes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFocusMinutes(Math.max(1, Math.min(180, parseInt(e.target.value || '0'))))} style={{ width: 72 }} /> 分
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={solidBg} onChange={e => setSolidBg(e.target.checked)} />
              純色背景
            </label>
            {!running ? (
              <button onClick={start} disabled={isRestTime && !allowFreeFocus} style={{ opacity: (isRestTime && !allowFreeFocus) ? 0.5 : 1 }}>
                {isRestTime && !allowFreeFocus ? '休息/無任務' : '開始專注'}
              </button>
            ) : (
              <button onClick={stop}>結束</button>
            )}
          </div>
          {isRestTime && (
            <div className="hint" style={{ marginTop: 8 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={allowFreeFocus} onChange={e => setAllowFreeFocus(e.target.checked)} />
                自由專注（無排程也可開始）
              </label>
            </div>
          )}

          <div className="mood-indicator">
            <span className="mood-emoji">{getMoodEmoji(mood)}</span>
            <div className="mood-info">
              <div className="mood-label">{getMoodLabel(mood)}</div>
              <div className="mood-xp">本週 XP：{totalXp} / 2500</div>
              <div className="xp-bar">
                <div className={`xp-bar-fill ${mood}`} style={{ width: `${xpProgress}%` }} />
              </div>
            </div>
          </div>

          <div className={`focus-world focus-${weather} ${solidBg ? 'solid-bg' : ''}`} style={solidBg ? undefined : { background: currentBg }}>
            <div className="timer">{mm}:{ss}</div>
            <div className="character-stage">
              {Array.from({ length: npcCount }).map((_, i) => (
                <NPC
                  key={i}
                  appearance={npcAppearances[i] || DEFAULT_NPC_APPEARANCES[i]}
                  mood={mood}
                  position={i}
                  size={70}
                />
              ))}
              <div className="main-character">
                <Character 
                  appearance={playerAppearance} 
                  mood={mood}
                  isWorking={running && !isRestTime}
                  isResting={isRestTime}
                  size={120}
                />
              </div>
              {pet && (
                <div className="pet-in-scene">
                  <PetDisplay 
                    pet={pet} 
                    size={80}
                    animation={running ? 'idle' : 'sleeping'}
                  />
                </div>
              )}
            </div>
            <div className="companion">
              {currentTask ? `正在執行：${currentTask}` : '角色正在休息... 💤'}
            </div>
            {pet && <p className="hint">🐾 {pet.name} 正在陪伴你專注！完成後會獲得食物獎勵</p>}
            {nextTaskInfo && <p className="hint">下個任務：{nextTaskInfo}</p>}
            {lastXp != null && <p className="hint">上次獲得 XP：{lastXp}</p>}
            {isRestTime && <div className="rest-overlay">現在是休息時間或未排程 ☕</div>}
          </div>
        </div>
      )}

      {/* 寵物頁 */}
      {activeTab === 'pet' && (
        <div className="tab-content">
          <div className="focus-pet-section">
            <div className="pet-toggle-header">
              <h3>🐾 我的寵物夥伴</h3>
            </div>
            <PetPanel focusXpEarned={focusXpForPet} />
          </div>
        </div>
      )}

      {/* 角色頁 */}
      {activeTab === 'character' && (
        <div className="tab-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div>
              <CharacterCustomizer 
                appearance={playerAppearance} 
                onChange={setPlayerAppearance} 
              />
              <div className="npc-settings">
                <h4>👥 NPC 夥伴設定</h4>
                <p className="hint">選擇要有幾隻 NPC 陪伴你（最多 4 隻）</p>
                <div className="npc-count-selector">
                  {[0, 1, 2, 3, 4].map(n => (
                    <button 
                      key={n}
                      className={`npc-count-btn ${npcCount === n ? 'active' : ''}`}
                      onClick={() => setNpcCount(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
              <p style={{ marginBottom: '10px', color: 'var(--gray-600)' }}>預覽：</p>
              <Character 
                appearance={playerAppearance} 
                mood={mood}
                isWorking={false}
                isResting={false}
                size={100}
              />
            </div>
          </div>
        </div>
      )}

      {/* 進度頁 */}
      {activeTab === 'progress' && (
        <div className="tab-content">
          <div className="mood-indicator">
            <span className="mood-emoji">{getMoodEmoji(mood)}</span>
            <div className="mood-info">
              <div className="mood-label">{getMoodLabel(mood)}</div>
              <div className="mood-xp">本週 XP：{totalXp} / 2500</div>
              <div className="xp-bar">
                <div className={`xp-bar-fill ${mood}`} style={{ width: `${xpProgress}%` }} />
              </div>
            </div>
          </div>
          <div className="glass-card" style={{ padding: 16, marginTop: 12 }}>
            <h3>🏆 成就</h3>
            {achievements.length === 0 ? (
              <p className="hint">尚未解鎖成就，開始專注來獲得 XP 吧！</p>
            ) : (
              <ul>
                {achievements.map((a, i) => <li key={i}>✅ {a}</li>)}
              </ul>
            )}
            {lastXp != null && <p className="hint" style={{ marginTop: 8 }}>上次獲得 XP：{lastXp}</p>}
            {pet && <p className="hint">寵物等級：Lv.{pet.level}</p>}
            <p className="hint">連續天數：{history.streakDays} 天，累積完成：{history.totalCompleted} 次</p>
          </div>
          <div className="glass-card" style={{ padding: 16, marginTop: 12 }}>
            <h3>🕒 最近專注</h3>
            {history.sessions.length === 0 ? (
              <p className="hint">目前沒有歷史紀錄</p>
            ) : (
              <ul>
                {history.sessions.map((s, i) => (
                  <li key={i}>
                    {new Date(s.end).toLocaleString('zh-TW')} • {s.xpGained || 0} XP • 天氣：{s.weather}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* 行程頁 */}
      {activeTab === 'schedule' && (
        <div className="tab-content">
          <div className="time-slots">
            <h3>今日行程預覽</h3>
            <ul>
              {timeSlots.map((slot, idx) => {
                 const key = `${isHoliday ? 'h' : 'w'}-${idx}`
                 const task = schedule[key]
                 const w = weatherForSlot(idx)
                 const light = w === 'sunny' ? 1 : w === 'cloudy' ? 0.85 : w === 'rain' ? 0.7 : 0.55
                 return <li key={idx} style={{ fontWeight: task === currentTask ? 'bold' : 'normal' }}>
                   {slot.start}-{slot.end} {task || '無'} • 天氣：{WEATHER.find(x => x.key === w)?.label} • 亮度：{Math.round(light * 100)}%
                 </li>
              })}
            </ul>
          </div>
        </div>
      )}

      {/* 商店 */}
      {activeTab === 'shop' && (
        <div className="tab-content">
          <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
            <h3>🛒 商店</h3>
            <div>角色等級：Lv.{character.level}</div>
          </div>
          <div className="shop-grid">
            {SHOP_ITEMS.map(item => {
              const isUnlocked = unlocked.has(item.id)
              return (
                <div className={`shop-item-card glass-card ${isUnlocked ? 'unlocked' : ''}`} key={item.id}>
                  <div className="shop-item-main">
                    <div className="shop-icon">{item.icon}</div>
                    <div className="shop-info">
                      <div className="shop-name">{item.name}</div>
                      <div className="shop-req">需求等級：Lv.{item.requireLevel || 1}</div>
                    </div>
                  </div>
                  {isUnlocked ? (
                    <button className="text-btn" onClick={() => applyToPet(item.id)}>套用到寵物</button>
                  ) : (
                    <button className="hero-btn" onClick={() => unlockItem(item.id)}>解鎖</button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 背包 */}
      {activeTab === 'bag' && (
        <div className="tab-content">
          <h3>🎒 背包</h3>
          {character.unlockedItems?.length ? (
            <div className="bag-grid">
              {character.unlockedItems.map(id => {
                const item = SHOP_ITEMS.find(i => i.id === id)
                return (
                  <div className="bag-item glass-card" key={id}>
                    <div className="bag-icon">{item?.icon || '🎁'}</div>
                    <div className="bag-name">{item?.name || id}</div>
                    <button className="text-btn" onClick={() => applyToPet(id)}>套用到寵物</button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="hint">尚未解鎖物品，去商店看看吧！</p>
          )}
        </div>
      )}
    </section>
  )
}
