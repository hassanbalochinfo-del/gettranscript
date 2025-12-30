import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FileText, CheckCircle, AlertCircle, Shield, Scale, Mail } from "lucide-react"

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
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-3">Terms of Service</h1>
            <p className="text-muted-foreground text-lg">
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <p className="mt-4 text-muted-foreground">
              By using GetTranscript, you agree to these Terms of Service.
            </p>
          </div>

          <div className="space-y-8">
            {/* Service Description */}
            <section className="bg-card rounded-lg border p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3">Service Description</h2>
                  <p className="text-muted-foreground leading-7">
                    GetTranscript is a free service that helps you fetch and display transcripts for YouTube videos when available. 
                    The service is provided "as is" without warranties of any kind.
                  </p>
                </div>
              </div>
            </section>

            {/* Acceptable Use */}
            <section className="bg-card rounded-lg border p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>You may use the service for personal or commercial purposes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>Do not abuse the service (e.g., excessive automated requests or attempts to overload our systems)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>Respect YouTube's terms of service and content owner rights</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>You are responsible for how you use transcripts obtained through this service</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Service Limitations */}
            <section className="bg-card rounded-lg border p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3">Service Limitations</h2>
                  <p className="text-muted-foreground leading-7">
                    Transcripts may not be available for every video. Availability depends on whether the video creator has enabled 
                    captions or transcripts. We may apply rate limits and caching to keep the service reliable and available for all users.
                  </p>
                </div>
              </div>
            </section>

            {/* No Warranties */}
            <section className="bg-card rounded-lg border p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3">No Warranties</h2>
                  <p className="text-muted-foreground leading-7">
                    We make no guarantees about the accuracy, completeness, or availability of transcripts. 
                    The service is provided without warranties, express or implied.
                  </p>
                </div>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="bg-card rounded-lg border p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Scale className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3">Limitation of Liability</h2>
                  <p className="text-muted-foreground leading-7">
                    GetTranscript shall not be liable for any indirect, incidental, special, or consequential damages 
                    arising from your use of the service.
                  </p>
                </div>
              </div>
            </section>

            {/* Changes to Terms */}
            <section className="bg-card rounded-lg border p-6 sm:p-8">
              <h2 className="text-2xl font-semibold mb-3">Changes to Terms</h2>
              <p className="text-muted-foreground leading-7">
                We may update these Terms of Service from time to time. Continued use of the service after changes 
                constitutes acceptance of the new terms.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-card rounded-lg border p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3">Contact</h2>
                  <p className="text-muted-foreground leading-7">
                    If you have questions about these terms, please contact us at{" "}
                    <a 
                      href="mailto:transcriptget@gmail.com" 
                      className="text-primary hover:underline font-medium"
                    >
                      transcriptget@gmail.com
                    </a>
                    .
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
