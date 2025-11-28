import { uid, store } from '../lib/store.js'
import { notFound } from '../lib/errors.js'

export async function registerFocus(app) {
  app.post('/api/focus/start', {
    schema: {
      body: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          weather: { type: 'string' }
        },
        additionalProperties: false
      }
    }
  }, async (req) => {
    const { userId = 'demo', weather = 'sunny' } = req.body || {}
    const session = { id: uid(), userId, weather, start: new Date().toISOString() }
    store.focusSessions.add(session)
    return { session }
  })

  app.post('/api/focus/stop', {
    schema: {
      body: {
        type: 'object',
        required: ['sessionId'],
        properties: { sessionId: { type: 'string' } },
        additionalProperties: false
      }
    }
  }, async (req, reply) => {
    const { sessionId } = req.body || {}
    const s = store.focusSessions.findById(sessionId)
    if (!s) return notFound(reply, 'session')
    
    const end = new Date().toISOString()
    const ms = new Date(end).getTime() - new Date(s.start).getTime()
    const minutes = Math.max(1, Math.round(ms / 60000))
    const xpGained = Math.round(minutes / 5) * 10
    
    store.focusSessions.update(sessionId, { end, xpGained, completed: true })
    
    // Character XP
    let ch = store.characters.find(s.userId)
    if (!ch) { 
      ch = { id: uid(), userId: s.userId, xp: 0, level: 1, unlockedItems: [] }
      store.characters.add(ch)
    }
    
    ch.xp += xpGained
    while (ch.xp >= ch.level * 100) { 
      ch.xp -= ch.level * 100
      ch.level += 1 
    }
    store.characters.update(ch)
    
    return { session: { ...s, end, xpGained }, character: ch }
  })

  // 取得本週 XP 統計
  app.get('/api/focus/stats', async (req) => {
    const userId = req.query.userId || 'demo'
    
    // 計算本週起始時間 (週一)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(now)
    monday.setDate(now.getDate() + mondayOffset)
    monday.setHours(0, 0, 0, 0)
    
    // 週日結算時間
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    
    // 計算本週完成的 sessions 總 XP
    const sessions = store.focusSessions.all()
    const weekSessions = sessions.filter(s => {
      if (s.userId !== userId || !s.completed) return false
      const endDate = new Date(s.end)
      return endDate >= monday && endDate <= sunday
    })
    
    const weeklyXp = weekSessions.reduce((sum, s) => sum + (s.xpGained || 0), 0)
    const completedSlots = weekSessions.length
    
    // 計算連續完成獎勵
    let consecutiveBonus = 0
    if (completedSlots >= 3) consecutiveBonus += Math.floor(completedSlots / 3) * 10
    if (completedSlots >= 15) consecutiveBonus += 110
    if (completedSlots >= 35) consecutiveBonus += 110
    if (completedSlots >= 45) consecutiveBonus += 120
    
    const totalWeeklyXp = weeklyXp + consecutiveBonus
    
    // 取得歷史最高
    const allSessions = sessions.filter(s => s.userId === userId && s.completed)
    const historicalMax = Math.max(totalWeeklyXp, ...allSessions.map(s => s.xpGained || 0))
    
    // 角色資料
    const character = store.characters.find(userId)
    
    return {
      weeklyXp: totalWeeklyXp,
      completedSlots,
      consecutiveBonus,
      historicalMax,
      weekStart: monday.toISOString(),
      weekEnd: sunday.toISOString(),
      character: character || { xp: 0, level: 1 }
    }
  })

  // 取得最近的專注歷史與連續天數
  app.get('/api/focus/history', async (req) => {
    const userId = req.query.userId || 'demo'
    const limit = Number(req.query.limit || 20)
    const all = store.focusSessions.all().filter(s => s.userId === userId && s.completed)
    const sorted = all.sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime())
    const recent = sorted.slice(0, limit)

    // 計算連續天數（由今天往回算，連續有至少一筆完成）
    const daysWithSession = new Set(all.map(s => new Date(s.end).toDateString()))
    let streakDays = 0
    const today = new Date()
    for (let i = 0; ; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toDateString()
      if (daysWithSession.has(key)) streakDays += 1
      else break
    }

    return { sessions: recent, streakDays, totalCompleted: all.length }
  })

  // 取得角色資料
  app.get('/api/character', async (req) => {
    const userId = req.query.userId || 'demo'
    const ch = store.characters.find(userId)
    return ch || { id: null, userId, xp: 0, level: 1, unlockedItems: [] }
  })

  // 解鎖物品（加入 unlockedItems）
  app.post('/api/character/unlock', {
    schema: {
      body: {
        type: 'object',
        required: ['userId', 'item'],
        properties: {
          userId: { type: 'string' },
          item: { type: 'string' }
        },
        additionalProperties: false
      }
    }
  }, async (req, reply) => {
    const { userId, item } = req.body
    let ch = store.characters.find(userId)
    if (!ch) {
      ch = { id: uid(), userId, xp: 0, level: 1, unlockedItems: [] }
      store.characters.add(ch)
    }
    if (!ch.unlockedItems.includes(item)) {
      ch.unlockedItems.push(item)
      store.characters.update(ch)
    }
    return { character: ch }
  })
}
