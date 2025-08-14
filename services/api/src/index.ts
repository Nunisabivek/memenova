import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import pino from 'pino'
import { PrismaClient } from '@prisma/client'
import { Queue } from 'bullmq'
import IORedis from 'ioredis'

const app = express()
const logger = pino({ level: process.env.LOG_LEVEL || 'info' })
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json({ limit: '2mb' }))

const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379')
const renderQueue = new Queue('render-jobs', { connection: redis })

app.get('/health', (_req, res) => res.json({ ok: true }))

app.post('/projects', async (req, res) => {
  const { ownerId, type, prompt, humor } = req.body
  const project = await prisma.project.create({
    data: { ownerId, type, prompt, humor, settings: {} }
  })
  res.json(project)
})

app.post('/generate', async (req, res) => {
  const { projectId, type } = req.body as { projectId: string, type: 'image' | 'video' }
  if (!projectId) return res.status(400).json({ error: 'projectId required' })

  if (type === 'image') {
    const previewUrl = `https://dummyimage.com/1024x576/000/fff&text=${encodeURIComponent('MemeNova')}`
    await prisma.generation.create({
      data: { projectId, provider: 'mock', input: {}, outputs: { previewUrl }, costMs: 42 }
    })
    return res.json({ ok: true, previewUrl })
  }

  if (type === 'video') {
    const job = await renderQueue.add('video-render', { projectId })
    await prisma.render.create({ data: { projectId, size: '1080x1920', status: 'queued', jobId: job.id } })
    return res.json({ ok: true, jobId: job.id })
  }

  return res.status(400).json({ error: 'invalid type' })
})

const port = Number(process.env.PORT || 4000)
app.listen(port, () => logger.info({ port }, 'API listening'))


