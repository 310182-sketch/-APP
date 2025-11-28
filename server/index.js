import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { registerTasks } from './routes/tasks.js'
import { registerEvents } from './routes/events.js'
import { registerFocus } from './routes/focus.js'
import { registerReminders } from './routes/reminders.js'
import { registerSchedule } from './routes/schedule.js'

const app = Fastify({ logger: true })
await app.register(cors, { origin: true })
await app.register(rateLimit, {
  global: true,
  max: 100,
  timeWindow: '1 minute',
  ban: 2,
})

app.get('/health', async () => ({ ok: true }))
app.get('/', async () => ({ message: 'API Server is running. Use /api/... endpoints.' }))

await registerTasks(app)
await registerEvents(app)
await registerFocus(app)
await registerReminders(app)
await registerSchedule(app)

const port = Number(process.env.PORT || 3000)
// Bind to 0.0.0.0 so the devcontainer can be reached from the host if needed
const host = process.env.HOST || '0.0.0.0'
app.listen({ port, host }).then(() => {
  console.log(`API server running on http://${host}:${port}`)
}).catch(err => {
  app.log.error(err)
  process.exit(1)
})
