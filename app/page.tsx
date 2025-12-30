"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Zap, Copy, Download, Clock, Youtube, Check } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { toast } from "sonner"
import { StructuredData } from "@/components/StructuredData"
import { UI_COPY, PLAN_PRICES, PLAN_CREDITS } from "@/lib/constants"
import { PaddleCheckoutButton } from "@/components/paddle-checkout-button"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gettranscript.com"

const plans = [
  {
    name: "Starter",
    price: PLAN_PRICES.starter,
    credits: PLAN_CREDITS.starter,
    features: UI_COPY.starterFeatures,
    plan: "starter",
    highlighted: false,
  },
  {
    name: "Pro",
    price: PLAN_PRICES.pro,
    credits: PLAN_CREDITS.pro,
    features: UI_COPY.proFeatures,
    plan: "pro",
    highlighted: true,
  },
  {
    name: "Plus",
    price: PLAN_PRICES.plus,
    credits: PLAN_CREDITS.plus,
    features: UI_COPY.plusFeatures,
    plan: "plus",
    highlighted: false,
  },
]

export default function HomePage() {
  const router = useRouter()
  const [url, setUrl] = useState("")

  const handleGetTranscript = () => {
    if (!url.trim()) {
      toast.error("Please enter a YouTube URL")
      return
    }
    
    router.push(`/app/result?url=${encodeURIComponent(url)}`)
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "GetTranscript",
    description: "Get instant YouTube transcripts for free. Paste a YouTube link and extract clean transcripts in seconds.",
    url: siteUrl,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "YouTube transcript extraction",
      "YouTube Shorts support",
      "Timestamp support",
      "Copy to clipboard",
      "Download as TXT or JSON",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "100",
    },
  }

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does every video have a transcript?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Not always. Some videos don't have transcripts available due to creator settings, restrictions, or missing captions.",
        },
      },
      {
        "@type": "Question",
        name: "Do you store my transcripts?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. We do not store your transcripts or any personal data. Transcripts are fetched on demand and may be cached temporarily for performance.",
        },
      },
    ],
  }

  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData data={faqStructuredData} />
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
        <section className="border-b border-border/60 bg-gradient-to-b from-muted/20 to-background">
          <div className="container mx-auto max-w-4xl px-4 py-16 sm:py-20 sm:px-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground mb-6">
                Works with YouTube & Shorts
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

        <section id="features" className="container mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Features</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">Everything you need to extract, copy, and download YouTube transcripts.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/60 hover:border-border transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">Fast transcripts</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Paste a URL and get a clean transcript with optional timestamps and metadata.
              </CardContent>
            </Card>
            <Card className="border-border/60 hover:border-border transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Copy className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">Copy & download</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                One-click copy. Download as TXT or JSON format.
              </CardContent>
            </Card>
            <Card className="border-border/60 hover:border-border transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">Timestamps</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Enable timestamps to navigate and quote specific moments in the video.
              </CardContent>
            </Card>
            <Card className="border-border/60 hover:border-border transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Youtube className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">Works with Shorts</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Supports common YouTube URL formats including <span className="font-mono">/shorts/</span>.
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-t border-border/60 bg-muted/20">
          <div className="container mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">Get your transcript in three simple steps</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-border/60 hover:border-border transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      1
                    </div>
                    <CardTitle className="text-base">Paste link</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Copy a YouTube video link and paste it here.</CardContent>
              </Card>
              <Card className="border-border/60 hover:border-border transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      2
                    </div>
                    <CardTitle className="text-base">Get transcript</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  We fetch the transcript and metadata, then display it in a clean viewer.
                </CardContent>
              </Card>
              <Card className="border-border/60 hover:border-border transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      3
                    </div>
                    <CardTitle className="text-base">Copy / download</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Copy to clipboard or download to your device.</CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
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

        <section className="border-t border-border/60 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Pricing</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                {UI_COPY.pricingSubhead}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative flex flex-col transition-all hover:shadow-lg ${
                    plan.highlighted
                      ? "border-primary shadow-xl ring-2 ring-primary scale-105"
                      : "border-border hover:border-border/80"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                    <div className="mt-4 flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {plan.credits} credits per month
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <ul className="flex-1 space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <PaddleCheckoutButton
                      plan={plan.plan as any}
                      className="w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                      size="lg"
                    >
                      <span className="inline-flex items-center">
                        {UI_COPY.getStarted}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </PaddleCheckoutButton>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button variant="ghost" asChild>
                <Link href="/pricing">
                  View all plans and FAQs →
                </Link>
              </Button>
            </div>
          </div>
        </section>

        </main>

        <Footer />
      </div>
    </>
  )
}
