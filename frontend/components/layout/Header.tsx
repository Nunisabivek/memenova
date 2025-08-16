"use client"
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Sparkles } from 'lucide-react'
import { Button } from '../ui/Button'

export function Header() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-secondary-200/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/studio"><Button size="sm" className="hero-glow" icon={Sparkles}>Create Meme</Button></Link>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
