import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import pino from 'pino'
import { PrismaClient } from '@prisma/client'
import { Queue } from 'bullmq'
import IORedis from 'ioredis'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'
import { MemeGeneratorService } from './services/meme-generator'
import { generateMemeContent, generateMemeImage } from './services/ai/openai'
import { generateMemeContentWithGemini } from './services/ai/gemini'

const app = express()
const logger = pino({ level: process.env.LOG_LEVEL || 'info' })
const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        'postgresql://memenova:memenova@localhost:5432/memenova'
    }
  }
})

app.use(cors())
app.use(express.json({ limit: '2mb' }))
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

const redisUrl = process.env.REDIS_URL
const renderQueue = redisUrl ? new Queue('render-jobs', { connection: new IORedis(redisUrl) }) : null

app.get('/health', (_req, res) => res.json({ ok: true }))

// Artificial delay helpers for free image generation (to show ads and throttle)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const randomDelayMs = () => 5000 + Math.floor(Math.random() * 5000) // 5–10s

// Supabase client (service role) for server-side uploads
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'assets'
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
  : null

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' })
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const ext = (req.file.originalname.split('.').pop() || 'bin').toLowerCase()
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase
      .storage
      .from(SUPABASE_BUCKET)
      .upload(key, req.file.buffer, { contentType: req.file.mimetype, upsert: false })

    if (error) return res.status(500).json({ error: error.message })

    // If bucket public, we can form public URL
    const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(key)
    return res.json({ key, url: data.publicUrl })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
})

app.post('/projects', async (req, res) => {
  const { ownerId, type, prompt, humor } = req.body
  const project = await prisma.project.create({
    data: { ownerId, type, prompt, humor, settings: {} }
  })
  res.json(project)
})

// Initialize meme generator service
const memeService = new MemeGeneratorService()

app.post('/generate', async (req, res) => {
  try {
    const { projectId, type, prompt, humor, imageUrl, provider = 'OPENAI' } = req.body
    const userId = 'anonymous' // In production, get from JWT token
    
    if (!prompt || !humor) {
      return res.status(400).json({ error: 'Prompt and humor are required' })
    }

    if (type === 'image') {
      try {
        // Use our enhanced AI generation
        let memeContent
        if (provider === 'GEMINI' && process.env.GEMINI_API_KEY) {
          memeContent = await generateMemeContentWithGemini({
            prompt,
            humor,
            imageUrl,
          })
        } else if (process.env.OPENAI_API_KEY) {
          memeContent = await generateMemeContent({
            prompt,
            humor,
            imageUrl,
          })
        } else {
          // Fallback to placeholder
          const previewUrl = imageUrl || `https://dummyimage.com/1024x576/111827/ffffff&text=${encodeURIComponent((prompt || 'MemeNova') + ' (' + (humor || 'sarcastic') + ')')}`
          if (projectId) {
            await prisma.generation.create({ 
              data: { 
                projectId, 
                provider: 'mock', 
                input: { prompt, humor }, 
                outputs: { previewUrl }, 
                costMs: 42 
              } 
            })
          }
          await sleep(randomDelayMs())
          return res.json({ ok: true, previewUrl })
        }
        
        // Generate image if OpenAI is available and no image provided
        let finalImageUrl = imageUrl
        if (!finalImageUrl && process.env.OPENAI_API_KEY && provider === 'OPENAI') {
          try {
            finalImageUrl = await generateMemeImage(memeContent.imagePrompt)
          } catch (error) {
            logger.warn('Image generation failed, using placeholder', error)
            finalImageUrl = `https://dummyimage.com/1024x576/111827/ffffff&text=${encodeURIComponent(memeContent.text)}`
          }
        } else if (!finalImageUrl) {
          finalImageUrl = `https://dummyimage.com/1024x576/111827/ffffff&text=${encodeURIComponent(memeContent.text)}`
        }
        
        // Save generation record
        if (projectId) {
          await prisma.generation.create({
            data: {
              projectId,
              provider: provider.toLowerCase(),
              input: { prompt, humor, imageUrl },
              outputs: {
                text: memeContent.text,
                imagePrompt: memeContent.imagePrompt,
                suggestions: memeContent.suggestions,
                imageUrl: finalImageUrl
              },
              costMs: Math.round(memeContent.cost * 1000) // Convert to milliseconds for legacy compatibility
            }
          })
        }
        
        await sleep(randomDelayMs())
        return res.json({ 
          ok: true, 
          previewUrl: finalImageUrl,
          text: memeContent.text,
          suggestions: memeContent.suggestions
        })
        
      } catch (aiError) {
        logger.error('AI generation failed:', aiError)
        // Fallback to placeholder
        const previewUrl = imageUrl || `https://dummyimage.com/1024x576/111827/ffffff&text=${encodeURIComponent((prompt || 'MemeNova') + ' (' + (humor || 'sarcastic') + ')')}`
        await sleep(randomDelayMs())
        return res.json({ ok: true, previewUrl, fallback: true })
      }
    }

    if (type === 'video') {
      if (!projectId) return res.status(400).json({ error: 'projectId required for video' })
      if (!renderQueue) return res.status(501).json({ error: 'Video rendering not configured (missing REDIS_URL)' })
      const job = await renderQueue.add('video-render', { projectId })
      await prisma.render.create({ data: { projectId, size: '1080x1920', status: 'queued', jobId: job.id } })
      return res.json({ ok: true, jobId: job.id })
    }

    return res.status(400).json({ error: 'invalid type' })
  } catch (error) {
    logger.error('Generate endpoint error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

const port = Number(process.env.PORT || 4000)
app.listen(port, () => logger.info({ port }, 'API listening'))

