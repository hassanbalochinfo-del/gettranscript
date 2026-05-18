import { MetadataRoute } from "next"
import { siteUrl } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/app/result",
          "/uploads/",
          "/login",
          "/signup",
          "/pricing",
          "/account",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/app/result", "/uploads/", "/login", "/signup", "/pricing", "/account"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
