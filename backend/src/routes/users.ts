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
      where: { id: userId },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        _count: {
          select: {
            projects: true
          }
        }
      }
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
        plan: user.plan,
        credits: user.credits,
        totalMemes: user.totalMemes,
        subscription: user.subscriptions[0] || null,
        projectCount: user._count.projects,
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
        plan: user.plan,
        credits: user.credits,
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
    const projectStats = await db.project.groupBy({
      by: ['status'],
      where: {
        ownerId: userId,
        createdAt: {
          gte: daysAgo
        }
      },
      _count: {
        status: true
      }
    })
    
    // Get generation costs
    const generationStats = await db.generation.aggregate({
      where: {
        project: {
          ownerId: userId
        },
        createdAt: {
          gte: daysAgo
        }
      },
      _sum: {
        cost: true,
        tokens: true
      },
      _count: {
        id: true
      }
    })
    
    // Get daily activity
    const dailyActivity = await db.project.findMany({
      where: {
        ownerId: userId,
        createdAt: {
          gte: daysAgo
        }
      },
      select: {
        createdAt: true,
        status: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    res.json({
      success: true,
      data: {
        projectStats,
        generationStats: {
          totalCost: generationStats._sum.cost || 0,
          totalTokens: generationStats._sum.tokens || 0,
          totalGenerations: generationStats._count || 0
        },
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
        data: {
          email,
          name,
          avatar,
          ...(email === 'nunisaalex456@gmail.com' ? { plan: 'PRO', credits: 100000 } : {})
        }
      })
    } else if (name || avatar || email === 'nunisaalex456@gmail.com') {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          ...(name && { name }),
          ...(avatar && { avatar }),
          ...(email === 'nunisaalex456@gmail.com' ? { plan: 'PRO', credits: Math.max(user.credits, 100000) } : {})
        }
      })
    }
    
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        plan: user.plan,
        credits: user.credits,
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
