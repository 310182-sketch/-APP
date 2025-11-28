import db from '../db.js'

export const uid = () => Math.random().toString(36).slice(2)

export function sameDayISO(isoA, isoB) {
  const a = new Date(isoA)
  const b = new Date(isoB)
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export const store = {
  tasks: {
    get: (filter = {}) => {
      let sql = 'SELECT * FROM tasks WHERE 1=1'
      const params = []
      if (filter.userId) { sql += ' AND userId = ?'; params.push(filter.userId) }
      const rows = db.prepare(sql).all(...params)
      return rows.map(r => ({...r, completed: !!r.completed}))
    },
    add: (task) => {
      const stmt = db.prepare('INSERT INTO tasks (id, userId, title, description, dueDate, priority, projectId, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      stmt.run(task.id, task.userId, task.title, task.description || '', task.dueDate, task.priority, task.projectId, task.completed ? 1 : 0)
    },
    findById: (id) => {
      const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
      if (row) return {...row, completed: !!row.completed}
      return null
    },
    update: (id, updates) => {
      const keys = Object.keys(updates).filter(k => k !== 'id')
      if (keys.length === 0) return
      const setClause = keys.map(k => `${k} = ?`).join(', ')
      const values = keys.map(k => typeof updates[k] === 'boolean' ? (updates[k]?1:0) : updates[k])
      db.prepare(`UPDATE tasks SET ${setClause} WHERE id = ?`).run(...values, id)
    },
    delete: (id) => {
      db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
    }
  },
  events: {
    get: (filter = {}) => {
      let sql = 'SELECT * FROM events WHERE 1=1'
      const params = []
      if (filter.userId) { sql += ' AND userId = ?'; params.push(filter.userId) }
      const rows = db.prepare(sql).all(...params)
      return rows.map(r => ({...r, reminders: JSON.parse(r.reminders || '[]')}))
    },
    add: (event) => {
      db.prepare('INSERT INTO events (id, userId, title, start, end, taskId, reminders) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        event.id, event.userId, event.title, event.start, event.end, event.taskId, JSON.stringify(event.reminders)
      )
    },
    delete: (id) => {
      db.prepare('DELETE FROM events WHERE id = ?').run(id)
    }
  },
  schedules: {
    find: (userId) => {
      const row = db.prepare('SELECT data FROM schedules WHERE userId = ?').get(userId)
      return row ? { userId, data: JSON.parse(row.data) } : null
    },
    save: (userId, data) => {
      const exists = db.prepare('SELECT 1 FROM schedules WHERE userId = ?').get(userId)
      if (exists) {
        db.prepare('UPDATE schedules SET data = ? WHERE userId = ?').run(JSON.stringify(data), userId)
      } else {
        db.prepare('INSERT INTO schedules (userId, data) VALUES (?, ?)').run(userId, JSON.stringify(data))
      }
    }
  },
  focusSessions: {
    all: () => {
      const rows = db.prepare('SELECT * FROM focus_sessions').all()
      return rows.map(r => ({...r, completed: !!r.completed}))
    },
    add: (s) => {
      db.prepare('INSERT INTO focus_sessions (id, userId, weather, start, end, duration, taskId, xpGained, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        s.id, s.userId, s.weather, s.start, s.end, s.duration, s.taskId, s.xpGained, s.completed ? 1 : 0
      )
    },
    findById: (id) => {
      return db.prepare('SELECT * FROM focus_sessions WHERE id = ?').get(id)
    },
    update: (id, updates) => {
      const keys = Object.keys(updates).filter(k => k !== 'id')
      if (keys.length === 0) return
      const setClause = keys.map(k => `${k} = ?`).join(', ')
      const values = keys.map(k => updates[k])
      db.prepare(`UPDATE focus_sessions SET ${setClause} WHERE id = ?`).run(...values, id)
    }
  },
  characters: {
    find: (userId) => {
      const row = db.prepare('SELECT * FROM characters WHERE userId = ?').get(userId)
      if (row) return {...row, unlockedItems: JSON.parse(row.unlockedItems || '[]')}
      return null
    },
    add: (c) => {
      db.prepare('INSERT INTO characters (id, userId, xp, level, unlockedItems) VALUES (?, ?, ?, ?, ?)').run(
        c.id, c.userId, c.xp, c.level, JSON.stringify(c.unlockedItems)
      )
    },
    update: (c) => {
      db.prepare('UPDATE characters SET xp = ?, level = ?, unlockedItems = ? WHERE id = ?').run(
        c.xp, c.level, JSON.stringify(c.unlockedItems), c.id
      )
    }
  },
  reminders: {
    get: () => db.prepare('SELECT * FROM reminders').all(),
    add: (r) => {
      db.prepare('INSERT INTO reminders (id, eventId, minutesBefore, channel, status, sentAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        r.id, r.eventId, r.minutesBefore, r.channel, r.status, r.sentAt, r.createdAt
      )
    },
    findById: (id) => db.prepare('SELECT * FROM reminders WHERE id = ?').get(id),
    update: (id, updates) => {
      const keys = Object.keys(updates).filter(k => k !== 'id')
      if (keys.length === 0) return
      const setClause = keys.map(k => `${k} = ?`).join(', ')
      const values = keys.map(k => updates[k])
      db.prepare(`UPDATE reminders SET ${setClause} WHERE id = ?`).run(...values, id)
    }
  }
}
