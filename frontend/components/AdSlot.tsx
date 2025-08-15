"use client"
import { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  adSlot?: string
  adFormat?: string
  adLayout?: string
  style?: React.CSSProperties
}

export function AdSlot({ adSlot, adFormat = 'auto', adLayout, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [adBlocked, setAdBlocked] = useState(false)
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

  useEffect(() => {
    // Detect basic adblock by attempting to load adsbygoogle and checking DOM
    const check = () => {
      const present = !!document.querySelector('ins.adsbygoogle')
      const hidden = present && (ref.current && getComputedStyle(ref.current).display === 'none')
      setAdBlocked(Boolean(client) && present && hidden)
    }
    try {
      // @ts-ignore
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      setTimeout(check, 800)
    } catch {
      setAdBlocked(Boolean(client))
    }
  }, [])

  if (!client) return null

  return (
    <div className="relative">
      <ins
        ref={ref as any}
        className="adsbygoogle"
        style={style || { display: 'block' }}
        data-ad-client={client}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
      />
      {adBlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary-50/90 rounded border border-secondary-200">
          <div className="text-center p-3 text-sm">
            <p className="font-medium text-secondary-800">Please disable your ad blocker</p>
            <p className="text-secondary-600">Ads keep MemeNova free. We only show minimal, non-intrusive ads.</p>
          </div>
        </div>
      )}
    </div>
  )
}

