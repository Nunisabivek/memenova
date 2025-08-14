import './globals.css'
import React from 'react'
import Script from 'next/script'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'

export const metadata = {
  title: 'MemeNova - AI-Powered Meme Studio',
  description: 'Create viral memes with AI. Transform your ideas into engaging content with our professional meme generation tools.',
  keywords: 'meme generator, AI memes, viral content, social media, content creation',
  authors: [{ name: 'MemeNova Team' }],
  openGraph: {
    title: 'MemeNova - AI-Powered Meme Studio',
    description: 'Create viral memes with AI. Transform your ideas into engaging content.',
    type: 'website',
    siteName: 'MemeNova',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MemeNova - AI-Powered Meme Studio',
    description: 'Create viral memes with AI. Transform your ideas into engaging content.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-primary-50/50 via-white to-accent-50/50 text-secondary-900 font-sans antialiased">
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <Script
            id="adsbygoogle-loader"
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}


