import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BLOG_POSTS } from "@/lib/blog/posts"
import { getPostThumbnail } from "@/lib/blog/thumbnails"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gettranscript.com"

export const metadata: Metadata = {
  title: "Blog - GetTranscript",
  description: "Read guides and tips for getting the most out of YouTube transcripts. Learn how to extract, use, and optimize transcripts for your workflow.",
  openGraph: {
    title: "Blog - GetTranscript",
    description: "Read guides and tips for getting the most out of YouTube transcripts.",
    url: `${siteUrl}/blog`,
  },
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
}

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
          <p className="mt-2 text-muted-foreground">Guides and tips for getting the most out of transcripts.</p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BLOG_POSTS.map((p) => {
              const thumb = getPostThumbnail(p)
              return (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group block h-full">
                  <Card className="h-full overflow-hidden border-border/60 transition-colors hover:bg-muted/20">
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                      <Image
                        src={thumb.src}
                        alt={thumb.alt}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-2 text-base leading-snug group-hover:text-primary">
                        {p.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <time dateTime={p.date} className="text-xs text-muted-foreground">
                        {p.date}
                      </time>
                      <p className="mt-2 line-clamp-3">{p.excerpt}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
