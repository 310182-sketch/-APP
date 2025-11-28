import { uid, store, sameDayISO } from '../lib/store.js'
import { notFound, badRequest } from '../lib/errors.js'

export async function registerEvents(app) {
  app.get('/api/calendar', {
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
    let events = store.events.get({ userId })
    if (date) events = events.filter(e => sameDayISO(e.start, String(date)))
    return { events }
  })

  app.post('/api/events', {
    schema: {
      body: {
        type: 'object',
        required: ['title','start','end'],
        properties: {
          title: { type: 'string', minLength: 1 },
          start: { type: 'string' },
          end: { type: 'string' },
          taskId: { type: 'string', nullable: true },
          reminders: { type: 'array', items: { type: 'object' } },
          userId: { type: 'string' }
        },
        additionalProperties: false
      }
    }
  }, async (req, reply) => {
    const { title, start, end, taskId, reminders = [], userId = 'demo' } = req.body || {}
    if (!title || !start || !end) return badRequest(reply, 'title/start/end required')
    const event = { id: uid(), userId, title, start, end, taskId: taskId || null, reminders }
    store.events.add(event)
    return { event }
  })

  app.delete('/api/events/:id', {
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
    const all = store.events.get()
    const event = all.find(x => x.id === id)
    if (!event) return notFound(reply, 'event')
    store.events.delete(id)
    return { event }
  })
}
