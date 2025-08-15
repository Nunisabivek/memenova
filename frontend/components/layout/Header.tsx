"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Zap, Sparkles, Crown } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [email, setEmail] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authMsg, setAuthMsg] = useState<string | null>(null)
  const plan = (typeof window !== 'undefined') ? (localStorage.getItem('userPlan') || '') : ''

  const navigation = [
    { name: 'Studio', href: '/studio', icon: Sparkles },
    { name: 'Pricing', href: '/pricing', icon: Crown },
  ]

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-secondary-200/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <Zap className="h-8 w-8 text-primary-600" />
                <motion.div
                  className="absolute inset-0 bg-primary-400 rounded-full blur-sm opacity-30"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className="text-xl font-bold text-gradient">MemeNova</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <motion.div key={item.name} whileHover={{ scale: 1.05 }}>
                <Link
                  href={item.href}
                  className="flex items-center space-x-1 text-secondary-600 hover:text-primary-600 transition-colors duration-200"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-xs text-secondary-600 mr-2">{plan ? `Plan: ${plan}` : ''}</div>
            {!plan ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowAuth(true)}>
                  Sign In
                </Button>
                <Link href="/studio"><Button size="sm" className="hero-glow">Get Started</Button></Link>
              </>
            ) : (
              <Link href="/studio"><Button size="sm" className="hero-glow">Create</Button></Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-secondary-600 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 backdrop-blur-lg border-t border-secondary-200/50"
          >
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600 transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </motion.div>
              ))}
              <div className="pt-4 space-y-3">
                {!plan ? (
                  <>
                    <Button variant="outline" className="w-full" onClick={() => { setShowAuth(true); setIsMenuOpen(false) }}>
                      Sign In
                    </Button>
                    <Link href="/studio" className="w-full block"><Button className="w-full hero-glow">Get Started</Button></Link>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-secondary-600">Plan: {plan}</div>
                    <Link href="/studio" className="w-full block"><Button className="w-full hero-glow">Create</Button></Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !authLoading && setShowAuth(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Sign in</h3>
                <button onClick={() => !authLoading && setShowAuth(false)} className="text-secondary-500 hover:text-secondary-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-secondary-600 mb-4">Enter your email to create or access your account.</p>
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {authMsg && <div className="text-sm text-secondary-600">{authMsg}</div>}
                <Button
                  className="w-full"
                  loading={authLoading}
                  disabled={!email.trim()}
                  onClick={async () => {
                    try {
                      setAuthLoading(true)
                      setAuthMsg(null)
                      const url = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/users/auth` : '/api/users/auth'
                      const { data } = await axios.post(url, { email: email.trim() })
                      const userId = data?.data?.id
                      if (userId) {
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('userId', userId)
                          localStorage.setItem('userEmail', data?.data?.email || email.trim())
                          localStorage.setItem('userPlan', data?.data?.plan || '')
                        }
                        setAuthMsg('Signed in! You can now generate and save memes.')
                        setTimeout(() => setShowAuth(false), 600)
                      } else {
                        setAuthMsg('Unexpected response. Please try again.')
                      }
                    } catch (e: any) {
                      setAuthMsg(e?.response?.data?.error || 'Sign in failed. Please try again.')
                    } finally {
                      setAuthLoading(false)
                    }
                  }}
                >
                  Continue
                </Button>
                <div className="text-xs text-secondary-500">
                  Tip: using <span className="font-medium">nunisaalex456@gmail.com</span> will enable PRO for testing.
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
