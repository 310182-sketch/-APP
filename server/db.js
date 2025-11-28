import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dbPath = path.join(process.cwd(), 'server', 'data.db')
const db = new Database(dbPath)

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    userId TEXT,
    title TEXT,
    description TEXT,
    dueDate TEXT,
    priority TEXT,
    projectId TEXT,
    completed INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    userId TEXT,
    title TEXT,
    start TEXT,
    end TEXT,
    taskId TEXT,
    reminders TEXT
  );

  CREATE TABLE IF NOT EXISTS schedules (
    userId TEXT PRIMARY KEY,
    data TEXT
  );

  CREATE TABLE IF NOT EXISTS focus_sessions (
    id TEXT PRIMARY KEY,
    userId TEXT,
    weather TEXT,
    start TEXT,
    end TEXT,
    duration INTEGER,
    taskId TEXT,
    xpGained INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    eventId TEXT,
    minutesBefore INTEGER,
    channel TEXT,
    status TEXT,
    sentAt TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    userId TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    unlockedItems TEXT
  );
`)

export default db
