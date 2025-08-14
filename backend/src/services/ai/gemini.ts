import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '../../config/env'
import { MemeGenerationRequest, MemeGenerationResponse } from './openai'

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

export async function generateMemeContentWithGemini(request: MemeGenerationRequest): Promise<MemeGenerationResponse> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const systemPrompt = `You are a viral meme creator AI. Your job is to create hilarious, engaging meme content that resonates with internet culture.

Humor Style: ${request.humor}
- sarcastic: Witty, ironic, and clever
- punny: Wordplay and clever puns
- wholesome: Feel-good, positive vibes
- savage: Bold, edgy, and provocative
- relatable: Everyday struggles and situations

Generate meme content that includes:
1. Main meme text (short, punchy, memorable)
2. Image generation prompt (describe the visual scene)
3. Three alternative suggestions

Keep it appropriate but engaging. Make it shareable and viral-worthy.

Return only valid JSON with: text, imagePrompt, suggestions (array of 3 alternatives)`

  const userPrompt = `Create a meme about: "${request.prompt}"
${request.imageUrl ? `Base it on this image context: ${request.imageUrl}` : ''}`

  try {
    const result = await model.generateContent([
      systemPrompt,
      userPrompt
    ])

    const response = await result.response
    const text = response.text()
    
    // Clean up the response to ensure it's valid JSON
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim()
    const parsed = JSON.parse(cleanedText)

    // Estimate tokens and cost (Gemini pricing is different)
    const tokens = Math.ceil(text.length / 4) // Rough estimate
    const cost = (tokens / 1000) * 0.001 // Approximate cost for Gemini

    return {
      text: parsed.text,
      imagePrompt: parsed.imagePrompt,
      suggestions: parsed.suggestions || [],
      tokens,
      cost,
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to generate meme content with Gemini')
  }
}

export async function analyzeImageWithGemini(imageUrl: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  try {
    // Convert image URL to base64 or use direct URL
    const result = await model.generateContent([
      'Analyze this image and describe what you see in detail. Focus on elements that could be used for meme creation - expressions, situations, objects, etc.',
      {
        inlineData: {
          data: imageUrl, // This would need proper base64 conversion in real implementation
          mimeType: 'image/jpeg'
        }
      }
    ])

    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini image analysis error:', error)
    throw new Error('Failed to analyze image with Gemini')
  }
}
