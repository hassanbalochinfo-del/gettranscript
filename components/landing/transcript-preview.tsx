"use client"

import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

const sampleTranscript = [
  {
    time: "00:00",
    text: "Welcome to today's episode where we'll be discussing the future of AI and its impact on creative industries.",
  },
  { time: "00:08", text: "I'm joined by two incredible guests who have been at the forefront of this revolution." },
  {
    time: "00:15",
    text: "Let's dive right in. What do you think is the most significant change we've seen in the past year?",
  },
  { time: "00:23", text: "Great question. I think the accessibility of these tools has been transformative." },
]

export function TranscriptPreview() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = sampleTranscript.map((line) => `[${line.time}] ${line.text}`).join("\n")
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">See it in action</h2>
          <p className="mt-3 text-muted-foreground">Clean, readable transcripts with timestamps</p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
              <span className="text-sm font-medium text-foreground">Sample Transcript</span>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="divide-y divide-border/50">
              {sampleTranscript.map((line, index) => (
                <div key={index} className="flex gap-4 px-4 py-3">
                  <span className="shrink-0 font-mono text-sm text-muted-foreground">{line.time}</span>
                  <p className="text-sm text-foreground">{line.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
