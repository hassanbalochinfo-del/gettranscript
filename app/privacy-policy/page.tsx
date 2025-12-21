import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground">
                Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              
              <h2>Our Commitment</h2>
              <p>
                GetTranscript is committed to protecting your privacy. We do not store, collect, or retain any personal data or transcripts from your use of this service.
              </p>

              <h2>Information We Do Not Store</h2>
              <ul>
                <li>We do not store the YouTube URLs you submit</li>
                <li>We do not store transcripts or any content from videos</li>
                <li>We do not collect personal information</li>
                <li>We do not use tracking cookies or analytics that identify you</li>
              </ul>

              <h2>How We Process Requests</h2>
              <p>
                When you submit a YouTube URL, we fetch the transcript on demand and display it to you. 
                We may temporarily cache responses to improve performance, but this data is not associated with you or stored long-term.
              </p>

              <h2>Technical Data</h2>
              <p>
                We may use basic technical information (such as IP addresses) solely for the purpose of preventing abuse 
                and ensuring service reliability through rate limiting. This information is not stored or used to identify you.
              </p>

              <h2>Third-Party Services</h2>
              <p>
                We use third-party services to fetch transcripts. These services have their own privacy policies, 
                and we encourage you to review them.
              </p>

              <h2>Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at{" "}
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
