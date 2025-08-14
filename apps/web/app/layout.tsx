import './globals.css'
import React from 'react'

export const metadata = {
  title: 'MemeNova',
  description: 'AI-powered meme generator for images and video'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  )
}


