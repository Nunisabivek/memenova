import './globals.css'
import React from 'react'
import Script from 'next/script'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'

export const metadata = {
  metadataBase: new URL('https://memenova.app/'),
  title: 'MemeNova – Free AI Meme Generator (Upload or Prompt)',
  description: 'Generate memes free with AI. Upload an image to add bold caption text or type a prompt to create new memes. Fast, simple, and ad-supported.',
  keywords: 'meme generator, free meme generator, AI memes, create memes online, add text to image, impact font, meme maker',
  authors: [{ name: 'MemeNova Team' }],
  openGraph: {
    title: 'MemeNova – Free AI Meme Generator',
    description: 'Upload an image or type a prompt to generate memes instantly.',
    type: 'website',
    siteName: 'MemeNova',
    url: 'https://memenova.app/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MemeNova – Free AI Meme Generator',
    description: 'Upload or prompt. Generate memes fast, free, and ad-supported.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://memenova.app/" />
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


