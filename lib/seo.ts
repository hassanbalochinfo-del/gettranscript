/**
 * SEO utility functions and constants
 */

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gettranscript.com"
export const siteName = "GetTranscript"

export function generateCanonicalUrl(path: string): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`
}

export function generatePageTitle(title: string): string {
  return `${title} | ${siteName}`
}
