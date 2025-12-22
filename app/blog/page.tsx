import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BLOG_POSTS } from "@/lib/blog/posts"
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

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {BLOG_POSTS.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="block">
                <Card className="border-border/60 hover:bg-muted/20 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <div className="text-xs text-muted-foreground">{p.date}</div>
                    <p className="mt-2">{p.excerpt}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

