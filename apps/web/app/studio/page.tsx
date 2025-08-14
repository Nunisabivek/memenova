"use client"
import { useState } from 'react'
import axios from 'axios'

export default function StudioPage() {
  const [prompt, setPrompt] = useState('When the sprint ends but the bugs start')
  const [humor, setHumor] = useState('sarcastic')
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  async function generate() {
    setLoading(true)
    setImageUrl(null)
    try {
      const { data } = await axios.post('/api/generate', { type: 'image', prompt, humor })
      setImageUrl(data.previewUrl)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Studio</h1>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-28 p-3 border rounded-md" />
          <div className="flex gap-3 items-center">
            <label>Humor</label>
            <select value={humor} onChange={e => setHumor(e.target.value)} className="border rounded-md px-2 py-1">
              <option value="sarcastic">Sarcastic</option>
              <option value="punny">Punny</option>
              <option value="wholesome">Wholesome</option>
            </select>
            <button className="btn" onClick={generate} disabled={loading}>{loading ? 'Generating...' : 'Generate'}</button>
          </div>
          {imageUrl && (
            <div className="mt-4">
              <img src={imageUrl} alt="preview" className="border rounded-md max-w-full" />
            </div>
          )}
        </div>
        <aside className="space-y-4">
          <div className="border rounded-md p-3">
            <h2 className="font-medium">Free tier ads</h2>
            <div id="ads-container" className="h-48 bg-neutral-100 rounded-md flex items-center justify-center text-neutral-500">
              AdSense banner placeholder
            </div>
          </div>
          <div className="border rounded-md p-3 text-sm text-neutral-600">
            Upgrade to Pro for ad-free, video memes, and auto-publish.
          </div>
        </aside>
      </div>
    </main>
  )
}


