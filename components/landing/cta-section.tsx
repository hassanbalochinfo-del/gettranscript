"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  const [url, setUrl] = useState("")

  return (
    <section className="bg-primary py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">Get your transcript now</h2>
          <p className="mt-3 text-primary-foreground/80">Start transcribing in seconds</p>

          <div className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
            <Input
              type="url"
              placeholder="Paste YouTube link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-12 flex-1 rounded-xl border-primary-foreground/20 bg-primary-foreground/10 text-base text-primary-foreground placeholder:text-primary-foreground/60"
            />
            <Button size="lg" variant="secondary" className="h-12 rounded-xl px-6" asChild>
              <Link href={url ? `/app?url=${encodeURIComponent(url)}` : "/app"}>
                Get Transcript
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
