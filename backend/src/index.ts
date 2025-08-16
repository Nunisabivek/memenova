import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import pino from 'pino'
import multer from 'multer'
import { promises as fs } from 'fs'
import path from 'path'
import { generateMemeContent, generateMemeImage } from './services/ai/openai'
import { composeMemeOnImage, composeTemplateMeme, fetchTopTemplates } from './services/meme-template'

const app = express()
const logger = pino({ level: process.env.LOG_LEVEL || 'info' })

app.use(cors())
app.use(express.json({ limit: '2mb' }))
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })
// Serve local uploads
app.use('/uploads', express.static('uploads'))

// Very simple auth shim: accept x-user-id header for demo purposes
app.use((req: any, _res, next) => {
  const headerUserId = req.header('x-user-id')
  if (headerUserId) {
    req.user = { id: headerUserId }
  }
  next()
})

// No extra routers to keep the server minimal and stable

app.get('/health', (_req, res) => res.json({
  ok: true,
  timestamp: new Date().toISOString(),
  services: { openai: !!process.env.OPENAI_API_KEY }
}))

// No metrics endpoint (DB removed)

// Optional small delay helpers
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const randomDelayMs = () => 0

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const ext = (req.file.originalname.split('.').pop() || 'bin').toLowerCase()
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // Save to ./uploads and serve via /uploads
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

app.post('/generate', async (req, res) => {
  try {
    const { prompt, humor = 'sarcastic', imageUrl } = req.body
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' })

    if (!process.env.OPENAI_API_KEY) {
      const previewUrl = imageUrl || `https://dummyimage.com/1024x576/111827/ffffff&text=${encodeURIComponent(prompt)}`
      return res.json({ ok: true, previewUrl, text: prompt })
    }

    try {
      const memeContent = await generateMemeContent({ prompt, humor, imageUrl })
      // If an image was uploaded, overlay top/bottom meme text
      if (imageUrl) {
        const buffer = await composeMemeOnImage({
          imageUrl,
          text: memeContent?.text || prompt,
          topText: memeContent?.topText,
          bottomText: memeContent?.bottomText,
        })
        const key = `generated/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
        const uploadsDir = path.join(process.cwd(), 'uploads')
        try { await fs.mkdir(uploadsDir, { recursive: true }) } catch {}
        const filePath = path.join(uploadsDir, path.basename(key))
        await fs.writeFile(filePath, buffer)
        const baseUrl = `${req.protocol}://${req.get('host')}`
        const url = `${baseUrl}/uploads/${path.basename(key)}`
        return res.json({ ok: true, previewUrl: url, text: memeContent?.text, suggestions: memeContent?.suggestions })
      }

      // No image uploaded → prefer classic template meme with caption overlay
      try {
        const templates = await fetchTopTemplates(100)
        const chosen = templates[Math.floor(Math.random() * Math.max(1, templates.length))]
        if (chosen?.Url) {
          const buffer = await composeTemplateMeme({
            templateUrl: chosen.Url,
            topText: memeContent?.topText || memeContent?.text || prompt,
            bottomText: memeContent?.bottomText || '',
          })
          const key = `generated/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
          const uploadsDir = path.join(process.cwd(), 'uploads')
          try { await fs.mkdir(uploadsDir, { recursive: true }) } catch {}
          const filePath = path.join(uploadsDir, path.basename(key))
          await fs.writeFile(filePath, buffer)
          const baseUrl = `${req.protocol}://${req.get('host')}`
          const url = `${baseUrl}/uploads/${path.basename(key)}`
          return res.json({ ok: true, previewUrl: url, text: memeContent?.text, suggestions: memeContent?.suggestions })
        }
      } catch {}

      // Fallback: ask DALL·E to render the caption on image (may look illustrative)
      let finalImageUrl = ''
      try {
        finalImageUrl = await generateMemeImage(memeContent.imagePrompt, memeContent.text)
      } catch (e) {
        finalImageUrl = `https://dummyimage.com/1024x576/111827/ffffff&text=${encodeURIComponent(memeContent.text)}`
      }
      return res.json({ ok: true, previewUrl: finalImageUrl, text: memeContent?.text, suggestions: memeContent?.suggestions })
    } catch (aiErr: any) {
      const previewUrl = imageUrl || `https://dummyimage.com/1024x576/111827/ffffff&text=${encodeURIComponent(prompt)}`
      return res.json({ ok: true, previewUrl, fallback: true, error: aiErr?.message })
    }
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

