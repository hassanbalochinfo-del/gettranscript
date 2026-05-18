import type React from "react"
import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/components/providers"
import { ADSENSE_PUBLISHER_ID } from "@/lib/adsense/config"
import { siteUrl } from "@/lib/seo"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const siteName = "GetTranscript"
const siteDescription = "Get instant YouTube transcripts for free. Paste a YouTube link and extract clean transcripts in seconds. Copy, download, and use transcripts with timestamps. Works with YouTube videos and Shorts."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Instant YouTube Transcripts | Free Transcript Generator`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "YouTube transcript",
    "video transcript",
    "YouTube Shorts transcript",
    "transcript generator",
    "free transcript",
    "YouTube captions",
    "video transcription",
    "YouTube subtitle extractor",
    "transcript download",
    "YouTube text extractor",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title: `${siteName} - Instant YouTube Transcripts`,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/logo.svg`,
        width: 180,
        height: 180,
        alt: `${siteName} Logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Instant YouTube Transcripts`,
    description: siteDescription,
    images: [`${siteUrl}/logo.svg`],
    creator: "@gettranscript",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content={ADSENSE_PUBLISHER_ID} />
      </head>
      <body className={`font-sans antialiased`}>
        <Script
          id="cookieyes"
          src="https://cdn-cookieyes.com/client_data/2dcd820386a82d3317c627d1/script.js"
          strategy="afterInteractive"
        />
        <Script
          id="gtag-js"
          src="https://www.googletagmanager.com/gtag/js?id=G-C6FB75Q6Y1"
          strategy="afterInteractive"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-C6FB75Q6Y1');
              gtag('config', 'AW-17823016947');
            `,
          }}
        />
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
