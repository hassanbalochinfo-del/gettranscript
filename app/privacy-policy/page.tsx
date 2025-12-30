import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Shield, Lock, Eye, Server, FileText, Mail } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gettranscript.com"

export const metadata: Metadata = {
  title: "Privacy Policy - GetTranscript",
  description: "GetTranscript Privacy Policy. We do not store your transcripts or personal data. Learn how we protect your privacy.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Privacy Policy - GetTranscript",
    description: "GetTranscript Privacy Policy. We do not store your transcripts or personal data.",
    url: `${siteUrl}/privacy-policy`,
  },
  alternates: {
    canonical: `${siteUrl}/privacy-policy`,
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-3">Privacy Policy</h1>
            <p className="text-muted-foreground text-lg">
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="space-y-8">
            {/* Our Commitment */}
            <section className="bg-card rounded-lg border p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3">Our Commitment</h2>
                  <p className="text-muted-foreground leading-7">
                    GetTranscript is committed to protecting your privacy. We do not store, collect, or retain any personal data or transcripts from your use of this service.
                  </p>
                </div>
              </div>
            </section>

            {/* Information We Do Not Store */}
            <section className="bg-card rounded-lg border p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-4">Information We Do Not Store</h2>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>We do not store the YouTube URLs you submit</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>We do not store transcripts or any content from videos</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>We do not collect personal information</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>We do not use tracking cookies or analytics that identify you</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Process Requests */}
            <section className="bg-card rounded-lg border p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Server className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3">How We Process Requests</h2>
                  <p className="text-muted-foreground leading-7">
                    When you submit a YouTube URL, we fetch the transcript on demand and display it to you. 
                    We may temporarily cache responses to improve performance, but this data is not associated with you or stored long-term.
                  </p>
                </div>
              </div>
            </section>

            {/* Technical Data */}
            <section className="bg-card rounded-lg border p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3">Technical Data</h2>
                  <p className="text-muted-foreground leading-7">
                    We may use basic technical information (such as IP addresses) solely for the purpose of preventing abuse 
                    and ensuring service reliability through rate limiting. This information is not stored or used to identify you.
                  </p>
                </div>
              </div>
            </section>

            {/* Third-Party Services */}
            <section className="bg-card rounded-lg border p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3">Third-Party Services</h2>
                  <p className="text-muted-foreground leading-7">
                    We use third-party services to fetch transcripts. These services have their own privacy policies, 
                    and we encourage you to review them.
                  </p>
                </div>
              </div>
            </section>

            {/* Changes to This Policy */}
            <section className="bg-card rounded-lg border p-6 sm:p-8">
              <h2 className="text-2xl font-semibold mb-3">Changes to This Policy</h2>
              <p className="text-muted-foreground leading-7">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date.
              </p>
            </section>

            {/* Contact Us */}
            <section className="bg-card rounded-lg border p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
                  <p className="text-muted-foreground leading-7">
                    If you have any questions about this Privacy Policy, please contact us at{" "}
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
