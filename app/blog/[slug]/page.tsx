import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getPostBySlug } from "@/lib/blog/posts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StructuredData } from "@/components/StructuredData"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gettranscript.com"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const post = getPostBySlug(slug)
  
  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${siteUrl}/blog/${slug}`,
      type: "article",
      publishedTime: post.date,
    },
    alternates: {
      canonical: `${siteUrl}/blog/${slug}`,
    },
  }
}

export default async function BlogPostPage(props: Props) {
  const { slug } = await props.params
  const post = getPostBySlug(slug)
  if (!post) return notFound()

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "GetTranscript",
    },
    publisher: {
      "@type": "Organization",
      name: "GetTranscript",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.svg`,
      },
    },
  }

  return (
    <>
      <StructuredData data={structuredData} />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto max-w-3xl px-4 py-14 sm:px-6">
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <div className="text-xs text-muted-foreground">{post.date}</div>
                <CardTitle className="text-2xl">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <article className="prose prose-neutral dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: post.html }} />
                </article>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}

