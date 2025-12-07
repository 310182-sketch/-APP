import React, { useState, useEffect } from 'react'
import { HOLIDAY_SLOTS, WEEKDAY_SLOTS } from '../lib/constants'
import { tasksAPI, scheduleAPI } from '../lib/api'

interface TaskItem {
  id: string
  title: string
  dueDate?: string
  priority?: 'low'|'medium'|'high'
  completed?: boolean
}

export function TasksView() {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [title, setTitle] = useState('')
  const [isHoliday, setIsHoliday] = useState(false)
  const [schedule, setSchedule] = useState<Record<string, string>>({})

  const timeSlots = isHoliday ? HOLIDAY_SLOTS : WEEKDAY_SLOTS

  const load = async () => {
    const data = await tasksAPI.getTasks()
    setTasks(data.tasks || [])

    const dataSch = await scheduleAPI.getSchedule('demo')
    setSchedule(dataSch.schedule || {})
  }
  const addTask = async () => {
    if (!title.trim()) return
    await tasksAPI.createTask(title)
    setTitle('')
    load()
  }
  const toggle = async (id: string) => {
    await tasksAPI.toggleTask(id)
    load()
  }

  const assignTask = async (slotIdx: number, taskTitle: string) => {
    const newSchedule = { ...schedule, [`${isHoliday ? 'h' : 'w'}-${slotIdx}`]: taskTitle }
    setSchedule(newSchedule)
    await scheduleAPI.saveSchedule('demo', newSchedule)
  }

  useEffect(() => { load() }, [])

  return (
    <section>
      <h2 className="heading-2">✅ 代辦清單（依時間格）</h2>
      <div className="row">
        <label>
          模式：
          <select value={isHoliday ? 'holiday' : 'weekday'} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setIsHoliday(e.target.value === 'holiday')}>
            <option value="weekday">平日</option>
            <option value="holiday">假日</option>
          </select>
        </label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="輸入任務..." />
        <button onClick={addTask}>新增</button>
      </div>
      
      <div className="time-slots-editor">
        <h3>今日行程表（{isHoliday ? '假日' : '平日'}）</h3>
        <p className="hint">請在時間格輸入任務，輸入「睡覺」則該時段不執行專注功能。</p>
        <ul>
          {timeSlots.map((slot, idx) => {
            const key = `${isHoliday ? 'h' : 'w'}-${idx}`
            const val = schedule[key] || ''
            return (
              <li key={idx} className="slot-row">
                <span className="slot-label">{slot.label}</span>
                <input 
                  type="text" 
                  value={val} 
                  placeholder="輸入任務或選取..." 
                  onChange={e => assignTask(idx, e.target.value)}
                  list="tasks-datalist"
                />
              </li>
            )
          })}
        </ul>
        <datalist id="tasks-datalist">
          {tasks.map(t => <option key={t.id} value={t.title} />)}
          <option value="睡覺" />
        </datalist>
      </div>

      <h3>待辦事項庫</h3>
      <ul className="tasks">
        {tasks.map(t => (
          <li key={t.id}>
            <label>
              <input type="checkbox" checked={!!t.completed} onChange={() => toggle(t.id)} />
              <span className={t.completed ? 'done' : ''}>{t.title}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}
