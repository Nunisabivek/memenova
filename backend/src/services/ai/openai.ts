import OpenAI from 'openai'
import { env } from '../../config/env'

// Lazily/conditionally initialize the OpenAI client so startup doesn't crash
// when OPENAI_API_KEY is not configured.
const openaiApiKey = process.env.OPENAI_API_KEY || env.OPENAI_API_KEY
export const openai: OpenAI | null = openaiApiKey
  ? new OpenAI({ apiKey: openaiApiKey })
  : null

export interface MemeGenerationRequest {
  prompt: string
  humor: string
  imageUrl?: string
  style?: string
  slangLevel?: 'none' | 'light' | 'medium'
}

export interface MemeGenerationResponse {
  text: string
  imagePrompt: string
  suggestions: string[]
  tokens: number
  cost: number
  topText?: string
  bottomText?: string
}

export async function generateMemeContent(request: MemeGenerationRequest): Promise<MemeGenerationResponse> {
  if (!openai) {
    throw new Error('OpenAI is not configured (missing OPENAI_API_KEY)')
  }
  const systemPrompt = `You are a viral meme creator AI. Your job is to create hilarious, engaging meme content that resonates with internet culture.

Humor Style: ${request.humor}
- sarcastic: Witty, ironic, and clever
- punny: Wordplay and clever puns
- wholesome: Feel-good, positive vibes
- savage: Bold, edgy, and provocative
- relatable: Everyday struggles and situations

Tone & Slang:
- Use ${request.slangLevel || 'light'} internet slang. Keep it witty and current without being vulgar.
- Avoid slurs, hate speech, sexual content, extreme profanity, targeted harassment, or illegal references.
- Keep it PG-13, playful, and inclusive.

Generate meme content that includes:
1. Main meme text (short, punchy, memorable)
2. Image generation prompt (describe the visual scene)
3. Three alternative suggestions

Keep it appropriate but engaging. Make it shareable and viral-worthy.`

  const userPrompt = `Create a meme about: "${request.prompt}"
${request.imageUrl ? `Base it on this image context: ${request.imageUrl}` : ''}

Return compact JSON with fields: {"text": string, "topText": string, "bottomText": string, "imagePrompt": string, "suggestions": string[3] }
Rules:
- topText and bottomText should be short, punchy, and read like classic meme captions (UPPERCASE OK).
- If the meme works better as a single line, put the leading phrase in topText and the punchline in bottomText.`

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
      topText: parsed.topText,
      bottomText: parsed.bottomText,
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

export async function generateMemeImage(prompt: string, memeText: string): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI is not configured (missing OPENAI_API_KEY)')
  }
  try {
    const fullPrompt = `A high-quality, funny meme image based on the following description: "${prompt}". The image should prominently feature the text "${memeText}" written in a classic, bold, white meme font (like Impact) with a black outline, making it clear and readable. The style should be modern, vibrant, and ready for social media.`
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: fullPrompt,
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
