import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { type, prompt, humor } = req.body as { type: 'image' | 'video', prompt: string, humor: string }

  if (type === 'image') {
    // Placeholder: call backend API in real setup. For now, return placeholder image.
    const previewUrl = `https://dummyimage.com/1024x576/111827/ffffff&text=${encodeURIComponent(prompt)}+(${encodeURIComponent(humor)})`
    return res.status(200).json({ previewUrl })
  }

  return res.status(400).json({ error: 'Video generation not implemented in web API. Use backend service.' })
}


