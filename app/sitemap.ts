import { MetadataRoute } from "next"
import { BLOG_POSTS } from "@/lib/blog/posts"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gettranscript.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteUrl

  // Static pages
  const routes = [
    "",
    "/features",
    "/blog",
    "/contact",
    "/privacy-policy",
    "/terms-of-service",
  ]

  // Blog posts
  const blogPosts = BLOG_POSTS.map((post) => post.slug)

  const staticPages: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }))

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  return [...staticPages, ...blogPages]
}
