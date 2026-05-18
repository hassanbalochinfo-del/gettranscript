import type { Metadata } from "next"

import { siteUrl } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Contact Us - GetTranscript",
  description: "Get in touch with GetTranscript. Questions, feedback, or partnership inquiries. Email us at transcriptget@gmail.com",
  openGraph: {
    title: "Contact Us - GetTranscript",
    description: "Get in touch with GetTranscript. Questions, feedback, or partnership inquiries.",
    url: `${siteUrl}/contact`,
  },
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
}
