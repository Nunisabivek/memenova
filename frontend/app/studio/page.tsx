"use client"
import { useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wand2, 
  Upload, 
  Download, 
  Share2, 
  Image as ImageIcon, 
  Sparkles, 
  Zap,
  Crown,
  RefreshCw,
  Copy,
  Heart
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Textarea, Input } from '../../components/ui/Input'
import { AdSlot } from '../../components/AdSlot'
import { CoolLoadingIndicator } from '../../components/ui/CoolLoadingIndicator'

export default function StudioPage() {
  const [prompt, setPrompt] = useState('When the sprint ends but the bugs start')
  const [humor, setHumor] = useState('sarcastic')
  const [loading, setLoading] = useState(false)
  const [showAdOverlay, setShowAdOverlay] = useState(false)
  const [type, setType] = useState<'image' | 'video'>('image')
  const [videoCount, setVideoCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    return Number(localStorage.getItem('freeVideoCount') || '0')
  })
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const humorStyles = [
    { value: 'sarcastic', label: 'Sarcastic', emoji: '😏', description: 'Witty and ironic' },
    { value: 'punny', label: 'Punny', emoji: '😄', description: 'Clever wordplay' },
    { value: 'wholesome', label: 'Wholesome', emoji: '🥰', description: 'Feel-good vibes' },
    { value: 'savage', label: 'Savage', emoji: '🔥', description: 'Bold and edgy' },
    { value: 'relatable', label: 'Relatable', emoji: '😅', description: 'Everyday struggles' },
  ]

  async function generate() {
    setLoading(true)
    setShowAdOverlay(true)
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
      if (type === 'video') {
        // Gate: allow only 3 free videos without account, at 720p quality notice
        if (videoCount >= 3) {
          alert('Free limit reached: Create an account to continue creating video memes or upgrade for HD quality.')
          return
        }
        // Simulate a low-res 720p result preview info
        const { data } = await axios.post(baseUrl ? `${baseUrl}/generate` : '/api/generate', { type: 'image', prompt: `${prompt} (video 720p preview frame)`, humor, imageUrl })
        setImageUrl(data.previewUrl)
        const next = videoCount + 1
        setVideoCount(next)
        if (typeof window !== 'undefined') localStorage.setItem('freeVideoCount', String(next))
      } else {
      const { data } = await axios.post(baseUrl ? `${baseUrl}/generate` : '/api/generate', { type: 'image', prompt, humor, imageUrl })
      setImageUrl(data.previewUrl)
      }
    } finally {
      setLoading(false)
      // keep overlay visible a bit longer for ad viewability if needed
      setTimeout(() => setShowAdOverlay(false), 600)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files[0] && files[0].type.startsWith('image/')) {
      setFile(files[0])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/50 via-white to-accent-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            AI Meme Studio
          </h1>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
            Transform your ideas into viral memes with our AI-powered creation tools
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Creation Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Type Selector */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      onClick={() => setType('image')}
                      className={`px-3 py-1.5 rounded-md border ${type==='image' ? 'bg-primary-600 text-white border-primary-600' : 'border-secondary-300 text-secondary-700 hover:bg-secondary-50'}`}
                    >Image</button>
                    <button
                      onClick={() => setType('video')}
                      className={`px-3 py-1.5 rounded-md border ${type==='video' ? 'bg-accent-600 text-white border-accent-600' : 'border-secondary-300 text-secondary-700 hover:bg-secondary-50'}`}
                    >Video</button>
                  </div>
                  <div className="text-xs text-secondary-600">
                    {type==='video' ? `Free: ${Math.max(0, 3 - videoCount)} of 3 left · Output: 720p preview` : 'Unlimited free image memes (with ads)'}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            {/* Prompt Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold">Your Meme Idea</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your meme idea... (e.g., 'When you finally fix a bug but create three new ones')"
                    className="min-h-[120px] text-lg"
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Image Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold">Upload Image (Optional)</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                      dragOver 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-secondary-300 hover:border-primary-400 hover:bg-primary-50/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {file ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-green-600" />
                        </div>
          <div>
                          <p className="font-medium text-secondary-900">{file.name}</p>
                          <p className="text-sm text-secondary-600">Ready to enhance with AI</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFile(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                          <Upload className="w-8 h-8 text-primary-600" />
          </div>
                        <div>
                          <p className="font-medium text-secondary-900">Drop your image here</p>
                          <p className="text-sm text-secondary-600">or click to browse</p>
          </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload">
                          <Button variant="outline" size="sm" className="cursor-pointer">
                            Choose File
                          </Button>
                        </label>
            </div>
          )}
        </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Humor Style Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold">Humor Style</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {humorStyles.map((style) => (
                      <motion.button
                        key={style.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setHumor(style.value)}
                        className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                          humor === style.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-secondary-200 hover:border-primary-300 hover:bg-primary-50/50'
                        }`}
                      >
                        <div className="text-2xl mb-1">{style.emoji}</div>
                        <div className="font-medium text-secondary-900">{style.label}</div>
                        <div className="text-xs text-secondary-600">{style.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Generate Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center"
            >
              <Button
                size="lg"
                onClick={generate}
                loading={loading}
                disabled={!prompt.trim()}
                icon={loading ? RefreshCw : Wand2}
                className="text-lg px-8 py-4 hero-glow"
              >
                {loading ? 'Creating Magic...' : `Generate ${type === 'video' ? 'Video' : 'Meme'}`}
              </Button>
            </motion.div>

            {/* Generated Meme */}
            <AnimatePresence>
              {imageUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-5 h-5 text-primary-600" />
                          <h3 className="text-lg font-semibold">Your Meme</h3>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" icon={Copy}>
                            Copy Link
                          </Button>
                          <Button variant="outline" size="sm" icon={Download}>
                            Download
                          </Button>
                          <Button variant="outline" size="sm" icon={Share2}>
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt="Generated meme" 
                          className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                        />
                        <div className="mt-3 text-xs text-secondary-600 text-center">
                          {type==='video' ? 'Free preview frame from 720p video. Create account for 3 full video exports. Upgrade for HD.' : 'Free image generated. Upgrade for watermark-free HD and auto-publish.'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pro Upgrade */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-accent-500 to-primary-600 text-white border-0">
                <CardContent className="p-6 text-center">
                  <Crown className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
                  <h3 className="text-xl font-bold mb-2">Upgrade to Pro</h3>
                  <p className="text-accent-100 mb-4 text-sm">
                    Unlock video memes, remove watermarks, and get priority generation
                  </p>
                  <Button variant="secondary" className="w-full bg-white text-accent-600 hover:bg-accent-50">
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Pro Tips</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-secondary-600">
                      Be specific about emotions and situations for better results
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-secondary-600">
                      Try different humor styles to match your audience
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-secondary-600">
                      Upload your own images for personalized memes
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Ad Slot */}
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-secondary-700 mb-3">Sponsored</p>
            <AdSlot adFormat="auto" adLayout="in-article" style={{ display: 'block' }} />
              </CardContent>
            </Card>
          </div>
          </div>

        {/* Bottom Ad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12"
        >
          <Card>
            <CardContent className="p-6">
              <AdSlot adFormat="auto" style={{ display: 'block' }} />
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Ad Overlay shown during generation */}
        <AnimatePresence>
          {showAdOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-4xl rounded-2xl bg-white/80 backdrop-blur-lg shadow-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-center md:text-left">
                  <CoolLoadingIndicator />
                </div>
                <div className="flex flex-col items-center justify-center space-y-4">
                  <p className="text-sm font-medium text-secondary-700">Sponsored Content</p>
                  <div className="w-full h-64 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <AdSlot adFormat="auto" style={{ display: 'block', width: '100%', height: '100%' }} />
                  </div>
                  <p className="text-xs text-secondary-500 text-center">Your meme will appear once generation is complete. Thanks for your patience!</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
  )
}


