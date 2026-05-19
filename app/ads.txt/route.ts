import { ADS_TXT_BODY } from "@/lib/adsense/ads-txt"

export const dynamic = "force-static"
export const revalidate = 86400

/** Ensures /ads.txt is always reachable for AdSense crawlers (200 + text/plain). */
export function GET() {
  return new Response(ADS_TXT_BODY, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
