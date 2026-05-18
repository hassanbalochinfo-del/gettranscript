import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { generateCanonicalUrl, siteName, siteUrl } from "@/lib/seo"

export const metadata: Metadata = {
  title: "About GetTranscript",
  description:
    "GetTranscript is a free YouTube transcript tool. Learn who we are, how the tool works, and what our blog covers for students, creators, and researchers.",
  alternates: {
    canonical: generateCanonicalUrl("/about"),
  },
  openGraph: {
    title: `About ${siteName}`,
    description: "Free YouTube transcript extraction for learning, research, and content workflows.",
    url: `${siteUrl}/about`,
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">About GetTranscript</h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            GetTranscript helps you turn YouTube videos and Shorts into clean, readable text — with optional timestamps —
            so you can study, quote, search, and repurpose video content without rewatching entire uploads.
          </p>

          <section className="mt-10 space-y-4 text-foreground/90 leading-relaxed">
            <h2 className="text-xl font-semibold text-foreground">What we do</h2>
            <p>
              Paste a public YouTube URL and get a transcript in seconds. Copy to your clipboard, download as a text file,
              or jump through timestamped segments when captions include timing data. The tool is built for everyday
              workflows: lecture notes, interview quotes, creator scripts, accessibility, and language learning.
            </p>
          </section>

          <section className="mt-10 space-y-4 text-foreground/90 leading-relaxed">
            <h2 className="text-xl font-semibold text-foreground">Who runs this site</h2>
            <p>
              GetTranscript is operated as an independent product focused on fast, simple transcript access. We do not
              sell your pasted URLs or downloaded transcripts as a data product. For questions, feedback, or partnerships,
              email us at{" "}
              <a href="mailto:transcriptget@gmail.com" className="text-primary hover:underline">
                transcriptget@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="mt-10 space-y-4 text-foreground/90 leading-relaxed">
            <h2 className="text-xl font-semibold text-foreground">Our blog</h2>
            <p>
              Articles on this site are written for people who learn and work from video: students, researchers, creators,
              and anyone who relies on captions and transcripts. We publish practical guides about YouTube transcripts,
              subtitles, accessibility, study workflows, and video quality — not generic filler content.
            </p>
            <p>
              <Link href="/blog" className="text-primary hover:underline">
                Browse the blog →
              </Link>
            </p>
          </section>

          <section className="mt-10 space-y-4 text-foreground/90 leading-relaxed">
            <h2 className="text-xl font-semibold text-foreground">Privacy & terms</h2>
            <p>
              Read our{" "}
              <Link href="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms-of-service" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              for how the service handles data and acceptable use.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
