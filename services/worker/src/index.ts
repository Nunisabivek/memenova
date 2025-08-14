import 'dotenv/config'
import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import pino from 'pino'

const logger = pino({ level: process.env.LOG_LEVEL || 'info' })
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379')

const renderWorker = new Worker(
  'render-jobs',
  async job => {
    logger.info({ jobId: job.id, name: job.name }, 'Starting render job')
    // Placeholder: video assembly, effects, uploads
    await new Promise(r => setTimeout(r, 2000))
    logger.info({ jobId: job.id }, 'Completed render job')
    return { ok: true }
  },
  { connection }
)

renderWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Job failed')
})

logger.info('Worker listening')


