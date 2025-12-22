"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Note: Metadata export doesn't work in client components
// Metadata is handled via layout.tsx for client components

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-14 sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
          <p className="mt-2 text-muted-foreground">Questions, feedback, or partnership inquiries—we'd love to hear from you.</p>

          <div className="mt-8">
            <Card className="border-border/60 max-w-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Email</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  Send us an email at:{" "}
                  <a
                    href="mailto:transcriptget@gmail.com"
                    className="font-medium text-foreground hover:underline"
                  >
                    transcriptget@gmail.com
                  </a>
                </p>
                <p className="text-xs">
                  We typically respond within 24-48 hours.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
