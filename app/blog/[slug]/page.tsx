import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getPostBySlug } from "@/lib/blog/posts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = { params: Promise<{ slug: string }> }

export default async function BlogPostPage(props: Props) {
  const { slug } = await props.params
  const post = getPostBySlug(slug)
  if (!post) return notFound()

  return (
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
  )
}

