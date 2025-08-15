import { Router } from 'express'
import { generateMemeContent, generateMemeImage } from '../services/ai/openai'
import { generateMemeContentWithGemini } from '../services/ai/gemini'

const router = Router()

// POST /api/news/generate
// Body: { headline: string, context?: string, imageUrl?: string, provider?: 'GEMINI' | 'OPENAI', slangLevel?: 'none' | 'light' | 'medium' }
router.post('/generate', async (req, res) => {
	try {
		const { headline, context, imageUrl, provider = 'GEMINI', slangLevel = 'light' } = req.body || {}
		if (!headline) {
			return res.status(400).json({ error: 'headline is required' })
		}

		const prompt = `Trending news: ${headline}${context ? `. Context: ${context}` : ''}. Create a timely meme that audiences will share.`
		const humor = 'sarcastic'

		let memeContent
		if (provider === 'GEMINI' && process.env.GEMINI_API_KEY) {
			memeContent = await generateMemeContentWithGemini({ prompt, humor, imageUrl, slangLevel })
		} else if (process.env.OPENAI_API_KEY) {
			memeContent = await generateMemeContent({ prompt, humor, imageUrl, slangLevel })
		} else {
			const previewUrl = imageUrl || `https://dummyimage.com/1024x576/111827/ffffff&text=${encodeURIComponent(headline)}`
			return res.json({ ok: true, previewUrl, text: `Hot take: ${headline}` })
		}

		let finalImageUrl = imageUrl
		if (!finalImageUrl && process.env.OPENAI_API_KEY && provider === 'OPENAI') {
			try {
				finalImageUrl = await generateMemeImage(memeContent.imagePrompt)
			} catch {
				finalImageUrl = `https://dummyimage.com/1024x576/111827/ffffff&text=${encodeURIComponent(memeContent.text)}`
			}
		} else if (!finalImageUrl) {
			finalImageUrl = `https://dummyimage.com/1024x576/111827/ffffff&text=${encodeURIComponent(memeContent.text)}`
		}

		return res.json({ ok: true, previewUrl: finalImageUrl, text: memeContent.text, suggestions: memeContent.suggestions })
	} catch (e: any) {
		return res.status(500).json({ error: e.message || 'Failed to generate news meme' })
	}
})

export default router
