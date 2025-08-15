"use client"
import Link from 'next/link'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Zap, 
  Wand2, 
  Image, 
  Video, 
  Share2, 
  Clock, 
  TrendingUp,
  Users,
  Star,
  ArrowRight,
  PlayCircle
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'

export default function HomePage() {
  const router = useRouter()
  // Redirect visitors from search engines directly to studio for faster creation
  useEffect(() => {
    try {
      const ref = document.referrer || ''
      const fromSearch = /(google\.|bing\.|duckduckgo\.|yahoo\.|yandex\.)/i.test(ref)
      if (fromSearch) {
        router.replace('/studio')
      }
    } catch {}
  }, [router])
  const features = [
    {
      icon: Wand2,
      title: 'AI-Powered Generation',
      description: 'Transform your ideas into viral memes with cutting-edge AI technology.',
      color: 'text-primary-600'
    },
    {
      icon: Image,
      title: 'Image Memes',
      description: 'Create stunning image memes with customizable templates and styles.',
      color: 'text-accent-600'
    },
    {
      icon: Video,
      title: 'Video Memes',
      description: 'Generate engaging video memes up to 60 seconds for maximum impact.',
      color: 'text-primary-600'
    },
    {
      icon: Share2,
      title: 'Auto-Publish',
      description: 'Share directly to social platforms with automated captions.',
      color: 'text-accent-600'
    },
    {
      icon: Clock,
      title: 'Lightning Fast',
      description: 'Generate professional memes in seconds, not hours.',
      color: 'text-primary-600'
    },
    {
      icon: TrendingUp,
      title: 'Viral Ready',
      description: 'Optimized for engagement with trending formats and styles.',
      color: 'text-accent-600'
    }
  ]

  // Live metrics for hero
  const [metrics, setMetrics] = React.useState<{ totals: { users: number, projects: number, memes: number } } | null>(null)
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/metrics` : '/api/metrics'
    fetch(url).then(r => r.json()).then(setMetrics).catch(() => {})
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl animate-pulse-gentle" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl animate-float" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-8"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Meme Studio
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-gradient mb-6 leading-tight">
                Create Viral Memes
                <br />
                <span className="text-secondary-900">in Seconds</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-secondary-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Transform your ideas into engaging content with our AI-powered meme studio. 
                Perfect for creators, marketers, and anyone who loves to make people laugh.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link href="/studio">
                <Button 
                  size="lg" 
                  className="hero-glow text-lg px-8 py-4"
                  icon={Zap}
                >
                  Start Creating Free
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-4"
                icon={PlayCircle}
              >
                Watch Demo
              </Button>
            </motion.div>

            {/* Live stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-900">{metrics?.totals.memes ?? '—'}</div>
                <p className="text-secondary-600">Memes Generated</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-900">{metrics?.totals.projects ?? '—'}</div>
                <p className="text-secondary-600">Projects</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-900">{metrics?.totals.users ?? '—'}</div>
                <p className="text-secondary-600">Users</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
              Everything You Need to Go
              <span className="text-gradient"> Viral</span>
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Our powerful AI engine and intuitive tools make it easy to create 
              professional memes that capture attention and drive engagement.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card hover className="h-full p-6 group">
                  <CardContent className="p-0">
                    <div className="flex items-center mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r from-primary-100 to-accent-100 group-hover:from-primary-200 group-hover:to-accent-200 transition-all duration-300`}>
                        <feature.icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-secondary-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent-400/30 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Create Your First Viral Meme?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of creators who are already using MemeNova to 
              engage their audience and grow their following.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/studio">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="text-lg px-8 py-4 bg-white text-primary-700 hover:bg-gray-50"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Start Creating Now
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  )
}


