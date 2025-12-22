import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gettranscript.com"

export const metadata: Metadata = {
  title: "Terms of Service - GetTranscript",
  description: "GetTranscript Terms of Service. Read our terms and conditions for using our free YouTube transcript service.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Terms of Service - GetTranscript",
    description: "GetTranscript Terms of Service. Read our terms and conditions.",
    url: `${siteUrl}/terms-of-service`,
  },
  alternates: {
    canonical: `${siteUrl}/terms-of-service`,
  },
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground">
                Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              
              <p>By using GetTranscript, you agree to these Terms of Service.</p>

              <h2>Service Description</h2>
              <p>
                GetTranscript is a free service that helps you fetch and display transcripts for YouTube videos when available. 
                The service is provided "as is" without warranties of any kind.
              </p>

              <h2>Acceptable Use</h2>
              <ul>
                <li>You may use the service for personal or commercial purposes</li>
                <li>Do not abuse the service (e.g., excessive automated requests or attempts to overload our systems)</li>
                <li>Respect YouTube's terms of service and content owner rights</li>
                <li>You are responsible for how you use transcripts obtained through this service</li>
              </ul>

              <h2>Service Limitations</h2>
              <p>
                Transcripts may not be available for every video. Availability depends on whether the video creator has enabled 
                captions or transcripts. We may apply rate limits and caching to keep the service reliable and available for all users.
              </p>

              <h2>No Warranties</h2>
              <p>
                We make no guarantees about the accuracy, completeness, or availability of transcripts. 
                The service is provided without warranties, express or implied.
              </p>

              <h2>Limitation of Liability</h2>
              <p>
                GetTranscript shall not be liable for any indirect, incidental, special, or consequential damages 
                arising from your use of the service.
              </p>

              <h2>Changes to Terms</h2>
              <p>
                We may update these Terms of Service from time to time. Continued use of the service after changes 
                constitutes acceptance of the new terms.
              </p>

              <h2>Contact</h2>
              <p>
                If you have questions about these terms, please contact us at{" "}
                <a href="mailto:transcriptget@gmail.com" className="text-primary hover:underline">
                  transcriptget@gmail.com
                </a>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
