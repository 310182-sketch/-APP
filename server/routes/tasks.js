import { uid, store } from '../lib/store.js'
import { notFound, badRequest } from '../lib/errors.js'

export async function registerTasks(app) {
  app.get('/api/tasks', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          userId: { type: 'string' }
        },
        additionalProperties: false
      }
    }
  }, async (req) => {
    const { date, userId } = req.query || {}
    let tasks = store.tasks.get({ userId })
    if (date) tasks = tasks.filter(t => t.dueDate && t.dueDate.slice(0,10) === String(date))
    return { tasks }
  })

  app.post('/api/tasks', {
    schema: {
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1 },
          dueDate: { type: 'string' },
          priority: { type: 'string', enum: ['low','medium','high'] },
          userId: { type: 'string' }
        },
        additionalProperties: false
      }
    }
  }, async (req, reply) => {
    const { title, dueDate, priority = 'medium', userId = 'demo' } = req.body || {}
    if (!title) return badRequest(reply, 'title required')
    const task = { id: uid(), userId, title, description: '', dueDate, priority, projectId: null, completed: false }
    store.tasks.add(task)
    return { task }
  })

  app.post('/api/tasks/:id/toggle', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
        additionalProperties: false
      }
    }
  }, async (req, reply) => {
    const { id } = req.params
    const t = store.tasks.findById(id)
    if (!t) return notFound(reply, 'task')
    store.tasks.update(id, { completed: !t.completed })
    return { task: { ...t, completed: !t.completed } }
  })

  app.delete('/api/tasks/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
        additionalProperties: false
      }
    }
  }, async (req, reply) => {
    const { id } = req.params
    const t = store.tasks.findById(id)
    if (!t) return notFound(reply, 'task')
    store.tasks.delete(id)
    return { task: t }
  })
}
