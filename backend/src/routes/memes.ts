import { Router } from 'express'
import { MemeGeneratorService } from '../services/meme-generator'
import { db } from '../config/database'
import { Provider } from '@prisma/client'

const router = Router()
const memeService = new MemeGeneratorService()

// Generate a new meme
router.post('/generate', async (req, res) => {
  try {
    const { prompt, humor, imageUrl, provider = 'OPENAI' } = req.body
    const userId = req.user?.id || 'anonymous' // You'll need to implement auth middleware
    
    if (!prompt || !humor) {
      return res.status(400).json({
        error: 'Prompt and humor style are required'
      })
    }
    
    // Check user credits (if authenticated)
    if (userId !== 'anonymous') {
      const user = await db.user.findUnique({
        where: { id: userId }
      })
      
      if (!user || user.credits <= 0) {
        return res.status(403).json({
          error: 'Insufficient credits'
        })
      }
    }
    
    const result = await memeService.generateMeme({
      userId,
      prompt,
      humor,
      imageUrl,
      provider: provider as Provider,
    })
    
    res.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('Generate meme error:', error)
    res.status(500).json({
      error: 'Failed to generate meme',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get user's memes
router.get('/my-memes', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    const { limit = 20, offset = 0 } = req.query
    
    const projects = await memeService.getUserProjects(
      userId,
      Number(limit),
      Number(offset)
    )
    
    res.json({
      success: true,
      data: projects
    })
    
  } catch (error) {
    console.error('Get user memes error:', error)
    res.status(500).json({
      error: 'Failed to fetch memes'
    })
  }
})

// Get specific meme
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    const project = await memeService.getProjectById(id, userId)
    
    if (!project) {
      return res.status(404).json({ error: 'Meme not found' })
    }
    
    res.json({
      success: true,
      data: project
    })
    
  } catch (error) {
    console.error('Get meme error:', error)
    res.status(500).json({
      error: 'Failed to fetch meme'
    })
  }
})

// Delete meme
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    await memeService.deleteProject(id, userId)
    
    res.json({
      success: true,
      message: 'Meme deleted successfully'
    })
    
  } catch (error) {
    console.error('Delete meme error:', error)
    res.status(500).json({
      error: 'Failed to delete meme'
    })
  }
})

// Get meme templates
router.get('/templates', async (req, res) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query
    
    const templates = await db.template.findMany({
      where: {
        isPublic: true,
        ...(category && { category: category as string })
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        uses: 'desc'
      },
      take: Number(limit),
      skip: Number(offset)
    })
    
    res.json({
      success: true,
      data: templates
    })
    
  } catch (error) {
    console.error('Get templates error:', error)
    res.status(500).json({
      error: 'Failed to fetch templates'
    })
  }
})

export default router
