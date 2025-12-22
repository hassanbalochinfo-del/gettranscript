import type { Metadata } from "next"
import { Suspense } from "react"
import ResultClient from "./ResultClient"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gettranscript.com"

export const metadata: Metadata = {
  title: "Transcript Result - GetTranscript",
  description: "View your YouTube video transcript with timestamps. Copy, download, and use the transcript however you need.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Transcript Result - GetTranscript",
    description: "View your YouTube video transcript with timestamps.",
    url: `${siteUrl}/app/result`,
  },
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Loading…
        </div>
      }
    >
      <ResultClient />
    </Suspense>
  )
}
