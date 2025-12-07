// 前端資料存取層 - 使用 localStorage 取代後端 API

// ===== Types =====
export interface Task {
  id: string
  title: string
  completed: boolean
}

export interface Event {
  id: string
  title: string
  start: string
  end: string
}

export interface FocusSession {
  id: string
  userId: string
  start: string
  end: string
  weather: string
  xpGained: number
}

export interface Character {
  id: string
  userId: string
  xp: number
  level: number
  unlockedItems: string[]
}

// ===== Helper Functions =====
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Save to storage failed:', e)
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ===== Tasks API =====
export const tasksAPI = {
  async getTasks(): Promise<{ tasks: Task[] }> {
    const tasks = getFromStorage<Task[]>('tasks', [])
    return { tasks }
  },

  async createTask(title: string): Promise<{ task: Task }> {
    const tasks = getFromStorage<Task[]>('tasks', [])
    const task: Task = {
      id: generateId(),
      title,
      completed: false
    }
    tasks.push(task)
    saveToStorage('tasks', tasks)
    return { task }
  },

  async toggleTask(id: string): Promise<{ task: Task }> {
    const tasks = getFromStorage<Task[]>('tasks', [])
    const task = tasks.find(t => t.id === id)
    if (task) {
      task.completed = !task.completed
      saveToStorage('tasks', tasks)
      return { task }
    }
    throw new Error('Task not found')
  }
}

// ===== Events API =====
export const eventsAPI = {
  async getEvents(date: string): Promise<{ events: Event[] }> {
    const allEvents = getFromStorage<Event[]>('events', [])
    // Filter events by date
    const events = allEvents.filter(e => e.start.startsWith(date))
    return { events }
  },

  async createEvent(event: Omit<Event, 'id'>): Promise<{ event: Event }> {
    const events = getFromStorage<Event[]>('events', [])
    const newEvent: Event = {
      id: generateId(),
      ...event
    }
    events.push(newEvent)
    saveToStorage('events', events)
    return { event: newEvent }
  },

  async deleteEvent(id: string): Promise<void> {
    const events = getFromStorage<Event[]>('events', [])
    const filtered = events.filter(e => e.id !== id)
    saveToStorage('events', filtered)
  }
}

// ===== Schedule API =====
export const scheduleAPI = {
  async getSchedule(userId: string): Promise<{ schedule: Record<string, string> }> {
    const schedule = getFromStorage<Record<string, string>>(`schedule_${userId}`, {})
    return { schedule }
  },

  async saveSchedule(userId: string, schedule: Record<string, string>): Promise<void> {
    saveToStorage(`schedule_${userId}`, schedule)
  }
}

// ===== Focus API =====
export const focusAPI = {
  async startSession(userId: string, weather: string): Promise<{ session: FocusSession }> {
    const session: FocusSession = {
      id: generateId(),
      userId,
      start: new Date().toISOString(),
      end: '',
      weather,
      xpGained: 0
    }
    saveToStorage('currentSession', session)
    return { session }
  },

  async stopSession(sessionId: string): Promise<{ session: FocusSession }> {
    const session = getFromStorage<FocusSession | null>('currentSession', null)
    if (!session || session.id !== sessionId) {
      throw new Error('Session not found')
    }

    session.end = new Date().toISOString()
    
    // Calculate XP (30 XP for completing a session)
    session.xpGained = 30

    // Save to history
    const history = getFromStorage<FocusSession[]>('focusHistory', [])
    history.push(session)
    saveToStorage('focusHistory', history)

    // Update character XP
    const character = getFromStorage<Character>('character_demo', {
      id: 'char_demo',
      userId: 'demo',
      xp: 0,
      level: 1,
      unlockedItems: []
    })
    character.xp += session.xpGained
    character.level = Math.floor(character.xp / 100) + 1
    saveToStorage('character_demo', character)

    // Update weekly XP
    const weekStart = getWeekStart()
    const weeklyData = getFromStorage<{ week: string; xp: number }>('weeklyXp', { week: weekStart, xp: 0 })
    if (weeklyData.week !== weekStart) {
      weeklyData.week = weekStart
      weeklyData.xp = 0
    }
    weeklyData.xp += session.xpGained
    saveToStorage('weeklyXp', weeklyData)

    localStorage.removeItem('currentSession')
    return { session }
  },

  async getStats(userId: string): Promise<{ weeklyXp: number; completedSlots: number; consecutiveBonus: number; historicalMax: number; weekStart: string; weekEnd: string; character: { xp: number; level: number } }> {
    const weekStart = getWeekStart()
    const weekEnd = getWeekEnd()
    const weeklyData = getFromStorage<{ week: string; xp: number }>('weeklyXp', { week: weekStart, xp: 0 })
    
    if (weeklyData.week !== weekStart) {
      weeklyData.week = weekStart
      weeklyData.xp = 0
    }

    const character = getFromStorage<Character>('character_demo', {
      id: 'char_demo',
      userId: 'demo',
      xp: 0,
      level: 1,
      unlockedItems: []
    })

    const historicalMax = getFromStorage<number>('historicalMaxXp', 0)
    if (weeklyData.xp > historicalMax) {
      saveToStorage('historicalMaxXp', weeklyData.xp)
    }

    return {
      weeklyXp: weeklyData.xp,
      completedSlots: Math.floor(weeklyData.xp / 30),
      consecutiveBonus: 0,
      historicalMax: Math.max(historicalMax, weeklyData.xp),
      weekStart,
      weekEnd,
      character: {
        xp: character.xp,
        level: character.level
      }
    }
  },

  async getHistory(userId: string, limit: number = 30): Promise<{ sessions: FocusSession[]; streakDays: number; totalCompleted: number }> {
    const history = getFromStorage<FocusSession[]>('focusHistory', [])
    const sessions = history.slice(-limit).reverse()
    
    return {
      sessions,
      streakDays: calculateStreakDays(history),
      totalCompleted: history.length
    }
  }
}

// ===== Character API =====
export const characterAPI = {
  async getCharacter(userId: string): Promise<Character> {
    const character = getFromStorage<Character>('character_demo', {
      id: 'char_demo',
      userId: 'demo',
      xp: 0,
      level: 1,
      unlockedItems: []
    })
    return character
  },

  async unlockItem(userId: string, item: string): Promise<{ character: Character }> {
    const character = getFromStorage<Character>('character_demo', {
      id: 'char_demo',
      userId: 'demo',
      xp: 0,
      level: 1,
      unlockedItems: []
    })
    
    if (!character.unlockedItems.includes(item)) {
      character.unlockedItems.push(item)
      saveToStorage('character_demo', character)
    }
    
    return { character }
  }
}

// ===== Helper Functions =====
function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday
  const monday = new Date(now.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString()
}

function getWeekEnd(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? 0 : 7) // Sunday
  const sunday = new Date(now.setDate(diff))
  sunday.setHours(23, 59, 59, 999)
  return sunday.toISOString()
}

function calculateStreakDays(sessions: FocusSession[]): number {
  if (sessions.length === 0) return 0
  
  const dates = new Set<string>()
  sessions.forEach(s => {
    const date = s.end.split('T')[0]
    dates.add(date)
  })
  
  const sortedDates = Array.from(dates).sort().reverse()
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  for (const dateStr of sortedDates) {
    const date = new Date(dateStr)
    date.setHours(0, 0, 0, 0)
    
    const diffDays = Math.floor((currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === streak) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}
