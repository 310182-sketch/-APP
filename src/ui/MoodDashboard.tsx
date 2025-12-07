import React, { useEffect, useState } from 'react'
import { getMoodFromXP, getMoodEmoji, getMoodLabel, MoodState } from './Character'
import { focusAPI } from '../lib/api'

interface WeekRecord {
  weekStart: string
  weekEnd: string
  totalXp: number
  completedSlots: number
  isPerfectWeek: boolean
}

interface StatsData {
  weeklyXp: number
  completedSlots: number
  consecutiveBonus: number
  historicalMax: number
  weekStart: string
  weekEnd: string
  character: { xp: number; level: number }
}

export function MoodDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [weekHistory, setWeekHistory] = useState<WeekRecord[]>([])
  const [perfectWeeks, setPerfectWeeks] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      const data = await focusAPI.getStats('demo')
      setStats(data)
      
      // 從 localStorage 讀取歷史紀錄
      const savedHistory = localStorage.getItem('weekHistory')
      if (savedHistory) {
        setWeekHistory(JSON.parse(savedHistory))
      }
      
      const savedPerfect = localStorage.getItem('perfectWeeks')
      if (savedPerfect) {
        setPerfectWeeks(JSON.parse(savedPerfect))
      }
    } catch (e) {
      console.error('載入統計失敗', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return <div className="loading-card">載入中...</div>
  }

  const weeklyXp = stats?.weeklyXp || 0
  const mood: MoodState = getMoodFromXP(weeklyXp)
  const historicalMax = stats?.historicalMax || weeklyXp
  const completedSlots = stats?.completedSlots || 0
  
  // 計算進度
  const xpProgress = Math.min((weeklyXp / 2500) * 100, 100)
  const perfectProgress = Math.min((weeklyXp / 2300) * 100, 100)
  const isPerfectWeek = weeklyXp >= 2300

  // 心情階段說明
  const moodStages = [
    { min: 0, max: 500, mood: 'anxious', label: '焦慮、憂鬱', color: '#ef4444' },
    { min: 500, max: 1200, mood: 'calm', label: '平靜、悠閒', color: '#3b82f6' },
    { min: 1200, max: 2100, mood: 'happy', label: '開心、滿足', color: '#10b981' },
    { min: 2100, max: 2500, mood: 'excited', label: '亢奮、十分滿足', color: '#ec4899' }
  ]

  return (
    <section className="mood-dashboard">
      <h2 style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)', fontWeight: 700 }}>📊 心情指數面板</h2>
      
      {/* 當前心情卡片 */}
      <div className="mood-card main-mood">
        <div className="mood-big-emoji">{getMoodEmoji(mood)}</div>
        <div className="mood-details">
          <h3 style={{ color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>本週心情：{getMoodLabel(mood)}</h3>
          <div className="xp-display">
            <span className="xp-value">{weeklyXp}</span>
            <span className="xp-max">/ 2500 XP</span>
          </div>
          <div className="xp-bar-large">
            <div 
              className={`xp-bar-fill ${mood}`} 
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{completedSlots}</div>
          <div className="stat-label">完成時間格</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{historicalMax}</div>
          <div className="stat-label">歷史最高 XP</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{perfectWeeks.length}</div>
          <div className="stat-label">最佳完整週</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">Lv.{stats?.character?.level || 1}</div>
          <div className="stat-label">角色等級</div>
        </div>
      </div>

      {/* 最佳完整週進度 */}
      <div className="perfect-week-card">
        <h4 style={{ color: '#1e293b' }}>
          {isPerfectWeek ? '🎉 恭喜達成最佳完整週！' : '🎯 距離最佳完整週 (2300 XP)'}
        </h4>
        <div className="perfect-bar">
          <div 
            className="perfect-bar-fill" 
            style={{ 
              width: `${perfectProgress}%`,
              background: isPerfectWeek 
                ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' 
                : 'linear-gradient(90deg, #6366f1, #8b5cf6)'
            }}
          />
        </div>
        <div className="perfect-info">
          {isPerfectWeek 
            ? `已達成 ${weeklyXp} XP！繼續保持 💪` 
            : `還需要 ${2300 - weeklyXp} XP`
          }
        </div>
      </div>

      {/* 心情階段說明 */}
      <div className="mood-stages">
        <h4 style={{ color: '#1e293b' }}>💡 心情指數說明</h4>
        <div className="stages-list">
          {moodStages.map((stage, i) => (
            <div 
              key={i} 
              className={`stage-item ${mood === stage.mood ? 'current' : ''}`}
            >
              <div className="stage-emoji">{getMoodEmoji(stage.mood)}</div>
              <div className="stage-info">
                <div className="stage-range" style={{ color: stage.color }}>
                  {stage.min} ~ {stage.max} XP
                </div>
                <div className="stage-label">{stage.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* XP 獲取規則 */}
      <div className="xp-rules">
        <h4 style={{ color: '#1e293b' }}>📈 XP 獲取規則</h4>
        <ul>
          <li>✅ 每完成一個時間格：+30 XP</li>
          <li>🔥 連續完成 3 個時間格：額外 +10 XP</li>
          <li>🌟 累積完成 15 個時間格：+110 XP</li>
          <li>🌟 累積完成 35 個時間格：+110 XP</li>
          <li>🏆 累積完成 45 個時間格：+120 XP</li>
        </ul>
      </div>

      {/* 過去紀錄 */}
      {weekHistory.length > 0 && (
        <div className="week-history">
          <h4 style={{ color: '#1e293b' }}>📅 過去 4 週紀錄</h4>
          <div className="history-list">
            {weekHistory.slice(-4).reverse().map((week, i) => (
              <div key={i} className="history-item">
                <div className="history-date">
                  {new Date(week.weekStart).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                  {' ~ '}
                  {new Date(week.weekEnd).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                </div>
                <div className="history-xp">
                  {getMoodEmoji(getMoodFromXP(week.totalXp))} {week.totalXp} XP
                  {week.isPerfectWeek && ' 🏆'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
