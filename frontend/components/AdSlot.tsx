"use client"
import { useEffect, useRef } from 'react'

type Props = {
  adSlot?: string
  adFormat?: string
  adLayout?: string
  style?: React.CSSProperties
}

export function AdSlot({ adSlot, adFormat = 'auto', adLayout, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      // @ts-ignore
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT) return null

  return (
    <ins
      ref={ref as any}
      className="adsbygoogle"
      style={style || { display: 'block' }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-ad-layout={adLayout}
    />
  )
}

