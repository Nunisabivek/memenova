import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import pino from 'pino'
import { Queue } from 'bullmq'
import IORedis from 'ioredis'
import multer from 'multer'
import { promises as fs } from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { db } from './config/database'
import { MemeGeneratorService } from './services/meme-generator'
import { generateMemeContent, generateMemeImage } from './services/ai/openai'
import { fetchTopTemplates, composeTemplateMeme, composeMemeOnImage } from './services/meme-template'
import { generateMemeContentWithGemini } from './services/ai/gemini'
import usersRouter from './routes/users'
import memesRouter from './routes/memes'
import newsRouter from './routes/news'

const app = express()
const logger = pino({ level: process.env.LOG_LEVEL || 'info' })

app.use(cors())
app.use(express.json({ limit: '2mb' }))
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })
// Serve local uploads if Supabase isn't configured
app.use('/uploads', express.static('uploads'))

// Very simple auth shim: accept x-user-id header for demo purposes
app.use((req: any, _res, next) => {
  const headerUserId = req.header('x-user-id')
  if (headerUserId) {
    req.user = { id: headerUserId }
  }
  next()
})

// Mount API routers (require x-user-id if you want persistence)
app.use('/api/users', usersRouter)
app.use('/api/memes', memesRouter)
app.use('/api/news', newsRouter)

const redisUrl = process.env.REDIS_URL
const renderQueue = redisUrl ? new Queue('render-jobs', { connection: new IORedis(redisUrl) }) : null

app.get('/health', (_req, res) => res.json({ 
  ok: true, 
  timestamp: new Date().toISOString(),
  database: db ? 'connected' : 'not configured',
  services: {
    openai: !!process.env.OPENAI_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE),
    redis: !!process.env.REDIS_URL
  }
}))

// Live metrics for homepage
app.get('/api/metrics', async (_req, res) => {
  try {
    if (!db) {
      return res.json({
        totals: { users: 0, projects: 0, memes: 0 },
        last24h: { memes: 0, projects: 0 },
        last7d: { memes: 0, projects: 0 },
      })
    }

    const [users, projects, memes, memes24h, projects24h, memes7d, projects7d] = await Promise.all([
      db.user.count(),
      db.project.count(),
      db.generation.count(),
      db.generation.count({ where: { createdAt: { gte: new Date(Date.now() - 24*60*60*1000) } } }),
      db.project.count({ where: { createdAt: { gte: new Date(Date.now() - 24*60*60*1000) } } }),
      db.generation.count({ where: { createdAt: { gte: new Date(Date.now() - 7*24*60*60*1000) } } }),
      db.project.count({ where: { createdAt: { gte: new Date(Date.now() - 7*24*60*60*1000) } } }),
    ])

    return res.json({
      totals: { users, projects, memes },
      last24h: { memes: memes24h, projects: projects24h },
      last7d: { memes: memes7d, projects: projects7d },
    })
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'metrics failed' })
  }
})

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
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const ext = (req.file.originalname.split('.').pop() || 'bin').toLowerCase()
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    if (supabase) {
      const { error } = await supabase
        .storage
        .from(SUPABASE_BUCKET)
        .upload(key, req.file.buffer, { contentType: req.file.mimetype, upsert: false })

      if (error) return res.status(500).json({ error: error.message })

      const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(key)
      return res.json({ key, url: data.publicUrl })
    }

    // Local fallback: save to ./uploads and serve via /uploads
    const uploadsDir = path.join(process.cwd(), 'uploads')
    try { await fs.mkdir(uploadsDir, { recursive: true }) } catch {}
    const filePath = path.join(uploadsDir, path.basename(key))
    await fs.writeFile(filePath, req.file.buffer)
    const baseUrl = `${req.protocol}://${req.get('host')}`
    const url = `${baseUrl}/uploads/${path.basename(key)}`
    return res.json({ key, url })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
})

app.post('/projects', async (req, res) => {
  if (!db) {
    return res.status(501).json({ error: 'Database not configured' })
  }
  
  const { ownerId, type, prompt, humor } = req.body
  const project = await db.project.create({
    data: { ownerId, type, prompt, humor, settings: {} }
  })
  res.json(project)
})

// Initialize meme generator service
const memeService = new MemeGeneratorService()

