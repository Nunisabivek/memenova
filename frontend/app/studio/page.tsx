"use client"
import { useState } from 'react'
import axios from 'axios'
import { AdSlot } from '../../components/AdSlot'

export default function StudioPage() {
  const [prompt, setPrompt] = useState('When the sprint ends but the bugs start')
  const [humor, setHumor] = useState('sarcastic')
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  async function generate() {
    setLoading(true)
    setImageUrl(null)
    try {
      let imageUrl: string | undefined
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
      if (file) {
        const form = new FormData()
        form.append('file', file)
        const upload = await axios.post(baseUrl ? `${baseUrl}/upload` : '/api/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
        imageUrl = upload.data.url
      }
      const { data } = await axios.post(baseUrl ? `${baseUrl}/generate` : '/api/generate', { type: 'image', prompt, humor, imageUrl })
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
          <div>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>
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
            <h2 className="font-medium">Sponsored</h2>
            <AdSlot adFormat="auto" adLayout="in-article" style={{ display: 'block' }} />
          </div>
          <div className="border rounded-md p-3 text-sm text-neutral-600">
            Upgrade to Pro for ad-free, video memes, and auto-publish.
          </div>
        </aside>
      </div>
      <div className="mt-8">
        <AdSlot adFormat="auto" style={{ display: 'block' }} />
      </div>
    </main>
  )
}


