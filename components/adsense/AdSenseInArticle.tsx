"use client"

import { useEffect } from "react"
import Script from "next/script"

interface AdSenseInArticleProps {
  slot: string
  className?: string
}

export function AdSenseInArticle({ slot, className = "" }: AdSenseInArticleProps) {
  const adSenseId = process.env.NEXT_PUBLIC_ADSENSE_ID

  if (!adSenseId) {
    return null
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
        style={{ display: "block", textAlign: "center" }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client={adSenseId}
        data-ad-slot={slot}
      />
    </>
  )
}
