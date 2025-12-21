"use client"

import { useEffect } from "react"

type AdSlotProps = {
  /**
   * Paste your AdSense client id (ca-pub-xxxx) into:
   * NEXT_PUBLIC_ADSENSE_CLIENT
   */
  client?: string
  /**
   * Paste your ad slot id into:
   * NEXT_PUBLIC_ADSENSE_SLOT_HOME / NEXT_PUBLIC_ADSENSE_SLOT_RESULT
   */
  slot?: string
  className?: string
  style?: React.CSSProperties
  format?: "auto" | "fluid"
  layout?: "in-article" | undefined
}

export function AdSlot({ client, slot, className = "", style, format = "auto", layout }: AdSlotProps) {
  // Don't render if not configured
  if (!client || !slot) return null

  useEffect(() => {
    try {
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch {
      // ignore
    }
  }, [client, slot])

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{
        display: "block",
        ...style,
      }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-ad-layout={layout}
      data-full-width-responsive="true"
    />
  )
}