app.post('/generate', async (req, res) => {
  try {
    let { projectId, type, prompt, humor, imageUrl, provider = 'GEMINI', slangLevel = 'light', userId, ownerId, style = 'AI_IMAGE', topText, bottomText, templateUrl } = req.body
    // Prefer explicit userId, fallback to ownerId, else anonymous
    userId = userId || ownerId || 'anonymous'
    
    if (!prompt || !humor) {
      return res.status(400).json({ error: 'Prompt and humor are required' })
    }

    if (type === 'image') {
      try {
        let memeContent: any = null
        let finalImageUrl: string | undefined = imageUrl
        let renderedBuffer: Buffer | null = null

        if (style === 'TEMPLATE') {
          const templates = await fetchTopTemplates(100)
          if (!topText || !bottomText) {
            if (provider === 'GEMINI' && process.env.GEMINI_API_KEY) {
              memeContent = await generateMemeContentWithGemini({ prompt, humor, imageUrl, slangLevel })
            } else if (process.env.OPENAI_API_KEY) {
              memeContent = await generateMemeContent({ prompt, humor, imageUrl, slangLevel })
            }
            const text = (memeContent?.text || prompt || '').trim()
            const midpoint = Math.floor(text.length / 2)
            topText = topText || text.slice(0, midpoint)
            bottomText = bottomText || text.slice(midpoint)
          }
          const selected = templateUrl || templates[0]?.Url
          if (!selected) return res.status(500).json({ error: 'No template available' })
          renderedBuffer = await composeTemplateMeme({ templateUrl: selected, topText, bottomText })
        } else {
          if (provider === 'GEMINI' && process.env.GEMINI_API_KEY) {
            memeContent = await generateMemeContentWithGemini({ prompt, humor, imageUrl, slangLevel })
          } else if (process.env.OPENAI_API_KEY) {
            memeContent = await generateMemeContent({ prompt, humor, imageUrl, slangLevel })
          } else {
            const previewUrl = imageUrl || `https://dummyimage.com/1024x576/111827/ffffff&text=${encodeURIComponent((prompt || 'MemeNova') + ' (' + (humor || 'sarcastic') + ')')}`
            await sleep(randomDelayMs())
            return res.json({ ok: true, previewUrl })
          }
          // If user uploaded an image, compose meme text onto it
          if (finalImageUrl) {
            try {
              renderedBuffer = await composeMemeOnImage({ imageUrl: finalImageUrl, text: memeContent?.text })
            } catch (e) {
              logger.warn({ err: e }, 'composeMemeOnImage failed, falling back to URL')
            }
          }

          if (!finalImageUrl && process.env.OPENAI_API_KEY) {
            try {
              finalImageUrl = await generateMemeImage(memeContent.imagePrompt, memeContent.text)
            } catch (error) {
              logger.warn('Image generation with DALL-E failed, using placeholder', error)
              finalImageUrl = `https://dummyimage.com/1024x576/111827/ffffff&text=${encodeURIComponent(memeContent.text)}`
            }
          } else if (!finalImageUrl) {
            finalImageUrl = `https://dummyimage.com/1024x576/111827/ffffff&text=${encodeURIComponent(memeContent.text)}`
          }
        }
        
        // Auto-create project for signed-in users if not provided
        if (!projectId && db && userId && userId !== 'anonymous') {
          const project = await db.project.create({
            data: { ownerId: userId, type: 'IMAGE' as any, prompt, humor, settings: {}, status: 'GENERATING' as any }
          })
          projectId = project.id
        }

        // Save generation record
        if (projectId && db) {
          await db.generation.create({
            data: {
              projectId,
              provider: provider.toLowerCase() as any,
              model: provider === 'OPENAI' ? 'gpt-4o-mini' : 'gemini-1.5-flash',
              input: { prompt, humor, imageUrl, style, topText, bottomText, templateUrl },
              output: {
                text: memeContent?.text,
                imagePrompt: memeContent?.imagePrompt,
                suggestions: memeContent?.suggestions,
                imageUrl: renderedBuffer ? undefined : finalImageUrl
              },
              tokens: memeContent?.tokens || 0,
              cost: memeContent?.cost || 0,
              duration: Date.now() - Date.now(), // Will be updated with actual duration
              success: true
            }
          })

          // Update project with results
          await db.project.update({
            where: { id: projectId },
            data: { resultUrl: renderedBuffer ? '' : (finalImageUrl || ''), status: 'COMPLETED' as any }
          })
        }
        
        await sleep(randomDelayMs())
        if (renderedBuffer) {
          try {
            // Persist composed image and return a URL so frontend can render it easily
            const composedKey = `generated/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
            if (supabase) {
              const { error } = await supabase
                .storage
                .from(SUPABASE_BUCKET)
                .upload(composedKey, renderedBuffer, { contentType: 'image/jpeg', upsert: false })
              if (!error) {
                const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(composedKey)
                return res.json({ ok: true, previewUrl: data.publicUrl, text: memeContent?.text, suggestions: memeContent?.suggestions })
              }
            }
            // Local fallback
            const uploadsDir = path.join(process.cwd(), 'uploads')
            try { await fs.mkdir(uploadsDir, { recursive: true }) } catch {}
            const filePath = path.join(uploadsDir, path.basename(composedKey))
            await fs.writeFile(filePath, renderedBuffer)
            const baseUrl = `${req.protocol}://${req.get('host')}`
            const url = `${baseUrl}/uploads/${path.basename(composedKey)}`
            return res.json({ ok: true, previewUrl: url, text: memeContent?.text, suggestions: memeContent?.suggestions })
          } catch (persistErr) {
            logger.warn({ err: persistErr }, 'Failed to persist composed image, streaming as fallback')
            res.setHeader('Content-Type', 'image/jpeg')
            return res.end(renderedBuffer)
          }
        }
        return res.json({ ok: true, previewUrl: finalImageUrl, text: memeContent?.text, suggestions: memeContent?.suggestions })
        
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
      
      if (db) {
        await db.render.create({ 
          data: { 
            projectId, 
            size: '1080x1920', 
            status: 'QUEUED' as any, 
            jobId: job.id?.toString() || '' 
          } 
        })
      }
      
      return res.json({ ok: true, jobId: job.id })
    }

    return res.status(400).json({ error: 'invalid type' })
  } catch (error) {
    logger.error('Generate endpoint error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

const port = Number(process.env.PORT || 3000)
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'

app.listen(port, host, () => {
  logger.info({ port, host, env: process.env.NODE_ENV }, 'API listening')
  console.log(`🚀 Server running on http://${host}:${port}`)
  console.log(`📊 Health check: http://${host}:${port}/health`)
})

