import { db } from '../config/database'
import { generateMemeContent, generateMemeImage } from './ai/openai'
import { generateMemeContentWithGemini } from './ai/gemini'
import { moderateArray, moderateText } from './moderation'
import pkg from '@prisma/client'
const { Prisma } = pkg
type Provider = typeof Prisma.Provider[keyof typeof Prisma.Provider]

export interface GenerateMemeRequest {
  userId: string
  prompt: string
  humor: string
  imageUrl?: string
  provider?: Provider
  projectId?: string
  slangLevel?: 'none' | 'light' | 'medium'
}

export interface GenerateMemeResponse {
  id: string
  text: string
  imageUrl?: string
  imagePrompt: string
  suggestions: string[]
  projectId: string
}

export class MemeGeneratorService {
  async generateMeme(request: GenerateMemeRequest): Promise<GenerateMemeResponse> {
    const startTime = Date.now()
    
    try {
      // Determine if we can persist: db present and user exists
      let canPersist = false
      if (db && request.userId) {
        const existingUser = await db.user.findUnique({ where: { id: request.userId } })
        canPersist = !!existingUser
      }

      // Create or update project (only if canPersist)
      let project = null as any
      if (canPersist) {
        project = await this.createOrUpdateProject(request)
      } else {
        // Mock project for anonymous or non-existing user
        project = {
          id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ownerId: request.userId || 'anonymous',
          prompt: request.prompt,
          humor: request.humor,
          status: 'GENERATING'
        }
      }
      
      // Generate meme content using selected AI provider (default to GEMINI for witty text)
      const provider = request.provider || Prisma.Provider.GEMINI
      let memeContent
      
      if (provider === Prisma.Provider.GEMINI) {
        memeContent = await generateMemeContentWithGemini({
          prompt: request.prompt,
          humor: request.humor,
          imageUrl: request.imageUrl,
          slangLevel: request.slangLevel,
        })
      } else {
        memeContent = await generateMemeContent({
          prompt: request.prompt,
          humor: request.humor,
          imageUrl: request.imageUrl,
          slangLevel: request.slangLevel,
        })
      }
      
      // Generate image if no image provided
      let imageUrl = request.imageUrl
      if (!imageUrl && provider === Prisma.Provider.OPENAI) {
        imageUrl = await generateMemeImage(memeContent.imagePrompt)
      }
      
      // Soft moderation pass to keep content PG-13
      const moderatedMain = moderateText(memeContent.text)
      const moderatedSuggestions = moderateArray(memeContent.suggestions || [])

      const duration = Date.now() - startTime
      
      // Save generation record (only if we can persist)
      if (canPersist) {
        await db.generation.create({
          data: {
            projectId: project.id,
            provider,
            model: provider === Prisma.Provider.OPENAI ? 'gpt-4o-mini' : 'gemini-1.5-flash',
            input: {
              prompt: request.prompt,
              humor: request.humor,
              imageUrl: request.imageUrl,
            },
            output: {
              text: moderatedMain.text,
              imagePrompt: memeContent.imagePrompt,
              suggestions: moderatedSuggestions.items,
              imageUrl,
              moderation: {
                flagged: moderatedMain.flagged || moderatedSuggestions.anyFlagged,
                reasons: [
                  ...(moderatedMain.flagged ? moderatedMain.reasons : []),
                  ...(moderatedSuggestions.anyFlagged ? moderatedSuggestions.reasons : []),
                ],
              },
            },
            tokens: memeContent.tokens,
            cost: memeContent.cost,
            duration,
            success: true,
          },
        })
        
        // Update project with results
        await db.project.update({
          where: { id: project.id },
          data: {
            resultUrl: imageUrl,
            status: 'COMPLETED',
          },
        })
        
        // Update user stats
        await db.user.update({
          where: { id: request.userId },
          data: {
            totalMemes: { increment: 1 },
            credits: { decrement: 1 },
          },
        })
      }
      
      return {
        id: project.id,
        text: moderatedMain.text,
        imageUrl,
        imagePrompt: memeContent.imagePrompt,
        suggestions: moderatedSuggestions.items,
        projectId: project.id,
      }
      
    } catch (error) {
      console.error('Meme generation error:', error)
      
      // Save failed generation (only if we can persist and have a project id)
      if (db && request.projectId) {
        await db.generation.create({
          data: {
            projectId: request.projectId,
            provider: request.provider || Prisma.Provider.OPENAI,
            model: 'unknown',
            input: { prompt: request.prompt, humor: request.humor },
            output: {},
            tokens: 0,
            cost: 0,
            duration: Date.now() - startTime,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        })
      }
      
      throw error
    }
  }
  
  private async createOrUpdateProject(request: GenerateMemeRequest) {
    if (!db) throw new Error('Database not available')
    
    if (request.projectId) {
      return await db.project.update({
        where: { id: request.projectId },
        data: {
          prompt: request.prompt,
          humor: request.humor as any,
          imageUrl: request.imageUrl,
          status: 'GENERATING',
        },
      })
    }
    
    return await db.project.create({
      data: {
        ownerId: request.userId,
        prompt: request.prompt,
        humor: request.humor as any,
        imageUrl: request.imageUrl,
        status: 'GENERATING',
      },
    })
  }
  
  async getUserProjects(userId: string, limit = 20, offset = 0) {
    if (!db) return []
    
    return await db.project.findMany({
      where: { ownerId: userId },
      include: {
        generations: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            generations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })
  }
  
  async getProjectById(projectId: string, userId: string) {
    if (!db) return null
    
    return await db.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
      include: {
        generations: {
          orderBy: { createdAt: 'desc' },
        },
        renders: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  }
  
  async deleteProject(projectId: string, userId: string) {
    if (!db) throw new Error('Database not available')
    
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
    })
    
    if (!project) {
      throw new Error('Project not found')
    }
    
    await db.project.delete({
      where: { id: projectId },
    })
    
    return { success: true }
  }
}
