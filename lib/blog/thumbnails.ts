import type { BlogPost } from "./posts"

const DEFAULT_THUMBNAIL =
  "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&h=450&fit=crop&q=80&auto=format"

/** Card / OG-friendly crop from Unsplash or other image URLs */
export function blogThumbnailUrl(src: string, width = 800, height = 450): string {
  try {
    const url = new URL(src)
    url.searchParams.set("w", String(width))
    url.searchParams.set("h", String(height))
    url.searchParams.set("fit", "crop")
    url.searchParams.set("q", "80")
    url.searchParams.set("auto", "format")
    return url.toString()
  } catch {
    return src
  }
}

export function extractFirstImageFromHtml(html: string): { src: string; alt: string } | null {
  const matches = html.matchAll(/<img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*>/gi)
  for (const match of matches) {
    const src = match[1]
    if (src.includes("cdn.jsdelivr") || src.endsWith(".svg")) continue
    return {
      src,
      alt: match[2]?.trim() || "",
    }
  }
  return null
}

export function getPostThumbnail(post: BlogPost): { src: string; alt: string } {
  const explicitSrc = post.thumbnail
  const explicitAlt = post.thumbnailAlt?.trim()

  if (explicitSrc) {
    return {
      src: blogThumbnailUrl(explicitSrc),
      alt: explicitAlt || post.title,
    }
  }

  const fromHtml = extractFirstImageFromHtml(post.html)
  if (fromHtml) {
    return {
      src: blogThumbnailUrl(fromHtml.src),
      alt: fromHtml.alt || post.title,
    }
  }

  return {
    src: blogThumbnailUrl(DEFAULT_THUMBNAIL),
    alt: post.title,
  }
}
