import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Image from "next/image"
import { getPostBySlug } from "@/lib/blog/posts"
import { getPostThumbnail } from "@/lib/blog/thumbnails"
import { StructuredData } from "@/components/StructuredData"

import { siteUrl } from "@/lib/seo"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const post = getPostBySlug(slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  const thumb = getPostThumbnail(post)

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${siteUrl}/blog/${slug}`,
      type: "article",
      publishedTime: post.date,
      images: [{ url: thumb.src, width: 800, height: 450, alt: thumb.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [thumb.src],
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

  const thumb = getPostThumbnail(post)

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: thumb.src,
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
          <article className="container mx-auto max-w-4xl px-4 py-12 sm:px-8 lg:py-16">
            <header className="mb-12 max-w-3xl">
              <time dateTime={post.date} className="text-sm text-muted-foreground">
                {post.date}
              </time>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
                {post.title}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {post.excerpt}
              </p>
            </header>
            <div className="relative mb-12 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted shadow-md">
              <Image
                src={thumb.src}
                alt={thumb.alt}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </div>
            <div
              className="prose prose-lg prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-14 prose-h2:mb-5 prose-h2:text-2xl prose-p:my-5 prose-p:leading-[1.9] prose-p:text-foreground/90 prose-li:my-2 prose-li:leading-relaxed prose-figure:my-12 prose-img:w-full prose-img:h-auto prose-img:rounded-2xl prose-img:shadow-md prose-figcaption:mt-3 prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-hr:my-14"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
          </article>
        </main>
        <Footer />
      </div>
    </>
  )
}
