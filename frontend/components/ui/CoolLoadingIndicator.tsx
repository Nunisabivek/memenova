"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const funnyMessages = [
  'Tickling the AI\'s funny bone...',
  'Reticulating splines... and memes',
  'Consulting the meme elders for inspiration...',
  'Warming up the meme machine...',
  'Teaching the AI about sarcasm...',
  'Searching for the perfect font (it\'s always Impact)...',
  'Polishing the pixels to perfection...',
  'Ensuring maximum virality...',
  'Adding a dash of internet culture...',
  'Making sure the punchline lands...',
]

export function CoolLoadingIndicator() {
  const [message, setMessage] = useState(funnyMessages[0])

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(prev => {
        const nextIndex = (funnyMessages.indexOf(prev) + 1) % funnyMessages.length
        return funnyMessages[nextIndex]
      })
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-center">
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="80"
        height="80"
        viewBox="0 0 24 24"
        className="mx-auto mb-4"
      >
        <motion.path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 3v3m4.243 4.243l-2.122 2.121M19 12h-3M4.243 19.757l2.121-2.121M5 12H2m7.07-7.071L7.07 7.07M16.929 16.929l2.122 2.121M12 21v-3"
          strokeDasharray="2"
          strokeDashoffset="2"
          initial={{ opacity: 0.5 }}
          animate={{
            rotate: 360,
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
        <motion.circle
          cx="12"
          cy="12"
          r="4"
          fill="currentColor"
          initial={{ scale: 0.5, opacity: 0.8 }}
          animate={{
            scale: [0.5, 1.1, 0.5],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2.5,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      </motion.svg>
      <p className="text-lg font-medium text-secondary-800">{message}</p>
      <p className="text-sm text-secondary-600">Please wait, magic is happening.</p>
    </div>
  )
}
