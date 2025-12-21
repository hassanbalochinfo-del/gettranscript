"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { toast } from "sonner"
import { AdSlot } from "@/components/adsense/AdSlot"

export default function HomePage() {
  const router = useRouter()
  const [url, setUrl] = useState("")

  const adSenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  const adSenseSlotHome = process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME

  const handleGetTranscript = () => {
    if (!url.trim()) {
      toast.error("Please enter a YouTube URL")
      return
    }
    
    router.push(`/app/result?url=${encodeURIComponent(url)}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-border/60 bg-gradient-to-b from-muted/20 to-background">
          <div className="container mx-auto max-w-4xl px-4 py-20 sm:px-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground mb-6">
                No sign-up • Works with YouTube & Shorts
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Get YouTube Transcript Instantly
              </h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg max-w-2xl mx-auto">
                Paste a YouTube link to extract a clean transcript in seconds. Copy, download, and use it however you need.
              </p>

              <div className="mt-8 max-w-2xl mx-auto">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    type="url"
                    placeholder="Paste YouTube or YouTube Shorts URL…"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleGetTranscript()
                    }}
                    className="flex-1 text-base"
                  />
                  <Button onClick={handleGetTranscript} disabled={!url.trim()} size="lg">
                    Get Transcript
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Tip: paste a video URL like <span className="font-mono">youtube.com/watch?v=…</span> or{" "}
                  <span className="font-mono">youtube.com/shorts/…</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ad slot (optional) */}
        <div className="container mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <AdSlot client={adSenseClient} slot={adSenseSlotHome} className="w-full" />
        </div>

        <section id="features" className="container mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Features</h2>
              <p className="mt-2 text-sm text-muted-foreground">Everything you need to grab, reuse, and share transcripts.</p>
            </div>
            <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Fast transcripts</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Paste a URL and get a clean transcript with optional timestamps and metadata.
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Copy & download</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  One-click copy. Download as TXT or JSON format.
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Timestamps</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Enable timestamps to navigate and quote specific moments in the video.
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Works with Shorts</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Supports common YouTube URL formats including <span className="font-mono">/shorts/</span>.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 bg-muted/20">
          <div className="container mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">1) Paste link</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Copy a YouTube video link and paste it here.</CardContent>
              </Card>
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">2) Get transcript</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  We fetch the transcript and metadata, then display it in a clean viewer.
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">3) Copy / download</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Copy to clipboard or download to your device.</CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Does every video have a transcript?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Not always. Some videos don't have transcripts available due to creator settings, restrictions, or missing captions.
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Do you store my transcripts?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                No. We do not store your transcripts or any personal data. Transcripts are fetched on demand and may be cached temporarily for performance.
              </CardContent>
            </Card>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
