import { store } from '../lib/store.js'

export async function registerSchedule(app) {
  app.get('/api/schedule', {
    schema: {
      querystring: {
        type: 'object',
        properties: { userId: { type: 'string' } },
        additionalProperties: false
      }
    }
  }, async (req) => {
    const { userId = 'demo' } = req.query || {}
    const record = store.schedules.find(userId)
    return { schedule: record ? record.data : {} }
  })

  app.post('/api/schedule', {
    schema: {
      body: {
        type: 'object',
        required: ['schedule'],
        properties: {
          userId: { type: 'string' },
          schedule: { type: 'object', additionalProperties: { type: 'string' } }
        },
        additionalProperties: false
      }
    }
  }, async (req) => {
    const { userId = 'demo', schedule } = req.body || {}
    store.schedules.save(userId, schedule)
    return { schedule }
  })
}
