import type { Metadata } from "next"
import { AdSenseScript } from "@/components/adsense/AdSenseScript"
import { siteUrl } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Contact Us - GetTranscript",
  description: "Contact GetTranscript for questions, feedback, or partnership inquiries. Email us at transcriptget@gmail.com",
  openGraph: {
    title: "Contact Us - GetTranscript",
    description: "Contact GetTranscript for questions, feedback, or partnership inquiries.",
    url: `${siteUrl}/contact`,
  },
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AdSenseScript />
      {children}
    </>
  )
}
