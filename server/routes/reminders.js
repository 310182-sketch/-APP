import { uid, store } from '../lib/store.js'
import { notFound, badRequest } from '../lib/errors.js'

export async function registerReminders(app) {
  app.get('/api/reminders', async () => {
    return { reminders: store.reminders.get() }
  })
  app.post('/api/reminders', {
    schema: {
      body: {
        type: 'object',
        required: ['eventId'],
        properties: {
          eventId: { type: 'string' },
          minutesBefore: { type: 'number' },
          channel: { type: 'string', enum: ['webpush','email','sms'] }
        },
        additionalProperties: false
      }
    }
  }, async (req, reply) => {
    const { eventId, minutesBefore = 10, channel = 'webpush' } = req.body || {}
    if (!eventId) return badRequest(reply, 'eventId required')
    const r = { id: uid(), eventId, minutesBefore, channel, createdAt: new Date().toISOString(), status: 'scheduled' }
    store.reminders.add(r)
    return { reminder: r }
  })
  app.post('/api/reminders/:id/mark-sent', {
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
    const r = store.reminders.findById(id)
    if (!r) return notFound(reply, 'reminder')
    
    const sentAt = new Date().toISOString()
    store.reminders.update(id, { status: 'sent', sentAt })
    
    return { reminder: { ...r, status: 'sent', sentAt } }
  })
}
