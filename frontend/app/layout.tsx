import './globals.css'
import React from 'react'
import Script from 'next/script'

export const metadata = {
  title: 'MemeNova',
  description: 'AI-powered meme generator for images and video'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <Script
            id="adsbygoogle-loader"
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
        {children}
      </body>
    </html>
  )
}


