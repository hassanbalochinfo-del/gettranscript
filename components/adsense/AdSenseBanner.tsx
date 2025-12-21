"use client"

import { useEffect } from "react"
import Script from "next/script"

interface AdSenseBannerProps {
  slot: string
  className?: string
  style?: React.CSSProperties
}

export function AdSenseBanner({ slot, className = "", style }: AdSenseBannerProps) {
  const adSenseId = process.env.NEXT_PUBLIC_ADSENSE_ID

  if (!adSenseId) {
    return null // Don't render ads if AdSense ID is not configured
  }

  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch (err) {
      // ignore
    }
  }, [])

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseId}`}
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />
      <ins
        className={`adsbygoogle ${className}`}
        style={{
          display: "block",
          ...style,
        }}
        data-ad-client={adSenseId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </>
  )
}
