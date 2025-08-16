import { Router } from 'express'
import { db } from '../config/database'

const router = Router()

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    const user = await db.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        totalMemes: user.totalMemes,
        createdAt: user.createdAt
      }
    })
    
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      error: 'Failed to fetch profile'
    })
  }
})

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    const { name, avatar, locale } = req.body
    
    const user = await db.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
        ...(locale && { locale })
      }
    })
    
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        totalMemes: user.totalMemes
      }
    })
    
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      error: 'Failed to update profile'
    })
  }
})

// Get user analytics
router.get('/analytics', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    const { days = 30 } = req.query
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - Number(days))
    
    // Get project stats
    const projectStats: any[] = []
    
    // Get generation costs
    const generationStats = { _sum: { cost: 0, tokens: 0 }, _count: 0 }
    
    // Get daily activity
    const dailyActivity: any[] = []
    
    res.json({
      success: true,
      data: {
        projectStats,
        generationStats: { totalCost: 0, totalTokens: 0, totalGenerations: 0 },
        dailyActivity
      }
    })
    
  } catch (error) {
    console.error('Get analytics error:', error)
    res.status(500).json({
      error: 'Failed to fetch analytics'
    })
  }
})

// Create or get user (for authentication)
router.post('/auth', async (req, res) => {
  try {
    const { email, name, avatar } = req.body
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }
    
    let user = await db.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      user = await db.user.create({
        data: { email, name, avatar }
      })
    } else if (name || avatar) {
      user = await db.user.update({
        where: { id: user.id },
        data: { ...(name && { name }), ...(avatar && { avatar }) }
      })
    }
    
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        totalMemes: user.totalMemes
      }
    })
    
  } catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({
      error: 'Authentication failed'
    })
  }
})

export default router
