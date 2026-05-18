import Script from "next/script"
import { ADSENSE_PUBLISHER_ID } from "@/lib/adsense/config"

/** AdSense loader — use only on editorial/content routes (blog, about, features, contact). */
export function AdSenseScript() {
  if (!ADSENSE_PUBLISHER_ID) return null

  return (
    <Script
      id="adsense-script"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}
