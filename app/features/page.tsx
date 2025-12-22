import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gettranscript.com"

export const metadata: Metadata = {
  title: "Features - GetTranscript",
  description: "Discover all features of GetTranscript: YouTube transcript extraction, timestamps, copy & download, video embed, and more. Free, fast, and no sign-up required.",
  openGraph: {
    title: "Features - GetTranscript",
    description: "Discover all features of GetTranscript: YouTube transcript extraction, timestamps, copy & download, and more.",
    url: `${siteUrl}/features`,
  },
  alternates: {
    canonical: `${siteUrl}/features`,
  },
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight">Features</h1>
          <p className="mt-2 text-muted-foreground">A fast, clean way to extract, copy, and download YouTube transcripts.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">YouTube + Shorts</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Works with common YouTube URL formats, including Shorts and standard video links.
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Timestamps</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Enable timestamps and click them to navigate the transcript. Perfect for quoting specific moments.
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Copy & Download</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Copy instantly to clipboard or download the transcript as TXT or JSON format.
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Video Embed</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                View the video alongside the transcript with embedded YouTube player.
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">No sign-up</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Public tool—no account required. Start using it immediately.
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Fast & reliable</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Quick transcript fetching with server-side caching for better performance.
              </CardContent>
            </Card>
          </div>

          <div className="mt-10">
            <Button asChild>
              <Link href="/">Try it now</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
