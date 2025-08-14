import OpenAI from 'openai'
import { env } from '../../config/env'

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

export interface MemeGenerationRequest {
  prompt: string
  humor: string
  imageUrl?: string
  style?: string
}

export interface MemeGenerationResponse {
  text: string
  imagePrompt: string
  suggestions: string[]
  tokens: number
  cost: number
}

export async function generateMemeContent(request: MemeGenerationRequest): Promise<MemeGenerationResponse> {
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

Keep it appropriate but engaging. Make it shareable and viral-worthy.`

  const userPrompt = `Create a meme about: "${request.prompt}"
${request.imageUrl ? `Base it on this image context: ${request.imageUrl}` : ''}

Return JSON with: text, imagePrompt, suggestions (array of 3 alternatives)`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
      temperature: 0.8,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    const parsed = JSON.parse(response)
    const tokens = completion.usage?.total_tokens || 0
    const cost = (tokens / 1000) * 0.002 // Approximate cost for GPT-4o-mini

    return {
      text: parsed.text,
      imagePrompt: parsed.imagePrompt,
      suggestions: parsed.suggestions || [],
      tokens,
      cost,
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate meme content')
  }
}

export async function generateMemeImage(prompt: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `Create a meme-style image: ${prompt}. Make it visually engaging, clear, and suitable for adding text overlay. Style: modern internet meme aesthetic.`,
      size: '1024x1024',
      quality: 'standard',
      n: 1,
    })

    return response.data[0]?.url || ''
  } catch (error) {
    console.error('DALL-E API error:', error)
    throw new Error('Failed to generate meme image')
  }
}
