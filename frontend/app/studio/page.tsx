"use client"
import { useRef, useState } from 'react'
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
  RefreshCw,
  Copy,
  Heart
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Textarea, Input } from '../../components/ui/Input'
import { AdsterraBanner } from '../../components/ads/AdsterraBanner'
import { CoolLoadingIndicator } from '../../components/ui/CoolLoadingIndicator'
import { ErrorBoundary } from '../../components/ui/ErrorBoundary'
import { getUserId } from '../../lib/auth'

export default function StudioPage() {
  const [prompt, setPrompt] = useState('')
  const [humor, setHumor] = useState('sarcastic')
  const [loading, setLoading] = useState(false)
  const [showAdOverlay, setShowAdOverlay] = useState(false)
  const [useCustomImage, setUseCustomImage] = useState<boolean>(true)
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
    const start = Date.now()
    try {
      let uploadedUrl: string | undefined
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
      if (useCustomImage && file) {
        const form = new FormData()
        form.append('file', file)
        const upload = await axios.post(baseUrl ? `${baseUrl}/upload` : '/api/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
        uploadedUrl = upload.data.url
      }
      const payload: any = { type: 'image', prompt, humor }
      if (!useCustomImage) {
        payload.provider = 'OPENAI'
      } else if (uploadedUrl) {
        payload.imageUrl = uploadedUrl
      }
      const { data } = await axios.post(
        baseUrl ? `${baseUrl}/generate` : '/api/generate',
        payload,
        { headers: { 'x-user-id': getUserId() || '' } }
      )
      setImageUrl(data.previewUrl)
    } finally {
      const elapsed = Date.now() - start
      const minMs = 5000
      const maxExtra = 3000
      const waitMs = elapsed >= minMs ? 0 : Math.min(minMs - elapsed + Math.floor(Math.random() * maxExtra), 8000)
      setTimeout(() => {
        setLoading(false)
        setShowAdOverlay(false)
      }, waitMs)
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
        {/* Top banner ad for visibility on all devices */}
        <div className="mb-6 flex justify-center">
          <div className="border border-secondary-200 rounded-lg p-4 bg-secondary-50">
            <ErrorBoundary fallback={<div className="w-[300px] h-[250px] flex items-center justify-center text-secondary-500">Ad loading...</div>}>
              <AdsterraBanner
                type="iframe"
                keyId="de0016110e51c18b0e34285a15e64a70"
                scriptSrc="//www.highperformanceformat.com/de0016110e51c18b0e34285a15e64a70/invoke.js"
                width={300}
                height={250}
              />
            </ErrorBoundary>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Creation Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mode toggle: Custom Meme (upload) vs AI Image */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="text-sm text-secondary-700">Custom Meme (use my image)</div>
                  <button
                    onClick={() => setUseCustomImage(v => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${useCustomImage ? 'bg-primary-600' : 'bg-secondary-300'}`}
                    aria-label="Toggle custom image"
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${useCustomImage ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </CardContent>
              </Card>
            </motion.div>
            {/* Inline ad row inside studio main area */}
            <div className="flex flex-wrap gap-4 justify-center">
              <ErrorBoundary fallback={<div className="w-[300px] h-[250px] flex items-center justify-center text-secondary-500">Ad</div>}>
                <AdsterraBanner type="native" containerId="studio-inline-1" scriptSrc="//pl27424868.profitableratecpm.com/03212cacd280051f4599929a27df3f3b/invoke.js" />
              </ErrorBoundary>
              <ErrorBoundary fallback={<div className="w-[300px] h-[250px] flex items-center justify-center text-secondary-500">Ad</div>}>
                <AdsterraBanner type="native" containerId="studio-inline-2" scriptSrc="//pl27424868.profitableratecpm.com/03212cacd280051f4599929a27df3f3b/invoke.js" />
              </ErrorBoundary>
            </div>
            {/* Single mode: Image memes only */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="text-sm text-secondary-700">Mode: Image Memes</div>
                  <div className="text-xs text-secondary-600">Fast generation · Free</div>
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

            {/* Image Upload (shown only when using custom image) */}
            {useCustomImage && (
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
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="file-upload"
                        />
                        <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          Choose File
                        </Button>
            </div>
          )}
        </div>
                </CardContent>
              </Card>
            </motion.div>
            )}

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
                {loading ? 'Creating Magic...' : 'Generate Meme'}
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
                        <div className="mt-3 text-xs text-secondary-600 text-center">Free image generated.</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Removed upgrade card */}

            {/* Ads directly under upgrade card */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-medium text-secondary-700">Sponsored</p>
                <ErrorBoundary fallback={<div className="w-[300px] h-[250px] flex items-center justify-center text-secondary-500">Ad</div>}>
                  <AdsterraBanner type="native" containerId="container-03212cacd280051f4599929a27df3f3b" scriptSrc="//meantimesubside.com/03212cacd280051f4599929a27df3f3b/invoke.js" />
                </ErrorBoundary>
                <ErrorBoundary fallback={<div className="w-[300px] h-[250px] flex items-center justify-center text-secondary-500">Ad</div>}>
                  <AdsterraBanner type="native" containerId="container-03212cacd280051f4599929a27df3f3b" scriptSrc="//meantimesubside.com/03212cacd280051f4599929a27df3f3b/invoke.js" />
                </ErrorBoundary>
              </CardContent>
            </Card>

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
                <ErrorBoundary fallback={<div className="w-[300px] h-[250px] flex items-center justify-center text-secondary-500">Ad loading...</div>}>
                  <AdsterraBanner
                    type="native"
                    containerId="container-03212cacd280051f4599929a27df3f3b"
                    scriptSrc="//meantimesubside.com/03212cacd280051f4599929a27df3f3b/invoke.js"
                  />
                </ErrorBoundary>
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
            <CardContent className="p-6 flex justify-center">
              <ErrorBoundary fallback={<div className="w-[300px] h-[250px] flex items-center justify-center text-secondary-500">Ad loading...</div>}>
                <AdsterraBanner
                  type="native"
                  containerId="container-03212cacd280051f4599929a27df3f3b"
                  scriptSrc="//meantimesubside.com/03212cacd280051f4599929a27df3f3b/invoke.js"
                />
              </ErrorBoundary>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sticky mobile bottom ad in studio */}
        <div className="fixed bottom-2 left-0 right-0 mx-auto w-full max-w-md px-4 sm:hidden z-40">
          <div className="rounded-md border border-secondary-200 bg-white/90 backdrop-blur p-2 shadow-lg flex justify-center">
            <ErrorBoundary fallback={<div className="w-[320px] h-[50px] flex items-center justify-center text-secondary-500">Ad</div>}>
              <AdsterraBanner type="native" containerId="container-03212cacd280051f4599929a27df3f3b" scriptSrc="//meantimesubside.com/03212cacd280051f4599929a27df3f3b/invoke.js" />
            </ErrorBoundary>
          </div>
        </div>
        
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
                    <ErrorBoundary fallback={<div className="w-[300px] h-[250px] flex items-center justify-center text-secondary-500">Ad loading...</div>}>
                      <AdsterraBanner
                        type="native"
                        containerId="container-03212cacd280051f4599929a27df3f3b"
                        scriptSrc="//pl27424868.profitableratecpm.com/03212cacd280051f4599929a27df3f3b/invoke.js"
                      />
                    </ErrorBoundary>
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


